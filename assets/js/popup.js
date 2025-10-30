// popup.js
const listEl = document.getElementById("list");
const refreshBtn = document.getElementById("refresh");
const clearBtn = document.getElementById("clear");
const exportBtn = document.getElementById("exportCsv");
const countEl = document.getElementById("count");

const optSoundNew = document.getElementById("optSoundNew");
const optSoundCaptcha = document.getElementById("optSoundCaptcha");
const defaultSettings = { soundOnNewItem: true, soundOnCaptcha: true };

const formatTime = (ts) => {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "";
  }
};

const render = (items) => {
  listEl.innerHTML = "";
  if (countEl) countEl.textContent = items ? items.length : 0;
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

const csvEscape = (val) => {
  if (val === null || val === undefined) return "";
  const s = String(val);
  // Escape double quotes by doubling them
  const needsQuotes = /[",\n]/.test(s) || s.trim() !== s;
  const escaped = s.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
};

const itemsToCSV = (items) => {
  const headers = ["timestamp","date","message","uuid","imgUrl","pageUrl"];
  const lines = [headers.join(";")];
  (items || []).forEach(it => {
    const ts = it.ts || "";
    const date = ts ? new Date(ts).toISOString() : "";
    const row = [
      csvEscape(ts),
      csvEscape(date),
      csvEscape(it.message || ""),
      csvEscape(it.uuid || ""),
      csvEscape(it.imgUrl || ""),
      csvEscape(it.pageUrl || "")
    ];
    lines.push(row.join(";"));
  });
  return lines.join("\r\n");
};

const triggerDownload = (filename, content, type = "text/csv;charset=utf-8") => {
  // Prepend UTF-8 BOM to ensure proper character rendering (e.g., in Excel on Windows)
  const bom = "\uFEFF";
  const blob = new Blob([bom, content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
};

const applySettingsUI = (s) => {
  if (optSoundNew) optSoundNew.checked = !!s.soundOnNewItem;
  if (optSoundCaptcha) optSoundCaptcha.checked = !!s.soundOnCaptcha;
};

const loadSettings = () => {
  chrome.storage.local.get({ spookySettings: defaultSettings }, (data) => {
    const s = data.spookySettings || defaultSettings;
    applySettingsUI(s);
  });
};

const persistSettings = () => {
  const s = {
    soundOnNewItem: !!(optSoundNew && optSoundNew.checked),
    soundOnCaptcha: !!(optSoundCaptcha && optSoundCaptcha.checked)
  };
  chrome.storage.local.set({ spookySettings: s });
};

if (optSoundNew) optSoundNew.addEventListener("change", persistSettings);
if (optSoundCaptcha) optSoundCaptcha.addEventListener("change", persistSettings);

const load = () => {
  chrome.storage.local.get({ spookyItems: [] }, (data) => {
    render(data.spookyItems);
  });
};

refreshBtn.addEventListener("click", load);

exportBtn.addEventListener("click", () => {
  chrome.storage.local.get({ spookyItems: [] }, (data) => {
    const csv = itemsToCSV(data.spookyItems || []);
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const fname = `spooky_items_${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.csv`;
    triggerDownload(fname, csv);
  });
});

clearBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all captured items? This action cannot be undone.")) {
    chrome.storage.local.set({ spookyItems: [] }, load);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  loadSettings();
  load();

  const toggleSettingsBtn = document.getElementById("toggleSettings");
  const settingsDiv = document.getElementById("settings");
  if (toggleSettingsBtn && settingsDiv) {
    toggleSettingsBtn.addEventListener("click", () => {
      if (settingsDiv.style.display === "none" || !settingsDiv.style.display) {
        settingsDiv.style.display = "block";
      } else {
        settingsDiv.style.display = "none";
      }
    });
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.spookyItems) {
    load();
  }
});
