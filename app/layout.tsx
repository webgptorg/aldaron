import { GOOGLE_ANALYTICS_ID } from '@/config';
import { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import Script from 'next/script';
import spaceTrim from 'spacetrim';
import { Chatbot } from '../components/chatbot';
import { ClientWrapper } from '../components/client-wrapper';
import { CookiesBar } from '../components/cookies-bar';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'latin-ext'], variable: '--font-inter' });
const outfit = Outfit({
    subsets: ['latin', 'latin-ext'],
    variable: '--font-outfit',
    weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
    title: 'Promptbook',
    description: 'Create AI that truly understands your business.',
    keywords: ['AI', 'prompt engineering', 'artificial intelligence', 'prompts', 'GPT', 'machine learning'],
    authors: [{ name: 'Promptbook Team' }],
    creator: 'Promptbook',
    publisher: 'Promptbook',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL('https://ptbk.io'),
    alternates: {
        canonical: '/',
    },
    openGraph: {
        title: 'Promptbook',
        description: 'Create AI that truly understands your business.',
        url: 'https://ptbk.io',
        siteName: 'Promptbook',
        images: [
            {
                url: '/logo/og-image.png',
                width: 1860,
                height: 992,
                alt: 'Promptbook',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Promptbook',
        description: 'Create AI that truly understands your business.',
        images: ['/logo/og-image.png'],
        creator: '@promptbook',
    },
    icons: {
        icon: [
            { url: '/favicon.ico' },
            { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
            { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
        apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    },
    manifest: '/manifest.json',
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        google: 'your-google-verification-code',
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <meta name="theme-color" content="#79EAFD" />
                <meta name="msapplication-TileColor" content="#79EAFD" />
                <meta name="msapplication-config" content="/browserconfig.xml" />

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
                        fbq('init', '1211494690544539');
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
                            src="https://www.facebook.com/tr?id=1211494690544539&ev=PageView&noscript=1"
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
