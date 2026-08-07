# Current preversion

- Fixed the cookie consent customization flow so the modal opens again and saving preferences dismisses the cookie bar.
- Improved landing page CTA flow so pricing cards keep the selected plan context and the Pro trial CTA goes straight to purchase instead of a generic waitlist modal.
- Reduced mobile hero/header overflow by tightening responsive header sizing and constraining hero text, hint pills, mocked chat, and AI Supervize terminal animation.
- Added the Czech `/ai-supervize-mini` workshop landing page with configurable dates, scarcity, SUPER discount tracking, Contact registration, `/skoleni` redirect, and cross-links from the full AI Supervize page.
- Updated `/ai-supervize-mini` terms to 19. 6. and 25. 6., added an online variant, and split onsite vs. online pricing in the registration flow.
- Rebuilt page metadata around one shared `createPageMetadata` factory, so every page derives its title, description, canonical, `hreflang` alternates, Open Graph and X card from a single definition instead of repeating them.
- Fixed `/cs` and `/en` sharing no preview image at all, because a page level `openGraph` object replaces the inherited one in Next.js.
- Generated on-brand sharing preview images for every landing page (`/cs`, `/en`, `/pro-mesta`, `/for-agro`, `/for-industry`, `/ai-supervize`, `/ai-supervize-mini`, `/cs/online-workshop`, `/hackathon-factory`, `/cs/pavol`, `/en/pavol`) from a derived palette, and dropped the duplicated `twitter-image` routes.
- Added `/sitemap.xml` built from the same page definitions, so the sitemap advertised by `robots.txt` finally exists.
- Added Organization, WebSite and Person structured data for Google, and removed the placeholder Google site verification tag that shipped to production.
- Gave metadata to the pages which had none (`/contact`, `/privacy`, `/terms`, `/data-deletion`, `/for-industry`) and kept `/old`, `/dekujeme`, `/shortener` and `/admin/contacts` out of search results.
- Replaced the static `manifest.json` and `robots.txt` with generated routes, aligning the app manifest theme color with the browser theme color and dropping the dead `browserconfig.xml` reference.
- Moved the online workshop registration confirmation onto its own `/cs/online-workshop/dekujeme` url reached by a full page load, so the Meta Pixel reports a `PageView` of it and an ad campaign can optimize on real registrations instead of clicks.
- Added "add to calendar" links and the follow-up steps to the online workshop confirmation, and reported it to the Meta Pixel as a `CompleteRegistration` event.
