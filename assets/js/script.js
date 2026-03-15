const navLinks = document.querySelectorAll('nav a[href^="#"]');
const sections = Array.from(document.querySelectorAll("section[id]"));

// Background particles
const bgCanvas = document.getElementById("bgCanvas");
let ctx,
  particles = [],
  particleCount = 120;

function initParticles() {
  if (!bgCanvas) return;
  ctx = bgCanvas.getContext("2d");
  const resize = () => {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener("resize", resize);

  particles = Array.from({ length: particleCount }, () => ({
    x: Math.random() * bgCanvas.width,
    y: Math.random() * bgCanvas.height,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    radius: 1 + Math.random() * 2,
    alpha: 0.2 + Math.random() * 0.35,
  }));

  requestAnimationFrame(drawParticles);
}

function drawParticles() {
  if (!ctx) return;
  ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0) p.x = bgCanvas.width;
    if (p.x > bgCanvas.width) p.x = 0;
    if (p.y < 0) p.y = bgCanvas.height;
    if (p.y > bgCanvas.height) p.y = 0;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(43, 243, 255, ${p.alpha})`;
    ctx.fill();
  });

  requestAnimationFrame(drawParticles);
}

initParticles();

// Custom cursor effect
const cursor = document.createElement("div");
cursor.className = "cursor";
document.body.appendChild(cursor);
let cursorX = 0;
let cursorY = 0;
let targetX = 0;
let targetY = 0;

window.addEventListener("mousemove", (e) => {
  targetX = e.clientX;
  targetY = e.clientY;
});

function animateCursor() {
  cursorX += (targetX - cursorX) * 0.25;
  cursorY += (targetY - cursorY) * 0.25;
  cursor.style.left = `${cursorX}px`;
  cursor.style.top = `${cursorY}px`;
  requestAnimationFrame(animateCursor);
}
animateCursor();

const interactiveSelectors = ["button", "a", ".project", ".project-btn"];
interactiveSelectors.forEach((sel) => {
  document.querySelectorAll(sel).forEach((el) => {
    el.addEventListener("mouseenter", () => {
      cursor.classList.add("cursor-hover");
    });
    el.addEventListener("mouseleave", () => {
      cursor.classList.remove("cursor-hover");
    });
  });
});

function scrollToHash(hash) {
  const target = document.querySelector(hash);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth" });
}

function renderMarkdown(md) {
  if (!md) return "";
  const escape = (str) =>
    str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const lines = escape(md)
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("### ")) return `<h3>${trimmed.slice(4)}</h3>`;
      if (trimmed.startsWith("## ")) return `<h2>${trimmed.slice(3)}</h2>`;
      if (trimmed.startsWith("# ")) return `<h1>${trimmed.slice(2)}</h1>`;
      if (trimmed === "") return "";
      return `<p>${trimmed}</p>`;
    })
    .filter((line) => line !== "");

  return lines
    .join("")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
}

navLinks.forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    e.preventDefault();
    const href = anchor.getAttribute("href");
    scrollToHash(href);
  });
});

const cta = document.querySelector(".cta-btn");
if (cta) {
  cta.addEventListener("click", () => scrollToHash("#about"));
}

function setActiveLink() {
  const scrollPos = window.scrollY + window.innerHeight / 2;
  sections.forEach((section) => {
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;
    const link = document.querySelector(`nav a[href="#${section.id}"]`);
    if (!link) return;
    if (scrollPos >= top && scrollPos < bottom) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animationDelay = "0s";
        entry.target.style.animationPlayState = "running";
      }
    });
  },
  { threshold: 0.15 },
);

document.querySelectorAll("#about, #projects, #contact").forEach((section) => {
  section.style.animationPlayState = "paused";
  revealObserver.observe(section);
});

window.addEventListener("scroll", setActiveLink);
setActiveLink();

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("sw.js")
      .catch((err) => console.warn("SW registration failed", err));
  }
}

async function loadProjects(tech) {
  const container = document.getElementById("projectGrid");
  if (!container || container.children.length > 3) return; // Já tem estáticos, não carregar dinâmicos

  let projects = Object.values(staticProjects);
  
  if (tech) {
    projects = projects.filter((project) =>
      project.tech.some((t) => t.toLowerCase().includes(tech.toLowerCase()))
    );
  }

  if (!projects.length) {
    container.innerHTML = "<p>Nenhum projeto encontrado.</p>";
    return;
  }

  container.innerHTML = "";
  projects.forEach((project) => {
    const card = document.createElement("div");
    card.className = "project";

    const img = document.createElement("img");
    img.src = project.img;
    img.alt = project.title;

    const title = document.createElement("h3");
    title.textContent = project.title;

    const desc = document.createElement("p");
    desc.textContent = project.subtitle;

    const actions = document.createElement("div");
    actions.className = "project-actions";

    const details = document.createElement("a");
    details.className = "project-btn";
    details.href =
      project.slug === "app-mobile" ? "mobile.html" : `project.html?id=${project.slug}`;
    details.textContent = "Ver detalhes";

    actions.appendChild(details);

    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(actions);

    container.appendChild(card);
  });
}

if (document.getElementById("projectGrid")) {
  loadProjects();
}

async function setupProjectPage() {
  const projectTitle = document.getElementById("projectTitle");
  if (!projectTitle) return;

  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('id') || window.location.pathname.split("/").pop();
  try {
    const project = staticProjects[slug];
    if (!project) throw new Error("Projeto não encontrado");

    document.title = `DWX DEV - ${project.title}`;
    projectTitle.textContent = project.title;
    document.getElementById("projectSubtitle").textContent = project.subtitle;
    document.getElementById("projectDescription").innerHTML = renderMarkdown(
      project.description,
    );

    const tags = document.getElementById("projectTags");
    tags.innerHTML = "";
    project.tech.forEach((tech) => {
      const chip = document.createElement("span");
      chip.className = "tag";
      chip.textContent = tech;
      tags.appendChild(chip);
    });

    const features = document.getElementById("projectFeatures");
    features.innerHTML = "";
    project.features.forEach((feature) => {
      const li = document.createElement("li");
      li.textContent = feature;
      features.appendChild(li);
    });

    const img = document.getElementById("projectImage");
    img.src = project.img;
    img.alt = project.title;

    const nextLink = document.getElementById("projectNext");
    nextLink.href = `project.html?id=${project.next || project.slug}`;
  } catch (err) {
    projectTitle.textContent = "Projeto não encontrado";
    document.getElementById("projectSubtitle").textContent =
      "Verifique se o link está correto e tente novamente.";
    document.getElementById("projectDetail").style.display = "none";
  }
}

const staticProjects = {
  "site-responsivo": {
    slug: "site-responsivo",
    title: "Site Responsivo",
    subtitle: "Layout fluido que se adapta a qualquer tela.",
    description: "Websites modernos precisam funcionar bem em dispositivos de diferentes tamanhos. Eu desenvolvo interfaces que escalam com graça, mantendo performance e acessibilidade.",
    features: [
      "Grid flexível e layouts adaptativos",
      "Imagens otimizadas e lazy loading",
      "Acessibilidade WCAG e navegação por teclado",
      "Testes em múltiplos navegadores e dispositivos"
    ],
    tech: [
      "HTML5",
      "CSS3 (Flexbox/Grid)",
      "JavaScript (ES6+)",
      "Auditoria Lighthouse"
    ],
    img: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=900",
    next: "app-mobile"
  },
  "app-mobile": {
    slug: "app-mobile",
    title: "App Mobile",
    subtitle: "Interfaces intuitivas para uso móvel.",
    description: "Foco em UX simples, desempenho e esforço reduzido do usuário. Desenvolvo experiências que funcionam offline, com gestos naturais e navegação clara.",
    features: [
      "Design orientado ao toque e gestos",
      "Progressive Web App (PWA) opcional",
      "Animações suaves e micro-interações",
      "Estratégias de cache e performance"
    ],
    tech: [
      "React Native / Expo",
      "PWA",
      "Service Workers",
      "APIs REST/GraphQL"
    ],
    img: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=900",
    next: "ia-integrada"
  },
  "ia-integrada": {
    slug: "ia-integrada",
    title: "IA Integrada",
    subtitle: "Automação e personalização com inteligência artificial.",
    description: "Implemento recursos com IA para melhorar a experiência do usuário, como recomendações inteligentes, assistentes conversacionais e análises preditivas.",
    features: [
      "Chatbots e assistentes",
      "Recomendações baseadas em comportamento",
      "Análise de sentimento e NLP",
      "Prototipagem rápida com APIs de IA"
    ],
    tech: ["OpenAI / GPT", "TensorFlow.js", "APIs REST", "Node.js"],
    img: "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=900",
    next: "site-responsivo"
  }
};

// Modal functionality
const modal = document.getElementById("projectModal");
const modalTitle = document.getElementById("modalTitle");
const modalImg = document.getElementById("modalImg");
const modalSubtitle = document.getElementById("modalSubtitle");
const modalDescription = document.getElementById("modalDescription");
const modalTags = document.getElementById("modalTags");
const modalFeatures = document.getElementById("modalFeatures");
const modalNext = document.getElementById("modalNext");
const closeBtn = document.querySelector(".close");

function openModal(slug) {
  const project = staticProjects[slug];
  if (!project) return;

  modalTitle.textContent = project.title;
  modalImg.src = project.img;
  modalImg.alt = project.title;
  modalSubtitle.textContent = project.subtitle;
  modalDescription.innerHTML = renderMarkdown(project.description);

  modalTags.innerHTML = "";
  project.tech.forEach((tech) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = tech;
    modalTags.appendChild(tag);
  });

  modalFeatures.innerHTML = "";
  project.features.forEach((feature) => {
    const li = document.createElement("li");
    li.textContent = feature;
    modalFeatures.appendChild(li);
  });

  modalNext.onclick = () => openModal(project.next);

  modal.style.display = "block";
}

closeBtn.onclick = () => (modal.style.display = "none");
window.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
};

// Animação ao selecionar projeto
document.querySelectorAll(".project").forEach((project) => {
  project.addEventListener("click", () => {
    project.classList.add("selected");
    setTimeout(() => project.classList.remove("selected"), 500);
  });
});

// Detalhes button
document.querySelectorAll(".details-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const slug = btn.dataset.slug;
    openModal(slug);
  });
});

// Chat IA
const chatModal = document.getElementById("chatModal");
const chatMessages = chatModal ? document.getElementById("chatMessages") : null;
const chatInput = chatModal ? document.getElementById("chatInput") : null;
const sendBtn = chatModal ? document.getElementById("sendBtn") : null;
const chatClose = chatModal ? document.getElementById("chatClose") : null;

const aiResponses = {
  oi: "Olá! Sou a assistente IA do DWX DEV. Como posso ajudar?",
  ola: "Olá! Sou a assistente IA do DWX DEV. Como posso ajudar?",
  projeto:
    "Temos projetos incríveis como sites responsivos, apps mobile e IA integrada. Quer ver detalhes?",
  contato:
    "Você pode me contatar pelo email ou formulário no site. Daniel Azevedo está sempre disponível!",
  sobre:
    "Daniel Azevedo é um dev full-stack com 25 anos, focado em interfaces limpas e performance.",
  mobile:
    "Desenvolvimento mobile inclui apps intuitivos, PWAs e performance otimizada.",
  ia: "Integro IA para personalização, chatbots e análises inteligentes.",
  site: "Crio sites responsivos, acessíveis e com ótimo desempenho.",
  default:
    "Desculpe, não entendi. Pergunte sobre projetos, contato ou sobre mim!",
};

function addMessage(text, sender) {
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;
  msg.textContent = text;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getAIResponse(message) {
  const lower = message.toLowerCase();
  for (const key in aiResponses) {
    if (lower.includes(key)) return aiResponses[key];
  }
  return aiResponses.default;
}

function sendMessage() {
  const msg = chatInput.value.trim();
  if (!msg) return;

  sendBtn.disabled = true;
  sendBtn.textContent = "Enviando...";

  addMessage(msg, "user");
  chatInput.value = "";

  setTimeout(() => {
    const response = getAIResponse(msg);
    addMessage(response, "ai");
    sendBtn.disabled = false;
    sendBtn.textContent = "Enviar";
  }, 1000);
}

const chatBtn = document.getElementById("chatBtn");
if (chatBtn && chatModal && chatMessages && chatInput && sendBtn && chatClose) {
  chatBtn.addEventListener("click", () => {
    chatModal.style.display = "block";
    chatMessages.innerHTML = "";
    addMessage("Olá! Como posso ajudar hoje?", "ai");
  });

  chatClose.addEventListener("click", () => (chatModal.style.display = "none"));
  window.addEventListener("click", (e) => {
    if (e.target === chatModal) chatModal.style.display = "none";
  });

  sendBtn.addEventListener("click", sendMessage);
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });
}

setupProjectPage();
registerServiceWorker();

// Repositórios (Mobile)
const repoListEl = document.getElementById("repoList");
if (repoListEl) {
  const repos = [
    {
      name: "dwx-dev",
      description: "Site principal com frontend, backend e PWA.",
      url: "https://github.com/SEU_USUARIO/dwx-dev",
    },
    {
      name: "dwx-dev-api",
      description:
        "API de backend (Node.js/Express) que serve projetos e contatos.",
      url: "https://github.com/SEU_USUARIO/dwx-dev-api",
    },
    {
      name: "dwx-dev-mobile",
      description: "Protótipo de app mobile e PWA com integração de IA.",
      url: "https://github.com/SEU_USUARIO/dwx-dev-mobile",
    },
  ];

  repoListEl.innerHTML = "";
  repos.forEach((repo) => {
    const card = document.createElement("div");
    card.className = "project";
    card.innerHTML = `
      <h3>${repo.name}</h3>
      <p>${repo.description}</p>
      <div class="project-actions">
        <a class="project-btn" href="${repo.url}" target="_blank" rel="noopener">
          Ver no GitHub
        </a>
      </div>
    `;
    repoListEl.appendChild(card);
  });
}

const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Enviando...";
    submitBtn.disabled = true;

    const formData = {
      name: this.name.value.trim(),
      email: this.email.value.trim(),
      message: this.message.value.trim(),
    };

    if (!formData.name || !formData.email || !formData.message) {
      alert("Preencha todos os campos antes de enviar.");
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      return;
    }

    try {
      // Modificado para ambiente estático, simulando o comportamento da API
      await new Promise(resolve => setTimeout(resolve, 800));
      alert("A versão atual deste site é estática. Em um ambiente real, esta mensagem seria gravada.");
      this.reset();
    } catch (err) {
      console.error(err);
      alert("Não foi possível enviar a mensagem. Tente novamente mais tarde.");
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}
