[x] by OpenAI Codex `gpt-5.6-sol` thinking `max` (ChatGPT account) - Implementation ~$0.6882 23 minutes; Testing a minute

[✨🛳] Create a workshop page of `/cs/online-workshop/participant`

- This will be a page for the participant.
- We will have a countdown till the workshop.
- After the countdown is over, there should be a YouTube video which will be the stream, which will be automatically played.
- Also allowed to unlock the content which can be written in Markdown after some time. For example, at 19:30 during the workshop, we can unlock some content.
- Allow editing this content dynamically and flexibly so that if the participant is already connected to the workshop and we add some new content or remove the old one, the participant will see our current version.
- Also every participant must write their name and email to connect (but it can be prefilled from the URL parameters).
    - Theese should be stored in the database with the timestamp of when they connected.
    - Also when user do comment or reaction, it should be stored with the timestamp.
- Add there a simple live chat and emoji reactions with some nice animation
- Also comments on the chat can be upvoted, each upvote should be stored in the database with the timestamp and the user who upvoted.
- Allow to order comments both by most recent and by upvotes.
- When user writes a comment, it should be first approved by the admin, so it should be stored in the database with a status `pending` and only after the admin approves it, it will be visible to all participants.
- The voting and reactions do not require approval, they are visible immediately.
- Keep in mind that the content can be unlocked at any time, not only during the workshop. For example, we can unlock some content after 2 days.
- Do some backend for this logic where we can add the content and set the times.
- Do the database migration in file `migrations/2026-07-0040-workshop-page`
- Allow to pass `?email=...&fullname=...` to the page and prefill the email field in the form.
    - Both parameters are optional, but if they are present, the form should be prefilled with them.
- The backend is not locked under the user and password, but use the simple admin token already used in `/admin` pages
- Do a page in `/admin` that will show dashboard with all the admin pages, to access it you must pass the admin token in the URL, for example `/admin?token=...`
- The tables must be RLS secured
- The miniapp you are implementing is small but it should be implemented in a way that it can be reused for other workshops in the future and also production-ready for 1000+ participants.
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a proper analysis of the current functionality before you start implementing.

---

[x] by OpenAI Codex `gpt-5.6-terra` thinking `max` (ChatGPT account) - Implementation ~$0.6863 43 minutes; Testing a few seconds

[✨🛳] Do some changes and fixes of `/cs/online-workshop/participant` and `/admin/workshops`

- Comments should be shown immediately for the person who wrote them, when the admin approves them, they will be visible to all participants.
- In administration allow to artificially set a positive or negative number of reactions for a comment, so that we can artificially add or remove reactions even if this comment is (not) popular.
- Also allow to create completely new comments in the admin panel, so that we can add some comments to the chat even if no participant has written them.
- Also allow to send arbitrary reaction (even reaction not listed for participants) from the admin panel
- All of these artificial options should be clearly marked as "artificial" in the admin panel and the database, so that we can distinguish them from the real ones.
- In the administration panel show number and list of the participants
- Allow to ban a participant from the commenting and reacting, so that they can only watch the stream and the content, but they cannot comment or react.
- On `/admin/workshops` when I am entering anything, it often "blinks" back to the saved version, so I cannot edit it or must edit it very fast and save it.
- The button "Odeslat" is just bellow the page fold, fix it ![alt text](prompts/screenshots/2026-07-0040-workshop-participant-page-1.png)
- Fix ![alt text](prompts/screenshots/2026-07-0040-workshop-participant-page.png)
- If you need a change in the database migration, do it in file `migrations/2026-07-0040-workshop-page-1.sql`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a proper analysis of the current functionality of workshop logic before you start implementing.

