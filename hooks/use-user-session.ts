import { useState, useEffect } from 'react';

export function useUserSession() {
    const [session, setSession] = useState<{ email: string } | null>(null);

    useEffect(() => {
        // In a real app, you'd fetch the user session here.
        // For now, we'll just simulate a logged-in user.
        setSession({ email: 'test@example.com' });
    }, []);

    return session;
}
