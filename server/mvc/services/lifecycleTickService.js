import { markPaiementsOverdue, processNotificationQueueStub } from './rentalLifecycleService.js'

export function runRentalLifecycleTicks() {
  try {
    const overdue = markPaiementsOverdue()
    const notif = processNotificationQueueStub()
    if (overdue?.data?.marked || notif?.data?.processed) {
      console.info(
        `[lifecycle] overdue=${overdue?.data?.marked ?? 0} notifications=${notif?.data?.processed ?? 0}`,
      )
    }
  } catch (error) {
    console.error('[lifecycle] tick error', error?.message || error)
  }
}
