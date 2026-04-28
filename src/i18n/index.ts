/**
 * Minimal i18n dictionary. v0.1 ships English only; structure is locale-first
 * so adding zh-CN later is a single new file + a `locale` resolver.
 */
import en from "./en.json";

export type Locale = "en";
export const DEFAULT_LOCALE: Locale = "en";

const dictionaries = { en } as const;

export function t(key: string, locale: Locale = DEFAULT_LOCALE): string {
  const dict = dictionaries[locale] as Record<string, string>;
  return dict[key] ?? key;
}
