import type { EmailRoutingLog, Env } from '../types'
import { renderFailureTable, renderFullHtml } from './render'

export async function sendResendNotification(
  env: Env,
  failures: EmailRoutingLog[],
  totalFailed: number,
  dateStr: string,
) {
  const tableHtml = renderFailureTable(failures)
  const htmlBody = renderFullHtml(tableHtml, dateStr, totalFailed)

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.RESEND_FROM,
      to: [env.RESEND_TO],
      subject: `⚠️ [Email Alert] ${totalFailed} 封邮件转发失败 - ${dateStr}`,
      html: htmlBody,
    }),
  })
}
