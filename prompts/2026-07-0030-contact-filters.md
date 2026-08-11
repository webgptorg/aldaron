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

---

[x] by Claude Code `claude-opus-5` thinking `max` - Implementation $2.84 13 minutes; Testing 3 minutes

[✨⇨] Enhance the export to VCARD functionality

The exported contact should look like this:

```vcard
BEGIN:VCARD
VERSION:3.0
N:Hejný;Pavol;;;
FN:Pavol Hejný
EMAIL;TYPE=INTERNET:me@pavolhejny.com
TEL;TYPE=CELL:+420777777777
ORG:Landing page
NOTE:Promptbook contact from Landing page -> OnlineWorkshopRegistration
 Online workshop registration Date: čtvrtek 20. 8. 2026 19:00
REV:2026-08-11T04:19:04.597Z
UID:contact-810
END:VCARD
```

- The `ORG` and `URL` fields should not be filled because they are not representing the organization of the contact, but the landing page where the contact was gathered.
- For the VCARD export the isContacted field is irrelevant and should not be included in the export.
- On the other hand, the `NOTE` field should contain all the information about the contact
    - It should have format `Promptbook contact from <app name> -> <place name>\n<users note>`
- You are working with `/admin/contacts` page.
- Do not change database structure or gathering of the contacts. You are just changing how the data is exported to VCARD.
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a proper analysis of the current functionality before you start implementing.

---

[x] by OpenAI Codex `gpt-5.6-terra` thinking `max` (ChatGPT account) - Implementation ~$0.2532 13 minutes; Testing 3 minutes

[✨⇨] Add pagination to the contacts table

- By default, show 100 contacts per page. Allow to change this to 50, 100, 200, 500, or all contacts.
- When exporting, always export ALL contacts, not just the current page.
- You are working with `/admin/contacts` page.
- Do not change database structure or gathering of the contacts. You are just editing the viewing of the contacts
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a proper analysis of the current functionality before you start implementing.

---

[x] by OpenAI Codex `gpt-5.6-terra` thinking `max` (ChatGPT account) - Implementation ~$0.2579 13 minutes; Testing 2 minutes

[✨⇨] The contacts table cannot be horizontally scrolled, fix it

- You are working with `/admin/contacts` page.
- Do not change database structure or gathering of the contacts. You are just editing the viewing of the contacts
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a proper analysis of the current functionality before you start implementing.



