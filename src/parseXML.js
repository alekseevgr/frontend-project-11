import uniqueId from "lodash/uniqueId";

export default function parseXML(xml) {
  const parser = new DOMParser();

  const doc = parser.parseFromString(xml, "text/xml");

  const errorNode = doc.querySelector("parsererror");
  if (errorNode) {
    throw new Error("Ошибка парсинга XML");
  }

  const channel = doc.querySelector("channel");
  const titleFeed = channel.querySelector("title")?.textContent ?? "";
  const descFeed = channel.querySelector("description")?.textContent ?? "";

  const feed = {
    titleFeed,
    descFeed,
    id: uniqueId(),
    posts: [],
  };

  const items = doc.querySelectorAll("item");

  items.forEach((item) => {
    const title = item.querySelector("title").textContent;
    const link = item.querySelector("link").textContent;
    const description = item.querySelector("description").textContent;
    const id = feed.id
    const post = {
      title,
      link,
      description,
      idFeed: id,
    };

    feed.posts.push(post);
  });

  return feed;
}
