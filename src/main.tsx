import { createRoot } from "react-dom/client";
import { ApolloProvider } from '@apollo/client/react';
import { apolloClient } from '@/services/graphql';
import { AuthProvider } from '@/contexts/AuthContext';
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <ApolloProvider client={apolloClient}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ApolloProvider>
);
