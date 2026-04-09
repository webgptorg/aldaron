import { Integration } from '@/components/integrations-section';
import chatAsset from '@/public/integrations/chat.png';
import gmailAsset from '@/public/integrations/gmail.png';
import graphAsset from '@/public/integrations/graph.png';
import vscodeAsset from '@/public/integrations/vscode.png';

/**
 * Integration and use-case cards for agronomy landing page.
 */
export const forAgroIntegrations: Array<Integration> = [
    {
        preview: chatAsset,
        title: 'Agent agronomické expertízy',
        description:
            'AI konzultant pro choroby plodin, správu půdy a osvědčené zemědělské postupy dostupný pro celý tým.',
        features: ['Diagnostika častých problémů', 'Doporučení konkrétních kroků', 'Sjednocení know-how v týmu'],
    },
    {
        preview: gmailAsset,
        title: 'Bot pro regulatorní compliance',
        description:
            'Rychlá orientace v zemědělských předpisech, interních směrnicích a povinné dokumentaci pro audit.',
        features: ['Kontrola souladu postupů', 'Přehled povinností podle agendy', 'Návrhy odpovědí pro úřady'],
    },
    {
        preview: graphAsset,
        title: 'Agent pro dodavatelský řetězec',
        description:
            'Podpora logistiky, inventáře a práce s dodavatelskými protokoly pro stabilnější provoz napříč sezónou.',
        features: ['Lepší přehled o zásobách', 'Rychlá práce s dodavateli', 'Snížení provozních výpadků'],
    },
    {
        preview: vscodeAsset,
        title: 'Interní provozní asistent',
        description:
            'Napojení AI do interních systémů pro konzistentní rozhodování mezi agronomy, managementem a provozem.',
        features: ['Automatizované interní workflow', 'Jednotný přístup k datům', 'Integrace na míru'],
    },
];

