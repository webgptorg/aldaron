[ ]

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
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a proper analysis of the current functionality before you start implementing.
