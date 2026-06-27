import { en } from './locales/en'
import { th } from './locales/th'
import { fi } from './locales/fi'
import type { Language, TranslationDict } from './types'

export const translations: Record<Language, TranslationDict> = {
    en,
    th,
    fi,
}

export function getByPath(dict: TranslationDict, path: string): unknown {
    return path.split('.').reduce<unknown>((acc, key) => {
        if (acc && typeof acc === 'object' && key in acc) {
            return (acc as Record<string, unknown>)[key]
        }
        return undefined
    }, dict)
}

export function interpolate(template: string, params?: Record<string, string | number>): string {
    if (!params) return template
    return Object.entries(params).reduce(
        (str, [key, value]) => str.replaceAll(`{{${key}}}`, String(value)),
        template
    )
}

export function translate(
    dict: TranslationDict,
    path: string,
    params?: Record<string, string | number>
): string {
    const value = getByPath(dict, path)
    if (typeof value !== 'string') return path
    return interpolate(value, params)
}

export function formatGroupName(dict: TranslationDict, groupCode: string): string {
    const letter = groupCode.replace(/^GROUP_/, '')
    return `${dict.common.group} ${letter}`
}

export { en, th, fi }
export * from './types'
