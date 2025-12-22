export interface EmailRoutingStats {
  viewer: {
    zones: Array<{
      emailRoutingAdaptiveGroups: Array<{
        count: number
        dimensions: { status: string }
      }>
    }>
  }
}

export interface EmailRoutingLog {
  datetime: string
  from: string
  to: string
  subject: string
  status: string
  errorDetail: string
}

export interface EmailRoutingLogs {
  viewer: {
    zones: Array<{
      emailRoutingAdaptive: EmailRoutingLog[]
    }>
  }
}
