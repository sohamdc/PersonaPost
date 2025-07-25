import { useEffect, useState } from 'react';

function ProtectedRoute({ children, isLogin, keycloakClient }) {
  const [loginTriggered, setLoginTriggered] = useState(false);

  useEffect(() => {
    if (keycloakClient && !isLogin && !loginTriggered) {
      console.log(' Triggering Keycloak login...');
      keycloakClient.login();
      setLoginTriggered(true);
    }
  }, [isLogin, keycloakClient, loginTriggered]);

  if (!keycloakClient) {
    console.log(' Keycloak not initialized');
    return null;
  }

  if (!isLogin) {
    // Login being triggered — show loading
    return null
  }

  return children;
}

export default ProtectedRoute