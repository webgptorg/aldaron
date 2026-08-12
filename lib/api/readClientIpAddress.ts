/**
 * Headers in which the proxy in front of the site writes the address of the visitor, in the order they are read
 *
 * Note: `x-forwarded-for` holds the whole chain "visitor, first proxy, second proxy", so only its first entry is the
 *       visitor itself.
 */
const CLIENT_IP_ADDRESS_HEADER_NAMES = ['x-forwarded-for', 'x-real-ip'] as const;

/**
 * How the four numbers of an IPv4 address look
 */
const IPV4_ADDRESS_PATTERN = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

/**
 * Highest value one number of an IPv4 address may have
 */
const MAXIMAL_IPV4_ADDRESS_PART = 255;

/**
 * How an IPv6 address looks, deliberately loosely - it is a group of hexadecimal numbers separated by colons, which
 * may end with an IPv4 address
 */
const IPV6_ADDRESS_PATTERN = /^[0-9a-f]{0,4}(:[0-9a-f]{0,4}){2,7}(\.\d{1,3}){0,3}$/i;

/**
 * Whether the text is an address the database can store in its `inet` column
 *
 * Note: The column refuses anything else with an error, so an address which cannot be understood is better stored as
 *       no address at all than as a lost contact.
 */
export function isIpAddressValid(ipAddress: string): boolean {
    const ipv4AddressParts = IPV4_ADDRESS_PATTERN.exec(ipAddress);

    if (ipv4AddressParts !== null) {
        return ipv4AddressParts.slice(1).every((ipAddressPart) => Number(ipAddressPart) <= MAXIMAL_IPV4_ADDRESS_PART);
    }

    return IPV6_ADDRESS_PATTERN.test(ipAddress);
}

/**
 * Read the address of the visitor from the request, or `null` when it cannot be told
 *
 * Note: The address is taken from the request itself and never from what the browser sends in the body, so that a
 *       contact cannot be written under somebody else's address.
 */
export function readClientIpAddress(request: Request): string | null {
    for (const headerName of CLIENT_IP_ADDRESS_HEADER_NAMES) {
        const headerValue = request.headers.get(headerName);

        if (headerValue === null) {
            continue;
        }

        // Note: An IPv6 address is written in brackets whenever a port could follow it, `[::1]:4009`
        const ipAddress = headerValue
            .split(',')[0]
            .trim()
            .replace(/^\[/, '')
            .replace(/\](:\d+)?$/, '');

        if (isIpAddressValid(ipAddress)) {
            return ipAddress;
        }
    }

    return null;
}
