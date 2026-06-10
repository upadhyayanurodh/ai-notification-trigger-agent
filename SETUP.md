# Setup Guide — Building This From Scratch

This guide covers every step to replicate this project end-to-end.
Follow the steps in order — each one produces a value you need in the next.

---

## What you need before starting

- An **Azure subscription** (free trial works)
- A **Microsoft 365 account** with access to Teams and Outlook (must be the same tenant)
- A **Microsoft Teams team** where you can create channels

---

## Step 1 — Create a Teams channel

In Microsoft Teams, create a channel named **"Notification Trigger Agent"** inside any team you own.
Power Automate will post alerts here. The channel name must match exactly what you configure in Step 2.

---

## Step 2 — Power Automate: Teams webhook

1. Go to [make.powerautomate.com](https://make.powerautomate.com)
2. **New flow → Instant cloud flow** → name it "Send webhook alerts to Notification Trigger Agent" → skip the trigger picker → click **Create**
3. Add trigger: search for **"When an HTTP request is received"** and select it
4. In the trigger block, click **"Use sample payload to generate schema"** and paste:
   ```json
   { "message": "Sample alert text", "severity": "High" }
   ```
   Click Done. Power Automate generates the JSON schema automatically.
5. Add a new step → search **"Teams"** → select **"Post a message in a chat or channel"**
   > **⚠️ Use "Post a message in a chat or channel" — NOT "Post a card in a chat or channel".**
   > The card action expects Adaptive Card JSON; sending `{ message, severity }` returns HTTP 200 but silently fails inside the flow.
6. Configure the action:
   - **Post in:** Channel
   - **Team:** select your team
   - **Channel:** "Notification Trigger Agent"
   - **Message:** click the field → select `message` from the dynamic content panel
7. Click **Save**
8. Open the trigger block → copy the **HTTP POST URL** — this is your `TEAMS_WEBHOOK_URL`

---

## Step 3 — Logic Apps: Outlook email workflow

1. Go to **portal.azure.com → Create a resource → Logic App**
   - Plan type: **Consumption** (pay-per-execution, free for low volume)
   - Region: any (East US recommended to match the rest of the project)
2. Once deployed, open the resource → **Logic app designer**
3. Add trigger: search **"When an HTTP request is received"** and select it
4. In the trigger block, click **"Use sample payload to generate schema"** and paste:
   ```json
   { "subject": "Alert", "body": "Alert body text", "recipient": "user@example.com" }
   ```
   Click Done.
5. Add an action → search **"Office 365 Outlook"** → select **"Send an email (V2)"**
   > **⚠️ You must sign in to authorize the Office 365 connector.** Click "Sign in" when prompted and authenticate with the O365 account that will send the emails.
6. Configure the action:
   - **To:** click the field → select `recipient` from dynamic content
   - **Subject:** select `subject` from dynamic content
   - **Body:** select `body` from dynamic content
7. Click **Publish** — not just Save.
   > **⚠️ "Autosaved" writes a Draft. The active version does not update until you click Publish in the designer.**
8. Open the trigger block → copy the **HTTP POST URL** — this is your `LOGIC_APPS_URL`

---

## Step 4 — Azure AI Foundry: Deploy GPT-4.1-mini

1. Go to **portal.azure.com → Create a resource → Azure OpenAI** and create a resource
2. Once deployed, go to [ai.azure.com](https://ai.azure.com) → open your project (or create one linked to the resource above)
3. Navigate to **Models + Endpoints → Deployments → Deploy model**
   - Select model: `gpt-4.1-mini`
   - Deployment type: Standard Global
   - Deployment name: keep the default (`gpt-4.1-mini`) or choose your own — note it exactly

**Finding your endpoint and API key (Path A — local / deployed):**

> **⚠️ The correct values are in Azure Portal, not in the Azure AI Foundry UI (ai.azure.com).**
> The Foundry UI shows a different endpoint (`services.ai.azure.com`) that uses a different API and will not work with the `/chat/completions` call in `agent-test.html`.

1. Go to **portal.azure.com → your Azure OpenAI resource**
2. In the left menu: **Resource Management → Keys and Endpoint**
3. Copy the **Endpoint** value → append `/openai/v1` → this is your `AZURE_ENDPOINT`
   - Example: `https://my-openai-resource.openai.azure.com/openai/v1`
4. Copy **KEY 1** → this is your `API_KEY`

---

## Step 5 — Configure and run locally

```bash
git clone https://github.com/upadhyayanurodh/ai-notification-trigger-agent.git
cd ai-notification-trigger-agent
cp config.example.js config.js
```

Open `config.js` and fill in the four values collected in Steps 2–4:

```javascript
const CONFIG = {
  AZURE_ENDPOINT:    "https://YOUR-RESOURCE.openai.azure.com/openai/v1",
  API_KEY:           "YOUR_KEY_1_FROM_AZURE_PORTAL",
  DEPLOYMENT:        "gpt-4.1-mini",   // must match exactly what you named your deployment
  TEAMS_WEBHOOK_URL: "https://prod-XX.westus.logic.azure.com...",
  LOGIC_APPS_URL:    "https://prod-YY.eastus.logic.azure.com..."
};
```

Open `agent-test.html` directly in Chrome or Edge.
If you see a CORS error on the Teams webhook, use VS Code Live Server instead:
```
Right-click agent-test.html → Open with Live Server
```

---

## Step 6 (Optional) — Path B: NotificationTrigger Agent in Azure AI Foundry

This creates the agent that runs in the Foundry playground (stateful, threads + run history).

1. Go to [ai.azure.com](https://ai.azure.com) → **Agents** → **New agent**
2. Name it: `NotificationTrigger`
3. Model: select your `gpt-4.1-mini` deployment
4. Paste this as the **System instructions**:

   ```
   You are a smart notification agent. When given an event or situation description, you analyze it and decide whether a notification should be sent.

   If a notification is warranted:
   1. Call the send_teams_notification function to post to Teams
   2. Call the send_email_notification function to send an email

   IMPORTANT — CONSISTENCY RULE:
   Both the Teams message and the email MUST convey exactly the same facts, severity level, and recommended action.
   The only difference between them is presentation format — not the underlying information.
   Decide on the facts and severity ONCE, then express them in each format below.

   Format your Teams message as a brief, clear alert with:
   - What happened
   - Severity (Low / Medium / High)
   - Recommended action

   Format your email with:
   - A clear subject line
   - A 2-3 sentence body explaining the same situation and next steps as the Teams message

   Always call both functions when sending notifications.
   If the situation does not warrant a notification, explain why.
   ```

5. Add an **OpenAPI tool** for Teams notifications:
   - Tool type: OpenAPI
   - Authentication: No auth (the SAS token in the URL is the auth)
   - Paste this spec, replacing `YOUR-FULL-POWER-AUTOMATE-URL` with your `TEAMS_WEBHOOK_URL`:

   ```yaml
   openapi: 3.0.0
   info:
     title: Teams Notification
     version: 1.0.0
   servers:
     - url: https://prod-REPLACE.REGION.logic.azure.com:443
   paths:
     /workflows/REPLACE/triggers/manual/paths/invoke:
       post:
         operationId: send_teams_notification
         summary: Sends a notification to Microsoft Teams
         parameters:
           - name: api-version
             in: query
             required: true
             schema:
               type: string
               default: "2016-06-01"
           - name: sp
             in: query
             required: true
             schema:
               type: string
           - name: sv
             in: query
             required: true
             schema:
               type: string
           - name: sig
             in: query
             required: true
             schema:
               type: string
         requestBody:
           required: true
           content:
             application/json:
               schema:
                 type: object
                 properties:
                   message:
                     type: string
                   severity:
                     type: string
                     enum: [Low, Medium, High]
                 required: [message, severity]
         responses:
           '200':
             description: Notification sent
   ```

   > **Tip:** Split your Power Automate URL at the `?` — everything before `?` is the path, the query parameters (`api-version`, `sp`, `sv`, `sig`) go in the `parameters` section as defaults.

6. Add a second **OpenAPI tool** for email — same structure, pointing to your `LOGIC_APPS_URL`, with operation ID `send_email_notification` and request body:
   ```yaml
   type: object
   properties:
     subject:
       type: string
     body:
       type: string
     recipient:
       type: string
   required: [subject, body, recipient]
   ```

7. Click **Save** → test in the Foundry playground

---

## Step 7 (Optional) — Deploy your own Azure Static Web Apps instance

This deploys a public URL so anyone can use the agent without local setup. Credentials are held server-side via Azure Functions — no API keys are exposed in the browser.

1. Go to **portal.azure.com → Create a resource → Static Web App**
   - Plan: Free
   - Deployment source: GitHub
   - Sign in and select your forked repo + `main` branch
   - Build preset: Custom
     - App location: `/`
     - API location: `api`
     - Output location: *(leave blank)*
2. Click **Create** — Azure commits a GitHub Actions workflow file to your repo.
   Before your next push, run: `git pull origin main`
3. Add environment variables in **Azure Portal → your Static Web App → Configuration → Application settings**:
   | Name | Value |
   |---|---|
   | `AZURE_ENDPOINT` | `https://YOUR-RESOURCE.openai.azure.com/openai/v1` |
   | `API_KEY` | your KEY 1 from Azure Portal |
   | `TEAMS_WEBHOOK_URL` | your Power Automate HTTP POST URL |
   | `LOGIC_APPS_URL` | your Logic Apps HTTP POST URL |
4. Click **Save** — Azure restarts the Functions with the new values
5. Your live URL appears on the SWA Overview page

The `api/` directory in this repo contains the three proxy functions (`chat`, `teams`, `email`) that read these environment variables and forward requests server-side. No code changes needed.

---

## SAS Token Reference

Both webhook URLs (`TEAMS_WEBHOOK_URL` and `LOGIC_APPS_URL`) contain a time-limited SAS token embedded as a `sig=` query parameter. When a working agent suddenly stops sending notifications, this is the most likely cause.

**How to identify a SAS token:** look for `sig=` near the end of the URL.

**To regenerate:**
- **Power Automate:** open the flow → click the trigger block → `···` menu → **Regenerate key** → copy the new HTTP POST URL
- **Logic Apps:** Azure Portal → Logic App Designer → click the trigger block → copy the refreshed **HTTP POST URL** from the trigger panel

Update `TEAMS_WEBHOOK_URL` and `LOGIC_APPS_URL` in `config.js` (local) and in the Azure SWA Application settings (deployed) with the new URLs.
