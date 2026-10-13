create table systems (id uuid primary key default gen_random_uuid(), name text not null check (length(trim(name))>0), owner text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), version integer not null default 1, purpose text, categories text, location text, retention_rule text, retention_review date, security_evidence text, status text not null default 'active' check(status in ('active','retired')));
create table activities (id uuid primary key default gen_random_uuid(), name text not null check (length(trim(name))>0), owner text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), version integer not null default 1, system_id uuid references systems(id), purpose text, subjects text, recipients text, transfer_basis text, jurisdiction text check(jurisdiction in ('NZ','AU','other')), review_due date);
create table assessments (id uuid primary key default gen_random_uuid(), name text not null check (length(trim(name))>0), owner text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), version integer not null default 1, system_id uuid references systems(id), source_id text unique, source_state text, source_data jsonb, status text not null default 'draft' check(status in ('draft','in-review','approved')), likelihood integer check(likelihood between 1 and 5), impact integer check(impact between 1 and 5), due_date date, renewal_date date, evidence text);
create table actions (id uuid primary key default gen_random_uuid(), name text not null check (length(trim(name))>0), owner text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), version integer not null default 1, assessment_id uuid not null references assessments(id), due_date date, status text not null default 'open' check(status in ('open','closed')), evidence text, check(status <> 'closed' or nullif(trim(evidence),'') is not null));
create table requests (id uuid primary key default gen_random_uuid(), name text not null check (length(trim(name))>0), owner text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), version integer not null default 1, kind text not null check(kind in ('access','correction','deletion','other')), received_on date not null, due_date date, deadline_basis text, verified_on date, response_on date, status text not null default 'open' check(status in ('open','closed')), evidence text, check(due_date is null or due_date >= received_on), check(verified_on is null or verified_on >= received_on), check(response_on is null or response_on >= received_on), check(status <> 'closed' or (response_on is not null and nullif(trim(evidence),'') is not null)));
create table reviews (id uuid primary key default gen_random_uuid(), assessment_id uuid not null references assessments(id), assessment_version integer not null, actor text not null, approver text not null, evidence text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check(lower(trim(actor))<>lower(trim(approver))));
create table notes (id uuid primary key default gen_random_uuid(), assessment_id uuid not null references assessments(id), body text not null, actor text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table audit_log (id uuid primary key default gen_random_uuid(), entity text not null, record_id uuid not null, action text not null, actor text not null, before_data jsonb, after_data jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create function record_change() returns trigger language plpgsql as $$
declare who text;
begin
 who := nullif(current_setting('app.actor', true),'');
 if who is null then raise exception 'An actor is required'; end if;

 insert into audit_log(entity,record_id,action,actor,before_data,after_data) values (TG_TABLE_NAME,NEW.id,TG_OP,who,case when TG_OP='UPDATE' then to_jsonb(OLD) else null end,to_jsonb(NEW));
 return NEW;
end $$;
create trigger track_systems after insert or update on systems for each row execute function record_change();
create trigger track_activities after insert or update on activities for each row execute function record_change();
create trigger track_assessments after insert or update on assessments for each row execute function record_change();
create trigger track_actions after insert or update on actions for each row execute function record_change();
create trigger track_requests after insert or update on requests for each row execute function record_change();
alter table systems enable row level security; revoke all on systems from public;
alter table activities enable row level security; revoke all on activities from public;
alter table assessments enable row level security; revoke all on assessments from public;
alter table actions enable row level security; revoke all on actions from public;
alter table requests enable row level security; revoke all on requests from public;
alter table reviews enable row level security; revoke all on reviews from public;
alter table notes enable row level security; revoke all on notes from public;
alter table audit_log enable row level security; revoke all on audit_log from public;

create view assessment_queue as select a.id,a.name,a.owner,s.name as system,a.status,a.likelihood,a.impact,a.likelihood*a.impact as risk_score,a.due_date,a.renewal_date,a.version,
(select count(*) from actions x where x.assessment_id=a.id and x.status='open') as open_actions,
exists(select 1 from reviews r where r.assessment_id=a.id and r.assessment_version=a.version) as current_review
from assessments a left join systems s on s.id=a.system_id;
create view retention_queue as select id,name,owner,retention_rule,retention_review,retention_review-current_date as days_to_review from systems where status='active' and (retention_rule is null or retention_review is null or retention_review <= current_date+30);
create view request_queue as select id,name,owner,kind,status,received_on,due_date,due_date-current_date as days_left,deadline_basis,verified_on,response_on from requests;
create view action_queue as select x.id,x.name,x.owner,a.name as assessment,x.status,x.due_date,x.due_date-current_date as days_left,x.evidence from actions x join assessments a on a.id=x.assessment_id;
create view compliance_findings as
select 'NZ-IPP9/AU-APP11'::text as rule,name as record,'Retention rule or review date missing'::text as finding from systems where status='active' and (retention_rule is null or retention_review is null)
union all select 'LOCAL-SECURITY',name,'Security evidence missing' from systems where status='active' and security_evidence is null
union all select 'LOCAL-REQUEST',name,'Deadline or recorded deadline basis missing' from requests where status='open' and (due_date is null or deadline_basis is null)
union all select 'LOCAL-RESPONSE',name,'Response recorded without identity verification evidence date' from requests where response_on is not null and verified_on is null
union all select 'LOCAL-APPROVAL',name,'Approval evidence is stale or missing' from assessment_queue where status='approved' and not current_review
union all select 'LOCAL-ACTIVITY',name,'Purpose, subjects or accountable owner missing' from activities where purpose is null or subjects is null or owner is null;

create function touch_record() returns trigger language plpgsql as $$ begin NEW.updated_at=now(); NEW.version=OLD.version+1; return NEW; end $$;
create trigger touch_systems before update on systems for each row execute function touch_record();
create trigger touch_activities before update on activities for each row execute function touch_record();
create trigger touch_assessments before update on assessments for each row execute function touch_record();
create trigger touch_actions before update on actions for each row execute function touch_record();
create trigger touch_requests before update on requests for each row execute function touch_record();
