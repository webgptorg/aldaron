[x] by OpenAI Codex `gpt-5.6-luna` thinking `max` (ChatGPT account) - Implementation ~$0.6823 24 minutes; Testing a minute

[✨🧕] Create a proper system for db migrations.

- Migrations are in folder `migrations/` and are run in order of their filename.
- The migrations should be applied automatically, but there should be also option to migrate via script.
    - Add this script to the `package.json` as `npm run migrate-database` and also to `terminals.json`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do an analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)

