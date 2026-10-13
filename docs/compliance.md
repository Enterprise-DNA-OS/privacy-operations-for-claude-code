# Evidence checks and their limits

Checked 13 October 2026. This is an administrative record tool for a trusted privacy operator. It does not certify compliance, decide whether a person has a right, discover personal data, operate cookie consent, send notices, delete external records or fulfil a request. Your privacy officer decides legal applicability and deadlines.

| Check | What the tool tests | Basis |
|---|---|---|
| NZ-IPP9/AU-APP11 | Active systems have a retention rule and a next review date | NZ information privacy principle 9 and AU APP 11.2, links below |
| LOCAL-SECURITY | Active systems have a security evidence reference | Local evidence completeness rule, not a security test |
| LOCAL-ACTIVITY | Processing activities have purpose, subject categories and an owner | Local record completeness rule informed by privacy impact assessment practice |
| LOCAL-REQUEST | Open requests have a recorded due date and its basis | Local workflow rule. No automatic statutory date calculation |
| LOCAL-RESPONSE | A recorded response has a verification date | Local exception flag, not proof that verification was adequate |
| LOCAL-APPROVAL | An approved assessment still has a review of its current version | Local evidence version rule |

NZ principle 9 limits keeping personal information beyond the period required for its lawful purpose. A date in this tool is a reminder to review the purpose, never permission to delete records. [Office of the Privacy Commissioner](https://www.privacy.org.nz/privacy-principles/9/).

AU APP 11.2 concerns destruction or de-identification when information is no longer needed, with exceptions including legal retention obligations and Commonwealth records. This register highlights missing retention evidence, not a legal breach. [OAIC APP 11 guidance](https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-11-app-11-security-of-personal-information).

Assessment records capture risks, evidence and actions. They are not a substitute for performing an assessment. [OAIC privacy impact assessment guide](https://www.oaic.gov.au/privacy/privacy-guidance-for-organisations-and-government-agencies/privacy-impact-assessments/guide-to-undertaking-privacy-impact-assessments).

NZ access requests generally require a decision within 20 working days. Public holidays and the statutory summer exclusion matter, as do extensions and urgent requests. This software does not calculate that deadline. The privacy officer enters the confirmed date and its basis. [OPC request guidance](https://www.privacy.org.nz/your-rights/ask-for-your-information/) and [working day exclusions](https://www.privacy.org.nz/resources-and-learning/knowledge-base/view/7/).

## Local thresholds

Risk score is likelihood times impact, each 1 to 5. This is an editable prioritisation convention, not a statutory formula. Assessment renewals show missing dates and dates within 60 calendar days. Retention reviews show dates within 30 days. Request reviews show open requests within 14 days, including overdue and unknown dates. An action is overdue after its recorded date.

Reviews require a linked system, an owner, assessment evidence, both risk scores, a future renewal date, and no open actions. Actor and approver labels must differ. Updating the assessment, a linked action or the system invalidates the current review. Source approval labels never approve an imported assessment here. Identity labels are operator attribution, not authenticated identities or a separation-of-duties security boundary.

## Operating security

Use a protected device, encrypted storage, restricted backups and least-privilege database credentials. Domain tables have row level security enabled and no public grants. Use an owner connection for the trusted CLI. There is no login, tenant isolation or application permission system. Do not expose the database directly to an untrusted client. Keep subject names and sensitive request content in your approved system: use case references here. Exports, drafts and reports contain your records and need the same protection. Database owners can alter history, so the audit log is not tamper-proof. Back up before migration and rehearse imports against an isolated database.
