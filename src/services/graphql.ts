import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { mockLink } from '@/lib/mockLink';

const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL as string | undefined;
const useMock = !GRAPHQL_URL;

const httpLink = createHttpLink({ uri: GRAPHQL_URL || '/graphql' });

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('kenkan_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const apolloClient = new ApolloClient({
  link: useMock ? mockLink : authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'network-only' },
    query: { fetchPolicy: 'network-only' },
  },
});
