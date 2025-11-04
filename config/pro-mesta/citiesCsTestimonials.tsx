import dariaHvizdalova from '@/public/people/daria-hvizdalova.jpeg';
import tomasStudenik from '@/public/people/tomas-studenik.jpg';
import { Testimonial } from '../../components/testimonials-section';

// TODO: !!! [🌆] `/pro-mesta` Testimonials for `citiesCsTestimonials`
// TODO: !!! [🌆] `/pro-mesta` Better copy of `citiesCsTestimonials`

export const citiesCsTestimonials: Array<Testimonial> = [
    {
        name: 'Daria Hvizdalova',
        role: 'Ředitelka, AI & Learning, 42 London',
        testimonial:
            'Nástroje jako Promptbook umožňují programování v přirozeném jazyce a tím propojují svět technologií a lidí.',
        avatar: dariaHvizdalova,
    },
    {
        name: 'Tomas Studenik',
        role: 'Produktový manažer, Inovativní technologie',
        testimonial:
            'Promptbook mění programování v kreativní proces dostupný pro každého. Jako nadšenec do inovací to vnímám jako revoluční změnu.',
        avatar: tomasStudenik,
    },
];
