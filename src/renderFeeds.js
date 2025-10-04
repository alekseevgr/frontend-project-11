const renderFeeds = (content, feeds) => {
  const cardBody = document.createElement("div");
  cardBody.classList.add("card-body");
  const h4 = document.createElement("h4");
  h4.classList.add("card-title", "h4");

  const ul = document.createElement('ul')
  ul.classList.add('list-group', 'border-0', 'rounded-0')
};

/* <ul class="list-group border-0 rounded-0">
  <li class="list-group-item border-0 border-end-0">
    <h3 class="h6 m-0">
      Lorem ipsum feed for an interval of 1 minutes with 10 item(s)
    </h3>
    <p class="m-0 small text-black-50">
      This is a constantly updating lorem ipsum feed
    </p>
  </li>
</ul>; */

export default function render(state, feeds, posts) {
  const { content } = state;

  renderFeeds(content, feeds);

  return 1;
}
