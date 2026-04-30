import chatAsset from '@/public/integrations/chat.png';
import gmailAsset from '@/public/integrations/gmail.png';
import graphAsset from '@/public/integrations/graph.png';
import vscodeAsset from '@/public/integrations/vscode.png';
import { Integration } from '../../components/integrations-section';

export const industryIntegrations: Array<Integration> = [
    {
        preview: chatAsset,
        title: 'Chat Apps !!!',
        description: 'Create a chat shopping assistant for your eShop or a customer support bot.',
        features: ['24/7 availability', 'Personalized recommendations', 'Tightly controlled responses'],
    },
    {
        preview: gmailAsset,
        title: 'Reply Agent !!!',
        description: 'Automatically analyze and reply to emails, or create drafts for your review.',
        features: ['Auto-replies', 'Context awareness', 'Draft generation'],
    },
    {
        preview: vscodeAsset,
        title: 'Coding Agent !!!',
        description: 'Enforce your coding style and architecture rules in any vibecoding platform.',
        features: ['Custom coding standards', 'Architecture alignment', 'Security enforcement'],
    },
    {
        preview: graphAsset,
        title: 'Internal Expertise !!!',
        description: 'Integrate AI into your internal apps for data analysis, sentiment analysis, and more.',
        features: ['Custom automations', 'Data analysis', 'Sentiment classification'],
    },
];
