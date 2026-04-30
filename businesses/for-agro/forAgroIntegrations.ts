import chatAsset from '@/public/integrations/chat.png';
import gmailAsset from '@/public/integrations/gmail.png';
import graphAsset from '@/public/integrations/graph.png';
import { Integration } from '@/components/integrations-section';

export const forAgroIntegrations: Integration[] = [
    {
        preview: chatAsset,
        title: 'Agent agronomické expertízy',
        description:
            'Odpovídá na dotazy k chorobám plodin, výživě, správě půdy a osvědčeným postupům podle vašich interních metodik.',
        features: [
            'Jednotná doporučení pro terénní týmy',
            'Rychlé vyhledání symptomů a postupů',
            'Znalosti z interních metodik i sezónních doporučení',
        ],
    },
    {
        preview: graphAsset,
        title: 'Bot pro regulatorní compliance',
        description:
            'Pomáhá navigovat složité zemědělské předpisy, interní pravidla a auditní požadavky bez zbytečné improvizace.',
        features: [
            'Odkazy na interní směrnice a legislativu',
            'Kontrola povinných kroků a evidence',
            'Méně stresu při auditu a interních kontrolách',
        ],
    },
    {
        preview: gmailAsset,
        title: 'Agent pro dodavatelský řetězec',
        description:
            'Podpora logistiky, inventáře a dodavatelských protokolů pro osiva, hnojiva, přípravky i technické vybavení.',
        features: [
            'Dodavatelské postupy na jednom místě',
            'Přehled zásob a kritických položek',
            'Standardizace procesů napříč provozy',
        ],
    },
    {
        preview: chatAsset,
        title: 'Asistent pro regionální týmy',
        description:
            'Pomocník pro distributory, agronomy a vedoucí provozu, kteří potřebují sdílet know-how mezi více lokalitami.',
        features: [
            'Sdílení expertizy napříč oblastmi',
            'Odpovědi v mobilu, chatu i e-mailu',
            'Nižší závislost na jednotlivcích',
        ],
    },
];
