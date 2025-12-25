import * as yup from "yup";
import { proxy, subscribe, snapshot } from "valtio/vanilla";
import keyBy from "lodash.keyby";
import i18next from "i18next";
import axios from "axios";
import buildPath from "./buildPath";
import parseXML from "./parseXML";
import render from "./renderFeeds";

await i18next.init({
  lng: "ru",
  resources: {
    ru: { translation: await import("/locales/ru/translation.json") },
    en: { translation: await import("/locales/en/translation.json") },
  },
});

yup.setLocale({
  mixed: {
    required: () => i18next.t("form.errors.required"),
  },
  string: {
    url: () => i18next.t("form.errors.url"),
  },
});

const makeSchema = (state) =>
  yup.object({
    website: yup
      .string()
      .url()
      .required()
      .test(
        "unique",
        () => i18next.t("form.errors.notUnique"),
        (value) => !state.websites.includes(value)
      ),
  });

const state = proxy({
  websites: [],
  errors: {},
  formState: "valid",
  content: [],
});

const validate = (fields, state) => {
  try {
    makeSchema(state).validateSync(fields, { abortEarly: false });
    return {};
  } catch (e) {
    return keyBy(e.inner, "path");
  }
};

const elements = {
  label: document.querySelector('label[for="url-input"]'),
  input: document.getElementById("url-input"),
  button: document.querySelector('.rss-form button[type="submit"]'),
  error: document.querySelector(".feedback"),
  feeds: document.querySelector(".feeds"),
  posts: document.querySelector(".posts"),
};

function updateTexts() {
  elements.label.textContent = i18next.t("form.label");
  elements.input.placeholder = i18next.t("form.placeholder");
  elements.button.textContent = i18next.t("form.submit");
}

updateTexts();

export default function app() {
  const form = document.querySelector(".rss-form");
  const input = document.querySelector("#url-input");

  subscribe(state, () => {
    const snap = snapshot(state);
    const textError = snap.errors.website?.message ?? null;
    if (textError) {
      elements.error.textContent = textError;
      elements.input.classList.add("is-invalid");
    } else {
      elements.error.textContent = "";
      elements.input.classList.remove("is-invalid");
      input.focus();
    }
  });

  i18next.on("languageChanged", updateTexts);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const url = data.get("url");

    const path = buildPath(url);

    const errors = validate({ website: url }, state);
    state.errors = errors;

    if (Object.keys(errors).length === 0) {
      axios
        .get(path)
        .then((response) => {
          const contents = response.data.contents;
          const feed = parseXML(contents);
          state.content.push(feed); 
          render(state, elements.feeds, elements.posts);
          state.websites.push(url);
          input.value = "";
        })
        .catch((err) => {
          console.error(err);
        });
    }
  });
}
