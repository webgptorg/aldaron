import { aiSupervizeMiniWorkshopConfig } from '@/businesses/ai-supervize-mini/config';
import { FAQ } from '@/components/faq-section';
import { Bot, Code2, GitPullRequest, Link, ShieldCheck, TestTube2, Workflow } from 'lucide-react';

export const aiSupervizeMiniHeroBullets = [
    'Celý den hands-on v Praze',
    'Max 10 účastníků',
    'Pro TypeScript / JavaScript produktový vývoj',
];

export const aiSupervizeMiniTerminalMetrics = [
    { metric: 'Nejasná zadání', before: 8, after: 3, unit: '×' },
    { metric: 'Ruční rework', before: 12, after: 6, unit: ' h' },
    { metric: 'Velikost PR', before: 900, after: 420, unit: ' ř.' },
    { metric: 'Regrese', before: 6, after: 2, unit: '/sprint' },
];

export const aiSupervizeMiniTakeaways = [
    {
        icon: Workflow,
        title: 'Workflow pro AI vývoj',
        description: 'Jak rozdělit práci od nápadu přes PRD, issue a branch až po kontrolovaný merge.',
    },
    {
        icon: Bot,
        title: 'Volba nástrojů a modelů',
        description: 'Kdy použít Codex, Claude Code, Copilot, Cursor nebo jiný nástroj a kdy model změnit.',
    },
    {
        icon: GitPullRequest,
        title: 'Git, PR a review',
        description: 'Jak držet změny malé, dohledatelné a kontrolovatelné i ve chvíli, kdy velkou část píše AI.',
    },
    {
        icon: TestTube2,
        title: 'Testování a signály kvality',
        description: 'Unit testy, e2e testy, typy v TypeScriptu a praktické kontrolní body proti regresím.',
    },
    {
        icon: ShieldCheck,
        title: 'Rizika a bezpečnost',
        description: 'Jak brzy chytat chyby, jak řešit průšvihy a jak nastavit hranice pro data i oprávnění.',
    },
    {
        icon: Code2,
        title: 'Code quality v době AI',
        description: 'Jak poznat, že AI skutečně zrychluje produkt, a ne jen vyrábí další neudržitelný kód.',
    },
];

export const aiSupervizeMiniFaqs: FAQ[] = [
    {
        question: 'V čem se AI Supervize Mini liší od běžného školení nebo workshopu o AI?',
        answer: (
            <p>
                Supervize není jen předávání informací. Je to komplexní pohled na AI vývoj včetně rizik, testování,
                verzování, kvality kódu a rozhodování nad nástroji. Nejde o naučení jednoho konkrétního nástroje, ale o
                způsob, jak přemýšlet nad celým procesem vývoje s AI.
            </p>
        ),
    },
    {
        question: 'Je to školení Claude Code?',
        answer: (
            <p>
                Ne. Claude Code může být jedním z probíraných nástrojů, ale workshop není postavený jako produktové
                školení jednoho vendoru. Cílem je, abyste uměli zvolit správný nástroj, model a workflow podle typu
                práce, rizika a kvality výstupu.
            </p>
        ),
    },
    {
        question: 'Jaké jsou hlavní přínosy pro účastníky?',
        answer: (
            <div className="space-y-3">
                <p>
                    Účastníci získají praktický mindset pro AI vývoj: jak delegovat práci na AI, jak brzy chytat chyby,
                    jak pracovat s PRD a jak měřit, že se produkt skutečně posouvá kupředu.
                </p>
                <ul className="list-disc space-y-1 pl-5">
                    <li>Jak nechat víc práce delegovat na AI místo neustálého ručního dohledu.</li>
                    <li>Jak co nejdřív odchytit potenciální chyby a průšvihy.</li>
                    <li>Jak správně dělit práci pro AI do PRD, issue a kontrolovatelných PR.</li>
                    <li>Kdy přecházet na jiný nástroj nebo model.</li>
                    <li>Konkrétní tipy pro Git, unit testy, e2e testy, TypeScript typy a code review.</li>
                </ul>
            </div>
        ),
    },
    {
        question: 'Jak dlouho workshop trvá a jak je strukturovaný?',
        answer: (
            <p>
                Workshop trvá jeden den od {aiSupervizeMiniWorkshopConfig.timeRange} s přestávkou na oběd. Je rozdělený
                do několika bloků: mindset a rizika, tooling, PRD a zadávání práce AI, verzování, testování, code review
                a měření dopadu. Každý blok kombinuje vysvětlení s praktickým cvičením.
            </p>
        ),
    },
    {
        question: 'Pro koho je workshop vhodný?',
        answer: (
            <p>
                Pro vývojáře a produkťáky, kteří pracují s TypeScriptem nebo JavaScriptem, případně obecně s webovým či
                aplikačním vývojem. Není potřeba být AI expert, ale základní zkušenost s AI nástroji pomůže dostat z dne
                víc praktických výsledků.
            </p>
        ),
    },
    {
        question: 'Může firma poslat víc lidí najednou?',
        answer: (
            <p>
                Ano. Formulář umožňuje vybrat počet účastníků podle zbývající kapacity konkrétního termínu. Workshop je
                pořád vedený pro jednotlivce a malé skupiny, takže držíme maximálně{' '}
                {aiSupervizeMiniWorkshopConfig.maxParticipantsPerWorkshop} lidí na termín.
                <br />
                <br />
                Zároveň však nabízíme <Link href="/ai-supervize">AI Supervizi i pro celé firmy</Link>, kde přizpůsobíme
                obsah a formát přímo na míru týmu a jeho potřebám.
            </p>
        ),
    },
    {
        question: 'Co si mám přinést?',
        answer: (
            <p>
                Vlastní notebook a ideálně konkrétní příklad produktu, repozitáře nebo workflow, na kterém chcete AI
                vývoj zlepšit. Není nutné sdílet citlivý kód. Stačí popsat situaci, typ práce a místa, kde dnes AI
                pomáhá nebo selhává.
            </p>
        ),
    },
    {
        question: 'Co si mám přinést?',
        answer: (
            <p>
                Vlastní notebook a ideálně konkrétní příklad produktu, repozitáře nebo workflow, na kterém chcete AI
                vývoj zlepšit. Není nutné sdílet citlivý kód. Stačí popsat situaci, typ práce a místa, kde dnes AI
                pomáhá nebo selhává.
            </p>
        ),
    },

    {
        question: 'Proč je cena 8500 Kč když jiné kurzy a školení o AI jsou levnější?',
        answer: (
            <p>
                AI Supervize není běžný kurz o AI, kterých je na trhu spousta. Je to komplexní a praktický workshop
                zaměřený na konkrétní výzvy a řešení v AI vývoji, včetně rizik, testování, verzování a code review. Cena
                odráží hloubku obsahu, praktickou hodnotu a individuální přístup v malých skupinách s expertem s
                reálnými zkušenostmi z AI vývoje. Konkrétně máme několik důvodů pro nastavení této ceny:
                <ul>
                    <li>
                        AI Supervizí Vás provází Pavol Hejný, který má za sebou 15+ let zkušeností s vývojem a
                        produktovým managementem, včetně 3 let intenzivní práce s AI nástroji v reálných projektech.
                    </li>
                    <li>
                        Jiné kurzy o AI často vedou lidé bez hluboké praktické zkušenosti s AI vývojem, což se může
                        odrazit na kvalitě obsahu a jeho aplikovatelnosti v reálných situacích.
                    </li>
                    <li>
                        Workshop není jen teorie, ale praktický trénink s konkrétními příklady, cvičeními a zpětnou
                        vazbou na vaše konkrétní výzvy.
                    </li>
                </ul>
            </p>
        ),
    },
];
