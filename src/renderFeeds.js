const renderFeeds = (content, feeds) => {

    const cardFeeds = document.createElement("div");
    cardFeeds.classList.add(
        "card",
        "border-0"
    );

    const div = document.createElement("div");
    div.classList.add("card-body");
    cardFeeds.append(div);

    const h2 = document.createElement("h2");
    h2.classList.add(
        "card-title",
        "h4"
    );
    h2.textContent = "Фиды";
    div.append(h2);

    const ul = document.createElement("ul");
    ul.classList.add(
        "list-group",
        "border-0",
        "rounded-0"
    );
    cardFeeds.append(ul);

    content.forEach((element) => {

        const {titleFeed, descFeed, id} = element;

        const li = document.createElement("li");
        li.classList.add(
            "list-group-item",
            "border-0",
            "border-end-0"
        );

        const h3 = document.createElement("h3");
        h3.classList.add(
            "h6",
            "m-0"
        );
        h3.textContent = titleFeed;
        li.dataset.id = id;
        li.append(h3);

        const p = document.createElement("p");
        p.classList.add(
            "m-0",
            "small",
            "text-black-50"
        );
        p.textContent = descFeed;
        li.append(p);

        ul.append(li);

    });

    feeds.append(cardFeeds);

};

const renderPosts = (content, posts) => {

    const cardPosts = document.createElement("div");
    cardPosts.classList.add(
        "card",
        "border-0"
    );
    const div = document.createElement("div");
    div.classList.add("card-body");
    cardPosts.append(div);

    const h2 = document.createElement("h2");
    h2.classList.add(
        "card-title",
        "h4"
    );
    h2.textContent = "Посты";
    div.append(h2);

    const ul = document.createElement("ul");
    ul.classList.add(
        "list-group",
        "border-0",
        "rounded-0"
    );
    cardPosts.append(ul);

    content.forEach((element) => {

        const {posts} = element;

        posts.forEach((post) => {

            const {title, link, id, read} = post;

            const li = document.createElement("li");
            li.classList.add(
                "list-group-item",
                "d-flex",
                "justify-content-between",
                "align-items-start",
                "border-0",
                "border-end-0"
            );

            const a = document.createElement("a");
            a.textContent = title;
            a.href = link;
            a.classList.add("fw-bold");
            a.dataset.id = id;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            if (read) {

                a.classList.remove("fw-bold");
                a.classList.add("fw-normal");

            }

            const button = document.createElement("button");
            button.type = "button";
            button.classList.add(
                "btn",
                "btn-outline-primary",
                "btn-sm"
            );
            button.textContent = "Просмотр";
            button.dataset.id = id;
            button.dataset.bsToggle = "modal";
            button.dataset.bsTarget = "#modal";

            li.append(
                a,
                button
            );

            ul.append(li);

        });

    });

    posts.append(cardPosts);

};

export default function render (state, feeds, posts) {

    const {content} = state;

    renderFeeds(
        content,
        feeds
    );
    renderPosts(
        content,
        posts
    );

    return 1;

}
