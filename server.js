const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(require("cors")());

app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/pages", express.static(path.join(__dirname, "pages")));
app.use(express.static(path.join(__dirname, "public")));

let projects = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "projects.json"), "utf8"),
);

function persistProjects() {
  fs.writeFileSync(
    path.join(__dirname, "data", "projects.json"),
    JSON.stringify(projects, null, 2),
    "utf8",
  );
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "index.html"));
});

app.get("/api/projects", (req, res) => {
  const tech = req.query.tech;
  if (!tech) return res.json(projects);
  const filtered = projects.filter((project) =>
    project.tech.some((t) => t.toLowerCase().includes(tech.toLowerCase())),
  );
  res.json(filtered);
});

app.get("/api/projects/:slug", (req, res) => {
  const project = projects.find((p) => p.slug === req.params.slug);
  if (!project) {
    return res.status(404).json({ error: "Projeto não encontrado." });
  }
  const idx = projects.findIndex((p) => p.slug === req.params.slug);
  const next = projects[(idx + 1) % projects.length];
  res.json({ ...project, next: next.slug });
});

app.put("/api/projects/:slug", (req, res) => {
  const project = projects.find((p) => p.slug === req.params.slug);
  if (!project) {
    return res.status(404).json({ error: "Projeto não encontrado." });
  }
  const updates = req.body;
  Object.assign(project, updates);
  persistProjects();
  res.json({ success: true, project });
});

app.get("/project/:slug", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "project.html"));
});

app.get("/mobile", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "mobile.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "admin.html"));
});

app.get("/api/contacts", (req, res) => {
  const filePath = path.join(__dirname, "contact-submissions.txt");
  if (!fs.existsSync(filePath)) {
    return res.json({ success: true, messages: [] });
  }

  const raw = fs.readFileSync(filePath, "utf8").trim();
  const messages = raw ? raw.split("\n") : [];
  res.json({ success: true, messages });
});

app.delete("/api/contacts", (req, res) => {
  const filePath = path.join(__dirname, "contact-submissions.txt");
  fs.writeFileSync(filePath, "");
  res.json({ success: true });
});

app.post("/api/contact", (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ success: false, error: "Todos os campos são obrigatórios." });
  }

  const entry = `${new Date().toISOString()} | ${name} | ${email} | ${message.replace(/\n/g, " ")}\n`;
  fs.appendFile(
    path.join(__dirname, "contact-submissions.txt"),
    entry,
    (err) => {
      if (err) {
        console.error("Erro ao salvar mensagem:", err);
      }
    },
  );

  res.json({
    success: true,
    message: "Mensagem recebida! Entrarei em contato em breve.",
  });
});

app.use((req, res) => {
  res.status(404).send("Página não encontrada.");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
