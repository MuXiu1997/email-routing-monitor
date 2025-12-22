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

  console.info(`[Resend] Sending notification for ${totalFailed} failures to ${env.RESEND_TO}`)

  const response = await fetch('https://api.resend.com/emails', {
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

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[Resend] Failed to send email: ${response.status} ${errorText}`)
    throw new Error(`Resend API error: ${response.status} ${errorText}`)
  }

  const data = await response.json() as any
  console.info(`[Resend] Email sent successfully. ID: ${data.id}`)
}
