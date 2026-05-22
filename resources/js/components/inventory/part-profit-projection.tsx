import { AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatCurrency } from '@/lib/format-currency';
import { cn } from '@/lib/utils';

function parsePrice(value: string): number | null {
    const trimmed = value.trim();

    if (trimmed === '') {
        return null;
    }

    const amount = Number.parseFloat(trimmed);

    if (!Number.isFinite(amount)) {
        return null;
    }

    return amount;
}

function barWidth(value: number, scale: number): number {
    if (scale <= 0) {
        return 0;
    }

    return Math.min(100, Math.max(0, (value / scale) * 100));
}

export function PartProfitProjection({
    costPrice,
    sellPrice,
}: {
    costPrice: string;
    sellPrice: string;
}) {
    const cost = parsePrice(costPrice);
    const sell = parsePrice(sellPrice);

    if (cost === null || sell === null) {
        return (
            <section
                aria-label="Projected margin preview"
                className="rounded-lg border border-dashed bg-muted/30 px-4 py-5"
            >
                <p className="text-sm font-medium">Projected margin</p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Enter cost and sell price to preview profit or loss per unit.
                </p>
            </section>
        );
    }

    const margin = sell - cost;
    const isLoss = margin < 0;
    const isBreakEven = margin === 0;
    const scale = Math.max(cost, sell, 0.01);
    const costWidth = barWidth(cost, scale);
    const sellWidth = barWidth(sell, scale);

    const StatusIcon = isLoss ? TrendingDown : TrendingUp;

    return (
        <section
            aria-label="Projected margin preview"
            aria-live="polite"
            className={cn(
                'rounded-lg border px-4 py-5',
                isLoss
                    ? 'border-destructive/40 bg-destructive/5'
                    : isBreakEven
                      ? 'border-border bg-muted/30'
                      : 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10',
            )}
        >
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium">Projected margin</p>
                    <p className="text-xs text-muted-foreground">
                        Per unit · selling price − cost price
                    </p>
                </div>
                <div
                    className={cn(
                        'flex items-center gap-2 rounded-md px-3 py-2 tabular-nums',
                        isLoss
                            ? 'bg-destructive/10 text-destructive'
                            : isBreakEven
                              ? 'bg-muted text-foreground'
                              : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
                    )}
                >
                    <StatusIcon className="size-4 shrink-0" aria-hidden />
                    <span className="text-lg font-semibold">
                        {isLoss ? '−' : isBreakEven ? '' : '+'}
                        {formatCurrency(Math.abs(margin))}
                    </span>
                    <span className="text-xs font-medium uppercase tracking-wide">
                        {isLoss
                            ? 'Loss'
                            : isBreakEven
                              ? 'Break even'
                              : 'Profit'}
                    </span>
                </div>
            </div>

            <div className="mt-5 space-y-4">
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-muted-foreground">
                            Cost price
                        </span>
                        <span className="tabular-nums">{formatCurrency(cost)}</span>
                    </div>
                    <div
                        className="h-3 overflow-hidden rounded-full bg-muted"
                        role="img"
                        aria-label={`Cost price ${formatCurrency(cost)}`}
                    >
                        <div
                            className="h-full rounded-full bg-muted-foreground/50 transition-[width] duration-200"
                            style={{ width: `${costWidth}%` }}
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-muted-foreground">
                            Sell price
                        </span>
                        <span className="tabular-nums">{formatCurrency(sell)}</span>
                    </div>
                    <div
                        className="h-3 overflow-hidden rounded-full bg-muted"
                        role="img"
                        aria-label={`Sell price ${formatCurrency(sell)}`}
                    >
                        <div
                            className={cn(
                                'h-full rounded-full transition-[width] duration-200',
                                isLoss
                                    ? 'bg-destructive/70'
                                    : isBreakEven
                                      ? 'bg-muted-foreground/60'
                                      : 'bg-emerald-600 dark:bg-emerald-500',
                            )}
                            style={{ width: `${sellWidth}%` }}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
                    <span
                        className={cn(
                            'inline-flex size-2.5 shrink-0 rounded-full',
                            isLoss
                                ? 'bg-destructive'
                                : isBreakEven
                                  ? 'bg-muted-foreground/60'
                                  : 'bg-emerald-600 dark:bg-emerald-500',
                        )}
                        aria-hidden
                    />
                    <span>
                        {isLoss ? (
                            <>
                                Sell is{' '}
                                <span className="font-medium text-destructive">
                                    {formatCurrency(Math.abs(margin))}
                                </span>{' '}
                                below cost per unit
                            </>
                        ) : isBreakEven ? (
                            'Sell price matches cost — no margin per unit'
                        ) : (
                            <>
                                Sell exceeds cost by{' '}
                                <span className="font-medium text-emerald-700 dark:text-emerald-400">
                                    {formatCurrency(margin)}
                                </span>{' '}
                                per unit
                            </>
                        )}
                    </span>
                </div>
            </div>

            {isLoss && (
                <Alert variant="destructive" className="mt-4 border-destructive/30">
                    <AlertTriangle aria-hidden />
                    <AlertTitle>Projected loss</AlertTitle>
                    <AlertDescription>
                        Sell price is lower than cost price. Please double-check
                        these values — you can still save the part if the pricing
                        is intentional.
                    </AlertDescription>
                </Alert>
            )}
        </section>
    );
}
