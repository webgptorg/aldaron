import chatAsset from '@/public/integrations/chat.png';
import gmailAsset from '@/public/integrations/gmail.png';
import graphAsset from '@/public/integrations/graph.png';
import { Integration } from '../../components/integrations-section';

// TODO: !!! [🌆] `/pro-mesta` Figure out best integrations
// TODO: !!! [🌆] `/pro-mesta` Better copy of `citiesCsIntegrations`

export const citiesCsIntegrations: Array<Integration> = [
    {
        preview: chatAsset,
        title: 'Asistent pro úředníky',
        description:
            'Pomocník při tvorbě dokumentů, usnesení a zápisů, který hlídá soulad s interními směrnicemi a legislativou.',
        features: ['Kontrola formální správnosti', 'Dodržování standardů města', 'Úspora času při administrativě'],
    },
    {
        preview: graphAsset,
        title: 'Znalostní báze úřadu',
        description:
            'Centralizovaný přístup k interním předpisům, metodikám a zkušenostem pro rychlejší a konzistentní rozhodování.',
        features: ['Vyhledávání v dokumentech', 'Sdílení know-how napříč odbory', 'Řešení na míru vašemu městu'],
    },
    {
        preview: chatAsset,
        title: 'Virtuální asistent pro občany',
        description:
            'Inteligentní chatbot na webu města, který okamžitě zodpoví dotazy občanů k úředním hodinám, životním situacím či místním akcím.',
        features: ['Nepřetržitá dostupnost 24/7', 'Odpovědi dle aktuálních dat města', 'Snížení zátěže infolinky'],
    },
    {
        preview: gmailAsset,
        title: 'Chytrá e-mailová podatelna',
        description:
            'Automatická analýza příchozích e-mailů, jejich třídění dle agendy a generování návrhů odpovědí pro rychlejší vyřízení.',
        features: ['Kategorizace dle tématu', 'Návrhy odpovědí jedním klikem', 'Zkrácení doby odezvy'],
    },
];
