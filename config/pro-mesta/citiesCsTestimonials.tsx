import dariaHvizdalova from '@/public/people/daria-hvizdalova.jpeg';
import tomasStudenik from '@/public/people/tomas-studenik.jpg';
import { Testimonial } from '../../components/testimonials-section';

// TODO: !!! [🌆] `/pro-mesta` Testimonials for `citiesCsTestimonials`
// TODO: !!! [🌆] `/pro-mesta` Better copy of `citiesCsTestimonials`
// TODO: !!! [🌆] `/pro-mesta` Update the testimonial text according to our new Book 2.0 vision and cities

export const citiesCsTestimonials: Array<Testimonial> = [
    {
        name: 'Daria Hvizdalova',
        role: 'Ředitelka, AI & Learning, 42 London',
        testimonial:
            'By enabling programming in your native language, tools like Promptbook are bridging the gap between technology and people.',

        avatar: dariaHvizdalova,
    },
    {
        name: 'Tomas Studenik',
        role: 'Produktový manažer, Inovativní technologie',
        testimonial:
            'Promptbook transforms programming into a creative process accessible to everyone. As someone passionate about innovation, I see this as a game-changer.',
        avatar: tomasStudenik,
    },
];
