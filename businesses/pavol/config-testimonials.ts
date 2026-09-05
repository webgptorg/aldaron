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
                'Pavola znám šest let, hlavně z hackathonů a dalších inovačních projektů. Když se účastnil se svým týmem, mohli jste si vsadit, že skončí mezi prvními třemi. A taky že ano. Pavol se vyzná v nových technologiích a umí rychle najít řešení pro průmysl, vzdělávání i rozvoj měst.',
            avatar: tomasStudenik,
        },
        {
            name: 'Jan Šedo',
            role: 'Zakladatel H-edu',
            testimonial:
                'Pavol vytvořil prototyp naší aplikace H-edu a díky němu jsme hned získali investici. Potom navrhl architekturu systému i technologie, které se ukázaly jako správná volba i s odstupem času.',
            avatar: janSedo,
        },
        {
            name: 'Max Kozlov',
            role: 'Founder & CEO, Undout',
            testimonial:
                'Pavol umí stavět digitální produkty. Viděl jsem ho přes noc vytvořit integrovaného chatbota, se kterým jsme vyhráli Startup Weekend v Praze. Dokáže rychle vzít nové téma nebo technologii a postavit na něm fungující produkt.',
            avatar: maxKozlov,
        },
        {
            name: 'Bob Kartous',
            role: 'Prorektor VŠEM a autor',
            testimonial:
                'Pavol je schopný inovátor, který propojuje digitální technologie se společenskými tématy. V projektech, na kterých pracoval, přinesl do vzdělávání nové nápady a postupy.',
            avatar: bobKartous,
        },
        {
            name: 'Tereza Texlová',
            role: 'Spoluzakladatelka Czech.events',
            testimonial:
                'Pavol spojuje technické dovednosti s veřejným vystupováním a umí rozjet nové nápady. Těším se na náš další projekt.',
            avatar: terezaTexlova,
        },
    ],
    en: [
        {
            name: 'Tomáš Studeník',
            role: 'Startupper',
            testimonial:
                'I have known Pavol for six years, mainly through hackathons and other innovation projects. When he took part with his team, you could bet they would finish in the top three. And they did. Pavol understands new technologies and finds fast solutions for industry, education, and city development.',
            avatar: tomasStudenik,
        },
        {
            name: 'Jan Šedo',
            role: 'Founder of H-edu',
            testimonial:
                'Pavol created the prototype of our H-edu app, and we secured investment right away. He then designed the system architecture and chose technologies that have proved to be the right choices over time.',
            avatar: janSedo,
        },
        {
            name: 'Max Kozlov',
            role: 'Founder & CEO, Undout',
            testimonial:
                'Pavol knows how to build digital products. I saw him create an integrated chatbot overnight, and it won us first place at Startup Weekend in Prague. He can quickly take a new topic or technology and turn it into a working product.',
            avatar: maxKozlov,
        },
        {
            name: 'Bob Kartous',
            role: 'Vice-Rector at VŠEM and author',
            testimonial:
                'Pavol is an innovator who connects digital technologies with social topics. In the projects he worked on, he brought new ideas and approaches to education.',
            avatar: bobKartous,
        },
        {
            name: 'Tereza Texlová',
            role: 'Co-founder, Czech.events',
            testimonial:
                'Pavol combines technical skills with public speaking and knows how to get new ideas moving. I look forward to our next project.',
            avatar: terezaTexlova,
        },
    ],
};
