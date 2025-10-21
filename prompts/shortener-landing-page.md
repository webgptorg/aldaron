[x]

Make landing page for localhost shortened links.

-   Add `landingPage` column to Supabase table `ShortcodeLink`
-   The `landingPage` can contain custom markdown content for the landing page
-   The `#url` header is replaced with the the `url` value from the table _(or randomly choose one if multiple)_
-   Shortener logic is in `/src/app/[shortcode]/page.tsx` using Supabase table `ShortcodeLink`
-   Update Supabase types here `/src/supabase/types.ts` and write migration SQL here to the chat
-   When the `landingPage` column is `null` (by default), keep the existing logic as is.

---

[x]

Auto-add call to action button on landing pages.

-   When there is `landingPage` defined in the Supabase table, and the `landingPage` does not already contain a link/button to the target URL `#url`, automatically add a call to action button at the bottom of the landing page
-   The button text should be "Go to link" and should link to the target URL `#url`
-   Shortener logic is in `/src/app/[shortcode]/page.tsx` using Supabase table `ShortcodeLink`
-   When the `landingPage` already contains a link/button keeping the existing logic as is.

---

[x]

Allow the raw HTML content in the `ShortcodeLink.landingPage`

-   When there is `landingPage` defined and the `landingPage` contains `<!--no-template-->` marker or `<!DOCTYPE html>`, render the `landingPage` content as raw HTML without any template or markdown processing.
-   Shortener logic is in `/src/app/[shortcode]/page.tsx` using Supabase table `ShortcodeLink`
-   In other cases, keep the existing logic of rendering markdown content.

---

[x][ ]

Avoid showing "Promptbook app 💬 Chatbot" from [RootLayout](/src/app/layout.tsx) on shortener page when `landingPage` is defined and has `isRawHtml`

-   Shortener logic is in `/src/app/[shortcode]/page.tsx` using Supabase table `ShortcodeLink`

---

[x]

Center the raw html content when on shortener page when `landingPage` is defined and has `isRawHtml`

-   Center both vertically and horizontally
-   Shortener logic is in `/src/app/[shortcode]/page.tsx` using Supabase table `ShortcodeLink`

---

[x]

Shortened links with Landing pages should measure both views and clicks.

-   Add column `ShortcodeLinkClick.navigatedAt` _(simmilar to `ShortcodeLinkClick.clickedAt`)_ which records the timestamp when user loads the landing page
-   When user clicks the link on the landing page, update the existing `ShortcodeLinkClick.clickedAt` timestamp
-   When user just loads the landing page, only `navigatedAt` is set and `clickedAt` remains `null`
-   Shortener logic is in `/src/app/[shortcode]/page.tsx` using Supabase table `ShortcodeLink`
-   Update Supabase types here `/src/supabase/types.ts` and write migration SQL here to the chat
-   When the `landingPage` column is `null` (by default), keep the existing logic as is.

---

[x] <- ???

Shortened links with Landing pages should have nice Open Graph metadata for better sharing on social media.

-   This applies to the `ShortcodeLink` with `landingPage` defined
-   Have `og:title`, `og:description`, and `og:image` meta tags for better link previews
-   Have `title`, `description` meta tags for SEO
-   Create / extract these meta tags dynamically based on the `landingPage` content
    -   Use first `#` header as `title` and `og:title`
    -   Use first paragraph as `description` and `og:description`
    -   Use first image as `og:image` (if any), otherwise don't set `og:image`
-   Shortener logic is in `/src/app/[shortcode]/page.tsx` using Supabase table `ShortcodeLink`

---

[ ]

_<- Put the landing page options in the form in Promptbook.studio_
