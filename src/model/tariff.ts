import { LanguageIdentifier } from '../resources/language';

import { Tariff, UserTariff } from '.';
import {
  fetch204ToNull,
  fetchEnsureOk,
  fetchJsonEnsureOk,
  postJsonEnsureOk,
} from './fetch';
import {
  tariffsUrl,
  APP_CURRENT_TARIFF_URL,
  APP_TOGGLE_TARIFF_RENEWAL_URL,
} from './urls';

export const activateAutoRenewal = () =>
  fetchEnsureOk(APP_TOGGLE_TARIFF_RENEWAL_URL, { method: 'post' });

export const bookTariff = (tariffId: number) =>
  postJsonEnsureOk(APP_CURRENT_TARIFF_URL, { tariffId }, 'put');

export const deactivateAutoRenewal = () =>
  fetchEnsureOk(APP_TOGGLE_TARIFF_RENEWAL_URL, { method: 'delete' });

export const getCurrentTariff = (): Promise<UserTariff | null> =>
  fetch204ToNull(APP_CURRENT_TARIFF_URL);

export const getTariffs = (lang: LanguageIdentifier): Promise<Tariff[]> =>
  fetchJsonEnsureOk(tariffsUrl(lang));
