[ ]

[✨🧕] Create a proper system for db migrations.

- Migrations are in folder `migrations/` and are run in order of their filename.
- The migrations should be applied automatically, but there should be also option to migrate via script.
    - Add this script to the `package.json` as `npm run migrate-database` and also to `terminals.json`
- There should be a table in the database to track which migrations have been applied and their checksums.
    - The system should refuse to run if a migration file has been changed or deleted after it has been applied.
- Track the name of the file and its checksum in the database.
- The migration table does not exist yet, create a first migration to create it.
    - The first migration table should be named `_initialize.sql` and should create a table named `Migration` with the following columns:
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do an analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)
