/**
 * Subscribe an email address to the newsletter
 *
 * @param email - The email address to subscribe to the newsletter
 */
export async function subscribeToNewsletter(email: string) {
    const response = await fetch('https://promptbook.studio/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });

    const data = (await response.json()) as { message?: string };

    if (!response.ok) {
        throw new Error(data.message || 'Failed to subscribe');
    }
}
