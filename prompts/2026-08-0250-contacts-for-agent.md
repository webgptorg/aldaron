[ ] !!!!!!!

[✨🕛] Add option to download all the contacts shaped as context for AI agent in `/admin/contacts`

- This is added alongside the existing options to download contacts as CSV or VCard.
- You are always downloading only the filtered contacts, same as downloading contacts to CSV or VCard.
- The downloaded file type should be `.book`
- To do every contact, you should put all information you have across the system you have for this contact.
- Add information about the workshop attendance, number of reactions, comments, how long he was there. This should be full context about that person we have.
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)

Exported contacts should look like:

```book
Contacts 2026-08-25

NOTE Thees are the contacts exported from ...


CONTACT John Snow
....

CONTACT Jane Doe
...


```
