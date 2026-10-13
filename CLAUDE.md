# Privacy Operations for Claude Code: operating instructions

This file is the brain. Claude Code reads it at the start of every session. It says who this is for, how work gets done, and the one right way to do each recurring job.

## Who this is for

- **Business:** [YOUR BUSINESS]
- **Operator:** [YOUR NAME], [your role]
- **What matters most:** [the one or two outcomes you care about]

Fill this in once. A worker with context knows. A worker without it guesses.

## How to work

1. **Take a brief, not a script.** The operator describes the outcome. You run the right command and present the answer.
2. **Read before you write.** Before drafting anything about a record, read its full history first.
3. **Plain language.** Short sentences. No filler. Numbers in tables.
4. **Silent success, loud problems.** No play-by-play. Say what broke and what you did about it.
5. **Stop at the line.** Anything that sends, deletes, or faces a customer waits for a yes in this session.

## Routing table: one right way for each recurring job

| When the operator asks for... | Use this |
|---|---|
| Read system owners, purposes and retention evidence | /systems |
| Read the processing activity register | /activities |
| Read assessments, action counts and review freshness | /assessments |
| Read action owners, deadlines and evidence | /actions |
| Read request metadata and confirmed deadlines | /requests |
| Rank the assessment review queue by recorded risk | /assessment-triage |
| Find assessments due for renewal in the next 60 days | /renewals-due |
| Review missing or upcoming retention decisions | /retention-review |
| Review unknown, overdue and approaching request deadlines | /requests-due |
| Find overdue and undated open actions | /overdue-actions |
| Review purposes, recipients and accountable owners | /processing-review |
| Count assessment and action work by owner | /owner-workload |
| Compare risk scores with actions and review freshness | /risk-register |
| Read approvals and identify obsolete assessment versions | /reviews |
| Check privacy record evidence against cited rules | /compliance |
| Find missing owners, evidence and overdue work | /attention |
| Read attributed changes | /history |
| Read one record and its change history | /show |
| Add a system, activity, assessment, action or request | /add |
| Update an existing record with a version check | /update |
| Add an assessment note with an actor | /log |
| Record a reviewed assessment with evidence and a separate approver label | /record-review |
| Rehearse and import a DataGrail assessment export | /import |
| Export every record, source field, note and review | /export |
| Draft the Monday assessment, request and action review | /weekly-review |
| Draft an internal assessment brief from its history | /draft-assessment |
| Draft an internal request handling brief | /draft-request |
| Read CLI commands and editable fields | /help |
| Add a field or rule through a tested migration | /customise |
| Add a branded read-only report | /new-view |

If an ask fits nothing here, run the CLI directly (`npm run privacy -- help`) and then propose a new command for it.

## Hard rules

- Never send email or messages from here. Draft to `drafts/`, a person sends.
- Never delete records without an explicit yes in this session. Prefer marking closed or archived.
- Never invent a record. If a name is ambiguous, list the candidates and ask.
- The database is the source of truth. If the answer is not in it, say so.

## Where things live

- `scripts/` the CLI. `scripts/lib/db.mjs` picks `DATABASE_URL` (Postgres, Supabase) or the embedded database in `.data/`.
- `supabase/migrations/` the schema, plain SQL. `npm run migrate` applies it.
- `.claude/commands/` the slash commands. Add one every time the same ask comes twice.
- `docs/` the thesis and the guide for moving off DataGrail.

Built by Enterprise DNA. Installed and run for you as part of Omni: https://enterprisedna.co/omni/instead-of/datagrail

## Privacy operations rules

Read docs/compliance.md before interpreting the evidence checks. Store request case references, not sensitive subject dossiers. Never treat imported vendor approval labels as a local review. Do not invent legal deadlines: the privacy officer enters dates and their basis. Use --actor for writes and --expected-version for updates and reviews. Review approver labels are not authenticated identities. Keep drafts and reports internal until a person has reviewed them. Use main. Never run tests against real records.
