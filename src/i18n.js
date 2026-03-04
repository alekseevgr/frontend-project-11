import i18next from 'i18next'

const initI18n = async () => {
  await i18next.init({
    lng: 'ru',
    resources: {
      ru: { translation: await import('./locales/ru/translation.json') },

      en: { translation: await import('./locales/en/translation.json') },
    },
  })
}

export default initI18n
