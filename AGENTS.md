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
- `/cs/online-workshop/participant` - The room of the online workshop, where a participant writes their name and then gets the countdown, the stream, the materials unlocked one by one, the live chat and the reactions. It is steered from `/admin/workshop` and its tables are created by `lib/workshop/workshop-tables.sql`.
- `/ai-ta-krajta` - The Czech landing page of the AI ta Krajta video podcast, which leads to its YouTube channel and to the e-mail notification about a new episode. Everything the site knows about the podcast lives in `businesses/ai-ta-krajta/config.ts`, so the media appearances of Pavol Hejný describe it from the very same place.
- `/pavol` - Redirects to `/cs/pavol` or `/en/pavol` based on the browser `Accept-Language` header.
- `/cs/pavol` - The Czech personal page of Pavol Hejný.
- `/en/pavol` - The English personal page of Pavol Hejný.
- ...
