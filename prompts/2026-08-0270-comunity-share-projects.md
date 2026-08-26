[x] (2 attempts) by OpenAI Codex `gpt-5.6-luna` thinking `medium` (ChatGPT account) - Implementation ~$0.1668 4 minutes; Testing 2 minutes; Fixing ~$0.1628 4 minutes; Testing 2 minutes

[✨🌇] In the community users should be able to share their projects and creations


- Do not do real data in the database, use mock data for testing purposes.
- Every project should have a card with a preview. 
- There should be up and down voting of the projects, similar to Reddit. 
- When creating a new project, there should be a pop-up with a wizard. 
- When showing a project preview, the OG image should be scraped from that page and used in a project card. 
    - You are now mocking the data, but the scraping and previewing the project should be implemented. 
- In the first step of the wizard, you should set only the URL of the project, and the title with description should be automatically scraped, but the user can edit it on the second page of the wizard. 
- You are working with `/cs/komunita`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do an analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)

