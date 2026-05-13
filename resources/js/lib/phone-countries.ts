import raw from '../data/phone-countries.json';

export type PhoneCountry = {
    name: string;
    iso2: string;
    dialCode: string;
};

export const PHONE_COUNTRIES: PhoneCountry[] = raw;
const PHONE_COUNTRY_BY_NAME = new Map(
    PHONE_COUNTRIES.map((country) => [country.name, country] as const),
);

export function countryUsesNanpMask(dialCode: string): boolean {
    return dialCode === '+1';
}

/** Regional-indicator flag emoji derived from `iso2` (Unicode flag sequence). */
export function flagEmojiFromIso2(iso2: string): string {
    const u = iso2.toUpperCase();

    if (u.length !== 2) {
        return '';
    }

    const base = 0x1f1e6 - 0x41;

    return String.fromCodePoint(
        u.charCodeAt(0) + base,
        u.charCodeAt(1) + base,
    );
}

export function findPhoneCountryByName(
    name: string,
): PhoneCountry | null {
    return PHONE_COUNTRY_BY_NAME.get(name) ?? null;
}

export function formatNanpDisplay(digits: string): string {
    const d = digits.replace(/\D/g, '').slice(0, 10);
    const p1 = d.slice(0, 3).padEnd(3, '_');
    const p2 = d.slice(3, 6).padEnd(3, '_');
    const p3 = d.slice(6, 10).padEnd(4, '_');

    return `(${p1}) - ${p2} - ${p3}`;
}

export function formatNanpStorage(digits: string): string {
    const d = digits.replace(/\D/g, '').slice(0, 10);

    if (d.length !== 10) {
        return '';
    }

    return `(${d.slice(0, 3)})-${d.slice(3, 6)}-${d.slice(6, 10)}`;
}

export function parseNanpDigitsFromStored(phone: string): string {
    const m = phone.match(/^\((\d{3})\)-(\d{3})-(\d{4})$/);

    return m ? `${m[1]}${m[2]}${m[3]}` : '';
}

export function nationalDigitsOnly(value: string): string {
    return value.replace(/\D/g, '');
}

export function telHref(dialDigits: string, nationalDigits: string): string {
    const d = dialDigits.replace(/^\+/, '').replace(/\D/g, '');
    const n = nationalDigits.replace(/\D/g, '');

    if (d === '') {
        return `tel:${n}`;
    }

    return `tel:+${d}${n}`;
}
