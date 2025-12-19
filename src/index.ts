import type { EmailRoutingLogs, EmailRoutingStats, Env } from './types'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { DEFAULT_TIMEZONE, SUCCESS_STATUSES } from './constants'
import { queryGraphQL } from './services/cloudflare'
import { sendResendNotification } from './services/resend'

dayjs.extend(utc)
dayjs.extend(timezone)

/**
 * 获取指定日期的邮件转发失败详情
 */
async function getEmailFailures(env: Env, date: dayjs.Dayjs) {
  const dateStr = date.format('YYYY-MM-DD')

  const queryStats = `
  query GetEmailRoutingStats($zoneTag: String!, $date: Date!) {
    viewer {
      zones(filter: { zoneTag: $zoneTag }) {
        emailRoutingAdaptiveGroups(filter: { date: $date }, limit: 100) {
          count
          dimensions { status }
        }
      }
    }
  }
  `

  const statsResult = await queryGraphQL<EmailRoutingStats>(env.CF_API_TOKEN, queryStats, {
    zoneTag: env.ZONE_ID,
    date: dateStr,
  })

  const stats = statsResult.data?.viewer?.zones[0]?.emailRoutingAdaptiveGroups || []

  let totalFailed = 0
  for (const s of stats) {
    if (!SUCCESS_STATUSES.includes(s.dimensions.status)) {
      totalFailed += s.count
    }
  }

  if (totalFailed === 0) {
    return { totalFailed: 0, failures: [], dateStr }
  }

  const queryRawLogs = `
  query GetEmailRoutingRawLogs($zoneTag: String!, $datetimeStart: DateTime!, $datetimeEnd: DateTime!) {
    viewer {
      zones(filter: { zoneTag: $zoneTag }) {
        emailRoutingAdaptive(filter: { datetime_geq: $datetimeStart, datetime_lt: $datetimeEnd }, limit: 50) {
          datetime, from, to, subject, status, errorDetail
        }
      }
    }
  }
  `

    const rawResult = await queryGraphQL<EmailRoutingLogs>(env.CF_API_TOKEN, queryRawLogs, {
      zoneTag: env.ZONE_ID,
      datetimeStart: `${dateStr}T00:00:00Z`,
      datetimeEnd: `${dateStr}T23:59:59Z`,
    })

  const logs = rawResult.data?.viewer?.zones[0]?.emailRoutingAdaptive || []
  const failures = logs.filter(log => !SUCCESS_STATUSES.includes(log.status))

  return { totalFailed, failures, dateStr }
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const tz = env.TIMEZONE || DEFAULT_TIMEZONE
    const yesterday = dayjs().tz(tz).subtract(1, 'day')

    ctx.waitUntil((async () => {
      const { totalFailed, failures, dateStr } = await getEmailFailures(env, yesterday)
      if (totalFailed > 0) {
        await sendResendNotification(env, failures, totalFailed, dateStr)
      }
    })())
  },

  async fetch(_request: Request, _env: Env, _ctx: ExecutionContext) {
    return new Response('TODO')
  },
}
