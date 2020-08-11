import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client'
import { SchemaLink } from '@apollo/link-schema'
import { ApolloProvider } from '@apollo/react-hooks'
import Head from 'next/head'
import * as PropTypes from 'prop-types'
import React, { useMemo } from 'react'

let apolloClient = null
let schema = null

const withData = (PageComponent, { ssr } = {}) => {
  const WithApollo = ({ apolloClient, apolloState, ...pageProps }) => {
    const client = useMemo(
      () => apolloClient || initApolloClient(apolloState),
      []
    )
    return (
      <ApolloProvider client={client}>
        <PageComponent {...pageProps} />
      </ApolloProvider>
    )
  }

  WithApollo.propTypes = {
    apolloClient: PropTypes.object,
    apolloState: PropTypes.object,
  }

  if (ssr || PageComponent.getInitialProps) {
    WithApollo.getInitialProps = async (ctx) => {
      const { AppTree } = ctx

      // Load schema on the server
      if (typeof window === 'undefined' && !schema) {
        ;({ schema } = ctx.req)
      }

      // Initialize ApolloClient, add it to the ctx object so
      // we can use it in `PageComponent.getInitialProp`.
      const apolloClient = initApolloClient(null)
      ctx.apolloClient = apolloClient

      // Run wrapped getInitialProps methods
      let pageProps = {}
      if (PageComponent.getInitialProps) {
        pageProps = await PageComponent.getInitialProps(ctx)
      }

      // Only on the server:
      if (typeof window === 'undefined') {
        // When redirecting, the response is finished.
        // No point in continuing to render
        if (ctx.res && ctx.res.writableEnded) {
          return pageProps
        }

        // Only if ssr is enabled
        if (ssr) {
          try {
            console.log('get data from tree')
            await ctx.req.getDataFromTree(
              <AppTree
                pageProps={{
                  ...pageProps,
                  apolloClient,
                }}
              />
            )
          } catch (error) {
            // Prevent Apollo Client GraphQL errors from crashing SSR.
            // Handle them in components via the data.error prop:
            // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
            console.error('Error while running `getDataFromTree`', error)
          }

          // getDataFromTree does not call componentWillUnmount
          // head side effect therefore need to be cleared manually
          Head.rewind()
        }
      }

      // Extract query data from the Apollo store
      console.log('extract cache')
      const apolloState = apolloClient.cache.extract()

      return {
        ...pageProps,
        apolloState,
      }
    }
  }

  return WithApollo
}

/**
 * Always creates a new apollo client on the server
 * Creates or reuses apollo client in the browser.
 * @param  {Object} initialState
 */
const initApolloClient = (initialState = {}) => {
  if (typeof window === 'undefined') {
    return createApolloClient(initialState)
  }

  // Reuse client on the client-side
  if (!apolloClient) {
    apolloClient = createApolloClient(initialState)
  }

  return apolloClient
}

const mergeChildren = (existing = [], incoming = [], { readField }) => {
  const merged = [...existing]
  const existingIds = existing.map((e) => readField('id', e))
  for (const item of incoming) {
    const id = readField('id', item)
    if (!existingIds.includes(id)) {
      merged.push(item)
      existingIds.push(id)
    }
  }
  return merged
}

/**
 * Creates and configures the ApolloClient
 * @param  {Object} [initialState={}]
 */
const createApolloClient = (initialState = {}) => {
  const cache = new InMemoryCache({
    typePolicies: {
      Sentence: {
        fields: {
          children: {
            keyArgs: ['order'],
            merge: mergeChildren,
          },
        },
      },
    },
  })

  if (typeof window === 'undefined') {
    return new ApolloClient({
      ssrMode: true,
      cache: cache.restore(initialState),
      link: new SchemaLink({ schema }),
    })
  }

  return new ApolloClient({
    ssrMode: true,
    cache: cache.restore(initialState),
    link: new HttpLink({
      uri: '/api/graphql',
    }),
  })
}

export default withData
