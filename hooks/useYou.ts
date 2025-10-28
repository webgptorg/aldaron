import { useSearchParams } from 'next/navigation';

export function useYou(): string | null {
    const searchParams = useSearchParams();

    // Get the 'you' parameter from URL (both regular and ROT13 encoded)
    const youParam = searchParams.get('you');
    const youRot13Param = searchParams.get('lbh'); // 'you' in ROT13

    // Decode the parameter - use regular 'you' if available, otherwise decode ROT13 'lbh'
    const you = youParam || (youRot13Param ? rot13(youRot13Param) : null);

    if (you === null) {
        return null;
    }

    const You = you.charAt(0).toUpperCase() + you.slice(1);

    return You;
}

/**
 * ROT13 decoder function
 */
function rot13(str: string): string {
    return str.replace(/[a-zA-Z]/g, (char) => {
        const start = char <= 'Z' ? 65 : 97;
        return String.fromCharCode(((char.charCodeAt(0) - start + 13) % 26) + start);
    });
}
