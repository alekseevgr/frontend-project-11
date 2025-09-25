import * as yup from "yup";
import { proxy, subscribe, snapshot } from "valtio/vanilla";
import keyBy from "lodash.keyby";

const makeSchema = (state) =>
  yup.object({
    website: yup
      .string()
      .url("Введите корректный URL")
      .required("Сайт обязателен")
      .test(
        "unique",
        "Такой сайт уже добавлен",
        (value) => !state.websites.includes(value)
      ),
  });

const state = proxy({
  websites: [],
  errors: {}, // тут будут ошибки
  formState: "valid",
});

const validate = (fields, state) => {
  try {
    makeSchema(state).validateSync(fields, { abortEarly: false });
    return {};
  } catch (e) {
    return keyBy(e.inner, "path");
  }
};

export default function app() {
  const form = document.querySelector(".rss-form");
  const input = document.querySelector("#url-input");
  const rssContainer = document.querySelector(".rss");

  subscribe(state, () => {
    const snap = snapshot(state);
    const textError = snap.errors.website?.message ?? null;
    let errorHtml = document.querySelector(".text-danger");

    if (textError) {
      if (!errorHtml) {
        errorHtml = document.createElement("p");
        errorHtml.classList.add(
          "feedback",
          "m-0",
          "position-absolute",
          "small",
          "text-danger"
        );
        rssContainer.appendChild(errorHtml);
      }
      errorHtml.textContent = textError;
      input.classList.add("is-invalid");
    } else {
      if (errorHtml) errorHtml.remove();
      input.classList.remove("is-invalid");
      input.focus()
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const url = data.get("url");

    const errors = validate({ website: url }, state);
    state.errors = errors;

    if (Object.keys(errors).length === 0) {
      state.websites.push(url);
      input.value = "";
    }
  });
}
