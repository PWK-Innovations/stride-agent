const { google } = require("googleapis");
const http = require("http");
const url = require("url");
const open = require("child_process").exec;
const fs = require("fs");
const path = require("path");

// Read .env.local manually (no dotenv dependency)
const envPath = path.join(__dirname, "..", ".env.local");
const envVars = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf-8").split("\n").forEach((line) => {
    const [key, ...val] = line.split("=");
    if (key && val.length) envVars[key.trim()] = val.join("=").trim();
  });
}

const CLIENT_ID = envVars.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = envVars.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3333/oauth2callback";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local first");
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: ["https://www.googleapis.com/auth/calendar"],
});

const server = http.createServer(async (req, res) => {
  const query = url.parse(req.url, true).query;
  if (query.code) {
    try {
      const { tokens } = await oauth2Client.getToken(query.code);
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end("<h1>Success! You can close this tab.</h1>");

      console.log("\n=== Add this to your .env.local ===\n");
      console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
      console.log("\n===================================\n");

      server.close();
      process.exit(0);
    } catch (err) {
      res.writeHead(500);
      res.end("Error getting token: " + err.message);
      console.error("Error:", err.message);
    }
  }
});

server.listen(3333, () => {
  console.log("Opening browser for Google authorization...");
  console.log("If it doesn't open, visit:", authUrl);

  // Open browser (macOS)
  open(`open "${authUrl}"`);
});
