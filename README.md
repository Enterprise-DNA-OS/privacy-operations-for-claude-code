<h1 align="center">Privacy Operations for Claude Code</h1>

<p align="center">
  <strong>The open-source privacy operations register that is just a database and Claude Code.</strong>
</p>

<p align="center">
  Created by <a href="https://www.enterprisedna.co"><strong>Enterprise DNA</strong></a>. Free and open source. Works with Claude Code, Codex, OpenCode or Cursor.
</p>

<!-- three-doors -->
<table align="center">
  <tr>
    <td align="center"><strong>Do it yourself</strong><br/>Clone it, run it, own it. Free, MIT.<br/><a href="#quick-start">Quick start</a></td>
    <td align="center"><strong>We customise it</strong><br/>Your fields, your rules, your DataGrail data brought across.<br/><a href="https://enterprisedna.co/omni/book/?utm_source=github&utm_medium=readme&utm_campaign=datagrail">Book a call</a></td>
    <td align="center"><strong>We run it for you</strong><br/>Installed, connected and operated inside Omni. Setup fee, then a retainer.<br/><a href="https://enterprisedna.co/omni/instead-of/datagrail?utm_source=github&utm_medium=readme&utm_campaign=datagrail">How it works</a></td>
  </tr>
</table>

<p align="center">
  <a href="#what-is-this">What is this</a> &bull;
  <a href="#why-no-front-end">Why no front end</a> &bull;
  <a href="#quick-start">Quick start</a> &bull;
  <a href="#the-commands">Commands</a> &bull;
  <a href="#instead-of-datagrail">Instead of DataGrail</a> &bull;
  <a href="#want-it-installed-and-run-for-you">Installed for you</a> &bull;
  <a href="#license">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node-20+-339933?style=flat-square" alt="Node 20+" />
  <img src="https://img.shields.io/badge/PostgreSQL-any-336791?style=flat-square" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/PGlite-embedded-3ecf8e?style=flat-square" alt="PGlite" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="MIT License" />
</p>

---

## What is this

Privacy Operations for Claude Code handles privacy assessment and review records, as a Postgres database and a set of agent commands. There is no web front end. You open the folder in [Claude Code](https://claude.com/claude-code) (or Codex, OpenCode, Cursor: see `AGENTS.md`) and ask for what you want in plain language. It runs the relevant query against your own records. Add new questions as your review process changes.

DataGrail lists an Essentials annual benchmark of US$36,000 on its vendor-supplied [HubSpot marketplace listing](https://ecosystem.hubspot.com/marketplace/listing/datagrail-hubspot-integration), checked 13 October 2026. This is a listed contract benchmark, not a verified NZ/AU invoice or a current small-business quote. Its own website offers pricing by enquiry.

Want the same thing with a web front end, or built on a different stack? That is a customisation, and it is exactly what Enterprise DNA does: [book a call](https://enterprisedna.co/omni/book/?utm_source=github&utm_medium=readme&utm_campaign=datagrail).

Built for the trusted privacy operator who owns assessment reviews, retention decisions and request follow-ups. Keep system purposes, processing activities, risks, actions and evidence together. This is the administrative record layer: it does not discover personal data, enforce consent or fulfil requests across other systems. Omni by Enterprise DNA can build the agreed connections and team screens, then run your version for one setup fee and a retainer.

## Why no front end

- The operator reads and updates records through commands, then shares read-only reports.
- Your data sits in plain Postgres tables you own. Any tool can read them. No export, no lock-in.
- No seats, no tiers, no add-ons. Read [docs/why-no-front-end.md](docs/why-no-front-end.md) for the honest trade-offs too.

## Quick start

No database install (an embedded Postgres runs inside Node):

```bash
git clone https://github.com/Enterprise-DNA-OS/privacy-operations-for-claude-code.git
cd privacy-operations-for-claude-code
npm install
npm run demo
```

Then open the folder in Claude Code and type a slash command. Start with /assessment-triage, then /requests-due. For real records, choose an empty DATA_DIR and run migrate without the fictional seed.

### Use it with your own Postgres or Supabase

Copy `.env.example` to `.env`, set `DATABASE_URL`, then `npm run migrate`. Same commands, shared data, no per-seat fee.

## The commands

| Command | Job |
|---|---|
| /systems | Read system owners, purposes and retention evidence |
| /activities | Read the processing activity register |
| /assessments | Read assessments, action counts and review freshness |
| /actions | Read action owners, deadlines and evidence |
| /requests | Read request metadata and confirmed deadlines |
| /assessment-triage | Rank the assessment review queue by recorded risk |
| /renewals-due | Find assessments due for renewal in the next 60 days |
| /retention-review | Review missing or upcoming retention decisions |
| /requests-due | Review unknown, overdue and approaching request deadlines |
| /overdue-actions | Find overdue and undated open actions |
| /processing-review | Review purposes, recipients and accountable owners |
| /owner-workload | Count assessment and action work by owner |
| /risk-register | Compare risk scores with actions and review freshness |
| /reviews | Read approvals and identify obsolete assessment versions |
| /compliance | Check privacy record evidence against cited rules |
| /attention | Find missing owners, evidence and overdue work |
| /history | Read attributed changes |
| /show | Read one record and its change history |
| /add | Add a system, activity, assessment, action or request |
| /update | Update an existing record with a version check |
| /log | Add an assessment note with an actor |
| /record-review | Record a reviewed assessment with evidence and a separate approver label |
| /import | Rehearse and import a DataGrail assessment export |
| /export | Export every record, source field, note and review |
| /weekly-review | Draft the Monday assessment, request and action review |
| /draft-assessment | Draft an internal assessment brief from its history |
| /draft-request | Draft an internal request handling brief |
| /help | Read CLI commands and editable fields |
| /customise | Add a field or rule through a tested migration |
| /new-view | Add a branded read-only report |

## Instead of datagrail

Download the DataGrail assessment CSV, rehearse the import, then compare source identifiers and dates. Custom headers use an explicit mapping. [Switching guide](docs/replace-datagrail.md).

## Architecture

```
privacy-operations-for-claude-code/
  CLAUDE.md                 how the operator wants this run (routing table + house rules)
  AGENTS.md                 the same, for Codex / OpenCode / Cursor / Gemini CLI
  .claude/commands/         the slash commands
  scripts/                  the CLI the commands drive
  scripts/lib/db.mjs        one adapter: DATABASE_URL (pg) or embedded PGlite
  supabase/migrations/      plain SQL schema
  supabase/seed.sql         demo data
  docs/                     the thesis and the migration guide
```

## Built for coding agents

The database, CLI and command recipes work with Claude Code, Codex, OpenCode or Cursor. Ask your coding agent for a new command and have it implement and test the change against the same records.

## Contributing

Issues and pull requests are welcome. Keep the shape: plain SQL, a small CLI, a slash command per recurring job, no front end.

## Want it installed and run for you?

Enterprise DNA installs Privacy Operations for Claude Code for your business, migrates your DataGrail data, connects it to the rest of your tools, and runs it for you as part of **Omni**, our managed Command Centre. One setup fee, then a monthly retainer.

- Book a call: [enterprisedna.co/omni/book](https://enterprisedna.co/omni/book/?offer=replace-software&utm_source=github&utm_medium=readme&utm_campaign=datagrail)
- Read more: [enterprisedna.co/omni/instead-of/datagrail](https://enterprisedna.co/omni/instead-of/datagrail?utm_source=github&utm_medium=readme&utm_campaign=datagrail)

## License

MIT. Copyright (c) 2026 Enterprise DNA.

## Evidence and reviews

Every write needs --actor. Update and record-review also need --expected-version from show. Names match case insensitively, UUID prefixes work, and ambiguous matches list candidates and exit 1. Reviews require evidence, a separate approver label, risk scores, a future renewal date and no open actions. Changes to an assessment, its actions or its system invalidate the current review. Labels are attribution, not authenticated identities. [Rules and sources](docs/compliance.md).

The importer preserves unknown vendor fields and the original approval state. Imported assessments start in-review. Whole batches roll back on an error, dry runs leave no records, and changed source rows require --update-existing. The free importer covers the assessment list, not attachments, answers or the whole vendor history.

Request deadlines are entered and justified by the privacy officer. The software never decides legal applicability or calculates statutory periods. Keep sensitive subject details in your approved system and use case references here.

## Reports and paperwork

npm run view produces the weekly position and evidence report. npm run docs produces an internal assessment brief per assessment and a request handling brief per request. Edit brand.json for your business name, logo and colours. Drafts never send.

## Ten questions to ask of your records

These answers work today. DataGrail also offers reporting and a query assistant, so there is no unsupported claim that it cannot answer an equivalent question.

1. Which assessments have the greatest recorded risk and open actions? `assessment-triage`
2. Which assessment renewals fall within the next 60 days? `renewals-due`
3. Which systems lack a retention rule or review date? `retention-review`
4. Which open requests have no confirmed deadline? `requests-due`
5. Which action deadlines have passed? `overdue-actions`
6. Which processing activities have no accountable owner? `processing-review`
7. Who carries the largest assessment workload? `owner-workload`
8. Which prior approvals refer to outdated records? `reviews`
9. Which records need security or retention evidence? `compliance`
10. What changed, and who recorded the change? `history`

## Your first hour: ten things to ask for

1. Put our name and logo in brand.json.
2. Rehearse our assessment export.
3. Show assessments missing evidence.
4. Find undated privacy requests.
5. Review overdue actions.
6. Compare retention purposes across systems.
7. Show our team workload.
8. Draft our Monday review.
9. Record a completed assessment review.
10. Add our business-unit field with /customise and a tested migration.

## Verification

npm test creates a temporary database, exercises every CLI command, and checks transactional imports, unchanged re-imports, source-state preservation, review invalidation, version conflicts, audit attribution and escaped reports. Windows and Linux CI use Node 20 and 22. A separate Postgres 17 job runs the same tests. TEST_DATABASE_URL must point to an empty disposable database.
