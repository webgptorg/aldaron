import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import type { Testimonial } from '@/components/testimonials-section';
import bobKartous from '@/public/pavol/testimonials/bob-kartous.png';
import janSedo from '@/public/pavol/testimonials/jan-sedo.png';
import maxKozlov from '@/public/pavol/testimonials/max-kozlov.png';
import terezaTexlova from '@/public/pavol/testimonials/tereza-texlova.png';
import tomasStudenik from '@/public/pavol/testimonials/tomas-studenik.png';

export const pavolTestimonials: Record<SupportedHomepageLanguage, Testimonial[]> = {
    cs: [
        {
            name: 'Tomáš Studeník',
            role: 'Startupper',
            testimonial:
                'Pavola znám už 6 let. Zejména z hackathonů a dalších inovačních projektů. Pokud se se svým týmem zúčastnil, mohli byste si vsadit, že bude mezi nejlepšími třemi. A měli byste pravdu! Pavol je inovátor, který se orientuje v nejnovějších technologiích a dokáže nacházet rychlá řešení výzev v průmyslu, vzdělávání či rozvoji měst.',
            avatar: tomasStudenik,
        },
        {
            name: 'Jan Šedo',
            role: 'Zakladatel H-edu',
            testimonial:
                'Pavol vytvořil prototyp naší aplikace H-edu tak, že jsme okamžitě získali investici. Následně navrhl architekturu systému a využití technologií, které se v testu času ukázaly jako správně zvolené pro naše účely.',
            avatar: janSedo,
        },
        {
            name: 'Max Kozlov',
            role: 'Founder & CEO, Undout',
            testimonial:
                'Pavol je naprosto špičkový v tvorbě digitálních produktů. Viděl jsem ho doslova přes noc vytvořit integrovaného chatbota, který nám zajistil první místo na Startup Weekendu v Praze. Rychle vezme jakoukoliv technologii nebo téma a postaví nad ní fungující produkt.',
            avatar: maxKozlov,
        },
        {
            name: 'Bob Kartous',
            role: 'Prorektor VŠEM a autor',
            testimonial:
                'Pavol je velmi schopný inovátor, jehož potenciál sahá napříč digitálními technologiemi a společenskými tématy. V projektech, na kterých spolupracoval, přinesl do světa vzdělávání nové vize a přístupy.',
            avatar: bobKartous,
        },
        {
            name: 'Tereza Texlová',
            role: 'Spoluzakladatelka Czech.events',
            testimonial:
                'Pavolova kombinace technických dovedností spolu s veřejným vystupováním a schopností nastartovat nové nápady je impozantní. Těším se na náš další super zajímavý projekt.',
            avatar: terezaTexlova,
        },
    ],
    en: [
        {
            name: 'Tomáš Studeník',
            role: 'Startupper',
            testimonial:
                'I have known Pavol for 6 years, especially from hackathons and other innovation projects. If he took part with his team, you could bet they would be among the top three. And you would be right! Pavol is an innovator who understands the latest technologies and can find fast solutions to challenges in industry, education, or city development.',
            avatar: tomasStudenik,
        },
        {
            name: 'Jan Šedo',
            role: 'Founder of H-edu',
            testimonial:
                'Pavol created the prototype of our H-edu app in such a way that we immediately secured investment. He then designed the system architecture and use of technologies that stood the test of time as the right choices for our purposes.',
            avatar: janSedo,
        },
        {
            name: 'Max Kozlov',
            role: 'Founder & CEO, Undout',
            testimonial:
                'Pavol is absolutely top-notch at creating digital products. I saw him literally create an integrated chatbot overnight that secured us first place at Startup Weekend in Prague. He quickly takes any technology or topic and builds a working product on top of it.',
            avatar: maxKozlov,
        },
        {
            name: 'Bob Kartous',
            role: 'Vice-Rector at VŠEM and author',
            testimonial:
                'Pavol is a very capable innovator whose potential spans digital technologies and social topics. In the projects he collaborated on, he brought new visions and approaches into the world of education.',
            avatar: bobKartous,
        },
        {
            name: 'Tereza Texlová',
            role: 'Co-founder, Czech.events',
            testimonial:
                'Pavol combines technical skills, public speaking, and the ability to kick-start new ideas in an impressive way. I look forward to our next really interesting project.',
            avatar: terezaTexlova,
        },
    ],
};
