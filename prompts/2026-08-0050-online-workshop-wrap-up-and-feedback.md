[x] by OpenAI Codex `gpt-5.6-terra` thinking `max` (ChatGPT account) - Implementation ~$0.7264 23 minutes; Testing 4 minutes

[✨♗] After the online workshop is over, there should be shown a wrapup screen.

- There are three phases of the online workshop on stage
    1. Before the workshop. - There is a countdown - Working
    2. During the workshop - there is a live video - Working
    3. After the workshop - There should be feedback and follow up materials - You are implementing this now
- The wrapup screen should be shown after the workshop is over. It should show a thank you message, a feedback form with stars and optional comments, and links to follow up materials.
- The follow up material is one material which is pinned to be a follow up material. One material can be pinned as a follow up material, and this material will be shown there.
- Before the workshop is over, the follow up material should be only among the materials, but there should be some highlight of the follow up material because follow up material is a little bit more important than other materials.
- But from the data and structure point of view, follow up material is only one of the materials, just with some special flag similar to the comments and pin comment.
- The feedback should be done progressively. First, show the stars rating, and then the user can answer what was good and what was bad about the online workshop, and also an arbitrary note.
- The user gives one, two or three stars, show first what was bad about the workshop. When the user gives four or five stars, show first what was good about the workshop, but progressively asks all three questions what was good, what was bad, and an arbitrary note. But save it progressively because some users can fill only some of the fields.
- The feedback should have a separate page on the admin panel and is visible only for admins.
- The online chat and reactions should work all the time.
- You are working with `/cs/online-workshop/participant`
- You are working with `/admin/workshops`
- If you need a change in the database migration, do it in file `migrations/*.sql`
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)

---

Is this done out of the box?

- All feedbacks should be visible as extra information alongside the contacts. This is a similar pattern to other extra information about the contact.

