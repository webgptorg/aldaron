[x] by OpenAI Codex `gpt-5.6-sol` thinking `max` (ChatGPT account) - Implementation ~$0.5001 20 minutes; Testing 7 minutes

[✨🥇] Create `/cs/komunita/clenstvi`

- This will be a landing page for the premium membership of the community. It should explain the benefits of being a premium member, such as access to exclusive content, workshops, and networking opportunities.
- The community page is `/cs/komunita` but now you are doing a landing page for the premium membership of the community.
- There are 3 types of membership: basic, standard, and premium. The landing page should focus on the premium membership.
- Discount codes should work for the comunity
- For both there is a 7-day free trial
- For both there is 20% discount when paying for a year upfront (and can be combined with discount codes)
- By default user should see yearly payment, but user can switch to monthly payment
- When looking on yearly payment, show the monthly price with a strikethrough
- Every plan includes everything included in a lower plan.
- Make there some nice comparison table.
- The page should look great on all devices: mobile, tablet, PC....
- The page is meant for developers, creators, and small business owners. Keep this in mind while you design and copywrite the page.
- In the header, there should be text "Promptbook > Komunita". Now do this pattern only for this new page, but in the future this will be a universal pattern across all the pages "Promptbook > Xyz"
- But always show the monthly price
- There should be a feature when you have a fullname get parameter present, for example `/cs/komunita/clenstvi?fullname=Pavol%20Hejný` the texts Across the page should be personalized with the fullname, for example "Pavol Hejný, become a premium member of the community and get access to exclusive content, workshops, and networking opportunities." (in Czech)
- Also, when there is an `email` get parameter, it should be together with the full name pre-filled in the registration form.
- There should be information and a disclaimer that the prices, plans, and benefits can be changed, but if you subscribe to the plan now, the price will be held for you even if we raise the price.
- K obchodním podmínkám vytvořte klauzuli, která nám umožní kdykoli zrušit smlouvu nebo ji změnit bez náhrady.
- Keep the page simple, clean, and easy to read. Avoid clutter and unnecessary information.
- The page should be visually appealing and use a consistent color scheme and typography.
- Do not put there any unnecessary information and bullshit. Keep it simple and to the point.
- Put there some nice illustrations and icons to make the page more engaging.
    - Use the reaction of "</>" and reactions from workshops
- Keep in mind the DRY _(don't repeat yourself)_ principle.
    - Get inspiration from other landing pages
- Do a analysis of the current functionality before you start implementing.
- Add the changes into the [changelog](./changelog/_current-preversion.md)

Plans include:

Basic
Invitation to live workshops
Community materials
Starter repositories
Discussion with other members of the community

Standard
180 CZK per month or 1800 CZK per year
Community discord for the paid members
All the recorded workshops! - Now, the online workshops are exceptionally available even after the event. However, from now on, all the workshops will be available only for the Standard and Premium community members. - We have made the workshops, which include everything in one hour, but in upcoming days we are listing specialized hour workshops, which will include: - deep dive to the Git - deep dive to the AI and databases - deep dive to the tests - deep dive to the context
All of these workshops will be available for free when the user connects online, but recordings will be available only for the paid members.
Access to exclusive content
Share your creations with other members.
Priority with the questions during the workshops and option to ask questions before the workshops
RSS feed with materials

Premium
900 CZK per month or 9000 CZK per year
Invitations to meetings in real life once a month
Even more priority with materials and discussion participation

---

[x] by OpenAI Codex `gpt-5.6-terra` thinking `max` (ChatGPT account) - Implementation ~$0.4389 14 minutes; Testing 6 minutes

[✨🥇] Simplify (and unbullshitify) `/cs/komunita/clenstvi`

- Analyze the current implementation before making changes.
- Keep the **current visual design and graphical style of the page**. Do not redesign it from scratch.
- Keep existing illustrations, typography, colors, spacing, reactions, icons and overall visual identity wherever possible.
- The goal is to drastically simplify the offer and test whether people are willing to pay a small monthly amount for community membership.
- Live online AI webinars remain free. Make this very clear.
- There should now be only:
    - Free community
    - Paid membership for **199 CZK/month**
- Remove/hide the current Standard vs Premium complexity.
- Remove/hide the Premium plan.
- Remove the yearly/monthly switch and yearly pricing from this page.
- Remove the 7-day free trial. We want to test real willingness to pay.
- The main CTA should clearly lead to becoming a paid member for **199 CZK/month**.
- Show that the membership can be cancelled anytime.
- Focus the paid membership mainly on:
    - recordings of all webinars
    - archive of previous recordings
    - practical materials
    - additional content
    - priority questions during webinars
    - possibility to ask questions before webinars
    - paid-member Discord/community features that already exist
- Do not oversell the Discord or claim that it is already a highly active community.
- Keep the copy simple and concrete. Avoid generic marketing bullshit.
- The main message should be approximately:

> Živé AI webináře zůstávají zdarma.  
> Za 199 Kč měsíčně získáte záznamy, materiály a další obsah, díky kterému se můžete k tématům vracet a jít více do hloubky.

- Make the difference between Free and Paid very easy to understand.
- A simple comparison is enough. Do not create a complicated pricing table.
- Preserve existing `fullname` personalization and `email` pre-filling.
- Preserve existing discount-code functionality if possible, but do not emphasize discounts on the landing page.
- Do not break existing subscribers or existing backend membership/payment logic. Legacy plans may stay internally even if they are no longer shown to new users.
- Preserve the existing `Promptbook > Komunita` header pattern.
- Make sure the page still looks great on mobile, tablet and desktop.
- Reuse existing components and follow DRY.
- Add/update relevant tests.
- Add the changes into [`changelog/_current-preversion.md`](./changelog/_current-preversion.md).

The key goal is simplicity:

> **Free webinars stay free. Paid membership costs 199 CZK/month and gives access mainly to recordings, materials and additional community benefits.**

---

[ ]

[✨🥇] Simplify (and unbullshitify) `/cs/komunita/clenstvi`

- @@@@@@

---

[x] by Claude Code `claude-opus-5` thinking `max` - Implementation 7.96 an hour; Testing 5 minutes

[✨🥇] Base the live preview of `/cs/komunita/clenstvi` on the real data

- But you can fake the emoji reactions
- Show there more from the community content, such as recent webinars, discussions, projects, and member interactions,...

