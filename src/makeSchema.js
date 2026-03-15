import * as yup from 'yup'
import i18next from 'i18next'

const makeSchema = state =>
  yup.object({
    website: yup
      .string()
      .url()
      .required()
      .test(
        'unique',
        () => i18next.t('form.errors.notUnique'),
        value => !state.websites.includes(value),
      ),
  })

yup.setLocale({
  mixed: {
    required: () => i18next.t('form.errors.required'),
  },
  string: {
    url: () => i18next.t('form.errors.url'),
  },
})

export default makeSchema
