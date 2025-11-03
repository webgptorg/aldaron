import chatAsset from '@/public/integrations/chat.png';
import gmailAsset from '@/public/integrations/gmail.png';
import graphAsset from '@/public/integrations/graph.png';
import { Integration } from '../../components/integrations-section';

// [🌆]

export const citiesCsIntegrations: Array<Integration> = [
    {
        preview: chatAsset,
        title: 'Chatovací aplikace !!!',
        description: 'Vytvořte chatovacího asistenta pro komunikaci s občany nebo pro turistické informační centrum.',
        features: ['Dostupnost 24/7', 'Personalizované informace', 'Přesně řízené odpovědi'],
    },
    {
        preview: gmailAsset,
        title: 'Agent pro odpovědi !!!',
        description: 'Automaticky analyzujte a odpovídejte na e-maily občanů, nebo vytvářejte návrhy odpovědí.',
        features: ['Automatické odpovědi', 'Povědomí o kontextu', 'Generování návrhů'],
    },
    {
        preview: chatAsset,
        title: 'Asistent pro úředníky !!!',
        description: 'Pomozte úředníkům s přípravou dokumentů a dodržováním interních předpisů.',
        features: ['Vlastní standardy pro dokumenty', 'Soulad s předpisy', 'Vynucování bezpečnosti'],
    },
    {
        preview: graphAsset,
        title: 'Interní expertíza !!!',
        description: 'Integrujte AI do interních aplikací pro analýzu dat, sentimentu a další.',
        features: ['Vlastní automatizace', 'Analýza dat', 'Klasifikace sentimentu'],
    },
];
