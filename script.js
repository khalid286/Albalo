/* ==========================================================
   CHERRY FRUIT SELLER — script.js
   Fetches plain-text content from a published Google Doc,
   parses the key: value pairs, and populates the page.
   ========================================================== */

// ============================================================
// ⬇️  CONFIGURATION — Edit only this section
// ============================================================

/**
 * Paste your published Google Doc URL here.
 * It should end with:  /pub?output=txt
 *
 * Example:
 *   https://docs.google.com/document/d/e/2PACX-.../pub?output=txt
 */
const GOOGLE_DOC_URL = "https://docs.google.com/document/d/e/2PACX-1vT3kJRS_EisoCAp4ekLw-JAQ_yGvqpxQVuoTpPb8LNtik75ull8q-UWsHzE4ESND5odbJgVWFpHuc_i/pub?output=txt";

/**
 * How often (in milliseconds) to auto-refresh when the tab is open.
 * Default: every 5 minutes. Set to 0 to disable.
 */
const AUTO_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

// ============================================================
// End of configuration
// ============================================================


// ---- CORS Proxy list (tried in order until one works) ----
// Google Docs blocks direct browser fetches (CORS policy).
// These free proxies forward the request on our behalf.
const CORS_PROXIES = [
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://cors-anywhere.herokuapp.com/${url}`,
];


// ---- Helpers ----

function getField(map, key) {
  const normalised = key.toLowerCase().trim();
  for (const [k, v] of map.entries()) {
    if (k.toLowerCase().trim() === normalised) return v.trim();
  }
  return "";
}

function parseDoc(text) {
  const map   = new Map();
  const lines = text.split("\n");
  let lastKey = null;

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line) continue;

    const colonIdx = line.indexOf(":");
    if (colonIdx > 0 && colonIdx < 60) {
      const potentialKey   = line.slice(0, colonIdx).trim();
      const potentialValue = line.slice(colonIdx + 1).trim();
      if (!potentialKey.includes("\n")) {
        map.set(potentialKey, potentialValue);
        lastKey = potentialKey;
        continue;
      }
    }

    if (lastKey) {
      const existing = map.get(lastKey) || "";
      map.set(lastKey, existing + "\n" + line);
    }
  }
  return map;
}

function formatTimestamp(date) {
  const en = date.toLocaleString("en-US", {
    weekday: "short", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
  return `Updated ${en}`;
}

function show(el) { el.removeAttribute("hidden"); }
function hide(el) { el.setAttribute("hidden", ""); }

/**
 * Tries each CORS proxy in sequence.
 * Returns the response text from the first one that succeeds.
 * Throws if all proxies fail.
 */
async function fetchWithFallback(docUrl) {
  const targetUrl = docUrl + "&cb=" + Date.now(); // cache-bust

  for (const proxyFn of CORS_PROXIES) {
    try {
      const proxiedUrl = proxyFn(targetUrl);
      const response = await fetch(proxiedUrl, { cache: "no-store" });
      if (!response.ok) continue; // try next proxy
      const text = await response.text();
      if (text && text.length > 10) return text; // success
    } catch (_) {
      // network error on this proxy — try the next one
    }
  }
  throw new Error("All proxies failed.");
}


// ---- Main fetch + render ----

async function loadContent() {
  const loadingEl  = document.getElementById("loading-state");
  const fallbackEl = document.getElementById("fallback-state");
  const cardEn     = document.getElementById("card-english");
  const cardFa     = document.getElementById("card-farsi");
  const cardInfo   = document.getElementById("card-info");

  show(loadingEl);
  hide(fallbackEl);
  hide(cardEn);
  hide(cardFa);
  hide(cardInfo);

  if (GOOGLE_DOC_URL.includes("YOUR_DOC_ID_HERE")) {
    document.getElementById("last-updated").textContent =
      "⚠️ Set your Google Doc URL in script.js to see live content.";
    hide(loadingEl);
    show(fallbackEl);
    return;
  }

  try {
    const text = await fetchWithFallback(GOOGLE_DOC_URL);
    const data = parseDoc(text);

    const enTitle  = getField(data, "English Title");
    const enBody   = getField(data, "English Body");
    const faTitle  = getField(data, "Farsi Title");
    const faBody   = getField(data, "Farsi Body");
    const location = getField(data, "Location");
    const contact  = getField(data, "Contact");
    const tag      = getField(data, "Fruit Tag");

    if (!enTitle && !faTitle) throw new Error("No content found in document.");

    if (enTitle || enBody) {
      document.getElementById("en-title").textContent     = enTitle;
      document.getElementById("en-body").textContent      = enBody;
      document.getElementById("en-fruit-tag").textContent = tag;
      show(cardEn);
    }

    if (faTitle || faBody) {
      document.getElementById("fa-title").textContent     = faTitle;
      document.getElementById("fa-body").textContent      = faBody;
      document.getElementById("fa-fruit-tag").textContent = tag;
      show(cardFa);
    }

    const locEl  = document.getElementById("info-location");
    const conEl  = document.getElementById("info-contact");
    const locRow = document.getElementById("location-row");
    const conRow = document.getElementById("contact-row");

    if (location) { locEl.textContent = location; show(locRow); }
    else          { hide(locRow); }

    if (contact) {
      conEl.innerHTML = `<a href="tel:${contact.replace(/\s/g,"")}" style="color:inherit;">${contact}</a>`;
      show(conRow);
    } else { hide(conRow); }

    if (location || contact) show(cardInfo);

    document.getElementById("last-updated").textContent = formatTimestamp(new Date());
    hide(loadingEl);

  } catch (err) {
    console.error("Fruit site: could not load content.", err);
    hide(loadingEl);
    show(fallbackEl);
    document.getElementById("last-updated").textContent =
      "⚠️ Could not load update. Please refresh or check back soon.";
  }
}


// ---- Boot ----
loadContent();

if (AUTO_REFRESH_INTERVAL_MS > 0) {
  setInterval(loadContent, AUTO_REFRESH_INTERVAL_MS);
}