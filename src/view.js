import { proxy, subscribe, snapshot } from 'valtio/vanilla'
import keyBy from 'lodash.keyby'
import makeSchema from './makeSchema'
import initI18n from './i18n'
import i18next from 'i18next'
import updateRss from './updateRss'

const state = proxy({
  websites: [],
  errors: {},
  formState: 'filling', // 'success' 'invalid'
  content: [],
})

const validate = (fields, state) => {
  try {
    makeSchema(state).validateSync(fields, { abortEarly: false })
    return {}
  }
  catch (e) {
    return keyBy(e.inner, 'path')
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

  const defaultLang = navigator.language.startsWith('en') ? 'en' : 'ru'
  await i18next.changeLanguage(defaultLang)

  subscribe(state, () => {
    const snap = snapshot(state)
    const textError = snap.errors.website?.message ?? null
    if (textError) {
      elements.error.textContent = textError
      elements.error.classList.remove('text-success')
      elements.error.classList.add('text-danger')

      elements.input.classList.add('is-invalid')
    }
    else if (snap.formState === 'success') {
      elements.error.textContent = i18next.t('form.success')
      elements.error.classList.remove('text-danger')
      elements.error.classList.add('text-success')
      elements.input.classList.remove('is-invalid')
    }
    else {
      elements.error.textContent = ''
      elements.error.classList.remove('text-danger', 'text-success')
      elements.input.classList.remove('is-invalid')
      input.focus()
    }
  })

  i18next.on('languageChanged', updateTexts)

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const data = new FormData(e.target)
    const url = data.get('url')

    const errors = validate({ website: url }, state)
    state.errors = errors

    if (Object.keys(errors).length === 0) {
      state.formState = 'sending'
      updateRss(url, state, elements, input)
    }
    else {
      state.formState = 'invalid'
    }
  })

  elements.posts.addEventListener('click', (e) => {
    if (!e.target.matches('button')) return

    const postId = e.target.dataset.id
    const post = state.content
      .flatMap((f) => f.posts)
      .find((p) => p.id === postId)

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
  })
}
