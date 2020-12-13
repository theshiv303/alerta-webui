<template>
  <v-container
    grid-list-sm
    fill-height
  >
    <v-layout
      align-center
      row
      wrap
    >
      <v-flex
        v-if="isBasicAuth"
        xs12
        sm8
        offset-xs0
        offset-sm2
      >
        <p class="text-xs-center headline font-weight-medium">
          {{ $t('LoginToContinue') }}
        </p>
        <div
          v-for="provider in providers"
          :key="provider.id"
          class="mb-2"
        >
          <v-btn
            block
            :color="provider.color"
            large
            class="pa-0"
          >
            <v-icon
              v-if="provider.icon"
              class="login-icon"
            >
              {{ provider.icon }}
            </v-icon>
            <img
              v-if="provider.image"
              id="google-login-icon"
              :src="provider.image"
            >
            {{ provider.text }}
          </v-btn>
        </div>

        <v-divider
          class="my-3"
        />

        <v-form @submit.prevent="login()">
          <v-text-field
            v-model.trim="username"
            name="login"
            type="text"
            :label="$t('Username')"
            prepend-inner-icon="alternate_email"
            outline
          />
          <v-text-field
            v-model="password"
            name="password"
            :type="showPassword ? 'text' : 'password'"
            :label="$t('Password')"
            :append-icon="showPassword ? 'visibility_off' : 'visibility'"
            outline
            @click:append="showPassword = !showPassword"
          />
          <v-btn
            block
            color="primary"
            type="submit"
          >
            {{ $t('LogIn') }}
          </v-btn>
        </v-form>
        <div class="text-xs-center">
          <v-btn
            flat
            color="primary"
            to="/signup"
            :disabled="!signupEnabled"
          >
            {{ $t('CreateAccount') }}
          </v-btn>
          <v-btn
            flat
            color="primary"
            to="/forgot"
          >
            {{ $t('ForgotPassword') }}
          </v-btn>
        </div>
      </v-flex>

      <v-flex
        v-else-if="$config.provider == 'saml2'"
        xs12
        sm8
        offset-xs0
        offset-sm2
      >
        <div>
          <p class="text-xs-center headline font-weight-medium">
            SAML2 Authentication uses pop-up windows.
          </p>
          <p class="text-xs-center subheading font-weight-medium">
            Please allow pop-ups from <kbd>{{ host }}</kbd>
          </p>
        </div>
        <div v-show="message && !error">
          <p class="text-xs-center headline font-weight-medium">
            {{ message }}
          </p>
        </div>
        <div v-show="error">
          <p class="text-xs-center headline font-weight-medium">
            {{ $t('UnspecifiedProblem') }}
            <a
              href="#"
              @click="authenticateUsingSAML"
            >
              {{ $t('TryAgain') }}
            </a>
          </p>
          <p class="text-xs-center subheading font-weight-medium">
            {{ $t('Error') }}: {{ error }}
          </p>
        </div>
      </v-flex>

      <v-flex
        v-else
        xs12
        sm8
        offset-xs0
        offset-sm2
      >
        <div v-show="message && !error">
          <p class="text-xs-center headline font-weight-medium">
            {{ message }}
          </p>
        </div>
        <div v-show="error">
          <p class="text-xs-center headline font-weight-medium">
            {{ $t('UnspecifiedProblem') }}
            <a
              href="#"
              @click="authenticate"
            >
              {{ $t('TryAgain') }}
            </a>
          </p>
          <p class="text-xs-center subheading font-weight-medium">
            {{ $t('Error') }}: {{ error }}
          </p>
        </div>
      </v-flex>

      <v-flex
        xs12
        sm8
        offset-xs0
        offset-sm2
      />
    </v-layout>
  </v-container>
</template>

<script>
import i18n from '@/plugins/i18n'

export default {
  props: [],
  data: () => ({
    host: window.location.origin,
    username: null,
    password: null,
    showPassword: false,
    message: null,
    error: null,

    providers: [
      {id: 'azure', text: 'Sign in with Azure', color: '', icon: 'fab fa-windows'},
      {id: 'cognito', text: 'Sign in with Amazon Cognito', color: '', icon: 'fab fa-aws'},
      {id: 'github', text: 'Sign in with GitHub', color: 'white', icon: 'fab fa-github'},
      {id: 'gitlab', text: 'Sign in with GitLab', color: 'white', icon: 'fab fa-gitlab'},
      {id: 'google', text: 'Sign in with Google', color: '#4285F4', image: '/images/btn_google_light_normal_ios.svg'},
      {id: 'keycloak', text: 'Sign in with Keycloak', color: '', icon: 'fas fa-key'},
      {id: 'openid', text: 'Sign in with OpenID Connect', color: '', icon: 'fab fa-openid'},
      {id: 'pingfederate', text: 'Sign in with PingFederate', color: '', icon: 'fas fa-id-badge'},
      {id: 'saml2', text: 'Sign in with SAML2', color: '', icon: 'fas fa-id-badge'},
    ]
  }),
  computed: {
    isBasicAuth() {
      return this.$config.provider == 'basic' || this.$config.provider == 'ldap'
    },
    authProvider() {
      let providers = this.$store.getters['auth/getOptions']['providers']
      return providers[this.$config.provider] ? providers[this.$config.provider].name : null
    },
    signupEnabled() {
      return this.$store.getters.getConfig('signup_enabled')
    }
  },
  created() {
    if (this.$config.provider == 'saml2') {
      this.authenticateUsingSAML()
    } else if (this.authProvider) {
      this.authenticate()
    }
  },
  methods: {
    login() {
      let credentials = {
        username: this.username,
        password: this.password
      }
      this.$store
        .dispatch('auth/login', credentials)
        .then(() => this.$router.push({ path: this.$route.query.redirect || '/' }))
        .catch(error => this.error = error.response.data.message)
    },
    authenticate() {
      if (this.authProvider) {
        this.message = `Authenticating with ${this.authProvider} ...`
        this.$store
          .dispatch('auth/authenticate', this.$config.provider)
          .then(() => this.$router.push({ path: this.$route.query.redirect || '/' }))
          .catch(error => this.error = error.response.data.message)
      } else {
        this.message = i18n.t('AuthNotPossible')
        this.error = `Unknown authentication provider (${this.$config.provider})`
      }
    },
    authenticateUsingSAML() {
      let auth_win
      window.addEventListener('message', event => {
        if (event.source === auth_win) {
          if (event.data && event.data.status && event.data.status === 'ok' && event.data.token) {
            this.$store
              .dispatch('auth/setToken', event.data)
              .then(() => this.$router.push({ path: this.$route.query.redirect || '/' }))
              .catch(error => this.error = error.response.data.message)
          } else {
            this.message = i18n.t('AuthNotPossible')
            this.error = event.data.message ? event.data.message : JSON.stringify(event)
          }
        }
        return
      })
      auth_win = window.open(this.$config.endpoint + '/auth/saml', i18n.t('AuthInProgress'))
    }
  }
}
</script>

<style>
#google-login-icon {
  position: absolute;
  left: 0;
}
.login-icon {
  position: absolute;
  left: 8px;
}
</style>
