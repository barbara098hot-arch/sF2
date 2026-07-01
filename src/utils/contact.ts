import { getStorage } from './localStorage';

export const WHATSAPP_NUMBER = '5588996849367';
const LEGACY_WHATSAPP_NUMBERS = ['5511999999999'];

export const getWhatsAppNumber = () => {
  const config = getStorage<any>('fiorella_config', null);
  if (config && config.whatsapp && !LEGACY_WHATSAPP_NUMBERS.includes(config.whatsapp)) {
    return config.whatsapp;
  }
  return WHATSAPP_NUMBER;
};
