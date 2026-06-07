// netlify/functions/fetch-doc.js
// This runs on Netlify's server (not the browser), so CORS is not an issue.

const DOC_URL = "https://docs.google.com/document/d/e/2PACX-1vT3kJRS_EisoCAp4ekLw-JAQ_yGvqpxQVuoTpPb8LNtik75ull8q-UWsHzE4ESND5odbJgVWFpHuc_i/pub?output=txt";

exports.handler = async function () {
  try {
    const response = await fetch(DOC_URL);

    if (!response.ok) {
      return {
        statusCode: 502,
        body: JSON.stringify({ error: `Google returned ${response.status}` }),
      };
    }

    const text = await response.text();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Access-Control-Allow-Origin": "*",   // allow our own frontend to read it
        "Cache-Control": "no-cache",
      },
      body: text,
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

