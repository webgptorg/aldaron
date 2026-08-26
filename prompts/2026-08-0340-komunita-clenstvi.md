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

