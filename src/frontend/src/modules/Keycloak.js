import Keycloak from "keycloak-js";


function initKeycloak(config, callbacks) {
    if (!config) {
        window.kc = {
            logout: function(){},
            login: function(){},
            createLoginUrl: function() { return "/sign-in"; }
        };
        return;
    }

    window.createLoginUrl = function() {
        return window.kc.createLoginUrl();
    }
    window.createLogoutUrl = function() {
        return "/sign-out"
    }

    const kc = Keycloak(config);
    window.kc = kc;
    kc.init({onLoad: "check-sso", flow: "standard",
        token: localStorage.getItem("kc_token"),
        refreshToken: localStorage.getItem("kc_refreshToken"),
        idToken: localStorage.getItem("kc_idToken"),
    }).success((authenticated) => {
        if (authenticated) {
            // alert("authenticated onload");
            // store.getState().keycloak = kc;
            updateLocalStorage();
            window.kcUpdateInterval = setInterval(() => updateToken , 10000);
        } else if (callbacks.isLoggedIn()) {
            console.error("Keycloak not authenticated");
            callbacks.logout();
        } else {
            // kc.login();
        }
    });

    kc.onAuthError = function(error) {
        console.error("Keycloak error");
        console.error(error);
        kc.logout();
    }

    /** 
     *
     * onTokenExpired - Called when the access token is expired. If a refresh token is available the token can be refreshed with
     * updateToken, or in cases where it is not (that is, with implicit flow) you can redirect to login screen to obtain a new access token.
     */
    kc.onTokenExpired = function () {
        console.log("Keycloak token expired");
        // kc.logout()
        updateToken();
    }.bind();
    kc.onAuthSuccess = function() {
        console.log("Keycloak auth success");
        onKCLogin();
    }
    kc.onAuthLogout = function() {
        console.error("Keycloak wants logout");
        callbacks.logout();
    }

    const onKCLogin = callbacks.signIn;

    function updateToken() {
        kc.updateToken(10)
            .success(function(){
                console.log("udpdated");
                updateLocalStorage();
            }).error(function() {
                console.log("error updating");
                clearInterval(window.kcUpdateInterval);
                kc.login()
            });
    }

    const updateLocalStorage = () => {
        localStorage.setItem('kc_token', kc.token);
        localStorage.setItem('kc_refreshToken', kc.refreshToken);
        localStorage.setItem('kc_idToken', kc.idToken);
    };
}

export default initKeycloak;
