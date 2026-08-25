[x] by OpenAI Codex `gpt-5.6-terra` thinking `max` (ChatGPT account) - Implementation ~$0.6470 28 minutes; Testing 6 minutes

[✨🤛] The online workshop app should be more resilient to server overloading.

- Especially when there are a lot of people crowded at the start of the workshop, the app can be overloaded and the backend can fail.
- But for the people who already have the app loaded, nothing should change. (The video is streamed from YouTube and the video id is enough). The people have all the information which are enough to render the workshop. They will just not have new comments and materials, but that's okay for a while.
- The Workshop participant app and workshop data should be cached in a way that for the people who tries to load the app during the fail, they will just see the version from their local data.
- Be aware that the app, there is a single app, but in a single app, there can be multiple workshops.
- Consider using service workers or local storage to cache the workshop data on the client side.
- The app should be able to handle the situation where the backend is temporarily unavailable, and still provide a good user experience.
- You are working with `/cs/online-workshop/participant`
- You are working with `/admin/workshops`
- If you need a change in the database migration, do it in file `migrations/*.sql`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)

---

[ ]

[✨🤛] When the server is not available, the message for the user should not scream as big warning but be some small "🟢 connected" dot on top-right corner

- You are working with `/cs/online-workshop/participant`
- You are working with `/cs/komunita`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
