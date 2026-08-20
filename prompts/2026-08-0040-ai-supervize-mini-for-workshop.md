[ ]

[✨👿] Uprav stránku `/ai-supervize-mini` aby fungovala jako follow-up pro dnešní online workshop.

- Budou tam dva termíny workshopů:
    - 4.9 - 10:00-16:00 - Exkluzivně maximálně pro 10 lidí v Praze. - 12 000 Kč
    - 9.9 - 13:00-17:00 - Online workshop pro maximálně 50 lidí - 3 000 Kč
- Nejsme plátci DPH zatím.
- Pro všechny účastníky webináře, to znamená, pokud budou mít v URL `?code=webinar-2026-08-20`, tak dostanou slevu 25% na oba workshopy.
- Akorát ta sleva platí pouze jeden den.
- GET param `code` v URL předvyplní Slevový kód, tak se automaticky předvyplní i do formuláře.
- Zbývající počet míst nepočítej fiktivně, ale skutečně ho spočítej z kontaktů, které jsou registrované.
- Zruš staré termíny, které tam jsou.
- Keep in mind the DRY _(don't repeat yourself)_ principle.
- Do a proper analysis of the current functionality before you start implementing.
