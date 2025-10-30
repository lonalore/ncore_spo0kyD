// popup.js
const listEl = document.getElementById("list");
const refreshBtn = document.getElementById("refresh");
const clearBtn = document.getElementById("clear");

const formatTime = (ts) => {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "";
  }
};

const render = (items) => {
  listEl.innerHTML = "";
  if (!items || !items.length) {
    const div = document.createElement("div");
    div.className = "empty";
    div.textContent = "There is no captured item.";
    listEl.appendChild(div);
    return;
  }

  items.forEach((it) => {
    const card = document.createElement("div");
    card.className = "item";

    const img = document.createElement("img");
    img.className = "thumb";
    img.src = it.imgUrl || "";
    img.alt = "Image";
    card.appendChild(img);

    const right = document.createElement("div");

    const msg = document.createElement("div");
    msg.className = "message";
    msg.textContent = it.message || "(no message)";
    right.appendChild(msg);

    const meta = document.createElement("div");
    meta.className = "meta";
    const link = document.createElement("a");
    link.href = it.imgUrl || "#";
    link.textContent = it.imgUrl || "(no image)";
    link.target = "_blank";
    link.rel = "noreferrer";
    meta.appendChild(document.createTextNode(formatTime(it.ts) + " • "));
    // meta.appendChild(link);

    meta.appendChild(document.createElement("br"));
    if (it.uuid) {
      // meta.appendChild(document.createTextNode("UUID: " + it.uuid));
    }

    // meta.appendChild(document.createElement("br"));
    if (it.pageUrl) {
      const pageLink = document.createElement("a");
      pageLink.href = it.pageUrl;
      pageLink.textContent = "Soruce page";
      pageLink.target = "_blank";
      pageLink.rel = "noreferrer";
      // meta.appendChild(pageLink);
    }

    right.appendChild(meta);
    card.appendChild(right);

    listEl.appendChild(card);
  });
};

const load = () => {
  chrome.storage.local.get({ spookyItems: [] }, (data) => {
    render(data.spookyItems);
  });
};

refreshBtn.addEventListener("click", load);

clearBtn.addEventListener("click", () => {
  chrome.storage.local.set({ spookyItems: [] }, load);
});

document.addEventListener("DOMContentLoaded", load);

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.spookyItems) {
    load();
  }
});
