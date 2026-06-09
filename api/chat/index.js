// api/chat/index.js
// ─────────────────────────────────────────────────────────────────────────────
// Proxy for Azure OpenAI /chat/completions
// Holds AZURE_ENDPOINT and API_KEY server-side — never exposed to the browser.
// Environment variables are set in Azure Static Web Apps → Configuration.
// ─────────────────────────────────────────────────────────────────────────────

module.exports = async function (context, req) {
    const endpoint = process.env.AZURE_ENDPOINT;
    const apiKey   = process.env.API_KEY;

    if (!endpoint || !apiKey) {
        context.res = {
            status: 500,
            body: { error: "Server configuration missing: AZURE_ENDPOINT or API_KEY not set." }
        };
        return;
    }

    try {
        const upstream = await fetch(`${endpoint}/chat/completions`, {
            method:  "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key":      apiKey
            },
            body: JSON.stringify(req.body)
        });

        const data = await upstream.json();
        context.res = {
            status:  upstream.status,
            body:    data,
            headers: { "Content-Type": "application/json" }
        };
    } catch (err) {
        context.res = {
            status: 500,
            body:   { error: err.message }
        };
    }
};
