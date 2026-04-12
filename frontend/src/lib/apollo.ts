import { ApolloClient, InMemoryCache, ApolloLink } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'
import UploadHttpLink from 'apollo-upload-client/UploadHttpLink.mjs'

const uploadLink = new UploadHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL ?? '/graphql',
}) as unknown as ApolloLink

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token')
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([authLink, uploadLink]),
  cache: new InMemoryCache(),
})
