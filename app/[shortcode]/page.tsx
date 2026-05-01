import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { MarkdownContent } from '@/components/markdown-content';
import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import Script from 'next/script';
import { spaceTrim } from 'spacetrim';

interface PageProps {
    params: Promise<{ shortcode: string }>;
}

async function getShortcodeLink(shortcode: string) {
    if (!supabase) return null;
    const result = await supabase
        .from('ShortcodeLink')
        .select('id, url, landingPage')
        .eq('shortcode', shortcode)
        .single();

    const { data, error } = result;

    if (error || !data) {
        return null;
    }

    return data;
}

function getLandingPageMetadata(landingPage: string) {
    const titleMatch = landingPage.match(/^#\s*(.*)$/m);
    const title = titleMatch ? titleMatch[1] : null;

    const descriptionMatch = landingPage.match(/^\s*>\s*(.*)$/m);
    const description = descriptionMatch ? descriptionMatch[1] : null;

    const imageMatch = landingPage.match(/!\[.*\]\((.*)\)/);
    const image = imageMatch ? imageMatch[1] : null;

    return { title, description, image };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { shortcode } = await params;
    const data = await getShortcodeLink(shortcode);

    if (!data || !data.landingPage) {
        return {};
    }

    const { title, description, image } = getLandingPageMetadata(data.landingPage);

    const metadata: Metadata = {};

    if (title) {
        metadata.title = title;
        metadata.openGraph = { ...metadata.openGraph, title };
    }

    if (description) {
        metadata.description = description;
        metadata.openGraph = { ...metadata.openGraph, description };
    }

    if (image) {
        metadata.openGraph = { ...metadata.openGraph, images: [{ url: image }] };
    }

    return metadata;
}

export default async function Page({ params }: PageProps) {
    const { shortcode } = await params;

    if (!shortcode) {
        notFound();
    }

    try {
        const data = await getShortcodeLink(shortcode);

        if (!data || !data.url || data.url.length === 0) {
            notFound();
        }

        const headerList = await headers();
        const userAgent = headerList.get('user-agent') ?? '';
        const referer = headerList.get('referer') ?? '';
        const ipHeader = headerList.get('x-forwarded-for') ?? '';
        const ip = ipHeader.split(',')[0];
        const language = headerList.get('accept-language') ?? '';
        const platform = headerList.get('sec-ch-ua-platform') ?? '';

        const randomIndex = Math.floor(Math.random() * data.url.length);
        const selectedUrl = data.url[randomIndex];

        if (!selectedUrl) {
            notFound();
        }

        const isLocalhost = /^https?:\/\/localhost(:[0-9]+)?/.test(selectedUrl);

        if (data.landingPage || (isLocalhost && !data.landingPage)) {
            const { data: clickData, error: clickError } = supabase
                ? await supabase
                      .from('ShortcodeLinkClick')
                      .insert({
                          shortcodeLinkId: data.id,
                          userAgent,
                          referer,
                          ip,
                          language,
                          platform,
                          navigatedAt: new Date().toISOString(),
                          clickedAt: null,
                      })
                      .select('id')
                      .single()
                : { data: null, error: null };

            if (clickError) {
                console.error('Error creating click record:', clickError);
                // Note: Proceeding without click tracking if insertion fails
            }

            const clickId = clickData?.id;

            let landingContent;
            if (isLocalhost && !data.landingPage) {
                landingContent = spaceTrim(`
                    # localhost Link
                    > This link points to a localhost address, which is only accessible on your local machine.
                    > You can continue to the link below, but it may not be accessible to others.
                    - Your URL: ${selectedUrl}
                `);
            } else {
                landingContent = data.landingPage;
            }

            // Replace #url header with selectedUrl
            landingContent = landingContent.replace(/^#url.*$/m, `# ${selectedUrl}`);

            // Check for existing link/button to selectedUrl or #url
            const linkRegex = new RegExp(
                `(\\\\[.*?\\\\]\\\\((?:${selectedUrl}|#url)\\\\))|(<a\\\\s+[^>]*href=[\"'](?:${selectedUrl}|#url)[\"'][^>]*>)|(<button[^>]*>(.|\\\\n)*?<\\\\/button>)`,
                'i',
            );
            if (!linkRegex.test(landingContent)) {
                landingContent += spaceTrim(`
                    <p>
                        <a href="${selectedUrl}" class="inline-block bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 transition no-underline">
                            Go to link
                        </a>
                    </p>
                `);
            }

            const isBareHtml = landingContent.includes('<!DOCTYPE html>');

            const isBarePage = landingContent.includes('<!--no-template-->') || isBareHtml;

            const trackingScript = clickId
                ? `
                  const clickId = ${clickId};
                  document.body.addEventListener('click', (event) => {
                      let target = event.target;
                      while (target && target.tagName !== 'A') {
                          target = target.parentElement;
                      }
                      if (target && target.tagName === 'A') {
                          navigator.sendBeacon('/api/track-click', JSON.stringify({ clickId }));
                      }
                  });
              `
                : '';

            if (isBareHtml) {
                return (
                    <div className="flex items-center justify-center min-h-screen">
                        <div dangerouslySetInnerHTML={{ __html: landingContent }} />
                        <Script id="tracking-script">{trackingScript}</Script>
                    </div>
                );
            }

            // For now, we'll just render the HTML. A markdown component can be added later.
            if (isBarePage) {
                return (
                    <div className="flex items-center justify-center min-h-screen">
                        <MarkdownContent content={landingContent} />
                        <Script id="tracking-script">{trackingScript}</Script>
                    </div>
                );
            }

            return (
                <div className="min-h-screen">
                    <main className="min-h-screen">
                        <Header isBare />
                        <div className="container min-h-screen flex items-center justify-center px-4 mx-auto">
                            <MarkdownContent content={landingContent} />
                        </div>
                        <Footer />
                    </main>
                    <Script id="tracking-script">{trackingScript}</Script>
                </div>
            );
        } else {
            if (supabase)
                await supabase.from('ShortcodeLinkClick').insert({
                    shortcodeLinkId: data.id,
                    userAgent,
                    referer,
                    ip,
                    language,
                    platform,
                    navigatedAt: new Date().toISOString(),
                    clickedAt: new Date().toISOString(),
                });

            redirect(selectedUrl);
        }
    } catch (err) {
        // Next.js uses thrown errors internally for redirect() and notFound() - must re-throw them
        if ((err as { digest?: string })?.digest?.startsWith('NEXT_')) {
            throw err;
        }
        console.error('Error processing shortcode:', err);
        notFound();
    }
}
