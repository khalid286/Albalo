// netlify/functions/fetch-doc.js
// Fetches the Google Sheets CSV server-side — no CORS issues.

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR-Bj2vMIFa6XKMhJosaJk7bH1Xtsc1KHFlOH-HnFnIJ7d8N9vo8Ye12zw8lBZK5eN1DTI-u0xV_gWA/pub?output=csv";

exports.handler = async function () {
  try {
    const response = await fetch(SHEET_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; FruitSiteBot/1.0)"
      }
    });

    const body = await response.text();

    if (!response.ok) {
      console.error("Google returned:", response.status, body);
      return {
        statusCode: 502,
        body: JSON.stringify({ error: `Google returned ${response.status}`, detail: body }),
      };
    }

    // Parse CSV into key-value pairs and return as JSON
    const lines = body.split("\n").filter(l => l.trim());
    const result = {};
    for (const line of lines) {
      // CSV: split on first comma only (value may contain commas)
      const commaIdx = line.indexOf(",");
      if (commaIdx === -1) continue;
      const key   = line.slice(0, commaIdx).replace(/^"|"$/g, "").trim();
      const value = line.slice(commaIdx + 1).replace(/^"|"$/g, "").trim();
      if (key) result[key] = value;
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify(result),
    };

  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
