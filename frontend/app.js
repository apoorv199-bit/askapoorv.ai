// ==========================================================================
// AskApoorv.ai Executive Recruiter Frontend Application
// Real-time Token Streaming & Dynamic Candidate Dossier Binding
// ==========================================================================

const API_BASE = window.location.origin.includes(":8000")
  ? "" 
  : "http://localhost:8000";

const PROFILE_ENDPOINT = `${API_BASE}/api/v1/chat/profile`;
const STREAM_ENDPOINT = `${API_BASE}/api/v1/chat/stream`;

// DOM Elements
const dossierNameEl = document.getElementById("dossierName");
const avatarInitialsEl = document.getElementById("avatarInitials");
const dossierEmailEl = document.getElementById("dossierEmail");
const dossierPhoneEl = document.getElementById("dossierPhone");
const metricExpEl = document.getElementById("metricExp");
const metricCompaniesEl = document.getElementById("metricCompanies");
const metricSkillsEl = document.getElementById("metricSkills");
const metricProjectsEl = document.getElementById("metricProjects");
const experienceTimelineEl = document.getElementById("experienceTimeline");
const skillsCategorizedEl = document.getElementById("skillsCategorized");
const projectsContainerEl = document.getElementById("projectsContainer");
const educationContainerEl = document.getElementById("educationContainer");

const chatContainerEl = document.getElementById("chatContainer");
const chatFormEl = document.getElementById("chatForm");
const questionInputEl = document.getElementById("questionInput");
const sendBtnEl = document.getElementById("sendBtn");
const clearChatBtn = document.getElementById("clearChatBtn");
const promptsContainerEl = document.getElementById("promptsContainer");

let isGenerating = false;

// ================= Tab Navigation =================
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));

    btn.classList.add("active");
    const targetPanel = document.getElementById(`tab-${btn.dataset.tab}`);
    if (targetPanel) targetPanel.classList.add("active");
  });
});

// ================= Load Candidate Dossier =================
async function loadCandidateDossier() {
  try {
    const res = await fetch(PROFILE_ENDPOINT);
    if (!res.ok) return;

    const data = await res.json();
    bindProfileData(data);
  } catch (err) {
    console.warn("Could not load candidate profile:", err);
  }
}

function bindProfileData(data) {
  if (data.name) {
    // Clean name formatting (e.g. "APOOR V SAHU" -> "Apoorv Sahu")
    const formattedName = data.name
      .toLowerCase()
      .split(" ")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
      .replace("Apoor V", "Apoorv");

    dossierNameEl.textContent = formattedName;

    // Initials
    const initials = formattedName
      .split(" ")
      .map(w => w[0])
      .join("")
      .slice(0, 2);
    avatarInitialsEl.textContent = initials || "AS";
  }

  if (data.email) {
    dossierEmailEl.href = `mailto:${data.email}`;
    dossierEmailEl.textContent = `✉️ ${data.email}`;
  }

  if (data.phone) {
    dossierPhoneEl.href = `tel:${data.phone.replace(/[^0-9+]/g, '')}`;
    dossierPhoneEl.textContent = `📞 ${data.phone}`;
  }

  if (data.total_experience_years) {
    metricExpEl.textContent = `${data.total_experience_years}+`;
  }
  if (metricCompaniesEl && data.experiences) {
    metricCompaniesEl.textContent = `${data.experiences.length}`;
  }
  if (metricSkillsEl && data.skills) {
    metricSkillsEl.textContent = `${data.skills.length}+`;
  }
  if (metricProjectsEl && data.projects) {
    metricProjectsEl.textContent = `${data.projects.length}+`;
  }

  // Update Welcome Message dynamically
  const welcomeBody = document.querySelector(".message.assistant .msg-body");
  if (welcomeBody) {
    const compNames = (data.experiences || []).map(e => e.company).filter(Boolean);
    const compString = compNames.length > 0 ? compNames.join(" & ") : "leading tech companies";
    welcomeBody.innerHTML = `
      <p>Welcome! I am the verified AI representative for <strong>${dossierNameEl.textContent}</strong>.</p>
      <p>I am trained directly on his verified engineering experience at <strong>${compString}</strong>, technical projects, and systems architecture.</p>
      <p>Select any of the dynamically generated recruiter questions below or ask your own specific interview question:</p>
    `;
  }

  // Render Dynamic Prompts Ribbon
  renderDynamicPrompts(data);

  // Render Experience Timeline
  if (data.experiences && data.experiences.length > 0) {
    experienceTimelineEl.innerHTML = "";
    data.experiences.forEach((exp) => {
      const item = document.createElement("div");
      item.className = "timeline-item";

      const tagsHtml = (exp.skills_used || [])
        .map(skill => `<span class="tech-tag">${skill}</span>`)
        .join("");

      const descriptionHtml = formatExperienceBullets(exp.description);

      item.innerHTML = `
        <div class="timeline-header">
          <div>
            <h3 class="role-title">${exp.role || "Software Engineer"}</h3>
            <h4 class="company-name">${exp.company || "Company"}</h4>
          </div>
          <span class="timeline-date">${exp.duration || ""}</span>
        </div>
        ${descriptionHtml}
        <div class="tag-row" style="margin-top: 0.65rem;">${tagsHtml}</div>
      `;
      experienceTimelineEl.appendChild(item);
    });
  }

  // Render Categorized Skills
  if (data.skills && data.skills.length > 0) {
    renderCategorizedSkills(data.skills);
  }

  // Render Projects with structured title, tags, and bullets
  if (data.projects && data.projects.length > 0) {
    projectsContainerEl.innerHTML = "";
    data.projects.forEach((proj) => {
      projectsContainerEl.innerHTML += formatProjectCard(proj);
    });
  }

  // Render Education
  if (data.education && data.education.length > 0) {
    educationContainerEl.innerHTML = "";
    data.education.forEach((edu) => {
      const card = document.createElement("div");
      card.className = "edu-card";
      card.innerHTML = `
        <div class="edu-badge">Verified Academic Record</div>
        <p class="edu-school" style="margin-top: 0.5rem; color: #f8fafc; font-weight: 600;">${edu}</p>
      `;
      educationContainerEl.appendChild(card);
    });
  }
}

function renderDynamicPrompts(data) {
  if (!promptsContainerEl) return;
  promptsContainerEl.innerHTML = "";

  const fullName = dossierNameEl.textContent || "Apoorv";
  const firstName = fullName.split(" ")[0];

  const chips = [];

  // 1. Elevator Pitch
  chips.push({
    label: "⚡ 1-Minute Executive Pitch",
    q: `Give me a concise 1-minute executive summary of ${firstName}'s engineering background and top strengths.`
  });

  // 2. Latest Role / Company
  if (data.experiences && data.experiences.length > 0) {
    const latest = data.experiences[0];
    chips.push({
      label: `🏢 Role at ${latest.company}`,
      q: `What are ${firstName}'s core responsibilities and engineering achievements as a ${latest.role} at ${latest.company}?`
    });

    if (data.experiences.length > 1) {
      const prev = data.experiences[1];
      chips.push({
        label: `⚙️ Experience at ${prev.company}`,
        q: `Describe his key technical contributions, microservices work, and achievements at ${prev.company}.`
      });
    }
  }

  // 3. Latency & Performance Optimization
  chips.push({
    label: "🚀 Latency & Query Optimization",
    q: `How did ${firstName} achieve significant latency reduction and optimize API throughput? Walk me through the technical techniques.`
  });

  // 4. Latest Featured Project
  if (data.projects && data.projects.length > 0) {
    const rawProj = data.projects[0];
    const projName = rawProj.split("–")[0].split("-")[0].split(":")[0].trim();
    chips.push({
      label: `🛠️ ${projName} Architecture`,
      q: `Walk me through ${firstName}'s project '${projName}', why it was built, concurrency/storage decisions, and its architecture.`
    });
  }

  // 5. Tech Stack & Distributed Systems
  if (data.skills && data.skills.length > 0) {
    const topStack = data.skills.slice(0, 4).join(", ");
    chips.push({
      label: `💻 Stack: ${topStack}`,
      q: `What is his hands-on experience building distributed systems with ${topStack}?`
    });
  }

  // 6. Why Hire
  chips.push({
    label: `🎯 Why Hire ${firstName}?`,
    q: `Why should our engineering team hire ${firstName} as a Software / Backend Engineer? What makes him stand out?`
  });

  // Render chips
  chips.forEach((chip) => {
    const btn = document.createElement("button");
    btn.className = "prompt-chip";
    btn.dataset.q = chip.q;
    btn.textContent = chip.label;
    promptsContainerEl.appendChild(btn);
  });
}

function renderCategorizedSkills(skillsList) {
  const categories = {
    "Backend & Microservices": ["Go", "Java", "Spring Boot", "Spring Security", "Echo", "Node.js", "Express.js", "REST APIs", "REST API", "Microservices", "JWT", "Multithreading"],
    "Cloud & DevOps": ["AWS", "AWS Lambda", "AWS EC2", "AWS DocumentDB", "AWS CloudWatch", "Docker", "Docker Compose", "Jenkins", "CI/CD", "Git", "GitLab", "Prometheus"],
    "Databases & Distributed Systems": ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Kafka", "Caching"],
    "Languages & Fundamentals": ["Go", "Python", "JavaScript", "TypeScript", "Algorithms and Data Structures", "LLD", "API Integration", "React.js", "React JS"]
  };

  skillsCategorizedEl.innerHTML = "";
  const assigned = new Set();

  for (const [catName, keywords] of Object.entries(categories)) {
    const matched = skillsList.filter(s => 
      keywords.some(k => s.toLowerCase() === k.toLowerCase())
    );

    if (matched.length > 0) {
      matched.forEach(s => assigned.add(s.toLowerCase()));
      const group = document.createElement("div");
      group.className = "skills-category-group";
      group.innerHTML = `
        <h4 class="category-title">${catName}</h4>
        <div class="tag-row">
          ${matched.map(s => `<span class="tech-tag" style="background: rgba(99, 102, 241, 0.12); color: #c7d2fe; border-color: rgba(99, 102, 241, 0.25);">${s}</span>`).join("")}
        </div>
      `;
      skillsCategorizedEl.appendChild(group);
    }
  }

  // Remaining Skills
  const remaining = skillsList.filter(s => !assigned.has(s.toLowerCase()));
  if (remaining.length > 0) {
    const group = document.createElement("div");
    group.className = "skills-category-group";
    group.innerHTML = `
      <h4 class="category-title">Tools & Methodologies</h4>
      <div class="tag-row">
        ${remaining.map(s => `<span class="tech-tag">${s}</span>`).join("")}
      </div>
    `;
    skillsCategorizedEl.appendChild(group);
  }
}

// ================= Markdown Formatter =================
function formatMarkdown(text) {
  if (!text) return "";

  let escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold **text**
  escaped = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Inline `code`
  escaped = escaped.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Parse lists and paragraphs
  const lines = escaped.split("\n");
  let inList = false;
  let formatted = "";

  for (let line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      if (!inList) {
        formatted += "<ul>";
        inList = true;
      }
      formatted += `<li>${trimmed.substring(2)}</li>`;
    } else {
      if (inList) {
        formatted += "</ul>";
        inList = false;
      }
      if (trimmed) {
        formatted += `<p>${line}</p>`;
      }
    }
  }
  if (inList) formatted += "</ul>";

  return formatted || `<p>${escaped}</p>`;
}

// ================= Messages Management =================
function appendMessage(role, initialText = "") {
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${role}`;

  const avatarCol = document.createElement("div");
  avatarCol.className = "msg-avatar-col";

  const avatarIcon = document.createElement("div");
  avatarIcon.className = "msg-avatar-icon";
  avatarIcon.textContent = role === "user" ? "👤" : "🤖";
  avatarCol.appendChild(avatarIcon);

  const bubbleDiv = document.createElement("div");
  bubbleDiv.className = "msg-bubble";

  if (role === "assistant") {
    bubbleDiv.innerHTML = `
      <div class="msg-author-header">
        <span class="author-name">AskApoorv.ai Copilot</span>
        <span class="verification-badge">✓ Verified Resume Data</span>
      </div>
      <div class="msg-body">${formatMarkdown(initialText)}</div>
    `;
  } else {
    bubbleDiv.innerHTML = `<div class="msg-body"><p>${initialText}</p></div>`;
  }

  msgDiv.appendChild(avatarCol);
  msgDiv.appendChild(bubbleDiv);

  chatContainerEl.appendChild(msgDiv);
  scrollToBottom();

  return bubbleDiv;
}

function scrollToBottom() {
  chatContainerEl.scrollTop = chatContainerEl.scrollHeight;
}

// ================= Real-Time Token Streaming =================
async function handleSendQuestion(question) {
  if (!question || isGenerating) return;

  isGenerating = true;
  sendBtnEl.disabled = true;
  questionInputEl.value = "";
  questionInputEl.style.height = "auto";

  // Append User message
  appendMessage("user", question);

  // Append Assistant placeholder with streaming cursor
  const assistantBubble = appendMessage("assistant", "");
  const msgBody = assistantBubble.querySelector(".msg-body");
  msgBody.classList.add("streaming-active");

  let accumulatedText = "";

  try {
    const response = await fetch(STREAM_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: question }),
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      accumulatedText += chunk;

      msgBody.innerHTML = formatMarkdown(accumulatedText);
      scrollToBottom();
    }

    // Add Copy Action Button when done
    const actionsDiv = document.createElement("div");
    actionsDiv.className = "msg-actions";
    actionsDiv.innerHTML = `
      <button class="btn-msg-action copy-btn">📋 Copy for ATS / Recruiter Notes</button>
    `;
    actionsDiv.querySelector(".copy-btn").addEventListener("click", (e) => {
      navigator.clipboard.writeText(accumulatedText);
      e.target.textContent = "✅ Copied to Clipboard!";
      setTimeout(() => { e.target.textContent = "📋 Copy for ATS / Recruiter Notes"; }, 2000);
    });
    assistantBubble.appendChild(actionsDiv);

  } catch (err) {
    console.error("Streaming error:", err);
    msgBody.innerHTML = `<p style="color: #f87171;">⚠️ Error: Unable to complete response (${err.message}). Please verify the backend is running.</p>`;
  } finally {
    msgBody.classList.remove("streaming-active");
    isGenerating = false;
    sendBtnEl.disabled = false;
    questionInputEl.focus();
  }
}

// ================= Event Listeners =================
chatFormEl.addEventListener("submit", (e) => {
  e.preventDefault();
  const q = questionInputEl.value.trim();
  if (q) handleSendQuestion(q);
});

// Auto-expand textarea & Enter to submit
questionInputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    chatFormEl.dispatchEvent(new Event("submit"));
  }
});

questionInputEl.addEventListener("input", () => {
  questionInputEl.style.height = "auto";
  questionInputEl.style.height = `${Math.min(questionInputEl.scrollHeight, 120)}px`;
});

// Recruiter Quick Chips
promptsContainerEl.addEventListener("click", (e) => {
  const chip = e.target.closest(".prompt-chip");
  if (chip && !isGenerating) {
    const q = chip.dataset.q;
    handleSendQuestion(q);
  }
});

// Clear Chat
clearChatBtn.addEventListener("click", () => {
  chatContainerEl.innerHTML = `
    <div class="message assistant">
      <div class="msg-avatar-col">
        <div class="msg-avatar-icon">🤖</div>
      </div>
      <div class="msg-bubble">
        <div class="msg-author-header">
          <span class="author-name">AskApoorv.ai Copilot</span>
          <span class="verification-badge">✓ Verified Resume Data</span>
        </div>
        <div class="msg-body">
          <p>Conversation reset. What specific role, technology, or achievement would you like to investigate next?</p>
        </div>
      </div>
    </div>
  `;
});

// ================= Formatting Helpers =================

function formatExperienceBullets(description) {
  if (!description) return "";

  // Split description by period followed by space, or semicolon, or newline
  let rawItems = [];
  if (description.includes("\n")) {
    rawItems = description.split("\n");
  } else {
    // Lookbehind for period or semicolon followed by space and capital letter or end of sentence
    rawItems = description.split(/\.\s+(?=[A-Z0-9])|;\s+/);
  }

  const items = rawItems
    .map(i => i.trim().replace(/^[-•*]\s*/, ""))
    .filter(i => i.length > 8);

  if (items.length <= 1) {
    return `<p class="timeline-desc">${description}</p>`;
  }

  const listItems = items
    .map(item => {
      // Clean trailing period
      const cleanItem = item.endsWith(".") ? item : `${item}.`;
      // Highlight metrics
      const highlighted = cleanItem
        .replace(/(~?\d+%\s*(?:latency\s*reduction|reduction|improvement)?)/gi, "<strong>$1</strong>")
        .replace(/(100\+\s*bugs)/gi, "<strong>$1</strong>")
        .replace(/(Kafka‑based fallback|Kafka-based fallback)/gi, "<strong>$1</strong>");
      return `<li>${highlighted}</li>`;
    })
    .join("");

  return `<ul class="bullet-list">${listItems}</ul>`;
}

function formatProjectCard(projString) {
  if (!projString) return "";

  let title = "Featured Engineering System";
  let techStack = [];
  let description = projString;

  // Pattern: "Title – Tech1, Tech2: Description" or "Title - Tech: Description"
  const dashMatch = projString.match(/^(.*?)\s+[–—-]\s+(.*?):\s*(.*)$/s);
  if (dashMatch) {
    title = dashMatch[1].trim();
    techStack = dashMatch[2].split(",").map(t => t.trim()).filter(Boolean);
    description = dashMatch[3].trim();
  } else {
    // Fallback: check if colon exists
    const colonIdx = projString.indexOf(":");
    if (colonIdx !== -1 && colonIdx < 60) {
      title = projString.substring(0, colonIdx).trim();
      description = projString.substring(colonIdx + 1).trim();
    }
  }

  // Split description into bullet points
  const rawBullets = description.split(/\.\s+(?=[A-Z0-9])|;\s+/);
  const bullets = rawBullets
    .map(b => b.trim().replace(/^[-•*]\s*/, ""))
    .filter(b => b.length > 8);

  const bulletsHtml = bullets.length > 1
    ? `<ul class="bullet-list">${bullets.map(b => `<li>${b.endsWith(".") ? b : b + "."}</li>`).join("")}</ul>`
    : `<p class="project-desc">${description}</p>`;

  const tagsHtml = techStack.length > 0
    ? `<div class="tag-row" style="margin: 0.65rem 0 0.85rem 0;">${techStack.map(t => `<span class="tech-tag" style="background: rgba(99, 102, 241, 0.14); color: #c7d2fe; border-color: rgba(99, 102, 241, 0.3); font-weight: 600;">${t}</span>`).join("")}</div>`
    : "";

  return `
    <div class="project-card">
      <div class="project-card-header">
        <div class="project-badge">Verified Engineering System</div>
        <h3 class="project-title">${title}</h3>
      </div>
      ${tagsHtml}
      ${bulletsHtml}
    </div>
  `;
}

// Start app
loadCandidateDossier();

