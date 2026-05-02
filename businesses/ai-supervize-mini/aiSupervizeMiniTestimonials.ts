import { pavolTestimonials } from '@/businesses/pavol/config-testimonials';
import type { Testimonial } from '@/components/testimonials-section';

const aiSupervizeMiniTestimonialNames = ['Tomáš Studeník', 'Jan Šedo'] as const;

export const aiSupervizeMiniTestimonials: Testimonial[] = aiSupervizeMiniTestimonialNames.map((name) => {
    const testimonial = pavolTestimonials.cs.find((item) => item.name === name);

    if (!testimonial) {
        throw new Error(`Missing Pavol testimonial for ${name}`);
    }

    return testimonial;
});
