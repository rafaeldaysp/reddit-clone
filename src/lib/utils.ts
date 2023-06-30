import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNowStrict } from 'date-fns'
import locale from 'date-fns/locale/pt-BR'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const formatDistanceLocale = {
  lessThanXSeconds: 'há poucos segundos',
  xSeconds: 'há poucos segundos',
  halfAMinute: 'menos de 1 minuto',
  lessThanXMinutes: 'há {{count}} minuto',
  xMinutes: 'há {{count}} minutos',
  aboutXHours: 'há {{count}} h',
  xHours: 'há {{count}} h',
  xDays: 'há {{count}} dias',
  aboutXWeeks: 'há {{count}} semana',
  xWeeks: 'há {{count}} semanas',
  aboutXMonths: 'há {{count}} mês',
  xMonths: 'há {{count}} meses',
  aboutXYears: 'há {{count}} ano',
  xYears: 'há {{count}} anos',
  overXYears: 'há {{count}} anos',
  almostXYears: 'há {{count}} anos',
}

function formatDistance(token: string, count: number, options?: any): string {
  options = options || {}

  const result = formatDistanceLocale[
    token as keyof typeof formatDistanceLocale
  ].replace('{{count}}', count.toString())

  if (options.addSuffix) {
    if (options.comparison > 0) {
      return 'em ' + result
    } else {
      if (result === 'just now') return result
      return result
    }
  }

  return result
}

export function formatTimeToNow(date: Date): string {
  return formatDistanceToNowStrict(date, {
    addSuffix: true,
    locale: {
      ...locale,
      formatDistance,
    },
  })
}
