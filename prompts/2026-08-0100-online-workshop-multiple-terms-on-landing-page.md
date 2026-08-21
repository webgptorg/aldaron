[ ] !

[✨🥥] landing page of workshops should list all upcoming workshops, not only the one hardcoded.

- You are working with `/cs/online-workshop`
- You are working with `/cs/online-workshop/dekujeme`
- You are working with `/cs/online-workshop/participant` - the particular workshop should be distinguished by the GET parameter, if there isn't that parameter present, consider that the participant is joining the most recent workshop.
- You are working with `/admin/workshops` - Allow here to change the workshop URL slug.
- If you need a change in the database migration, do it in file `migrations/*.sql`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)
