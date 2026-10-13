# add

Add a system, activity, assessment, action or request.

Read CLAUDE.md. Run npm run privacy -- add <entity>. Use --json for further analysis. Read help for the supported fields. Never invent missing evidence.

Confirm the operator's intended record and values. Every write needs --actor. Before update or record-review, read show and supply --expected-version. List ambiguous matches and ask which one. Record-review also needs --approver and --evidence. Imports default to rehearsal first, compare counts, then remove --dry-run for an authorised load. Never use --update-existing until the changed source rows have been reviewed.
