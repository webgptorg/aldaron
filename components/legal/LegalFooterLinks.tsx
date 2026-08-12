import type { SupportedHomepageLanguage } from '@/lib/homepage-language';
import { getLegalLinks } from '@/lib/legal/legalLinks';
import { cn } from '@/lib/utils';
import Link from 'next/link';

/**
 * Links to every legal document of the site, which each footer has to offer
 *
 * @param language language the visitor is reading, which decides the language of the documents they land on
 */
export function LegalFooterLinks({
    language,
    className,
    linkClassName,
}: {
    language: SupportedHomepageLanguage;
    className?: string;
    linkClassName?: string;
}) {
    return (
        <ul className={cn('flex flex-wrap items-center gap-x-6 gap-y-2', className)}>
            {getLegalLinks(language).map((link) => (
                <li key={link.href}>
                    <Link href={link.href} className={cn('transition-colors', linkClassName)}>
                        {link.text}
                    </Link>
                </li>
            ))}
        </ul>
    );
}
