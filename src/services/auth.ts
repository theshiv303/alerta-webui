import Vue from 'vue'
import Vuex from 'vuex'
import VueAxios from 'vue-axios'
import { VueAuthenticate } from '@alerta/vue-authenticate'
import axios from 'axios'

Vue.use(Vuex)
Vue.use(VueAxios, axios)

function getRedirectUri(path: string) {
  return window.location.origin + (path || '')
}

export function vueAuth(config) {
  let basePath = config.base_path || process.env.BASE_URL
  return new VueAuthenticate(Vue.prototype.$http, {
    tokenPath: 'token',
    tokenName: 'token',
    tokenPrefix: '',
    registerUrl: '/auth/signup',
    logoutUrl: '/auth/logout',
    storageType: 'localStorage',
    storageNamespace: 'auth',
    providers: {
      azure: {
        name: 'Azure Active Directory',
        url: '/auth/azure',
        clientId: config.provider === 'azure' ? config.client_id : config.azure_client_id,
        authorizationEndpoint: `https://login.microsoftonline.com/${config.azure_tenant}/oauth2/v2.0/authorize`,
        redirectUri: getRedirectUri(basePath),
        requiredUrlParams: ['scope'],
        optionalUrlParams: ['display', 'state'],
        scope: 'openid+profile+email',
        display: 'popup',
        oauthType: '2.0',
        popupOptions: { width: 1020, height: 618 },
        state: () => encodeURIComponent(Math.random().toString(36).substr(2))
      },
      cognito: {
        name: 'Amazon Cognito',
        url: '/auth/openid',
        clientId: config.provider === 'cognito' ? config.client_id : config.cognito_client_id,
        authorizationEndpoint: `https://${config.cognito_domain}.auth.${config.aws_region}.amazoncognito.com/login`,
        redirectUri: getRedirectUri(basePath),
        requiredUrlParams: ['scope'],
        optionalUrlParams: ['display', 'state'],
        scope: 'openid+profile+email',
        display: 'popup',
        oauthType: '2.0',
        popupOptions: { width: 1020, height: 618 },
        state: () => encodeURIComponent(Math.random().toString(36).substr(2))
      },
      github: {
        name: 'GitHub',
        url: '/auth/github',
        clientId: config.provider === 'github' ? config.client_id : config.github_client_id,
        authorizationEndpoint: `${config.github_url}/login/oauth/authorize`,
        redirectUri: getRedirectUri(basePath),
        scope: ['user:email', 'read:org']
      },
      gitlab: {
        name: 'GitLab',
        url: '/auth/gitlab',
        clientId: config.provider === 'gitlab' ? config.client_id : config.gitlab_client_id,
        authorizationEndpoint: `${config.gitlab_url}/oauth/authorize`,
        redirectUri: getRedirectUri(basePath),
        requiredUrlParams: ['scope'],
        optionalUrlParams: ['display', 'state'],
        scope: ['openid'],
        display: 'popup',
        oauthType: '2.0',
        popupOptions: { width: 1020, height: 618 },
        state: () => encodeURIComponent(Math.random().toString(36).substr(2))
      },
      google: {
        name: 'Google',
        url: '/auth/google',
        clientId: config.provider === 'google' ? config.client_id : config.google_client_id,
        redirectUri: getRedirectUri(basePath)
      },
      keycloak: {
        name: 'Keycloak',
        url: '/auth/keycloak',
        clientId: config.provider === 'keycloak' ? config.client_id : config.keycloak_client_id,
        authorizationEndpoint: `${config.keycloak_url}/auth/realms/${
          config.keycloak_realm
        }/protocol/openid-connect/auth`,
        redirectUri: getRedirectUri(basePath),
        requiredUrlParams: ['scope'],
        optionalUrlParams: ['display', 'state'],
        scope: 'openid+profile+email',
        display: 'popup',
        oauthType: '2.0',
        popupOptions: { width: 1020, height: 618 },
        state: () => encodeURIComponent(Math.random().toString(36).substr(2))
      },
      openid: {
        name: 'OpenID',
        url: '/auth/openid',
        clientId: config.provider === 'openid' ? config.client_id : config.openid_client_id,
        authorizationEndpoint: config.oidc_auth_url,
        redirectUri: getRedirectUri(basePath),
        requiredUrlParams: ['scope'],
        optionalUrlParams: ['display', 'state'],
        scope: 'openid+profile+email',
        display: 'popup',
        oauthType: '2.0',
        popupOptions: { width: 1020, height: 618 },
        state: () => encodeURIComponent(Math.random().toString(36).substr(2))
      },
      pingfederate: {
        name: 'PingFederate',
        url: '/auth/pingfederate',
        clientId: config.client_id,
        authorizationEndpoint: config.pingfederate_url,
        redirectUri: getRedirectUri(basePath || '/'),
        requiredUrlParams: ['pfidpadapterid', 'scope'],
        scope: 'openid+profile+email',
        pfidpadapterid: 'kerberos',
        oauthType: '2.0'
      }
    }
  })
}
