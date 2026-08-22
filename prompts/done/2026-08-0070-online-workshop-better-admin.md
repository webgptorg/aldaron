[x] by OpenAI Codex `gpt-5.6-terra` thinking `max` (ChatGPT account) - Implementation ~$0.5953 26 minutes; Testing a minute

[✨🍻] Enhanced admin page for workshops.

- On the workshop there can be A lot of participants, comments, reactions, et cetera.
- Now, when... There are many things. It is extremely cluttered.
- Separate each thing, like basic settings, or reactions, into the depths.
- Allow to filter and sort the participants by multiple criteria, like name, email, registration date, and so on.
- For each participant, show not only the duration, but the time he was on the workshop and directions in a timeline, and also the comments and other thanks, and actions which he did.
- There should be also aggregated timeline with total bar, number of the participants, reactions, comments, etc.
- Each thing should be exportable. To CSV and participants also to the VCARD
- You are working with `/admin/workshops`
- If you need a change in the database migration, do it in file `migrations/*.sql`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)

