'use client';
import { Benefit } from '../../components/benefits-section';

// TODO: !!! [🌆] `/pro-mesta` Figure out best benefits
// TODO: !!! [🌆] `/pro-mesta` Better copy of `citiesCsBenefits`

export const citiesCsBenefits: Array<Benefit> = [
    {
        iconName: 'Zap',
        title: 'Jednoduchost',
        description: (
            <>
                Získejte to nejlepší z obou světů:
                <br />
                jednoduchost no-code platforem a hlubokou kontrolu nad frameworky.
            </>
        ),
    },
    {
        iconName: 'Zap',
        title: 'Skutečně Vaše AI',
        description:
            'Vytvořte AI agenty pro jakoukoli roli, od zákaznické podpory a marketingu po právní a personální oddělení, a zajistěte, aby splňovali vaše specifické požadavky.',
    },
    {
        iconName: 'Briefcase',
        title: 'Práce s dokumenty',
        description:
            'Snadno definujte AI agenty se specifickými znalostmi, pravidly a osobnostmi, které odpovídají hodnotám vaší organizace.',
    },
    {
        iconName: 'Shield',
        title: 'Bezpečnost',
        description:
            'Knihy jsou explicitní a snadno srozumitelné, což zajišťuje, že se vaše AI chová předvídatelně a konzistentně ve všech aplikacích.',
    },

    {
        iconName: 'Book',
        title: 'Chování pod kontrolou',
        description:
            'Použijte závazky Persona, Knowledge, Rule a Action k přesnému definování chování vašeho AI agenta.',
    },
    {
        iconName: 'Code',
        title: 'Široké možnosti integrace',
        description:
            'Používejte své AI agenty definované v knihách v chatovacích aplikacích, odpovídacích agentech, kódovacích asistentech a interních aplikacích.',
    },
];
