# 🍒 Cherry Fruit Seller — Project Handoff

A simple, beautiful, bilingual (English + Farsi) fruit announcement website powered by Google Docs.

---

## 📁 Folder Structure

```
fruit-site/
├── index.html      ← Main webpage
├── style.css       ← Cherry-themed styles
├── script.js       ← Google Doc fetcher & content renderer
└── README.md       ← This file
```

---

## 🏗️ Architecture (How It Works)

```
Google Doc (Plain Text)
       ↓   Published to web
  Public URL (txt format)
       ↓   Fetched by browser
  script.js parses key: value pairs
       ↓
  Page displays English + Farsi cards
```

No server. No login. No backend. Just a Google Doc and a static webpage.

---

## 📄 Google Doc Template

Create a new Google Doc and paste **exactly** this template inside.
Change only the content after the colon (`:`) on each line.

```
English Title: Fresh Cherries Available Today
English Body: We are selling fresh, sweet cherries near the main square. Come visit us between 8am and 6pm. Limited supply!

Farsi Title: گیلاس تازه امروز موجود است
Farsi Body: گیلاس‌های تازه و شیرین در نزدیکی میدان اصلی به فروش می‌رسد. از ساعت ۸ صبح تا ۶ بعد از ظهر. موجودی محدود!

Location: Corner of Oak Street & Main Square, Downtown
Contact: +1 555 123 4567
Fruit Tag: 🍒 Cherries
```

### Rules for the seller:
- **Do NOT change the label names** (e.g. `English Title:`, `Farsi Body:`, etc.)
- You can change the text **after** the colon freely.
- You can write multiple lines of body text — they all appear on the site.
- Leave a label blank if you don't need it (e.g. `Contact:` with nothing after it).
- Save the doc, and the website will update on the next page refresh.

---

## 🔗 Connecting the Google Doc

### Step 1 — Publish the Doc as Plain Text
1. Open the Google Doc in your browser.
2. Click **File** → **Share** → **Publish to web**.
3. In the popup, change the format dropdown from "Web page" to **Plain text**.
4. Click **Publish**, then **OK** to confirm.
5. Copy the link. It will look like:
   ```
   https://docs.google.com/document/d/LONG_ID_STRING_HERE/pub?output=txt
   ```

### Step 2 — Paste the URL into script.js
1. Open `script.js` in a text editor.
2. Find this line near the top:
   ```js
   const GOOGLE_DOC_URL = "https://docs.google.com/document/d/YOUR_DOC_ID_HERE/pub?output=txt";
   ```
3. Replace the whole URL with your copied link.
4. Save the file.

That's it. The website will now read from your Google Doc.

---

## 🚀 Deployment (Free)

### Option A — GitHub Pages (Recommended)
1. Create a free account at https://github.com
2. Click **New repository** → name it `fruit-site` → set it to **Public**.
3. Upload all three files: `index.html`, `style.css`, `script.js`.
4. Go to **Settings** → **Pages** → set Source to **main branch / root**.
5. Your site will be live at: `https://YOUR_USERNAME.github.io/fruit-site`

### Option B — Netlify (Drag & Drop, No Account Required)
1. Go to https://app.netlify.com/drop
2. Drag the entire `fruit-site` folder onto the page.
3. Your site is instantly live with a random URL like `https://amazing-cherry-abc123.netlify.app`
4. Optional: create a free account to set a custom subdomain.

### Option C — Vercel
1. Create a free account at https://vercel.com
2. Install the Vercel CLI or use the web dashboard.
3. Deploy the folder. Live in ~30 seconds.

---

## 🔄 How to Update Content

1. Open your Google Doc.
2. Edit the text after any label.
3. **Save** (Ctrl+S / Cmd+S).
4. Reload the website in your browser. Done!

The page also auto-refreshes every 5 minutes while open.

---

## 🛡️ Fallback Behaviour

If the Google Doc can't be loaded (network error, wrong URL, etc.), the website automatically shows a friendly message in both English and Farsi instead of a broken page.

---

## 💡 Future Improvements

| Idea | How |
|---|---|
| Custom domain (e.g. `cherries.myshop.com`) | Add via Netlify / GitHub Pages settings |
| Multiple seasonal pages | Duplicate `index.html`, link them in a nav bar |
| WhatsApp button | Add `<a href="https://wa.me/PHONE">` in `index.html` |
| Photo of the fruit stand | Add `<img>` tag in the info card |
| Google Maps link | Wrap location in an `<a href="https://maps.google.com/?q=...">` |
| Cache for offline use | Add a `manifest.json` + service worker |

---

Made with 🍒 — Simple, elegant, and beginner-friendly.
