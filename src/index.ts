import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { DEFAULT_TIMEZONE, SUCCESS_STATUSES } from './constants'
import { getEmailRoutingRawLogs, getEmailRoutingStats } from './services/cloudflare'
import { sendResendNotification } from './services/resend'

dayjs.extend(utc)
dayjs.extend(timezone)

/**
 * Get email forwarding failure details for a specific date
 */
async function getEmailFailures(env: Env, date: dayjs.Dayjs) {
  const dateStr = date.format('YYYY-MM-DD')

  const statsResult = await getEmailRoutingStats(env.CF_API_TOKEN, env.ZONE_ID, dateStr)

  const stats = statsResult.viewer?.zones[0]?.emailRoutingAdaptiveGroups || []

  let totalFailed = 0
  for (const s of stats) {
    if (!SUCCESS_STATUSES.includes(s.dimensions.status)) {
      totalFailed += s.count
    }
  }

  if (totalFailed === 0) {
    return { totalFailed: 0, failures: [], dateStr }
  }

  const rawResult = await getEmailRoutingRawLogs(
    env.CF_API_TOKEN,
    env.ZONE_ID,
    `${dateStr}T00:00:00Z`,
    `${dateStr}T23:59:59Z`,
  )

  const logs = rawResult.viewer?.zones[0]?.emailRoutingAdaptive || []
  const failures = logs.filter(log => !SUCCESS_STATUSES.includes(log.status))

  return { totalFailed, failures, dateStr }
}

export default {
  async scheduled(_, env, ctx) {
    const tz = DEFAULT_TIMEZONE
    const yesterday = dayjs().tz(tz).subtract(1, 'day')

    ctx.waitUntil((async () => {
      const { totalFailed, failures, dateStr } = await getEmailFailures(env, yesterday)
      if (totalFailed > 0) {
        await sendResendNotification(env, failures, totalFailed, dateStr)
      }
    })())
  },
} satisfies ExportedHandler<Env>
