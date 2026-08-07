import { GOOGLE_ANALYTICS_ID, META_PIXEL_ID } from '@/config';
import { SITE_METADATA, SITE_VIEWPORT } from '@/lib/metadata/site-metadata';
import { createOrganizationStructuredData, createWebSiteStructuredData } from '@/lib/metadata/structured-data';
import { Metadata, Viewport } from 'next';
import { Inter, Outfit } from 'next/font/google';
import Script from 'next/script';
import spaceTrim from 'spacetrim';
import { Chatbot } from '../components/chatbot';
import { ClientWrapper } from '../components/client-wrapper';
import { CookiesBar } from '../components/cookies-bar';
import { StructuredData } from '../components/structured-data';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'latin-ext'], variable: '--font-inter' });
const outfit = Outfit({
    subsets: ['latin', 'latin-ext'],
    variable: '--font-outfit',
    weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = SITE_METADATA;

export const viewport: Viewport = SITE_VIEWPORT;

const SITE_STRUCTURED_DATA = [createOrganizationStructuredData(), createWebSiteStructuredData()];

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

                <StructuredData nodes={SITE_STRUCTURED_DATA} />

                {/* Google Analytics */}
                <Script
                    async
                    src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
                    strategy="afterInteractive"
                />
                <Script id="google-analytics" strategy="afterInteractive">
                    {spaceTrim(`
                        console.log('📊 Google Analytics initialized');

                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${GOOGLE_ANALYTICS_ID}');
                    `)}
                </Script>

                {/* Meta Pixel Code */}
                {/*
                    Note: The snippet runs on every real page load and reports a `PageView` of the current url, which is
                          what the url based conversions in the Meta administration are built on. A page which must be
                          measured as a conversion therefore has to be reached by a full page load.
                */}
                <Script id="meta-pixel" strategy="afterInteractive">
                    {spaceTrim(`
                        console.log('📈 Meta Pixel initialized');

                        !function(f,b,e,v,n,t,s)
                        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                        n.queue=[];t=b.createElement(e);t.async=!0;
                        t.src=v;s=b.getElementsByTagName(e)[0];
                        s.parentNode.insertBefore(t,s)}(window, document,'script',
                        'https://connect.facebook.net/en_US/fbevents.js');
                        fbq('init', '${META_PIXEL_ID}');
                        fbq('track', 'PageView');
                    `)}
                </Script>
            </head>
            <body className={`${inter.variable} ${outfit.variable} font-sans`}>
                <ClientWrapper>
                    {children}
                    {/* Meta Pixel NoScript */}
                    <noscript>
                        <img
                            height="1"
                            width="1"
                            style={{ display: 'none' }}
                            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
                            alt="Meta Pixel"
                        />
                    </noscript>
                    <Chatbot />
                    <CookiesBar />
                </ClientWrapper>
            </body>
        </html>
    );
}
