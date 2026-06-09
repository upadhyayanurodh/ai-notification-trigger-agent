// config.example.js
// ─────────────────────────────────────────────────────────────────────────────
// SETUP INSTRUCTIONS:
//   1. Copy this file → config.js  (same folder as agent-test.html)
//   2. Fill in your actual values below
//   3. config.js is gitignored — your credentials will never be committed
// ─────────────────────────────────────────────────────────────────────────────

const CONFIG = {

  // Azure AI Foundry — OpenAI endpoint
  // Found in: ai.azure.com → Your Project → Settings → API Keys
  AZURE_ENDPOINT: "https://YOUR-RESOURCE-NAME.openai.azure.com/openai/v1",

  // Azure OpenAI API Key
  // Found in: ai.azure.com → Your Project → Settings → API Keys
  API_KEY: "YOUR_AZURE_OPENAI_API_KEY",

  // Model deployment name in Azure AI Foundry
  DEPLOYMENT: "gpt-4.1-mini",

  // Power Automate webhook URL (Teams notifications)
  // Found in: make.powerautomate.com → Your Flow → trigger block
  // Note: Contains a SAS token — regenerate if notifications stop working
  TEAMS_WEBHOOK_URL: "YOUR_POWER_AUTOMATE_WEBHOOK_URL",

  // Azure Logic Apps HTTP trigger URL (Outlook email)
  // Found in: Azure Portal → Logic App Designer → trigger block
  // Note: Contains a SAS token — regenerate if emails stop working
  LOGIC_APPS_URL: "YOUR_LOGIC_APPS_HTTP_TRIGGER_URL"

};
