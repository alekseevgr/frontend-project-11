import axios from 'axios'
import buildPath from './buildPath'
import parseXML from './parseXML'
import render from './renderFeeds'
import i18next from 'i18next'

const updateRss = (url, state, elements, input) => {
  const path = buildPath(url)
  let isRetry = true
  axios
    .get(path)
    .then((response) => {
      const contents = response.data.contents
      const parsedFeed = parseXML(contents)
      const existingFeed = state.content.find((f) => f.url === url)

      const newPosts = parsedFeed.posts.filter((post) => {
        if (!existingFeed) return true

        return !existingFeed.posts.some((p) => p.link === post.link)
      })

      if (!existingFeed) {
        parsedFeed.url = url
        state.content.push(parsedFeed)
        state.websites.push(url)
      }
      else if (newPosts.length > 0) {
        existingFeed.posts.unshift(...newPosts)
      }

      elements.feeds.innerHTML = ''
      elements.posts.innerHTML = ''
      render(state, elements.feeds, elements.posts)
      input.value = ''
      state.formState = 'success'
      isRetry = true
    })
    .catch((err) => {
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
        setTimeout(() => updateRss(url), 5000)
      }
    })
}

export default updateRss
