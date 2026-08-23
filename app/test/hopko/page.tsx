import type { Metadata } from 'next';
import { HopkoExperiment } from './HopkoExperiment';

export const metadata: Metadata = {
    title: 'Hopko — tiny chaos, big hop',
    description: 'An experimental little productivity goblin with excellent bounce.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function HopkoRoute() {
    return <HopkoExperiment />;
}
