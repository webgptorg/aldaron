/**
 * Reads the first name out of a full name
 *
 * @param fullname full name such as `Jana Nováková`
 * @returns first name such as `Jana`, or an empty string when the full name carries no name at all
 */
export function getFirstName(fullname: string): string {
    return fullname.trim().split(/\s+/)[0] ?? '';
}
