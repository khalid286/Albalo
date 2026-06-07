/* ==========================================================
   CHERRY FRUIT SELLER — script.js
   Fetches content via a Netlify serverless function,
   which avoids all CORS issues with Google Docs.
   ========================================================== */

// Auto-refresh interval (5 minutes). Set to 0 to disable.
const AUTO_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

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
  return `Updated ${date.toLocaleString("en-US", {
    weekday: "short", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit"
  })}`;
}

function show(el) { el.removeAttribute("hidden"); }
function hide(el) { el.setAttribute("hidden", ""); }


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

  try {
    // Call our own Netlify function — no CORS issues!
    const response = await fetch(`/.netlify/functions/fetch-doc?cb=${Date.now()}`);

    if (!response.ok) throw new Error(`Function returned ${response.status}`);

    const text = await response.text();
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
    console.error("Fruit site error:", err);
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
