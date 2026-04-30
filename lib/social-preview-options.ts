import {
    defaultMetadataDescription,
    defaultMetadataOpenGraphAlt,
    defaultMetadataTitle,
} from '@/businesses/_generic/defaultMetadata';
import {
    citiesCsMetadataDescription,
    citiesCsMetadataOpenGraphAlt,
    citiesCsMetadataTitle,
} from '@/businesses/pro-mesta/citiesCsMetadata';
import { SocialPreviewImageOptions } from '@/lib/social-preview-image';

export const defaultSocialPreviewOptions: SocialPreviewImageOptions = {
    alt: defaultMetadataOpenGraphAlt,
    audienceLabel: 'For growing teams',
    description: defaultMetadataDescription,
    eyebrow: 'AI transformation for business',
    title: defaultMetadataTitle,
    urlLabel: 'ptbk.io',
    bullets: ['Business context', 'Simple Books', 'Your data, your control'],
    stats: [
        { label: 'Knowledge', value: 'Capture company context' },
        { label: 'Agents', value: 'Build aligned AI workflows' },
        { label: 'Control', value: 'Open-source and private' },
    ],
    palette: {
        backgroundStart: '#04131c',
        backgroundEnd: '#123847',
        accent: '#7aebff',
        accentSoft: '#7affeb',
        frame: 'rgba(255, 255, 255, 0.12)',
        cardBackground: 'rgba(4, 19, 28, 0.82)',
        mutedText: 'rgba(255, 255, 255, 0.78)',
        chipBackground: 'rgba(255, 255, 255, 0.08)',
        chipBorder: 'rgba(122, 235, 255, 0.28)',
        sidePanelBackground: 'linear-gradient(180deg, rgba(122, 235, 255, 0.18) 0%, rgba(255, 255, 255, 0.06) 100%)',
        sidePanelBorder: 'rgba(122, 235, 255, 0.24)',
        sideLabel: 'rgba(255, 255, 255, 0.72)',
        statBackground: 'rgba(4, 19, 28, 0.36)',
        statBorder: 'rgba(255, 255, 255, 0.08)',
        orbPrimary: 'rgba(122, 235, 255, 0.18)',
        orbSecondary: 'rgba(122, 255, 235, 0.14)',
    },
};

export const proMestaSocialPreviewOptions: SocialPreviewImageOptions = {
    alt: citiesCsMetadataOpenGraphAlt,
    audienceLabel: 'Pro samosprávy',
    description: citiesCsMetadataDescription,
    eyebrow: 'AI transformace pro města a obce',
    title: citiesCsMetadataTitle,
    urlLabel: 'ptbk.io/pro-mesta',
    bullets: ['Interní pravidla', 'Open-source řešení', 'Vaše data, Vaše kontrola'],
    stats: [
        { label: 'Úřad', value: 'AI pro agendy a směrnice' },
        { label: 'Občané', value: 'Přesnější odpovědi' },
        { label: 'Provoz', value: 'Méně administrativy' },
    ],
    palette: {
        backgroundStart: '#06111d',
        backgroundEnd: '#183752',
        accent: '#7aebff',
        accentSoft: '#8fffcc',
        frame: 'rgba(255, 255, 255, 0.14)',
        cardBackground: 'rgba(6, 17, 29, 0.84)',
        mutedText: 'rgba(255, 255, 255, 0.8)',
        chipBackground: 'rgba(255, 255, 255, 0.08)',
        chipBorder: 'rgba(143, 255, 204, 0.28)',
        sidePanelBackground: 'linear-gradient(180deg, rgba(12, 39, 57, 0.96) 0%, rgba(7, 23, 37, 0.9) 100%)',
        sidePanelBorder: 'rgba(143, 255, 204, 0.18)',
        sideLabel: 'rgba(255, 255, 255, 0.7)',
        statBackground: 'rgba(255, 255, 255, 0.06)',
        statBorder: 'rgba(255, 255, 255, 0.08)',
        orbPrimary: 'rgba(122, 235, 255, 0.16)',
        orbSecondary: 'rgba(143, 255, 204, 0.13)',
    },
};
