import type { EmailRoutingLogs, EmailRoutingStats } from '../types'

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

export async function getEmailRoutingStats(
  apiToken: string,
  zoneTag: string,
  date: string,
) {
  const query = `
    query GetEmailRoutingStats($zoneTag: String!, $date: Date!) {
      viewer {
        zones(filter: { zoneTag: $zoneTag }) {
          emailRoutingAdaptiveGroups(filter: { date: $date }, limit: 1000) {
            count
            dimensions { status }
          }
        }
      }
    }
  `

  return queryGraphQL<EmailRoutingStats>(apiToken, query, {
    zoneTag,
    date,
  })
}

export async function getEmailRoutingRawLogs(
  apiToken: string,
  zoneTag: string,
  datetimeStart: string,
  datetimeEnd: string,
) {
  const query = `
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

  return queryGraphQL<EmailRoutingLogs>(apiToken, query, {
    zoneTag,
    datetimeStart,
    datetimeEnd,
  })
}
