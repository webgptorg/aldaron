[x] by OpenAI Codex `gpt-5.6-terra` thinking `max` (ChatGPT account) - Implementation ~$0.2193 8 minutes; Testing a minute

[✨🪴] Create a management of discount codes in the admin

- Now the discounts quotes are hardcoded. Move them to the admin panel and database to be manageable by the admin.
- If you need a change in the database migration, do it in file `migrations/*.sql`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)

---

[x] by OpenAI Codex `gpt-5.6-luna` thinking `max` (ChatGPT account) - Implementation ~$0.5334 15 minutes; Testing a few seconds

[✨🪴] Discount codes should be relevant for all places where discount codes are used

- Now the discounts are only for ai-supervize-mini, make them relevant for all places where discount codes are used.
- Allow to check either all places or specific places where the discount code is valid.
- Also remove the option "Navazující nabídka z online workshopu Odkazy z online workshopu automaticky použijí tento jediný vybraný kód, pokud je právě aktivní."
- Add option to set maximum number of uses for the discount code. (if the maximum number of uses is set, show how many left uses are available for the users which have prefilled the discount code in the registration form and looking at a form)
- There should be a pattern where `?code=DISCOUNT_CODE` is used to prefill the discount code across the app and scroll directly to the registration form.
- If you need a change in the database migration, do it in file `migrations/*.sql`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)

