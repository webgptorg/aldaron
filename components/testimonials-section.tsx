import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

const testimonials = [
  {
    name: 'John Doe',
    role: 'CEO, Example Inc.',
    testimonial:
      'Promptbook has revolutionized our workflow. The ability to create and share prompts has saved us countless hours.',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
  },
  {
    name: 'Jane Smith',
    role: 'Developer, Tech Corp.',
    testimonial:
      'As a developer, I appreciate the simplicity and power of Promptbook. It has become an essential tool in my daily routine.',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
  },
  {
    name: 'Samuel Green',
    role: 'Marketing Manager, Creative Solutions',
    testimonial:
      "Thanks to Promptbook, our marketing team can now collaborate on campaigns more effectively. The results have been outstanding.",
    avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d',
  },
  {
    name: 'Emily White',
    role: 'Data Scientist, Analytics Co.',
    testimonial:
      'Promptbook is a game-changer for data analysis. The ability to reuse complex prompts has significantly improved our efficiency.',
    avatar: 'https://i.pravatar.cc/150?u=a04258114e29026708d',
  },
  {
    name: 'Michael Brown',
    role: 'Freelancer',
    testimonial:
      'I use Promptbook for all my projects. It helps me stay organized and deliver high-quality work to my clients.',
    avatar: 'https://i.pravatar.cc/150?u=a04258114e29026707d',
  },
  {
    name: 'Jessica Black',
    role: 'Student',
    testimonial:
      'Promptbook has been an invaluable tool for my studies. It helps me organize my research and write better essays.',
    avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026706d',
  },
];

export function TestimonialsSection() {
  return (
    <section className="container mx-auto py-12 md:py-24">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">What Our Users Say</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Discover how Promptbook is making a difference for professionals and students alike.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.name}>
            <CardContent className="pt-6">
              <div className="flex items-start">
                <Avatar>
                  <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
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
