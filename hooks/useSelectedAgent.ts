import { useEffect, useState } from 'react';
import { getDefaultAgent, getAgentById, type BookAgent } from '../lib/book-registry';

const SELECTED_AGENT_KEY = 'selected_agent_id';

export function useSelectedAgent() {
    const [selectedAgent, setSelectedAgent] = useState<BookAgent>(getDefaultAgent());
    const [isLoaded, setIsLoaded] = useState(false);

    // Load persisted selected agent on mount
    useEffect(() => {
        try {
            const savedAgentId = localStorage.getItem(SELECTED_AGENT_KEY);
            if (savedAgentId) {
                const agent = getAgentById(savedAgentId);
                if (agent) {
                    setSelectedAgent(agent);
                }
            }
        } catch (e) {
            console.warn('Failed to load selected agent from localStorage', e);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    // Persist selected agent whenever it changes (but only after initial load)
    useEffect(() => {
        if (!isLoaded) return;

        try {
            localStorage.setItem(SELECTED_AGENT_KEY, selectedAgent.id);
        } catch (e) {
            console.warn('Failed to save selected agent to localStorage', e);
        }
    }, [selectedAgent, isLoaded]);

    const selectAgent = (agent: BookAgent) => {
        setSelectedAgent(agent);
    };

    const selectAgentById = (agentId: string) => {
        const agent = getAgentById(agentId);
        if (agent) {
            setSelectedAgent(agent);
        }
    };

    return {
        selectedAgent,
        selectAgent,
        selectAgentById,
        isLoaded
    };
}
