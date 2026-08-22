Following information is from file `AGENTS.md`, if you need to update it, do it:

## Context

This is the landing page for the Promtpbook, there are multiple landing pages for different businesses, use cases, and audiences.

- `/` - Redirects to `/cs` or `/en` based on the browser `Accept-Language` header.
- `/cs` - The Czech generic homepage and source of truth for homepage structure/copy.
- `/en` - The English localized variant of the generic homepage.
- `/pro-mesta` - The landing page for Czech cities and municipalities to use AI in their internal processes.
- `/pro-firmy` - The landing page for Czech companies - a sales-style page with pain points, solution overview, comparison with ChatGPT, FAQ, and a strategic call CTA.
- `/for-agro` - The landing page for agronomy and agricultural companies to use AI for expert knowledge, compliance, and operations.
- `/ai-supervize` - The landing page for the AI for IT development companies
- `/ai-supervize-mini` - The Czech one-day AI Supervize workshop page for individual developers and product people.
- `/skoleni` - Redirects to `/ai-supervize-mini`.
- `/cs/online-workshop` - The Czech landing page of the free 60minute online workshop about writing production code with AI agents.
- `/cs/online-workshop/dekujeme` - The confirmation page of the online workshop registration, reached by a full page load so that the Meta Pixel can measure the conversion.
- `/cs/online-workshop/participant` - The live room of one workshop occurrence: a countdown, a YouTube stage, reactions, a watching count, moderated chat, and timed materials. A participant marked as trusted stays invisible and only has their messages approved as they write them, while a participant marked as a moderator wears a badge and moderates the chat from inside the room: they see every message waiting for a decision, approve, reject, correct and pin messages, and trust or silence their authors. Only `/admin/workshops` appoints a moderator.
- `/cs/komunita` - The Czech-only room of the one permanent community, built on the very same participant room. Being a `community` room rather than a workshop occurrence, it has no schedule, no stage, and no live updates, so it offers the chat, the materials, and links into every published workshop.
- `/admin/community` - The administration of that one community, which is the shared workshop dashboard restricted to the `community` room kind, therefore without a picker between rooms and without the settings a permanent room does not have.
- `/admin/login` - The login of the whole administration, for the one hard-coded administrator `admin` whose password is the `ADMIN_TOKEN` of the server. It opens a signed session cookie, which is what every `/admin/*` page and every administration endpoint reads; a page therefore guards itself by `requireAdminSignedIn` and no address ever carries the token.
- `/admin` - The dashboard which links to every administration page, reached after signing in.
- `/pavol` - Redirects to `/cs/pavol` or `/en/pavol` based on the browser `Accept-Language` header.
- `/cs/pavol` - The Czech personal page of Pavol Hejný.
- `/en/pavol` - The English personal page of Pavol Hejný.
- ...

- If you need a change in the database migration, do it in file `migrations/*.sql`
