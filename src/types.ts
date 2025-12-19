export interface Env {
  CF_API_TOKEN: string
  ZONE_ID: string
  RESEND_API_KEY: string
  RESEND_FROM: string
  RESEND_TO: string
  TIMEZONE?: string
}

export interface GraphQLResponse<T> {
  data?: T
  errors?: any[]
}

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
