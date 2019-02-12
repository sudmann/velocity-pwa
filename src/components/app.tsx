import { navigate, Router } from '@reach/router';
import React, { Component } from 'react';
import { toast, Slide, ToastContainer } from 'react-toastify';

import { isLoggedIn, login, logout } from '../model/authentication';
import {
  de,
  en,
  supportsLanguage,
  LanguageContext,
  LanguageIdentifier,
  LanguageIdContext,
  LanguageType,
} from '../resources/language';
import * as serviceWorker from '../serviceWorker';
import Login from '../util/lazy-login';
import makeLazy from '../util/make-lazy';
import needsLogin from '../util/needs-login';

import './app.scss';
import MenuBar from './menu-bar';

interface AppState {
  isLoggedIn: boolean;
  language: LanguageType;
  languageId: LanguageIdentifier;
  loginStatusKnown: boolean;
}

interface AppBodyProps extends AppState {
  onChangeLanguage: (lang: LanguageIdentifier) => void;
  onLoginLogoutButtonClick: React.MouseEventHandler;
  onLoginStart: (email: string, password: string) => void;
  onLoginStartWithoutRedirect: (email: string, password: string) => void;
}

const Bookings = needsLogin(makeLazy(() => import('./bookings')));
const Customer = needsLogin(makeLazy(() => import('./customer/customer')));
const Invoices = needsLogin(makeLazy(() => import('./invoices')));
const Map = makeLazy(() => import('./map/bike-map'));
const Support = needsLogin(makeLazy(() => import('./support')));
const Tariff = needsLogin(makeLazy(() => import('./tariff')));

const LOCALSTORAGE_LANGUAGE_KEY = 'velocity/lang';

const AppBody: React.SFC<AppBodyProps> = ({
  isLoggedIn,
  language,
  languageId,
  loginStatusKnown,

  onChangeLanguage,
  onLoginLogoutButtonClick,
  onLoginStart,
  onLoginStartWithoutRedirect,
}) => ((
  <LanguageContext.Provider value={language}>
    <LanguageIdContext.Provider value={languageId}>
      <div className="app">
        <ToastContainer
          position="bottom-center"
          progressClassName="toast-progress"
          toastClassName="toast outline"
          transition={Slide}
        />

        <MenuBar
          isLoggedIn={isLoggedIn}
          loginStatusKnown={loginStatusKnown}
          onChangeLanguage={onChangeLanguage}
          onLoginButtonClick={onLoginLogoutButtonClick}
        />

        <Router role="main" className="main">
          <Map path="/" isLoggedIn={isLoggedIn}/>

          <Bookings
            path="/bookings"
            isLoggedIn={isLoggedIn}
            onLoginStart={onLoginStartWithoutRedirect}
          />
          <Customer
            path="/customer/*"
            isLoggedIn={isLoggedIn}
            onLoginStart={onLoginStartWithoutRedirect}
          />
          <Invoices
            path="/invoices"
            isLoggedIn={isLoggedIn}
            onLoginStart={onLoginStartWithoutRedirect}
          />
          <Login path="/login" onLoginStart={onLoginStart}/>
          <Support
            path="/support"
            isLoggedIn={isLoggedIn}
            onLoginStart={onLoginStartWithoutRedirect}
          />
          <Tariff
            path="/tariff"
            isLoggedIn={isLoggedIn}
            onLoginStart={onLoginStartWithoutRedirect}
          />
        </Router>

        <a
          className="unofficial"
          href="https://github.com/NeoLegends/velocity-pwa"
          target="_blank"
        >
          Unofficial version
        </a>
      </div>
    </LanguageIdContext.Provider>
  </LanguageContext.Provider>
));

class App extends Component<{}, AppState> {
  static contextType = LanguageContext;

  context!: React.ContextType<typeof LanguageContext>;
  state = {
    isLoggedIn: false,
    language: de,
    languageId: 'de' as LanguageIdentifier,
    loginStatusKnown: false,
  };

  componentDidMount() {
    this.checkLanguage();
    this.checkLogin();
    this.configureServiceWorker();
  }

  render() {
    return (
      <AppBody
        {...this.state}
        onChangeLanguage={this.handleChangeLanguage}
        onLoginLogoutButtonClick={this.handleLoginLogoutButton}
        onLoginStart={this.handleLoginWithRedirect}
        onLoginStartWithoutRedirect={this.handleLogin}
      />
    );
  }

  private checkLanguage() {
    const navigatorLanguage = navigator.language.split('-')[0].trim();
    const lang = localStorage.getItem(LOCALSTORAGE_LANGUAGE_KEY) ||
      (supportsLanguage(navigatorLanguage) ? navigatorLanguage : 'de');

    this.handleChangeLanguage(lang as LanguageIdentifier);
  }

  private async checkLogin() {
    const loggedIn = await isLoggedIn();
    this.setState({
      isLoggedIn: loggedIn,
      loginStatusKnown: true,
    });
  }

  private configureServiceWorker() {
    const swConfig = {
      onSuccess: this.handleSwInstallation,
      onUpdate: this.handleSwUpdate,
    };
    process.env.NODE_ENV === 'production'
      ? serviceWorker.register(swConfig)
      : serviceWorker.unregister();
  }

  private handleChangeLanguage = (lang: LanguageIdentifier) => {
    this.setState({
      language: (lang === 'en' ? en : de) as LanguageType,
      languageId: lang,
    });
    localStorage.setItem(LOCALSTORAGE_LANGUAGE_KEY, lang);
  }

  private handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      await this.checkLogin();
    } catch (err) {
      toast(
        this.context.LOGIN.ALERT.NO_SERVER_RESPONSE,
        { type: 'error' },
      );
    }
  }

  private handleLoginWithRedirect = async (email: string, password: string) => {
    await this.handleLogin(email, password);

    navigate('/');
  }

  private handleLoginLogoutButton = async () => {
    if (!this.state.isLoggedIn) {
      return navigate('/login');
    }

    try {
      await logout();
      await this.checkLogin();
    } catch (err) {
      toast(
        this.context.LOGIN.ALERT.LOGOUT_ERR,
        { type: 'error' },
      );
    }
  }

  private handleSwInstallation = () =>
    toast(this.state.language.sw.NOW_AVAILABLE_OFFLINE)

  private handleSwUpdate = () => {
    toast(
      this.state.language.sw.UPDATE_AVAILABLE,
      { autoClose: false },
    );
  }
}

export default App;
