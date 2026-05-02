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
            name: 'Tomas Studenik',
            role: 'Startupper',
            testimonial:
                'I have known Pavol for years through hackathons and innovation projects. If his team joined, you could bet they would finish in the top three. Pavol is an innovator who keeps up with new technologies and finds fast solutions to challenges in industry, education, and city development.',
            avatar: tomasStudenik,
        },
        {
            name: 'Jan Sedo',
            role: 'Founder of H-edu',
            testimonial:
                'Pavol built a prototype of our H-edu app in a way that helped us secure investment immediately. He then designed the architecture and the use of technologies that proved to be the right choice over time.',
            avatar: janSedo,
        },
        {
            name: 'Max Kozlov',
            role: 'Founder & CEO, Undout',
            testimonial:
                'Pavol is an absolute beast when it comes to creating digital products. I have seen him build an integrated chatbot overnight that won us first place at Startup Weekend Prague. He picks up any topic fast and builds even faster.',
            avatar: maxKozlov,
        },
        {
            name: 'Bob Kartous',
            role: 'Vice-Rector at VSEM and author',
            testimonial:
                'Pavol is a highly capable innovator whose range spans digital technologies and socially important themes. In the projects we collaborated on, he brought new visions and new approaches into education.',
            avatar: bobKartous,
        },
        {
            name: 'Tereza Texlova',
            role: 'Co-founder, Czech.events',
            testimonial:
                'Pavol combines strong technical skills with public speaking and the ability to kick-start new ideas. That mix is rare. I am looking forward to our next genuinely interesting project together.',
            avatar: terezaTexlova,
        },
    ],
};
