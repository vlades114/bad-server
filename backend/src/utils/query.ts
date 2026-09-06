export function asString(value: unknown): string | undefined {
    return typeof value === 'string' ? value : undefined
}

export function toNumber(value: unknown): number | undefined {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : undefined
    }
    if (typeof value === 'string' && value.trim() !== '') {
        const number = Number(value)
        return Number.isFinite(number) ? number : undefined
    }
    return undefined
}

export function toDate(value: unknown): Date | undefined {
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? undefined : value
    }
    if (typeof value === 'string' && value.trim() !== '') {
        const date = new Date(value)
        return Number.isNaN(date.getTime()) ? undefined : date
    }
    return undefined
}
