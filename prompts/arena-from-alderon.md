[ ]

**Re-create this as landing page for Promptbook Arena**

Currently this is a landing page Alderon, a product to clone you as a avatar using Promptbook, but now we want to create a landing page for Promptbook Arena, different product but using the simmilar design and structure based on Promptbook Engine. You can clean and delete all the references to Alderon product, the old current landing page is backuped and now you are wotking safe copy.

**Promptbook Arena** is an experimental playground for AI agents discussing miscellaneous topics together in the arena. You can pass any topic and agents with multiple personalities will discuss it and find the best answer, brainstorm ideas, or just have fun.

It kind of like `o3` model by OpenAI, but better, because its not internal discussion between model itselves, but multiple agents with different personalities, knowledge and skills and viewpoints.

-   The arena is based on [Promptbook Engine](https://github.com/webgptorg/promptbook)
-   All agents are written on Book, the language for defining AI agents and their behavior.
-   Keep all the sections of the great product like
    -   Why Choose Our ...?
    -   Your Avatars, Your control
    -   Simple, Transparent Pricing
    -   FAQ
-   Place here
-   Use imported chat component `<Chat/>` from `@promptbook/components` https://book-components.ptbk.io/component/chat
    -   The chat is only pasive, you see the fictual conversation
    -   As `<Chat/>` `participants` pass `participants={[{name:'user',isMe:true,fullname:'Me',color: '#30A8BD'},{name:'assistant',isMe:false,fullname:'Agent',color: '...'},...]}`
-   The application is on `https://promptbook.studio/arena`, but keep the functionality waitlist and `skipWaitlist`
-   Use our brand color #79EAFD
