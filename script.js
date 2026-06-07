/* ==========================================================
   CHERRY FRUIT SELLER — script.js
   Reads from Netlify function which fetches Google Sheets CSV
   ========================================================== */

const AUTO_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

function show(el) { el.removeAttribute("hidden"); }
function hide(el) { el.setAttribute("hidden", ""); }

function formatTimestamp(date) {
  return `Updated ${date.toLocaleString("en-US", {
    weekday: "short", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit"
  })}`;
}

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
    const response = await fetch(`/.netlify/functions/fetch-doc?cb=${Date.now()}`);
    if (!response.ok) throw new Error(`Function returned ${response.status}`);

    const data = await response.json();

    // Keys match column A of your Google Sheet exactly
    const enTitle  = (data["English Title"] || "").trim();
    const enBody   = (data["English Body"]  || "").trim();
    const faTitle  = (data["Farsi Title"]   || "").trim();
    const faBody   = (data["Farsi Body"]    || "").trim();
    const location = (data["Location"]      || "").trim();
    const contact  = (data["Contact"]       || "").trim();
    const tag      = (data["Fruit Tag"]     || "").trim();

    if (!enTitle && !faTitle) throw new Error("No content found.");

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

    const locRow = document.getElementById("location-row");
    const conRow = document.getElementById("contact-row");

    if (location) {
      document.getElementById("info-location").textContent = location;
      show(locRow);
    } else { hide(locRow); }

    if (contact) {
      document.getElementById("info-contact").innerHTML =
        `<a href="tel:${contact.replace(/\s/g,"")}" style="color:inherit;">${contact}</a>`;
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

loadContent();
if (AUTO_REFRESH_INTERVAL_MS > 0) {
  setInterval(loadContent, AUTO_REFRESH_INTERVAL_MS);
}
