[x] (2 attempts) by OpenAI Codex `gpt-5.6-luna` thinking `medium` (ChatGPT account) - Implementation ~$0.2704 8 minutes; Testing a few seconds; Fixing ~$0.1376 7 minutes; Testing 3 minutes

[✨🌇] In the community users should be able to share their projects and creations

- Every project should have a card with a preview.
- There should be up and down voting of the projects, similar to Reddit.
- When creating a new project, there should be a pop-up with a wizard.
- When showing a project preview, the OG image should be scraped from that page and used in a project card.
- In the first step of the wizard, you should set only the URL of the project, and the title with description should be automatically scraped, but the user can edit it on the second page of the wizard.
- Projects should be in cards in three columns.
- Projects should be under the workshops and above the materials.
- The project cards should be sorted by the number of upvotes, with the most upvoted projects at the top.
- One user can put only one upvote or downvote on each project.
- On the home page of the Community, show only the first 5 most upvoted projects The sixth card should be more, which will open `/cs/komunita/projects` with all the projects.
- Also, every project should have its own unique page with chat similar to the workshops. `/cs/komunita/projects/<project_id>`
- Author of the project is automatically the moderator of this discussion.
- You are working with `/cs/komunita`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do an analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)

