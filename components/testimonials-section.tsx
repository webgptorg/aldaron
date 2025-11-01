import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { StaticImageData } from 'next/image';
import { defaultTestimonials } from '../config/_generic/defaultTestimonials';

export type Testimonial = {
    name: string;
    role: string;
    testimonial: string;
    avatar: StaticImageData;
};

type TestimonialsSectionProps = {
    testimonials?: Array<Testimonial>;
    title?: string;
    description?: string;
};

export function TestimonialsSection(props: TestimonialsSectionProps) {
    const {
        testimonials = defaultTestimonials,
        title = 'What People Says',
        description = 'Discover how Promptbook is making a difference for professionals worldwide:',
    } = props;

    return (
        <section className="container mx-auto py-12 md:py-24">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
                <p className="mt-4 text-lg text-muted-foreground">{description}</p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {testimonials.map((testimonial) => (
                    <Card key={testimonial.name}>
                        <CardContent className="pt-6">
                            <div className="flex items-start">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={testimonial.avatar.src} alt={testimonial.name} />
                                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="ml-4">
                                    <p className="text-lg font-semibold">{testimonial.name}</p>
                                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                </div>
                            </div>
                            <p className="mt-4 text-muted-foreground">{`"${testimonial.testimonial}"`}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
}
