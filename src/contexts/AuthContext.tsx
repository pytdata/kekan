import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apolloClient } from '@/services/graphql';
import { gql } from '@apollo/client';

const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      name
      avatar
      role
      subscriptionStatus
    }
  }
`;

interface AuthContextType {
  user: any;
  login: (token: string, user: any) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  loading: true,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('kenkan_token');
    if (token) {
      apolloClient.query({ query: ME_QUERY }).then(({ data }: any) => {
        if (data?.me) setUser(data.me);
      }).catch(() => {
        localStorage.removeItem('kenkan_token');
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token: string, userData: any) => {
    localStorage.setItem('kenkan_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('kenkan_token');
    setUser(null);
    apolloClient.resetStore();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
