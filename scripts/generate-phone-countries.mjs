/**
 * Regenerates `resources/js/data/phone-countries.json` from libphonenumber-js
 * calling codes and English display names, with a small override map so labels
 * match the catalog this app used before expansion (validation / imports).
 *
 * Run: npm run generate:phone-countries
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import countries from 'i18n-iso-countries';
import { getCountries, getCountryCallingCode } from 'libphonenumber-js/min';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const outPath = join(repoRoot, 'resources/js/data/phone-countries.json');

const enLang = JSON.parse(
    readFileSync(
        join(repoRoot, 'node_modules/i18n-iso-countries/langs/en.json'),
        'utf8',
    ),
);
countries.registerLocale(enLang);

/** Short labels where i18n-iso-countries differs from this app’s prior catalog. */
const DISPLAY_NAME_OVERRIDES = {
    BN: 'Brunei',
    CN: 'China',
    CZ: 'Czechia',
    PS: 'Palestine',
    RU: 'Russia',
    TR: 'Turkey',
    TW: 'Taiwan',
    US: 'United States',
};

function displayName(iso2) {
    const u = String(iso2).toUpperCase();

    return DISPLAY_NAME_OVERRIDES[u] ?? countries.getName(iso2, 'en');
}

const rows = getCountries()
    .map((iso2) => {
        const isoU = iso2.toUpperCase();
        const name = displayName(iso2);

        if (!name) {
            return null;
        }

        let dial;

        try {
            dial = `+${getCountryCallingCode(iso2)}`;
        } catch {
            return null;
        }

        return { name, iso2: isoU, dialCode: dial };
    })
    .filter(Boolean)
    .sort((a, b) => a.name.localeCompare(b.name));

const nameCount = {};

for (const r of rows) {
    nameCount[r.name] = (nameCount[r.name] ?? 0) + 1;
}

const dupes = Object.entries(nameCount).filter(([, n]) => n > 1);

if (dupes.length > 0) {
    throw new Error(`Duplicate country names: ${JSON.stringify(dupes)}`);
}

writeFileSync(outPath, `${JSON.stringify(rows, null, 4)}\n`, 'utf8');

console.log(`Wrote ${rows.length} rows to ${outPath}`);
