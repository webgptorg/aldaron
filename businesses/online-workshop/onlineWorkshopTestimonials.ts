import { pavolTestimonials } from '@/businesses/pavol/config-testimonials';
import type { Testimonial } from '@/components/testimonials-section';

const onlineWorkshopTestimonialNames = ['Jan Šedo', 'Tomáš Studeník'] as const;

export const onlineWorkshopTestimonials: Testimonial[] = onlineWorkshopTestimonialNames.map((name) => {
    const testimonial = pavolTestimonials.cs.find((item) => item.name === name);

    if (!testimonial) {
        throw new Error(`Missing Pavol testimonial for ${name}`);
    }

    return testimonial;
});
