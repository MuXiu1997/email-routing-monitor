import type { EmailRoutingLogs } from '../types'

export async function queryGraphQL<T>(
  apiToken: string,
  query: string,
  variables: Record<string, any>,
): Promise<T> {
  const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw new Error(`Cloudflare API error: ${response.status} ${response.statusText}`)
  }

  const { data, errors } = await response.json() as any

  // Only throw if errors is a non-empty array (ignoring null or empty array)
  if (errors && Array.isArray(errors) && errors.length > 0) {
    throw new Error(`GraphQL Error: ${JSON.stringify(errors)}`)
  }

  return data as T
}

export async function getEmailRoutingRawLogs(
  apiToken: string,
  zoneTag: string,
  datetimeStart: string,
  datetimeEnd: string,
) {
  console.info(`[Cloudflare] Fetching logs between ${datetimeStart} and ${datetimeEnd}`)
  const query = `
    query GetEmailRoutingRawLogs($zoneTag: String!, $datetimeStart: DateTime!, $datetimeEnd: DateTime!) {
      viewer {
        zones(filter: { zoneTag: $zoneTag }) {
          emailRoutingAdaptive(filter: { datetime_geq: $datetimeStart, datetime_lt: $datetimeEnd }, limit: 10000) {
            action
            arc
            datetime
            dkim
            dmarc
            errorDetail
            eventType
            from
            isNDR
            isSpam
            messageId
            ruleMatched
            sampleInterval
            sessionId
            spamScore
            spamThreshold
            spf
            status
            subject
            to
          }
        }
      }
    }
  `

  try {
    const result = await queryGraphQL<EmailRoutingLogs>(apiToken, query, {
      zoneTag,
      datetimeStart,
      datetimeEnd,
    })
    return result
  }
  catch (error) {
    console.error('[Cloudflare] API Query Failed:', error)
    throw error
  }
}
