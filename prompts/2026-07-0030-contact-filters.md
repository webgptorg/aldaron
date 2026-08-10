[x] by Claude Code `claude-opus-5` thinking `max` - Implementation $9.33 6 hours; Testing a minute

[✨⇨] Enhance the contacts dashboard

- Allow to resize the columns in the contacts table, adjust what in the columnd is after the elipsis "..."
- Allow to sort by any column in the contacts table.
- Add option to download contacts as CSV or VCARD file.
- Allow to download filtered contacts as CSV or VCARD file.
- When exporting the contacts, you are always exporting the current view. Alongside the exporting buttons, show how many contacts are being exported.
- Also allows filtering by data range, fulltext search, presence of email or phone number,...
- Do not change database structure or gathering of the contacts. You are just editing the viewing and exporting of the contacts
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a proper analysis of the current functionality before you start implementing.

![alt text](prompts/screenshots/2026-07-0030-contact-filters.png)

