[ ]

[✨👹] Remove the connection from the `ShortcodeLink` to the `App`

- The `App` table is not used anymore. It was part of the old system.
- But there is a still foreign key between these tables.
- `ShortcodeLink.appId → App`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)
