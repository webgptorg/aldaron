'use client';

import { GOOGLE_ANALYTICS_ID, META_PIXEL_ID } from '@/config';
import {
    isGoogleAnalyticsAllowed,
    isGoogleAnalyticsPageViewAllowed,
    isThirdPartyTrackingAllowed,
} from '@/lib/tracking/trackingExclusions';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import spaceTrim from 'spacetrim';

/**
 * Global page analytics. Administration remains fully excluded; the workshop
 * participant room initializes Google Analytics without a page view and sends
 * only explicit anonymous interaction events.
 */
export function Analytics() {
    const pathname = usePathname();
    const isGoogleAnalyticsEnabled = isGoogleAnalyticsAllowed(pathname);
    const isGoogleAnalyticsPageViewEnabled = isGoogleAnalyticsPageViewAllowed(pathname);
    const isMetaPixelEnabled = isThirdPartyTrackingAllowed(pathname);

    if (!isGoogleAnalyticsEnabled && !isMetaPixelEnabled) {
        return null;
    }

    return (
        <>
            {isGoogleAnalyticsEnabled && (
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
                            gtag('config', '${GOOGLE_ANALYTICS_ID}', { send_page_view: ${isGoogleAnalyticsPageViewEnabled} });
                        `)}
                    </Script>
                </>
            )}

            {isMetaPixelEnabled && (
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
            )}
        </>
    );
}
