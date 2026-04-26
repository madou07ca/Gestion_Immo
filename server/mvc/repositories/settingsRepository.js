import { readCollectionByKey, writeCollectionByKey } from '../utils/dataStore.js'

const KEY = 'appSettings'

const DEFAULT_SETTINGS = {
  slaNotifications: {
    enabled: true,
    warningLeadHours: 2,
    autoRunEveryMinutes: 15,
    lastAutoRunAt: null,
    templates: {
      warning: {
        emailSubject: '[SLA imminent] Ticket {{ticketId}} - {{sujet}}',
        emailBody: 'Le ticket {{ticketId}} approche son echeance SLA ({{dueAt}}). Merci de traiter rapidement.',
        smsBody: 'SLA imminent: ticket {{ticketId}} ({{sujet}}), echeance {{dueAt}}.',
      },
      breach: {
        emailSubject: '[HORS SLA] Ticket {{ticketId}} - {{sujet}}',
        emailBody: 'Le ticket {{ticketId}} est hors SLA depuis {{dueAt}}. Escalade immediate requise.',
        smsBody: 'HORS SLA: ticket {{ticketId}} ({{sujet}}). Action immediate.',
      },
    },
  },
}

export function getAppSettings() {
  const rows = readCollectionByKey(KEY)
  const first = rows[0] || {}
  return {
    ...DEFAULT_SETTINGS,
    ...first,
    slaNotifications: {
      ...DEFAULT_SETTINGS.slaNotifications,
      ...(first.slaNotifications || {}),
    },
  }
}

export function updateAppSettings(next) {
  writeCollectionByKey(KEY, [next])
  return next
}
