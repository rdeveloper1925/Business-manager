import { Flag } from 'lucide-react';

import { flagEmojiFromIso2 } from '@/lib/phone-countries';
import { cn } from '@/lib/utils';

export type PhoneCountryFlagProps = {
    iso2: string;
    /** Applied to the emoji span (when a regional flag is available). */
    className?: string;
    /** Applied to the lucide `Flag` fallback. */
    fallbackClassName?: string;
};

/**
 * Renders a country flag as a Unicode regional-indicator emoji when `iso2` is
 * valid. Lucide does not ship per-country glyphs, so we use `Flag` only as a
 * generic fallback when `iso2` cannot be turned into a flag sequence.
 */
export function PhoneCountryFlag({
    iso2,
    className,
    fallbackClassName,
}: PhoneCountryFlagProps) {
    const emoji = flagEmojiFromIso2(iso2);

    if (emoji) {
        return (
            <span
                aria-hidden
                className={cn('font-emoji-flag leading-none', className)}
            >
                {emoji}
            </span>
        );
    }

    return (
        <Flag
            aria-hidden
            className={cn(
                'size-4 shrink-0 text-muted-foreground',
                fallbackClassName,
            )}
        />
    );
}
