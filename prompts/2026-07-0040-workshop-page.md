[x] by Claude Code `claude-opus-5` thinking `max` - Implementation $4.83 5 hours; Testing a minute

[✨🛳] Create a workshop page of `/cs/online-workshop/participant`

- This will be a page for the participant.
- We will have a countdown till the workshop.
- After the countdown is over, there should be a YouTube video which will be the stream, which will be automatically played.
- Also allowed to unlock the content which can be written in Markdown after some time. For example, at 19:30 during the workshop, we can unlock some content.
- Allow editing this content dynamically and flexibly so that if the participant is already connected to the workshop and we add some new content or remove the old one, the participant will see our current version.
- Also every participant must write their name to connect
- Add there a simple live chat and reactions
- Keep in mind that the content can be unlocked at any time, not only during the workshop. For example, we can unlock some content after 2 days.
- Do some backend for this logic where we can add the content and set the times.
- The backend is not locked under the user and password, but use the simple admin token already used in `/admin` pages
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a proper analysis of the current functionality before you start implementing.

