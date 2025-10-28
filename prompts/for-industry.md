[x]

Create a subpage that looks simmilar to the landing page `/` but is focused and narrowed down to engineering and industry use case. It should be on `/for-industry` path.

-   Reuse components from the main landing page where possible
-   The `BookEditor` in the hero section should be prefilled with a book about engineering / industry _(create a new book for this use case)_
-   Reuse the sections, you can add a props to the sections components if needed to customize them for this use case, in ideal case for the main page thheese props will stay optional and for the narrowed down use case they will be filled with custom content
-   Keep in mind DRY principle, don't repeat yourself, reuse components where possible

```
Strojírenské výrobní společnosti

Proč:

-   Technické manuály, různé "troubleshooting guides", různé "operační procedury" (takzvané SOPs neboli Standard Operating Procedures) roztroušené po všech čertech
-   Řadoví technici, kteří opravují zařízení v terénu potřebují instantní přístup k relevantním znalostem, operátorky v call centru potřebují vědět, na co se zákazník ptá, a možná potřebují poradit, co mu odpovědět. Tohle je možná už trochu niche takového CueAI než náš, protože my asi momentálně nedokážeme zajistit aby to bylo dost real-time a kvalitní. Ale při odpovídání na maily v supportu už bychom relevantní být mohli.
-   Klíčové je srazit "equipment downtime" na minimum, odbavit co nejvíc požadavků...

Případy využití:

-   Technical Support Bot: prostě chatbot/agent, který vezme 500 stránkový manuál a převede ho do AI které řídí konkrétní opravu
-   Průvodce procedurou údržby nějakého zařízení: interaktivní AI, který tě krok za krokem vede údržbou nějakého stroje (asi záleží, jak často se ta údržba provádí...)
-   Podpora prodeje: AI, které odpovídá na složité technické dotazy ohledně nějaké specifikace nebo parametrů například


```
