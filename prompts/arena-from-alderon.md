[ ]

**Re-create this as landing page for Promptbook Arena**

Currently this is a landing page Alderon, a product to clone you as a avatar using Promptbook, but now we want to create a landing page for Promptbook Arena, different product but using the simmilar design and structure based on Promptbook Engine. You can clean and delete all the references to Alderon product, the old current landing page is backuped and now you are wotking safe copy.

**Promptbook Arena** is an experimental playground for AI agents discussing miscellaneous topics together in the arena. You can pass any topic and agents with multiple personalities will discuss it and find the best answer, brainstorm ideas, or just have fun.

It kind of like `o3` model by OpenAI, but better, because its not internal discussion between model itselves, but multiple agents with different personalities, knowledge and skills and viewpoints.

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
