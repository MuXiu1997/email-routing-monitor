import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { getEmailRoutingRawLogs } from './services/cloudflare'
import { sendResendNotification } from './services/resend'

dayjs.extend(utc)
dayjs.extend(timezone)

/**
 * Get email forwarding failure details for a specific date
 */
async function getEmailFailures(env: Env, date: dayjs.Dayjs) {
  const dateStr = date.format('YYYY-MM-DD')
  console.info(`[Monitor] Starting check for date: ${dateStr}`)

  const rawResult = await getEmailRoutingRawLogs(
    env.CF_API_TOKEN,
    env.ZONE_ID,
    `${dateStr}T00:00:00Z`,
    `${dateStr}T23:59:59Z`,
  )

  const logs = rawResult.viewer?.zones[0]?.emailRoutingAdaptive || []
  const failures = logs.filter((log) => {
    // Condition: errorDetail is not empty, or status is not delivered
    const isPotentiallyFailed = (log.errorDetail && log.errorDetail !== '') || log.status !== 'delivered'

    // Exception: action is worker, status is dropped, and errorDetail is empty
    const isIgnoredWorkerDrop = log.action === 'worker' && log.status === 'dropped' && (!log.errorDetail || log.errorDetail === '')

    return isPotentiallyFailed && !isIgnoredWorkerDrop
  })

  console.info(`[Monitor] Processed ${logs.length} logs, found ${failures.length} failures.`)

  return {
    totalFailed: failures.length,
    failures,
    dateStr,
  }
}

export default {
  async scheduled(_, env, ctx) {
    console.log('[Cron] Scheduled trigger started')
    const tz = env.TIMEZONE
    const yesterday = dayjs().tz(tz).subtract(1, 'day')

    ctx.waitUntil((async () => {
      try {
        const { totalFailed, failures, dateStr } = await getEmailFailures(env, yesterday)
        if (totalFailed > 0) {
          await sendResendNotification(env, failures, totalFailed, dateStr)
        }
        else {
          console.info(`[Monitor] No failures found for ${dateStr}.`)
        }
      }
      catch (error) {
        console.error('[Monitor] Critical error during execution:', error)
      }
    })())
  },
} satisfies ExportedHandler<Env>
