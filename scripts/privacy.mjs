#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {getDb,REPO_ROOT} from './lib/db.mjs';
import {parseCsv,pick} from './lib/csv.mjs';
import {table} from './lib/format.mjs';

export const entities={
 systems:['name','owner','purpose','categories','location','retention_rule','retention_review','security_evidence','status'],
 activities:['name','owner','system_id','purpose','subjects','recipients','transfer_basis','jurisdiction','review_due'],
 assessments:['name','owner','system_id','status','likelihood','impact','due_date','renewal_date','evidence'],
 actions:['name','owner','assessment_id','due_date','status','evidence'],
 requests:['name','owner','kind','received_on','due_date','deadline_basis','verified_on','response_on','status','evidence']
};
export const reads={
 systems:'select * from systems order by name',
 activities:'select * from activities order by name',
 assessments:'select * from assessment_queue order by name',
 actions:'select * from action_queue order by due_date nulls first,name',
 requests:'select * from request_queue order by due_date nulls first,name',
 'assessment-triage':"select name,owner,status,risk_score,open_actions,due_date from assessment_queue where status<>'approved' or not current_review order by risk_score desc nulls first,name",
 'renewals-due':"select name,owner,renewal_date,renewal_date-current_date as days_left from assessments where renewal_date is null or renewal_date<=current_date+60 order by renewal_date nulls first,name",
 'retention-review':'select name,owner,retention_rule,retention_review,days_to_review from retention_queue order by retention_review nulls first,name',
 'requests-due':"select name,owner,kind,due_date,days_left,deadline_basis from request_queue where status='open' and (due_date is null or due_date<=current_date+14) order by due_date nulls first,name",
 'overdue-actions':"select name,owner,assessment,due_date,days_left from action_queue where status='open' and (due_date is null or due_date<current_date) order by due_date nulls first,name",
 'processing-review':'select a.name,a.owner,s.name as system,a.purpose,a.subjects,a.recipients,a.jurisdiction,a.review_due from activities a left join systems s on s.id=a.system_id order by a.review_due nulls first,a.name',
 'owner-workload':"select coalesce(owner,'Unassigned') as owner,count(*) as assessments,sum(open_actions) as open_actions from assessment_queue where status<>'approved' or not current_review group by owner order by assessments desc,owner",
 'risk-register':'select name,system,owner,likelihood,impact,risk_score,open_actions,current_review from assessment_queue order by risk_score desc nulls first,name',
 'reviews':'select a.name,r.actor,r.approver,r.evidence,r.assessment_version,a.version as current_version,(r.assessment_version=a.version) as current_review,r.created_at from reviews r join assessments a on a.id=r.assessment_id order by r.created_at desc',
 'compliance':'select * from compliance_findings order by rule,record',
 'attention':"select 'Request deadline' as issue,name as record from requests where status='open' and (due_date is null or due_date<current_date) union all select 'Overdue action',name from actions where status='open' and (due_date is null or due_date<current_date) union all select 'Assessment evidence',name from assessments where evidence is null union all select 'Missing owner',name from systems where owner is null order by issue,record",
 'history':'select entity,record_id,action,actor,created_at from audit_log order by created_at desc,id'
};
export const commands=[...Object.keys(reads),'show','add','update','log','record-review','import','export','weekly-review','draft-assessment','draft-request','help'];
const fail=message=>{throw Error(message);};
export function parse(args){
 const positional=[],opts={};
 for(const a of args){if(!a.startsWith('--')){positional.push(a);continue;}const i=a.indexOf('=');const k=a.slice(2,i<0?undefined:i).replaceAll('-','_');if(k in opts)fail(`Duplicate option ${k}`);opts[k]=i<0?true:a.slice(i+1);}
 return {positional,opts};
}
function allowed(o,keys){for(const k of Object.keys(o))if(![...keys,'json'].includes(k))fail(`Unknown option --${k.replaceAll('_','-')}`);for(const k of ['json','dry_run','update_existing'])if(k in o&&o[k]!==true)fail(`--${k.replaceAll('_','-')} takes no value`);}
function required(v,name){if(typeof v!=='string'||!v.trim())fail(`${name} is required`);return v.trim();}
function date(v){if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(Date.parse(v))||new Date(v+'T00:00:00Z').toISOString().slice(0,10)!==v)fail(`Expected a real date YYYY-MM-DD: ${v}`);return v;}
function known(t){if(!entities[t])fail(`Unknown entity ${t}`);return t;}
async function match(db,t,q){known(t);required(q,'record');const all=await db.query(`select * from ${t} order by name,id`);let hits=all.filter(r=>r.name.toLowerCase()===q.toLowerCase()||r.id===q);if(!hits.length)hits=all.filter(r=>r.id.startsWith(q)||r.name.toLowerCase().includes(q.toLowerCase()));if(hits.length!==1)fail(`${hits.length?'Ambiguous':'No match'} ${t}: ${q}\n${(hits.length?hits:all).map(r=>r.id+' '+r.name).join('\n')}`);return hits[0];}
async function transaction(db,actor,fn,dry=false){required(actor,'actor');await db.exec('BEGIN');try{await db.query("select set_config('app.actor',$1,true)",[actor]);const result=await fn();await db.exec(dry?'ROLLBACK':'COMMIT');return result;}catch(e){await db.exec('ROLLBACK');throw e;}}
async function values(db,t,o){const v={};for(const k of entities[t]){if(!(k in o))continue;let x=o[k];if(x===true)fail(`${k} needs a value`);x=x.trim()||null;if(x&&(/_date$|_on$|^review_due$|^retention_review$/.test(k)))date(x);if(x&&['received_on','verified_on','response_on'].includes(k)&&x>new Date().toISOString().slice(0,10))fail(`${k} cannot be in the future`);if(x&&['likelihood','impact'].includes(k)){if(!/^[1-5]$/.test(x))fail(`${k} must be 1 to 5`);x=Number(x);}if(x&&k==='system_id')x=(await match(db,'systems',x)).id;if(x&&k==='assessment_id')x=(await match(db,'assessments',x)).id;v[k]=x;}return v;}
async function insert(db,t,v){const keys=Object.keys(v);return (await db.query(`insert into ${t} (${keys.join(',')}) values (${keys.map((_,i)=>'$'+(i+1)).join(',')}) returning *`,Object.values(v)))[0];}
async function update(db,t,id,v,expected){const keys=Object.keys(v);if(!keys.length)fail('No editable fields supplied');const rows=await db.query(`update ${t} set ${keys.map((k,i)=>k+'=$'+(i+1)).join(',')} where id=$${keys.length+1} and version=$${keys.length+2} returning *`,[...Object.values(v),id,expected]);if(!rows.length)fail('Record changed; read show again');return rows[0];}
async function invalidate(db,id){await db.query("update assessments set status='in-review' where id=$1",[id]);}
const canonical=x=>JSON.stringify(x,Object.keys(x).sort());
async function importAssessments(db,o){
 const rows=parseCsv(fs.readFileSync(required(o.file,'file'),'utf8'));if(!rows.length)fail('CSV has no data rows');
 const mapping=o.mapping?JSON.parse(fs.readFileSync(o.mapping,'utf8')):{};
 const fields=['source_id','name','owner','source_state','due_date','renewal_date'];for(const [k,v] of Object.entries(mapping)){if(!fields.includes(k)||typeof v!=='string')fail('Invalid mapping field '+k);if(!(v in rows[0]))fail('Mapped header is missing: '+v);}
 const aliases={source_id:['Identifier','ID','Assessment ID'],name:['Name','Assessment Name'],owner:['Contributor Assignee','Assignee','Owner'],source_state:['State','Status'],due_date:['Due Date'],renewal_date:['Renewal Date']};
 const seen=new Set();
 const batch=rows.map(row=>{const v={};for(const k of fields)v[k]=(mapping[k]?row[mapping[k]]:pick(row,...aliases[k])).trim()||null;required(v.source_id,'Identifier (use --mapping for custom headers)');required(v.name,'Name');if(seen.has(v.source_id))fail('Duplicate source identifier '+v.source_id);seen.add(v.source_id);for(const k of ['due_date','renewal_date'])if(v[k])date(v[k]);v.source_data=row;return v;});
 return transaction(db,o.actor,async()=>{const counts={added:0,unchanged:0,updated:0,dry_run:!!o.dry_run};for(const v of batch){const old=(await db.query('select * from assessments where source_id=$1',[v.source_id]))[0];if(!old){await insert(db,'assessments',{...v,status:'in-review'});counts.added++;}else if(canonical(old.source_data)===canonical(v.source_data)){counts.unchanged++;}else{if(!o.update_existing)fail('Source changed; inspect and use --update-existing: '+v.source_id);await update(db,'assessments',old.id,{...v,status:'in-review'},old.version);counts.updated++;}}return counts;},o.dry_run);
}
export async function execute(db,args){
 const {positional:p,opts:o}=parse(args);const [cmd='help',t,q]=p;
 if(reads[cmd]){allowed(o,[]);if(p.length!==1)fail('Unexpected arguments');return db.query(reads[cmd]);}
 if(cmd==='help'){allowed(o,[]);return {commands,entities,usage:'privacy <command> [entity] [record] --field=value --actor=Name; updates require --expected-version=N; dates YYYY-MM-DD'};}
 if(cmd==='show'){allowed(o,[]);const r=await match(db,t,q);return {...r,history:await db.query('select * from audit_log where entity=$1 and record_id=$2 order by created_at',[t,r.id])};}
 if(cmd==='add'||cmd==='update'){
  known(t);allowed(o,[...entities[t],'actor','expected_version']);
  if(t==='assessments'&&o.status==='approved')fail('Use record-review to approve');
  const v=await values(db,t,o);if(cmd==='add')required(v.name,'name');
  return transaction(db,o.actor,async()=>{
   const old=cmd==='update'?await match(db,t,q):null;
   if(old&&(!/^\d+$/.test(String(o.expected_version))||Number(o.expected_version)!==old.version))fail('Expected version required or record changed; read show');
   if(t==='actions'&&old&&v.assessment_id&&v.assessment_id!==old.assessment_id)fail('An action cannot change its assessment');
   const r=old?await update(db,t,old.id,v,old.version):await insert(db,t,v);
   if(t==='actions')await invalidate(db,r.assessment_id);
   if(t==='systems')await db.query("update assessments set status='in-review' where system_id=$1",[r.id]);
   return r;
  });
 }
 if(cmd==='log'){allowed(o,['body','actor']);return transaction(db,o.actor,async()=>{const a=await match(db,'assessments',t);return insert(db,'notes',{assessment_id:a.id,body:required(o.body,'body'),actor:o.actor});});}
 if(cmd==='record-review'){
  allowed(o,['actor','approver','evidence','expected_version']);required(o.approver,'approver');required(o.evidence,'evidence');
  if(required(o.actor,'actor').toLowerCase()===o.approver.trim().toLowerCase())fail('Approver must differ from actor');
  return transaction(db,o.actor,async()=>{let a=await match(db,'assessments',t);if(Number(o.expected_version)!==a.version)fail('Record changed; expected version required');
   const open=await db.query("select id from actions where assessment_id=$1 and status='open'",[a.id]);
   if(open.length)fail('Close outstanding actions with evidence before review');
   if(!a.system_id||!a.owner||!a.evidence||!a.likelihood||!a.impact||!a.renewal_date)fail('Review needs system, owner, evidence, risk scores and renewal date');
   if(a.renewal_date<=new Date().toISOString().slice(0,10))fail('Review needs a future renewal date');
   a=await update(db,'assessments',a.id,{status:'approved'},a.version);
   return insert(db,'reviews',{assessment_id:a.id,assessment_version:a.version,actor:o.actor,approver:o.approver.trim(),evidence:o.evidence});
  });
 }
 if(cmd==='import'){if(t!=='datagrail')fail('Use import datagrail');allowed(o,['file','mapping','actor','dry_run','update_existing']);return importAssessments(db,o);}
 if(cmd==='export'){allowed(o,['file']);const out={};for(const k of [...Object.keys(entities),'reviews','notes','audit_log'])out[k]=await db.query(`select * from ${k} order by id`);if(o.file)fs.writeFileSync(o.file,JSON.stringify(out,null,2)+'\n',{flag:'wx',mode:0o600});return o.file?{file:o.file}:out;}
 if(['weekly-review','draft-assessment','draft-request'].includes(cmd)){
  allowed(o,[]);const sections=[];
  if(cmd==='weekly-review')for(const c of ['assessment-triage','requests-due','overdue-actions'])sections.push({title:c,rows:await execute(db,[c])});
  else {const entity=cmd==='draft-assessment'?'assessments':'requests';const r=await match(db,entity,t);sections.push({title:r.name,rows:[r]});if(entity==='assessments')sections.push({title:'Actions',rows:await db.query('select * from actions where assessment_id=$1',[r.id])});}
  const dir=path.resolve(process.env.OUTPUT_DIR||REPO_ROOT,'drafts');fs.mkdirSync(dir,{recursive:true});const file=path.join(dir,cmd+'-'+randomUUID()+'.md');
  fs.writeFileSync(file,`# DRAFT: ${cmd}\n\nInternal review only. No message has been sent. Confirm dates and evidence before any external response.\n\n`+sections.map(s=>'## '+s.title+'\n\n'+format(s.rows)).join('\n\n')+'\n',{flag:'wx',mode:0o600});return {file};
 }
 fail('Unknown command '+cmd);
}
export function format(value){if(!Array.isArray(value))return JSON.stringify(value,null,2);if(!value.length)return '(none)';return table(value,Object.keys(value[0]).map(k=>({key:k,label:k,width:55,format:x=>typeof x==='object'&&x!==null?JSON.stringify(x):x})));}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){let db;try{db=await getDb();const result=await execute(db,process.argv.slice(2));console.log(process.argv.includes('--json')?JSON.stringify(result,null,2):format(result));}catch(e){console.error(e.message);process.exitCode=1;}finally{if(db)await db.close();}}
