const path = require("path");
const express = require("express");
const Database = require("better-sqlite3");

const app = express();
const port = Number(process.env.PORT || 3430);
const databasePath = path.join(__dirname, "action-tracker.sqlite");
const database = new Database(databasePath);

database.pragma("journal_mode = WAL");
database.exec(`
  CREATE TABLE IF NOT EXISTS tracker_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

app.use(express.json({ limit: "5mb" }));
app.use((request, response, next) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (request.method === "OPTIONS") return response.sendStatus(204);
  next();
});
app.use(express.static(__dirname));

app.get("/api/state", (request, response) => {
  const row = database.prepare("SELECT data, updated_at FROM tracker_state WHERE id = 1").get();
  if (!row) return response.json({ data: null, updatedAt: null });

  try {
    return response.json({ data: JSON.parse(row.data), updatedAt: row.updated_at });
  } catch (error) {
    return response.status(500).json({ error: "Stored tracker data is invalid." });
  }
});

app.put("/api/state", (request, response) => {
  const data = request.body;
  if (!data || !Array.isArray(data.tasks) || !Array.isArray(data.people) || !Array.isArray(data.projects)) {
    return response.status(400).json({ error: "State must contain tasks, people and projects arrays." });
  }

  const updatedAt = new Date().toISOString();
  database.prepare(`
    INSERT INTO tracker_state (id, data, updated_at)
    VALUES (1, ?, ?)
    ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
  `).run(JSON.stringify(data), updatedAt);

  return response.json({ ok: true, updatedAt });
});

app.listen(port, () => {
  console.log(`Action Tracker running at http://localhost:${port}/my-action-tracker.html`);
  console.log(`SQLite database: ${databasePath}`);
});
