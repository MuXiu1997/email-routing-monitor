import type { EmailRoutingLog } from '../types'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface FailureNotificationEmailProps {
  failures: EmailRoutingLog[]
  totalFailed: number
  dateStr: string
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
}

const h1 = {
  color: '#f44336',
  fontSize: '24px',
  fontWeight: 'bold',
  paddingBottom: '8px',
  borderBottom: '2px solid #eee',
}

const meta = {
  background: '#f9f9f9',
  padding: '16px',
  borderRadius: '8px',
  marginBottom: '24px',
}

const metaText = {
  margin: '4px 0',
  fontSize: '14px',
  color: '#333',
}

const card = {
  borderRadius: '12px',
  marginBottom: '20px',
  overflow: 'hidden',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
}

const hr = {
  borderColor: '#cccccc',
  margin: '20px 0',
}

const footer = {
  color: '#888888',
  fontSize: '12px',
  textAlign: 'center' as const,
}

const DEFAULT_FAILURES: EmailRoutingLog[] = []

export function FailureNotificationEmail({
  failures = DEFAULT_FAILURES,
  totalFailed = 0,
  dateStr = '',
}: FailureNotificationEmailProps) {
  const previewText = `⚠️ [Email Alert] ${totalFailed} 封邮件转发失败 - ${dateStr}`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>⚠️ Email Routing 转发失败通知</Heading>
          <Section style={meta}>
            <Text style={metaText}>
              检测日期:
              {' '}
              <strong>{dateStr}</strong>
              <span style={{ margin: '0 12px', color: '#ccc' }}>|</span>
              失败总数:
              {' '}
              <b style={{ color: '#f44336' }}>{totalFailed}</b>
            </Text>
          </Section>

          {failures.map(f => (
            <FailureCard key={f.messageId || f.sessionId} failure={f} />
          ))}

          <Hr style={hr} />
          <Text style={footer}>—— Cloudflare Worker 邮件监控</Text>
        </Container>
      </Body>
    </Html>
  )
}

if (!import.meta?.env?.PROD) {
  FailureNotificationEmail.PreviewProps = {
    failures: [
      {
        action: 'forward',
        arc: 'pass',
        datetime: '2025-12-22 10:30:00',
        dkim: 'pass',
        dmarc: 'pass',
        errorDetail: 'MTA failure: 550 5.1.1 The email account that you tried to reach does not exist.',
        eventType: 'email_routing',
        from: 'sender@example.com',
        isNDR: 0,
        isSpam: 0,
        messageId: 'msg-1',
        ruleMatched: 'default',
        sampleInterval: 1,
        sessionId: 'session-123',
        spamScore: 0,
        spamThreshold: 0,
        spf: 'pass',
        status: 'failed',
        subject: '这是一封模拟的失败邮件',
        to: 'me@example.com',
      },
      {
        action: 'forward',
        arc: 'fail',
        datetime: '2025-12-22 10:35:00',
        dkim: 'fail',
        dmarc: 'fail',
        errorDetail: 'Spam detected',
        eventType: 'email_routing',
        from: 'spam@bad.com',
        isNDR: 0,
        isSpam: 1,
        messageId: 'msg-2',
        ruleMatched: 'spam-rule',
        sampleInterval: 1,
        sessionId: 'session-456',
        spamScore: 10,
        spamThreshold: 5,
        spf: 'fail',
        status: 'rejected',
        subject: '⚠️ 垃圾邮件拦截测试',
        to: 'me@example.com',
      },
    ],
    totalFailed: 2,
    dateStr: '2025-12-22',
  } as FailureNotificationEmailProps
}

function FailureCard({ failure }: { failure: EmailRoutingLog }) {
  const isSpam = failure.isSpam === 1
  const isSuccess = failure.status === 'delivered'
  const statusColor = isSuccess ? '#2e7d32' : isSpam ? '#ffa000' : '#d32f2f'
  const borderColor = isSuccess ? '#c8e6c9' : isSpam ? '#ffecb3' : '#ffcdd2'
  const bgColor = isSuccess ? '#f1f8e9' : isSpam ? '#fffdf7' : '#fff8f8'

  return (
    <Section style={{ ...card, border: `1px solid ${borderColor}`, backgroundColor: bgColor }}>
      <Section style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <span
              style={{
                backgroundColor: statusColor,
                color: 'white',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
              }}
            >
              {failure.status}
            </span>
            {isSpam && <span style={{ marginLeft: '8px', color: '#ffa000', fontSize: '12px', fontWeight: 'bold' }}>⚠️ SPAM</span>}
          </div>
          <span style={{ color: '#999', fontSize: '12px' }}>{failure.datetime}</span>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>
            {failure.subject || '(无主题)'}
          </div>
          <div style={{ fontSize: '14px', color: '#555' }}>
            <span style={{ color: '#888' }}>From:</span>
            {' '}
            {failure.from}
          </div>
          <div style={{ fontSize: '14px', color: '#555' }}>
            <span style={{ color: '#888' }}>To:</span>
            {' '}
            {failure.to}
          </div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <Badge label="SPF" value={failure.spf} />
          <Badge label="DKIM" value={failure.dkim} />
          <Badge label="DMARC" value={failure.dmarc} />
        </div>

        {failure.errorDetail && (
          <div
            style={{
              marginTop: '12px',
              padding: '12px',
              background: '#fff',
              border: `1px solid ${borderColor}`,
              borderLeft: `4px solid ${statusColor}`,
              borderRadius: '6px',
              fontSize: '13px',
              color: '#444',
              lineHeight: '1.4',
            }}
          >
            <strong>Error:</strong>
            {' '}
            {failure.errorDetail}
          </div>
        )}
      </Section>
      <DiagnosticSection failure={failure} statusColor={statusColor} borderColor={borderColor} />
    </Section>
  )
}

function DiagnosticSection({
  failure,
  statusColor,
  borderColor,
}: {
  failure: EmailRoutingLog
  statusColor: string
  borderColor: string
}) {
  return (
    <Section style={{ borderTop: `1px solid ${borderColor}`, backgroundColor: 'rgba(0,0,0,0.02)' }}>
      <details style={{ cursor: 'pointer' }}>
        <summary style={{ padding: '10px 16px', color: statusColor, fontSize: '13px', fontWeight: 'bold', outline: 'none' }}>
          展开原始诊断数据 (Session:
          {' '}
          {failure.sessionId}
          )
        </summary>
        <div style={{ padding: '0 16px 16px', fontSize: '11px', fontFamily: 'monospace', color: '#666' }}>
          {Object.entries(failure).map(([key, value]) => (
            <DiagnosticRow key={key} label={key} value={value} />
          ))}
        </div>
      </details>
    </Section>
  )
}

function DiagnosticRow({ label, value }: { label: string, value: any }) {
  return (
    <div style={{ borderBottom: '1px solid #eee', padding: '4px 0', display: 'flex' }}>
      <span style={{ width: '100px', flexShrink: 0, color: '#888' }}>{label}</span>
      <span style={{ wordBreak: 'break-all' }}>{value === '' || value === null || value === undefined ? '(empty)' : String(value)}</span>
    </div>
  )
}

function Badge({ label, value }: { label: string, value: string }) {
  const isPass = value.toLowerCase() === 'pass'
  const color = isPass ? '#2e7d32' : '#d32f2f'
  const bg = isPass ? '#e8f5e9' : '#ffebee'
  return (
    <span style={{ display: 'inline-block', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', marginRight: '4px', background: bg, color, textTransform: 'uppercase' }}>
      {label}
      :
      {value}
    </span>
  )
}

export default FailureNotificationEmail
