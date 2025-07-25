import { useState, useEffect, useRef } from "react";
import Keycloak from "keycloak-js";

const client = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_SERVER_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
});

const useAuth = () => {
  const isRun = useRef(false);
  const [isLogin, setLogin] = useState(false);
  const [keycloakClient, setKeycloakCLient] = useState(null);

  useEffect(() => {
    if (isRun.current) {
      return;
    }

    isRun.current = true;

    client
      .init({ onLoad: "check-sso", checkLoginIframe: false })
      .then((res) => {
        console.log("Authorization is", res);
        setKeycloakCLient(client);
        setLogin(res);

        // Periodic token refresh
        const interval = setInterval(() => {
          client
            .updateToken(60) // refreshing if token will expire in 60s
            .then((refreshed) => {
              if (refreshed) {
                console.log("Token refreshed");
              } else {
                console.log("Token still valid");
              }
            })
            .catch(() => {
              console.warn("Token refresh failed; logging out");
              localStorage.clear()
              sessionStorage.clear()
              client.logout();
            });
        }, 60000); // every 1 minute

        return () => clearInterval(interval);
      })
      .catch((err) => {
        console.error("Keycloak Init Error", err);
      });
  }, []);

  return { isLogin, keycloakClient };
};

export default useAuth;
