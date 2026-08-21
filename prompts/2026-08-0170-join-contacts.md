[x] by OpenAI Codex `gpt-5.6-terra` thinking `max` (ChatGPT account) - Implementation ~$0.7540 30 minutes; Testing a minute

[✨🖕] In the admin where you are, listing contact join all the information about particular contact.

- There are multiple tables and sources where there are contacts. For example, the contact table or the participants of the workshop.
- From whatever admin page you are, To the primary contact, view and export should be joined, the additional information from other tables.
- For example, when viewing the main contact table, there should be information about the workshop presence.
- Or vice versa, when viewing the workshop, there should be information about the phone, which isn't the information in the workshop.
- Group contacts by normalized email.
    - Normalize into email such as `example@example.com` and `EXAMPLE@EXAMPLE.COM` or `example+foo@example.com` are the same contact.
- You are not changing the database structure, you are just changing how the data is viewed and exported.
- This joining is available only in admin
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do an analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)

