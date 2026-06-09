// api/teams/index.js
// ─────────────────────────────────────────────────────────────────────────────
// Proxy for the Power Automate Teams webhook
// Holds TEAMS_WEBHOOK_URL (with embedded SAS token) server-side.
// ─────────────────────────────────────────────────────────────────────────────

module.exports = async function (context, req) {
    const webhookUrl = process.env.TEAMS_WEBHOOK_URL;

    if (!webhookUrl) {
        context.res = {
            status: 500,
            body:   { error: "Server configuration missing: TEAMS_WEBHOOK_URL not set." }
        };
        return;
    }

    try {
        const upstream = await fetch(webhookUrl, {
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
