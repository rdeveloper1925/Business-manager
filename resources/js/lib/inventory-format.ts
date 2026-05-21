import type { ConditionTypeValue } from '@/types/inventory';

export const conditionLabels: Record<ConditionTypeValue, string> = {
    GOOD: 'Good',
    DAMAGED: 'Damaged',
    DEFECTIVE: 'Defective',
};

export function formatDelta(delta: number): string {
    if (delta > 0) {
        return `+${delta}`;
    }

    return String(delta);
}

export function formatInventoryDate(value: string): string {
    return new Date(value).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

export function formatInventoryDateLong(value: string): string {
    return new Date(value).toLocaleString(undefined, {
        dateStyle: 'full',
        timeStyle: 'short',
    });
}

export function formatCondition(condition: string): string {
    return conditionLabels[condition as ConditionTypeValue] ?? condition;
}
