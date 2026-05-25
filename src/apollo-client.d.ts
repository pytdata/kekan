declare module '@apollo/client' {
  export class ApolloClient<T = any> {
    constructor(options: any);
    query(options: any): Promise<{ data?: any; errors?: any[] }>;
    mutate(options: any): Promise<{ data?: any; errors?: any[] }>;
    resetStore(): Promise<any[]>;
  }
  export class InMemoryCache {
    constructor(options?: any);
  }
  export function createHttpLink(options: any): any;
  export function gql(literals: TemplateStringsArray, ...args: any[]): any;
}

declare module '@apollo/client/react' {
  export const ApolloProvider: React.FC<{ client: any; children: React.ReactNode }>;
  export function useQuery(query: any, options?: any): { data?: any; loading: boolean; error?: any; refetch: any };
  export function useMutation(mutation: any, options?: any): [any, { data?: any; loading: boolean; error?: any }];
  export function useLazyQuery(query: any, options?: any): [any, { data?: any; loading: boolean; error?: any }];
}

declare module '@apollo/client/link/context' {
  export function setContext(setter: (operation: any, prevContext: any) => any): any;
}
