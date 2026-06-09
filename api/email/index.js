// api/email/index.js
// ─────────────────────────────────────────────────────────────────────────────
// Proxy for the Azure Logic Apps HTTP trigger (Outlook email)
// Holds LOGIC_APPS_URL (with embedded SAS token) server-side.
// ─────────────────────────────────────────────────────────────────────────────

module.exports = async function (context, req) {
    const logicAppsUrl = process.env.LOGIC_APPS_URL;

    if (!logicAppsUrl) {
        context.res = {
            status: 500,
            body:   { error: "Server configuration missing: LOGIC_APPS_URL not set." }
        };
        return;
    }

    try {
        const upstream = await fetch(logicAppsUrl, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(req.body)
        });

        const text = await upstream.text();
        context.res = {
            status:  upstream.status,
            body:    text,
            headers: { "Content-Type": "application/json" }
        };
    } catch (err) {
        context.res = {
            status: 500,
            body:   { error: err.message }
        };
    }
};
