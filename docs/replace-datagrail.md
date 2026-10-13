# Move assessment records from DataGrail

The free importer brings across the assessment list. It does not claim to move the entire DataGrail platform.

1. In DataGrail, open Risk Assessments and select Download CSV. Export the complete authorised assessment list. [DataGrail instructions](https://docs.datagrail.io/docs/risk-management/risk-assessments/getting-started/), checked 13 October 2026.
2. Keep the original export. Confirm its identifier, name, assignee, state, due date and renewal date columns. The vendor documents these record fields but does not publish a universal CSV header contract. The included fixture is synthetic, not a captured customer export.
3. If your headers differ, use a mapping like examples/mapping.json. Mapping keys are source_id, name, owner, source_state, due_date and renewal_date. Dates must be unambiguous YYYY-MM-DD. Convert dates in a working copy if needed. Blanks remain unknown. Unknown columns are retained in source_data, including likelihood, completion percentage and approving user. Vendor likelihood labels do not silently become our local numeric scores.
4. Create an empty database with npm run migrate, then rehearse and import:

```bash
npm run privacy -- import datagrail --file=export.csv --actor=Mere --dry-run
npm run privacy -- import datagrail --file=export.csv --actor=Mere
# Custom tenant headings:
npm run privacy -- import datagrail --file=export.csv --mapping=examples/mapping.json --actor=Mere
```

One command imports the supported export once its headers and date representation are confirmed. The whole batch is transactional. Dry run writes nothing. Repeating the same export skips identical rows. Changed rows stop the import until you inspect the differences and add --update-existing. Records match on the vendor identifier, never the name. Duplicate identifiers, invalid dates and missing mandatory fields fail the batch.

## Reconciliation

Compare the original row count with added plus unchanged plus updated. Review source identifiers and dates using show assessments and export. Read unmapped source_data fields. Add each assessment's system link, evidence, local risk scores and actions. Imported assessments start in-review even when the source says Approved. The vendor state and source approving user remain available as history, not proof of a fresh review.

## What stays outside the import

Assessment answers, attachments, comments, processing activities, system inventories, requests, consent settings, discovery connections and vendor workflow histories are not in this importer. Export or retain those separately before changing subscriptions. Record approved evidence references and add systems, activities, actions and request metadata with the CLI. Enterprise DNA scopes any additional data mapping, connections or screens as custom work. Compare a sample end to end and get your privacy officer's sign-off before changing how requests are handled.
