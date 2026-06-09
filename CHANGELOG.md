# Changelog

All notable changes to this project are documented here.

---

## [1.0.0] — 2026-05-29

### Added
- `agent-test.html` — browser-based interface using Azure OpenAI chat completions API with function calling
- `send_teams_notification` tool — posts formatted alert to Microsoft Teams via Power Automate webhook
- `send_email_notification` tool — sends email via Azure Logic Apps → Office 365 Outlook
- Live log panel with timestamped status for every step
- `config.example.js` — credential template for safe public distribution
- NotificationTrigger agent configured in Azure AI Foundry portal with two OpenAPI tools
- System prompt consistency rule enforcing identical facts across Teams and email outputs

### Fixed
- Teams + email content divergence — root cause: model generated both outputs independently without consistency constraint; fixed via explicit system prompt rule
- Teams notifications not arriving from Foundry portal — root cause: Power Automate flow expected Adaptive Card JSON; fixed by changing action to "Post a message in a chat or channel"
- Email arriving with hardcoded subject/body — root cause: Logic App email action used static text; fixed by mapping dynamic content from trigger body
- Logic App changes not taking effect — root cause: changes saved as Draft but not Published; fixed by clicking Publish in Logic App designer

---

## [1.1.0] — 2026-06-09

### Added
- Azure Functions proxy layer (`api/chat`, `api/teams`, `api/email`) — credentials held server-side, never exposed in the browser
- `staticwebapp.config.json` — Azure Static Web Apps routing and security headers
- Deployment mode detection in `agent-test.html` — automatically uses `/api/*` proxy when hosted, `config.js` when running locally
- Live deployment on Azure Static Web Apps (free tier)

---

## [Pending] — Next Release

- Update `agent-test.html` to use Azure AI Foundry Assistants API (replacing raw chat completions)
- HTML will call the `NotificationTrigger` agent directly via thread/run lifecycle
- Run history will be visible in Azure AI Foundry portal
