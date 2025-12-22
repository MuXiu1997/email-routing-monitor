import type { EmailRoutingLog } from '../types'
import { Resend } from 'resend'
import { FailureNotificationEmail } from '../emails/FailureNotification'

export async function sendResendNotification(
  env: Env,
  failures: EmailRoutingLog[],
  totalFailed: number,
  dateStr: string,
) {
  const resend = new Resend(env.RESEND_API_KEY)
  const subject = `⚠️ [Email Alert] ${totalFailed} 封邮件转发失败 - ${dateStr}`

  console.info(`[Resend] Sending notification for ${totalFailed} failures to ${env.RESEND_TO}`)

  const { data, error } = await resend.emails.send({
    from: env.RESEND_FROM,
    to: [env.RESEND_TO],
    subject,
    react: FailureNotificationEmail({ failures, totalFailed, dateStr }),
  })

  if (error) {
    console.error(`[Resend] Failed to send email:`, error)
    throw new Error(`Resend API error: ${error.message}`)
  }

  console.info(`[Resend] Email sent successfully. ID: ${data?.id}`)
}
