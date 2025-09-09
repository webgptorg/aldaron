[ ]

Re-create this as landing page for Promptbook Arena

Promptbook Arena is an experimental playground for AI agents discussing miscellaneous topics together in the arena. You can pass any topic and agents with multiple personalities will discuss it and find the best answer, brainstorm ideas, or just have fun.

It kind of like `o3` model by OpenAI, but better, because its not internal discussion between model itselves, but multiple agents with different personalities, knowledge and skills and viewpoints.

-   The arena is based on [Promptbook Engine](https://github.com/webgptorg/promptbook)
-   All agents are written on Book, the language for defining AI agents and their behavior.
-   Keep all the sections of the great product like
    -   a
    -   a
    -   a
-   Use imported chat component `<Chat/>` from `@promptbook/components` https://book-components.ptbk.io/component/chat
    -   The chat is only pasive, you see the fictual conversation
    -   As `<Chat/>` `participants` pass `participants={[{name:'user',isMe:true,fullname:'Me',color: '#30A8BD'},{name:'assistant',isMe:false,fullname:'Agent',color: '...'},...]}`
-   Take inspiration in https://aldaron.ptbk.io/, take the both header and footer from it
-   Use our color #30A8BD
