[x]

**Re-create this as a landing page for PromptBook Arena.**

Currently, this is an Alderon landing page, a product that clones you as an avatar using Promptbook. However, we now want to create a Promptbook Arena landing page. It is a different product, but it uses a similar design and structure based on the Promptbook Engine. You can clean and delete all the references to the Alderon product.
The old landing page has been backed up, so you are now working on a safe copy.

**Promptbook Arena** is an experimental playground where AI agents discuss various topics. You can propose any topic, and the agents, which have multiple personalities, will discuss it, find the best answer, brainstorm ideas, or just have fun.

It's similar to the `o3` model by OpenAI, but better. It's not an internal discussion between models themselves, but rather between multiple agents with different personalities, knowledge, skills, and viewpoints.

-   The arena is based on [Promptbook Engine](https://github.com/webgptorg/promptbook)
-   All agents are written on Book, the language for defining AI agents and their behavior.
-   Keep all the sections of the great product like
    -   Hero section (this should be preview of the arena with some fictual conversation)
    -   Why Choose Our Arena?
    -   Your Agents, Your Control
    -   Simple, Transparent Pricing
    -   FAQ
-   Make preview of the arena with some fictual conversation containing 3 agents with different personalities
    -   Allow user to show multiple fictual conversations about miscellaneous topics like:
        -   "The future of AI in healthcare"
        -   "Best strategies for remote team collaboration"
        -   "The impact of climate change on AI Agents"
        -   "Does AI have consciousness and soul?"
        -   "Is AI a threat to humanity?"
        -   "Is vibecoding dope or nope?"
        -   Fictional programming with programmer and reviewer
    -   Simulate the conversation flow and writing
    -   Make the conversation interesting and fun to read and bit controversial
    -   Each agent should have different personality, knowledge and viewpoint
    -   Each agent should have different color and profile picture
    -   For theese fictual conversations make some system, make each fictiual conversation in its own `YAML` file
    -   Use imported chat component `<Chat/>` from `@promptbook/components` https://book-components.ptbk.io/component/chat
        -   The chat is only pasive, you see the fictual conversation
        -   As `<Chat/>` `participants` pass `participants={[{name:'user',isMe:true,fullname:'Me',color: '#30A8BD'},{name:'assistant',isMe:false,fullname:'Agent',color: '...'},...]}`
-   The application is on `https://promptbook.studio/arena`, but keep the functionality waitlist and `skipWaitlist`
-   Use our brand color #79EAFD

---

[x]

In [arena-preview.tsx](components/arena-preview.tsx) use imported chat component `<Chat/>` from `@promptbook/components` not your own implementation.

As `<Chat/>` `participants` pass `participants={[{name:'user',isMe:true,fullname:'Me',color: '#30A8BD'},{name:'assistant',isMe:false,fullname:'Agent',color: '...'},...]}`

---

[ ]

Each participant of the arena-preview should have its own `avatarSrc` with different profile picture.

---

[ ]

Discussion in arena-preview should be emulated that is happening in real time, so each message should appear with some delay, not all at once.

When user loads the page, the first message should appear after 1 second, then the next message some random time between 1 and 3 seconds, then the next message some random time between 1 and 3 seconds, etc.
