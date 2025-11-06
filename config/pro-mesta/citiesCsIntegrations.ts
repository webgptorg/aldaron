import chatAsset from '@/public/integrations/chat.png';
import gmailAsset from '@/public/integrations/gmail.png';
import graphAsset from '@/public/integrations/graph.png';
import { Integration } from '../../components/integrations-section';

// TODO: !!! [🌆] `/pro-mesta` Figure out best integrations
// TODO: !!! [🌆] `/pro-mesta` Better copy of `citiesCsIntegrations`

export const citiesCsIntegrations: Array<Integration> = [
    {
        preview: chatAsset,
        title: 'Chat',
        description: 'Vytvořte chat pro komunikaci s občany nebo zaměstnanci.',
        features: ['Dostupnost 24/7', 'Personalizované informace', 'Přesně řízené odpovědi'],
    },
    {
        preview: gmailAsset,
        title: 'Email',
        description: 'Automaticky analyzujte a odpovídejte na e-maily občanů, nebo vytvářejte návrhy odpovědí.',
        features: ['Automatické odpovědi', 'Velmi jednoduché', 'Generování návrhů'],
    },
    {
        preview: chatAsset,
        title: 'Asistent pro úředníky',
        description: 'Pomozte úředníkům s přípravou dokumentů a dodržováním interních předpisů.',
        features: ['Vlastní standardy pro dokumenty', 'Soulad s předpisy'],
    },
    {
        preview: graphAsset,
        title: 'Interní expertíza',
        description: 'Využijte interní znalosti pro lepší rozhodování a služby.',
        features: ['Analýza dat', 'Možnost na míru'],
    },
];
