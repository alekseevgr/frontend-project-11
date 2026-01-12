import * as yup from 'yup'
import { proxy, subscribe, snapshot } from 'valtio/vanilla'
import keyBy from 'lodash.keyby'
import i18next from 'i18next'
import axios from 'axios'
import buildPath from './buildPath'
import parseXML from './parseXML'
import render from './renderFeeds'

const initI18n = async() => {
  await i18next.init({
    lng: 'ru',
    resources: {
      ru: { translation: await import('../locales/ru/translation.json') },
      en: { translation: await import('../locales/en/translation.json') },
    },
  })
}

yup.setLocale({
  mixed: {
    required: () => i18next.t('form.errors.required'),
  },
  string: {
    url: () => i18next.t('form.errors.url'),
  },
})

const makeSchema = state => yup.object({
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

const state = proxy({
  websites: [],
  errors: {},
  formState: 'filling', // 'success' 'invalid'
  content: [],
})

const validate = (fields, state) => {
  try {
    makeSchema(state).validateSync(
      fields,
      { abortEarly: false },
    )
    return {}
  } catch(e) {
    return keyBy(
      e.inner,
      'path',
    )
  }
}

const elements = {
  label: document.querySelector('label[for="url-input"]'),
  input: document.getElementById('url-input'),
  button: document.querySelector('.rss-form button[type="submit"]'),
  error: document.querySelector('.feedback'),
  feeds: document.querySelector('.feeds'),
  posts: document.querySelector('.posts'),
}

function updateTexts() {
  elements.label.textContent = i18next.t('form.label')
  elements.input.placeholder = i18next.t('form.placeholder')
  elements.button.textContent = i18next.t('form.submit')
}

export default async function app() {
  await initI18n()
  updateTexts()
  const form = document.querySelector('.rss-form')
  const input = document.querySelector('#url-input')

  const defaultLang = navigator.language.startsWith('en')
    ? 'en'
    : 'ru'
  await i18next.changeLanguage(defaultLang)

  const updateRss = url => {
    const path = buildPath(url)
    let isRetry = true
    axios
      .get(path)
      .then(response => {
        const contents = response.data.contents
        const parsedFeed = parseXML(contents)

        const existingFeed = state.content.find(f => f.url === url)

        const newPosts = parsedFeed.posts.filter(post => {
          if (!existingFeed) return true

          return !existingFeed.posts.some(p => p.link === post.link)
        })

        if (!existingFeed) {
          parsedFeed.url = url
          state.content.push(parsedFeed)
          state.websites.push(url)
        } else if (newPosts.length > 0) {
          existingFeed.posts.unshift(...newPosts)
        }

        elements.feeds.innerHTML = ''
        elements.posts.innerHTML = ''
        render(
          state,
          elements.feeds,
          elements.posts,
        )
        input.value = ''
        state.formState = 'success'
        isRetry = true
      })
      .catch(err => {
        if (err.message === 'Ошибка парсинга XML') {
          state.errors = {
            website: { message: i18next.t('form.errors.invalidRss') },
          }
          state.formState = 'invalid'
          isRetry = false
          return
        }
        if (err.response?.status === 404) {
          state.errors = {
            website: { message: i18next.t('form.errors.notFound') },
          }
          state.formState = 'invalid'
          isRetry = false
          return
        }
        state.errors = {
          website: { message: i18next.t('form.errors.network') },
        }
        state.formState = 'invalid'
        isRetry = true
      })
      .finally(() => {
        if (isRetry) {
          setTimeout(
            () => updateRss(url),
            5000,
          )
        }
      })
  }

  subscribe(
    state,
    () => {
      const snap = snapshot(state)
      const textError = snap.errors.website?.message ?? null
      if (textError) {
        elements.error.textContent = textError
        elements.error.classList.remove('text-success')
        elements.error.classList.add('text-danger')

        elements.input.classList.add('is-invalid')
      } else if (snap.formState === 'success') {
        elements.error.textContent = i18next.t('form.success')
        elements.error.classList.remove('text-danger')
        elements.error.classList.add('text-success')
        elements.input.classList.remove('is-invalid')
      } else {
        elements.error.textContent = ''
        elements.error.classList.remove(
          'text-danger',
          'text-success',
        )
        elements.input.classList.remove('is-invalid')
        input.focus()
      }
    },
  )

  i18next.on(
    'languageChanged',
    updateTexts,
  )

  form.addEventListener(
    'submit',
    e => {
      e.preventDefault()
      const data = new FormData(e.target)
      const url = data.get('url')

      const errors = validate(
        { website: url },
        state,
      )
      state.errors = errors

      if (Object.keys(errors).length === 0) {
        state.formState = 'sending'
        updateRss(url)
      } else {
        state.formState = 'invalid'
      }
    },
  )

  elements.posts.addEventListener(
    'click',
    e => {
      if (!e.target.matches('button')) return

      const postId = e.target.dataset.id
      const post = state.content
        .flatMap(f => f.posts)
        .find(p => p.id === postId)

      if (!post) return

      post.read = true

      const link = elements.posts.querySelector(`a[data-id="${postId}"]`)
      if (link) {
        link.classList.remove('fw-bold')
        link.classList.add('fw-normal')
      }

      document.querySelector('.modal-title').textContent = post.title
      document.querySelector('.modal-body').textContent = post.description
      document.querySelector('.full-article').href = post.link
    },
  )
}
