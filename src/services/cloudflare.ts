import type { GraphQLResponse } from '../types'
import { GRAPHQL_ENDPOINT } from '../constants'

export async function queryGraphQL<T>(
  apiToken: string,
  query: string,
  variables: Record<string, any>,
): Promise<GraphQLResponse<T>> {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  })
  return response.json()
}
