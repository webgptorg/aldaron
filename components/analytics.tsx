'use client';

import { GOOGLE_ANALYTICS_ID, META_PIXEL_ID } from '@/config';
import { isThirdPartyTrackingAllowed } from '@/lib/tracking/trackingExclusions';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import spaceTrim from 'spacetrim';

/**
 * Global analytics, omitted from pages whose URL contains credentials or
 * participant identity.
 */
export function Analytics() {
    const pathname = usePathname();

    if (!isThirdPartyTrackingAllowed(pathname)) {
        return null;
    }

    return (
        <>
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
        </>
    );
}
