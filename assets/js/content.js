// content.js
(() => {
  const POLL_MS = 3000;

  const savedUUIDs = new Set();
  let lastCaptchaAlert = 0;

  // Settings cache with defaults; kept in sync with popup
  let spookySettings = { soundOnNewItem: true, soundOnCaptcha: true };
  try {
    chrome.storage.local.get({ spookySettings }, (data) => {
      if (data && data.spookySettings) {
        spookySettings = { ...spookySettings, ...data.spookySettings };
      }
    });
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.spookySettings) {
        const nv = changes.spookySettings.newValue || {};
        spookySettings = { ...spookySettings, ...nv };
      }
    });
  } catch {}

  const playCaptchaAlert = () => {
    if (!spookySettings.soundOnCaptcha) {
      return;
    }
    try {
      const mp3 = 'https://media.geeksforgeeks.org/wp-content/uploads/20190531135120/beep.mp3';
      (new Audio(mp3)).play().catch((e) => {
        console.error(e);
      });
    } catch (e) {
      console.error(e);
    }
  };

  const playNewItemSound = () => {
    if (!spookySettings.soundOnNewItem) {
      return;
    }
    try {
      const mp3 = 'https://media.geeksforgeeks.org/wp-content/uploads/20190531135120/beep.mp3';
      (new Audio(mp3)).play().catch((e) => {
        console.error(e);
      });
    } catch (e) {
      console.error(e);
    }
  };

  const detectCaptchaAndAlert = (container) => {
    // If text not present yet but a reCAPTCHA element exists in DOM, raise an audible alert (debounced)
    const hasText = !!extractLeadText(container);
    const hasCaptcha = !!(document.querySelector('div.g-recaptcha') || document.querySelector('.g-recaptcha') || document.querySelector('iframe[src*="recaptcha"]'));
    if (!hasText && hasCaptcha) {
      const now = Date.now();
      if (now - lastCaptchaAlert > 10000) { // debounce 10s
        lastCaptchaAlert = now;
        playCaptchaAlert();
      }
    }
  };

  const rand = (min, max) => Math.random() * (max - min) + min;

  const fireMouseEvent = (type, el, x, y) => {
    const ev = new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      composed: true,
      view: window,
      clientX: x,
      clientY: y,
    });
    el.dispatchEvent(ev);
  };

  const humanClick = async (el) => {
    // Ensure element is visible
    try { el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' }); } catch {}
    await new Promise(r => setTimeout(r, rand(120, 260)));

    const rect = el.getBoundingClientRect();
    // Small jitter, as if a human clicks near the center
    const x = rect.left + rect.width * 0.5 + rand(-rect.width * 0.08, rect.width * 0.08);
    const y = rect.top + rect.height * 0.5 + rand(-rect.height * 0.08, rect.height * 0.08);

    // Pointer + mouse events
    fireMouseEvent('pointerover', el, x, y);
    fireMouseEvent('mouseover', el, x, y);
    fireMouseEvent('mousemove', el, x, y);
    await new Promise(r => setTimeout(r, rand(40, 120)));
    fireMouseEvent('pointerdown', el, x, y);
    fireMouseEvent('mousedown', el, x, y);
    await new Promise(r => setTimeout(r, rand(30, 90)));
    fireMouseEvent('pointerup', el, x, y);
    fireMouseEvent('mouseup', el, x, y);
    fireMouseEvent('click', el, x, y);
  };

  const saveItem = (imgUrl, message, uuid) => {
    chrome.storage.local.get({ spookyItems: [] }, (data) => {
      const items = Array.isArray(data.spookyItems) ? data.spookyItems : [];

      // Deduplicate based on UUID (if available)
      const exists = uuid ? items.some(it => it.uuid === uuid) : false;
      const entry = {
        uuid: uuid || null,
        imgUrl: imgUrl || '',
        message: message || '',
        pageUrl: location.href,
        ts: Date.now(),
      };
      if (!exists) {
        items.unshift(entry);
      } else {
        // Update existing item (if the message changed)
        const idx = items.findIndex(it => it.uuid === uuid);
        if (idx !== -1) {
          items[idx] = entry;
        }
      }
      // Maintenance
      chrome.storage.local.set({ spookyItems: items.slice(0, 2000) });
    });
  };

  const processedMarker = (el) => el && el.dataset ? el.dataset.spookyClicked === '1' : false;
  const markProcessed = (el) => {
    if (el && el.dataset) {
      el.dataset.spookyClicked = '1';
    }
  };

  const extractLeadText = (container) => {
    // Build text from the first text nodes before a <br> or <p>
    if (!container) {
      return '';
    }
    const parts = [];
    for (const node of container.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        parts.push(node.textContent);
      } else if (node.nodeName === 'BR' || node.nodeName === 'P') {
        break;
      }
    }
    return parts.join('').trim();
  };

  const clickRemoveMessageIfExists = async (container) => {
    const removeMessageEl = container.querySelector('p#removeMessage');
    if (removeMessageEl) {
      if (!removeMessageEl.isConnected) {
        return;
      }
      await humanClick(removeMessageEl);
    }
  };

  // Watch for #spo0kyD creation and changes – more reliable than fixed timeout
  let containerObserver = null;

  const attachContainerObserver = (container) => {
    if (!container) {
      return;
    }

    if (containerObserver) {
      try { containerObserver.disconnect(); } catch {}
      containerObserver = null;
    }

    containerObserver = new MutationObserver(async (mutations) => {
      // If popup content changes (spooky-event), extract the text and click close
      const msg = extractLeadText(container);
      if (msg) {
        const uuid = container.getAttribute('data-uuid') || null;
        const img = container.querySelector('img');
        const imgUrl = container.dataset.spookyImgUrl || (img ? (img.currentSrc || img.src || '') : '');
        if (uuid && savedUUIDs.has(uuid)) {
          return;
        }
        saveItem(imgUrl, msg, uuid);
        if (uuid) {
          savedUUIDs.add(uuid);
        } else {
          container.dataset.spookySaved = '1';
        }
        playNewItemSound();
        await clickRemoveMessageIfExists(container);
      }
    });

    containerObserver.observe(container, { childList: true, subtree: true, characterData: true });
  };

  const processContainerIfReady = async (container) => {
    if (!container) {
      return;
    }

    // Click the image if not already clicked
    const img = container.querySelector('img');
    if (img && !processedMarker(img)) {
      if (!container.dataset.spookyImgUrl) { container.dataset.spookyImgUrl = img.currentSrc || img.src || ''; }
      await humanClick(img);
      // Give the DOM a moment to update, then check for captcha
      await new Promise(r => setTimeout(r, rand(250, 600)));
      detectCaptchaAndAlert(container);
      markProcessed(img);
    }

    // If the text is already present, process it immediately (fallback alongside observer)
    const msgNow = extractLeadText(container);
    if (msgNow) {
      const uuid = container.getAttribute('data-uuid') || null;
      const imgUrl = container.dataset.spookyImgUrl || (img ? (img.currentSrc || img.src || '') : '');
      if (uuid && savedUUIDs.has(uuid)) {
        return;
      }
      saveItem(imgUrl, msgNow, uuid);
      if (uuid) {
        savedUUIDs.add(uuid);
      } else {
        container.dataset.spookySaved = '1';
      }
      playNewItemSound();
      await clickRemoveMessageIfExists(container);
    }
  };

  // Body observer – react immediately when #spo0kyD is added
  const bodyObserver = new MutationObserver(async (mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (!(node instanceof HTMLElement)) {
          continue;
        }
        const container = node.id === 'spo0kyD' ? node : node.querySelector && node.querySelector('#spo0kyD');
        if (container) {
          attachContainerObserver(container);
          await processContainerIfReady(container);
        }
      }
    }
  });

  try { bodyObserver.observe(document.documentElement || document.body, { childList: true, subtree: true }); } catch {}

  // Polling fallback – if MutationObserver does not work
  const loop = async () => {
    try {
      const container = document.querySelector('#spo0kyD');
      if (!container) {
        return;
      }
      attachContainerObserver(container);
      await processContainerIfReady(container);
    } catch (e) {
      // Ignorable
    }
  };

  setInterval(loop, POLL_MS);
})();
