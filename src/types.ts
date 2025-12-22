export interface EmailRoutingLog {
  action: string
  arc: string
  datetime: string
  dkim: string
  dmarc: string
  errorDetail: string
  eventType: string
  from: string
  isNDR: number
  isSpam: number
  messageId: string
  ruleMatched: string
  sampleInterval: number
  sessionId: string
  spamScore: number
  spamThreshold: number
  spf: string
  status: string
  subject: string
  to: string
}

export interface EmailRoutingLogs {
  viewer: {
    zones: Array<{
      emailRoutingAdaptive: EmailRoutingLog[]
    }>
  }
}
