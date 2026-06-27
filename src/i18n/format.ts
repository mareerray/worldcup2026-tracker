export function formatDate(
    locale: string,
    utcDate: string,
    timeZone: string,
    options: Intl.DateTimeFormatOptions
): string {
    return new Date(utcDate).toLocaleDateString(locale, {
        timeZone,
        ...options,
    })
}

export function formatTime(
    locale: string,
    utcDate: string,
    timeZone: string,
    options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }
): string {
    return new Date(utcDate).toLocaleTimeString(locale, {
        timeZone,
        ...options,
    })
}

export function formatDateTime(
    locale: string,
    utcDate: string,
    timeZone: string,
    options: Intl.DateTimeFormatOptions
): string {
    return new Date(utcDate).toLocaleString(locale, {
        timeZone,
        ...options,
    })
}

export function formatClockTime(locale: string, timestamp: number, timeZone: string): string {
    return new Date(timestamp).toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
        timeZone,
    })
}
