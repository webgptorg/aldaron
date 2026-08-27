import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import type { LegalDocument } from '@/lib/legal/legalDocument';
import { getLegalLink } from '@/lib/legal/legalLinks';
import { getOperatorIdentification, LEGAL_CONTACT_EMAIL } from '@/lib/legal/legalOperator';
import { ORGANIZATION_DATA_BOX_ID, SITE_URL } from '@/lib/metadata/site-config';
import Link from 'next/link';

/**
 * Host of the site as a visitor reads it, without the protocol
 */
const SITE_HOST = new URL(SITE_URL).host;

/**
 * Body which resolves consumer disputes out of court in the Czech Republic
 */
const CONSUMER_DISPUTE_RESOLUTION_URL = 'https://adr.coi.cz';

/**
 * Rules under which the site and the services are used, in every language they are published in
 */
export const TERMS_AND_CONDITIONS_DOCUMENTS: Readonly<Record<SupportedHomepageLanguage, LegalDocument>> = {
    cs: {
        title: 'Obchodní podmínky',
        perex: `Tyto obchodní podmínky upravují, za jakých pravidel používáte web ${SITE_HOST} a služby Promptbook a jak spolu uzavíráme smlouvu, když se registrujete na workshop, aktivujete členství v komunitě nebo si objednáte konzultaci.`,
        sections: [
            {
                heading: 'Kdo podmínky vydává',
                paragraphs: [
                    `Podmínky vydává společnost ${getOperatorIdentification('cs')}, provozovatel webu ${SITE_HOST} a služeb Promptbook (dále jen „provozovatel“).`,
                    <>
                        Zastihnete nás na <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a> nebo
                        prostřednictvím datové schránky {ORGANIZATION_DATA_BOX_ID}.
                    </>,
                ],
            },
            {
                heading: 'Co podmínky upravují',
                paragraphs: [
                    'Podmínky se vztahují na návštěvu a používání webu, na registraci na workshopy, školení a online akce, na členství v komunitě Promptbooku, na objednávku konzultací a na přihlášení k odběru novinek.',
                    'Pokud s vámi uzavřeme samostatnou smlouvu, řídí se náš vztah především touto smlouvou a podmínky se použijí na to, co smlouva neupravuje.',
                ],
            },
            {
                heading: 'Používání webu',
                paragraphs: [
                    'Obsah webu poskytujeme takový, jaký je, pro informaci o našich službách. Vyhrazujeme si právo web kdykoli změnit, doplnit nebo jeho část zrušit.',
                    'Web nesmíte používat způsobem, který by ho poškodil, přetížil nebo obešel jeho zabezpečení, ani z něj automatizovaně stahovat obsah bez našeho souhlasu.',
                ],
            },
            {
                heading: 'Registrace na akce a objednávka služeb',
                bullets: [
                    'Odesláním registračního formuláře nám podáváte návrh na uzavření smlouvy. Smlouva vzniká okamžikem, kdy vám registraci potvrdíme e-mailem.',
                    'V potvrzení najdete termín, místo nebo odkaz na online místnost, cenu a platební údaje.',
                    'U bezplatných akcí vzniká smlouva potvrzením registrace a nevzniká povinnost cokoli platit.',
                    'Kapacita akcí je omezená. Pokud se akce naplní nebo ji musíme zrušit, dáme vám vědět a už zaplacenou cenu vrátíme v plné výši do čtrnácti dnů.',
                ],
            },
            {
                heading: 'Cena a platba',
                bullets: [
                    'Ceny uvádíme v korunách českých. Informaci o tom, zda je cena včetně DPH, uvádíme vždy u konkrétní akce nebo služby.',
                    'Cenu platíte na základě faktury převodem se splatností uvedenou na faktuře, nejpozději však před konáním akce.',
                    'Slevový kód lze uplatnit jen po dobu jeho platnosti a nelze ho kombinovat s jinou slevou, pokud neuvedeme jinak.',
                ],
            },
            {
                heading: 'Členství v komunitě Promptbooku',
                bullets: [
                    'Stránka členství popisuje bezplatnou komunitu a aktuální placené členství. Živé online AI webináře zůstávají zdarma; placené členství dává přístup hlavně k záznamům, materiálům a dalšímu obsahu.',
                    'Nové placené členství se účtuje měsíčně za cenu uvedenou při registraci a nezačíná bezplatným zkušebním obdobím. Platný slevový kód může tuto cenu snížit. Dříve sjednané plány a roční platby se řídí podmínkami potvrzenými při jejich vzniku.',
                    'Cenu potvrzenou při vzniku členství vám po dobu nepřerušeného členství ve stejném plánu nezvýšíme. Při změně plánu, ukončení a pozdějším obnovení se použije cena platná v okamžiku této změny nebo obnovení.',
                    'Člen může členství ukončit e-mailem; není-li dohodnuto jinak, skončí uplynutím už zaplaceného období. Tím není dotčeno zákonné právo spotřebitele odstoupit od smlouvy.',
                    'Z provozních, technických, bezpečnostních, právních, ekonomických nebo obsahových důvodů můžeme změnit skladbu plánů či benefitů nebo jednotlivý benefit nahradit. Podstatnou změnu oznámíme e-mailem nejméně 30 dnů předem a člen může členství do její účinnosti bez sankce ukončit. Je-li okamžitý zásah nutný z právních, bezpečnostních nebo technických důvodů, můžeme změnu provést či službu pozastavit ihned a oznámit ji bez zbytečného odkladu.',
                    'Smlouvu můžeme vypovědět i bez uvedení důvodu s 30denní výpovědní dobou. Pro závažné právní, bezpečnostní či technické důvody nebo při podstatném porušení podmínek ji můžeme ukončit nebo členství pozastavit okamžitě.',
                    'Při změně, pozastavení nebo ukončení členství provozovatelem nevzniká právo na náhradu nepřímé újmy, ušlého zisku ani jinou kompenzaci nad rámec práv, která nelze smluvně omezit. Pokud neposkytneme službu za část již zaplaceného období, vrátíme poměrnou část ceny.',
                ],
            },
            {
                heading: 'Zrušení účasti a odstoupení od smlouvy',
                bullets: [
                    <>
                        Účast můžete zrušit e-mailem na{' '}
                        <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>. Zrušíte-li ji více než 14
                        dnů před akcí, vrátíme vám celou cenu; zrušíte-li ji později, můžete místo sebe poslat
                        náhradníka.
                    </>,
                    'Jste-li spotřebitel, máte právo odstoupit od smlouvy uzavřené na dálku do 14 dnů bez udání důvodu a bez sankce.',
                    'Pokud výslovně požádáte, abychom službu začali poskytovat ještě před uplynutím této lhůty, a služba je splněna, právo na odstoupení zaniká.',
                    'Peníze vracíme stejným způsobem, jakým jsme je přijali, do 14 dnů od odstoupení.',
                ],
            },
            {
                heading: 'Duševní vlastnictví',
                paragraphs: [
                    'Obsah webu, materiály z workshopů, texty, grafika a software jsou chráněné autorským právem a patří provozovateli nebo jeho partnerům.',
                    'Materiály, které od nás dostanete, můžete používat pro vlastní potřebu a pro potřebu své firmy. Bez našeho písemného souhlasu je nesmíte šířit dál, prodávat ani z nich vytvářet vlastní školení.',
                    'Obsah, který nám sami pošlete, zůstává váš. Dáváte nám k němu jen právo použít ho v rozsahu potřebném pro poskytnutí služby.',
                ],
            },
            {
                heading: 'Odpovědnost',
                paragraphs: [
                    'Naše služby vycházejí z aktuálního stavu poznání v oblasti umělé inteligence. Neručíme za konkrétní obchodní výsledek, kterého s našimi radami nebo nástroji dosáhnete.',
                    'Neodpovídáme za škodu způsobenou výpadkem webu, technickou závadou na straně poskytovatelů služeb nebo zásahem vyšší moci.',
                    'Vůči podnikatelům je naše odpovědnost za škodu omezena do výše ceny zaplacené za danou službu. Vůči spotřebitelům se odpovědnost řídí zákonem a toto omezení se neuplatní.',
                ],
            },
            {
                heading: 'Ochrana osobních údajů',
                paragraphs: [
                    <>
                        Jak nakládáme s osobními údaji, popisujeme v{' '}
                        <Link href={getLegalLink('privacyPolicy', 'cs').href}>zásadách ochrany osobních údajů</Link>.
                    </>,
                ],
            },
            {
                heading: 'Řešení sporů',
                paragraphs: [
                    <>
                        Spory se snažíme vyřešit dohodou, tak nám nejdřív napište na{' '}
                        <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>.
                    </>,
                    <>
                        Jste-li spotřebitel a nedohodneme se, můžete se obrátit na Českou obchodní inspekci, která
                        provádí mimosoudní řešení spotřebitelských sporů,{' '}
                        <a href={CONSUMER_DISPUTE_RESOLUTION_URL} target="_blank" rel="noopener noreferrer">
                            adr.coi.cz
                        </a>
                        .
                    </>,
                ],
            },
            {
                heading: 'Závěrečná ustanovení',
                paragraphs: [
                    'Náš vztah se řídí právem České republiky, zejména občanským zákoníkem, a případné spory rozhodují české soudy.',
                    'Podmínky můžeme změnit. Pro už uzavřenou smlouvu platí znění účinné v den, kdy jste registraci odeslali.',
                ],
            },
        ],
    },
    en: {
        title: 'Terms and Conditions',
        perex: `These terms and conditions set out the rules under which you use the ${SITE_HOST} website and the Promptbook services, and how we enter into a contract when you register for a workshop, activate a community membership, or order a consultation.`,
        sections: [
            {
                heading: 'Who issues these terms',
                paragraphs: [
                    `These terms are issued by ${getOperatorIdentification('en')}, the operator of the ${SITE_HOST} website and the Promptbook services (the "operator").`,
                    <>
                        You can reach us at <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a> or
                        through the Czech data box {ORGANIZATION_DATA_BOX_ID}.
                    </>,
                ],
            },
            {
                heading: 'What these terms cover',
                paragraphs: [
                    'These terms apply to visiting and using the website, to registering for workshops, trainings, and online events, to membership in the Promptbook community, to ordering consultations, and to subscribing to our news.',
                    'If we enter into a separate contract with you, our relationship is governed primarily by that contract and these terms apply to whatever the contract does not cover.',
                ],
            },
            {
                heading: 'Using the website',
                paragraphs: [
                    'We provide the content of the website as it is, as information about our services. We reserve the right to change or extend the website, or to discontinue a part of it, at any time.',
                    'You must not use the website in a way which would damage it, overload it, or circumvent its security, nor download its content automatically without our consent.',
                ],
            },
            {
                heading: 'Registrations and orders',
                bullets: [
                    'By submitting a registration form you make an offer to enter into a contract. The contract is concluded the moment we confirm your registration by e-mail.',
                    'The confirmation states the date, the venue or the link to the online room, the price, and the payment details.',
                    'For free events the contract is concluded by the confirmation of the registration and no obligation to pay arises.',
                    'Capacity is limited. If an event fills up or we have to cancel it, we let you know and refund the price already paid in full within fourteen days.',
                ],
            },
            {
                heading: 'Price and payment',
                bullets: [
                    'Prices are stated in Czech koruna. Whether a price includes VAT is always stated with the given event or service.',
                    'You pay against an invoice by bank transfer, by the due date stated on the invoice and at the latest before the event takes place.',
                    'A discount code can be used only while it is valid and cannot be combined with another discount unless we state otherwise.',
                ],
            },
            {
                heading: 'Promptbook community membership',
                bullets: [
                    'The membership page describes the free community and the current paid membership. Live online AI webinars remain free; paid membership primarily gives access to recordings, materials, and additional content.',
                    'New paid membership is billed monthly at the price shown when registering and does not begin with a free trial. A valid discount code may reduce that price. Previously agreed plans and annual billing remain governed by the terms confirmed when they began.',
                    'We do not increase the price confirmed when your membership starts for as long as the same plan continues without interruption. A plan change, termination, or later reactivation uses the price in effect at the time of that change or reactivation.',
                    'A member may terminate membership by e-mail; unless agreed otherwise, it ends when the paid billing period expires. This does not affect a consumer’s statutory right to withdraw from the contract.',
                    'For operational, technical, security, legal, economic, or content-related reasons, we may change the composition of plans or benefits or replace an individual benefit. We notify a member of a material change by e-mail at least 30 days in advance, and the member may terminate without penalty before it takes effect. Where legal, security, or technical reasons require immediate action, we may make the change or suspend the service immediately and give notice without undue delay.',
                    'We may terminate the contract without stating a reason on 30 days’ notice. For serious legal, security, or technical reasons, or a material breach of these terms, we may terminate the contract or suspend membership immediately.',
                    'A change, suspension, or termination by the operator creates no right to compensation for indirect loss, lost profit, or other compensation beyond rights which cannot be limited by contract. If we do not provide the service for part of a period already paid for, we refund the corresponding part of the price.',
                ],
            },
            {
                heading: 'Cancellation and withdrawal',
                bullets: [
                    <>
                        You can cancel your attendance by e-mail at{' '}
                        <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>. If you cancel more than 14
                        days before the event, we refund the full price; if you cancel later, you may send a substitute
                        in your place.
                    </>,
                    'If you are a consumer, you have the right to withdraw from a distance contract within 14 days without giving a reason and without penalty.',
                    'If you expressly ask us to start providing the service before that period ends and the service is fully performed, the right to withdraw ceases.',
                    'We return the money the same way we received it, within 14 days of the withdrawal.',
                ],
            },
            {
                heading: 'Intellectual property',
                paragraphs: [
                    'The content of the website, the workshop materials, texts, graphics, and software are protected by copyright and belong to the operator or to its partners.',
                    'You may use the materials you receive from us for your own needs and for the needs of your company. You must not distribute, sell, or build your own training on them without our written consent.',
                    'The content you send us stays yours. You only grant us the right to use it to the extent needed to provide the service.',
                ],
            },
            {
                heading: 'Liability',
                paragraphs: [
                    'Our services build on the current state of knowledge in artificial intelligence. We do not guarantee any particular business result you achieve with our advice or tools.',
                    'We are not liable for damage caused by an outage of the website, by a technical fault on the side of a service provider, or by force majeure.',
                    'Towards businesses, our liability for damage is limited to the price paid for the given service. Towards consumers, liability follows the law and this limitation does not apply.',
                ],
            },
            {
                heading: 'Personal data',
                paragraphs: [
                    <>
                        How we handle personal data is described in our{' '}
                        <Link href={getLegalLink('privacyPolicy', 'en').href}>privacy policy</Link>.
                    </>,
                ],
            },
            {
                heading: 'Disputes',
                paragraphs: [
                    <>
                        We try to settle disputes by agreement, so write to us first at{' '}
                        <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>.
                    </>,
                    <>
                        If you are a consumer and we do not reach an agreement, you can turn to the Czech Trade
                        Inspection Authority, which handles the out-of-court resolution of consumer disputes,{' '}
                        <a href={CONSUMER_DISPUTE_RESOLUTION_URL} target="_blank" rel="noopener noreferrer">
                            adr.coi.cz
                        </a>
                        .
                    </>,
                ],
            },
            {
                heading: 'Final provisions',
                paragraphs: [
                    'Our relationship is governed by the law of the Czech Republic, in particular by the Civil Code, and any disputes are decided by Czech courts.',
                    'We may change these terms. A contract already concluded is governed by the wording effective on the day you submitted your registration.',
                ],
            },
        ],
    },
};
