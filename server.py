import json
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

ROOT = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(ROOT, "data")
PROJECTS_FILE = os.path.join(DATA_DIR, "projects.json")
CONTACTS_FILE = os.path.join(DATA_DIR, "contacts.json")

os.makedirs(DATA_DIR, exist_ok=True)

if not os.path.exists(CONTACTS_FILE):
    with open(CONTACTS_FILE, "w", encoding="utf-8") as f:
        json.dump({"messages": []}, f, indent=2, ensure_ascii=False)


def load_json(path):
    if not os.path.exists(path):
        return None
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


class Handler(SimpleHTTPRequestHandler):
    def send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/"):
            self.handle_api_get(parsed)
            return
        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/contact":
            self.handle_contact()
            return
        self.send_response(404)
        self.send_cors_headers()
        self.end_headers()

    def handle_api_get(self, parsed):
        if parsed.path == "/api/projects":
            projects = load_json(PROJECTS_FILE) or []
            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps(projects, ensure_ascii=False).encode("utf-8"))
            return

        if parsed.path.startswith("/api/projects/"):
            slug = parsed.path.split("/", 3)[3] if len(parsed.path.split("/")) > 3 else ""
            projects = load_json(PROJECTS_FILE) or []
            project = next((p for p in projects if p.get("slug") == slug), None)
            if project:
                self.send_response(200)
                self.send_cors_headers()
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps(project, ensure_ascii=False).encode("utf-8"))
                return
            self.send_response(404)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Projeto não encontrado"}, ensure_ascii=False).encode("utf-8"))
            return

        if parsed.path == "/api/contacts":
            data = load_json(CONTACTS_FILE) or {"messages": []}
            self.send_response(200)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "messages": data.get("messages", [])}, ensure_ascii=False).encode("utf-8"))
            return

        self.send_response(404)
        self.send_cors_headers()
        self.end_headers()

    def handle_contact(self):
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length).decode("utf-8")
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            self.send_response(400)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "JSON inválido"}, ensure_ascii=False).encode("utf-8"))
            return

        name = payload.get("name", "").strip()
        email = payload.get("email", "").strip()
        message = payload.get("message", "").strip()

        if not name or not email or not message:
            self.send_response(400)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Campos obrigatórios faltando"}, ensure_ascii=False).encode("utf-8"))
            return

        contacts = load_json(CONTACTS_FILE) or {"messages": []}
        contacts.setdefault("messages", []).append(f"{__import__('datetime').datetime.now().isoformat()} | {name} | {email} | {message}")
        save_json(CONTACTS_FILE, contacts)

        self.send_response(200)
        self.send_cors_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(json.dumps({"success": True, "message": "Mensagem recebida"}, ensure_ascii=False).encode("utf-8"))


if __name__ == "__main__":
    os.chdir(os.path.join(ROOT, "pages"))
    port = 3000
    print(f"Rodando servidor em http://localhost:{port}")
    HTTPServer(("", port), Handler).serve_forever()
