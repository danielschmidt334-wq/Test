(function () {
  "use strict";

  const STORAGE_KEY = "darrel-english-studio-v1";

  const WRITING_PROMPTS = [
    "Describe your perfect weekend in 5–8 sentences. Use past simple and past continuous at least once.",
    "Write an email to DaRrel explaining one grammar topic you find difficult and what you tried to improve.",
    "Compare your hometown with Berlin (or your current city). Use comparatives and superlatives.",
    "Tell a short story that starts with: \"When I opened the door, I didn't expect…\"",
    "Explain your job or studies to a new colleague in English (80–120 words).",
    "Write three goals for your English learning this month and how DaRrel can help you.",
    "Describe a book, film, or series you enjoyed. Include opinion phrases (I think, In my view).",
    "Practice conditionals: What would you do if you had a free month to travel?",
  ];

  const SPEAKING_TOPICS = [
    "Daily routine – walk through yesterday hour by hour.",
    "Pronunciation focus: word stress in 5 new vocabulary items.",
    "Role-play: booking an appointment by phone.",
    "Explain a news headline you read this week.",
    "Tell DaRrel about a mistake you made in English and what you learned.",
    "Debate: Is it better to learn English only in class or also from series/music?",
    "Describe a photo from your phone for 2 minutes without stopping.",
    "Review homework: read your written answer aloud and self-correct.",
  ];

  const GRAMMAR_FOCUS = [
    "Present perfect vs. past simple",
    "Articles (a / an / the)",
    "Prepositions of time and place",
    "Modal verbs (must, should, might)",
    "Word order in questions",
    "Phrasal verbs from last lesson",
  ];

  const defaultState = () => ({
    vocab: [
      {
        id: crypto.randomUUID(),
        english: "nevertheless",
        german: "dennoch / nichtsdestotrotz",
        example: "It was raining; nevertheless, we went for a walk.",
        lessonDate: todayISO(),
      },
      {
        id: crypto.randomUUID(),
        english: "to figure out",
        german: "herausfinden / verstehen",
        example: "Can you help me figure out this exercise?",
        lessonDate: todayISO(),
      },
    ],
    homework: [
      {
        id: crypto.randomUUID(),
        title: "Unit 4 – Exercise 2 (Workbook)",
        notes: "Focus on present perfect. Bring questions to the next lesson.",
        dueDate: addDaysISO(3),
        done: false,
        fromDarrel: true,
      },
    ],
    lessons: [
      {
        id: crypto.randomUUID(),
        date: todayISO(),
        topics: "Small talk, present perfect review",
        darrelFeedback: "Great progress on fluency. Watch word stress on \"development\".",
        myNotes: "Homework: pages 44–45. Record myself reading the dialogue.",
      },
    ],
    practiceLog: [],
    settings: {
      studentName: "",
      nextLessonDate: addDaysISO(7),
    },
  });

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  function addDaysISO(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      return { ...defaultState(), ...JSON.parse(raw) };
    } catch {
      return defaultState();
    }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  let state = loadState();
  let activeTab = "dashboard";
  let flashcardIndex = 0;
  let flashcardFlipped = false;

  const app = document.getElementById("app");

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatDate(iso) {
    if (!iso) return "—";
    try {
      return new Date(iso + "T12:00:00").toLocaleDateString("de-DE", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  }

  function daysUntil(iso) {
    if (!iso) return null;
    const target = new Date(iso + "T12:00:00");
    const now = new Date();
    now.setHours(12, 0, 0, 0);
    return Math.ceil((target - now) / (86400000));
  }

  function computeStreak(log) {
    if (!log.length) return 0;
    const days = new Set(log.map((e) => e.date));
    let streak = 0;
    const cursor = new Date();
    cursor.setHours(12, 0, 0, 0);
    for (;;) {
      const key = cursor.toISOString().slice(0, 10);
      if (days.has(key)) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else if (streak === 0 && key === todayISO()) {
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }

  function logPractice(type) {
    const today = todayISO();
    const already = state.practiceLog.some(
      (e) => e.date === today && e.type === type
    );
    if (!already) {
      state.practiceLog.push({ date: today, type });
      saveState(state);
    }
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function renderShell(content) {
    const streak = computeStreak(state.practiceLog);
    const name = state.settings.studentName.trim();
    const greeting = name ? `Hallo ${escapeHtml(name)}` : "Dein Lernstudio";

    app.innerHTML = `
      <header class="site-header">
        <div class="brand">
          <h1>DaRrel <span>English</span> Studio</h1>
          <p>${greeting} – strukturiert üben, Hausaufgaben tracken, Lektionen festhalten.</p>
        </div>
        <div class="streak-badge" title="Tage in Folge mit Übungseintrag">
          🔥 Streak: <strong>${streak}</strong> Tag${streak === 1 ? "" : "e"}
        </div>
      </header>
      <nav class="nav-tabs" aria-label="Hauptnavigation">
        ${tabButton("dashboard", "Übersicht")}
        ${tabButton("vocab", "Vokabeln")}
        ${tabButton("homework", "Hausaufgaben")}
        ${tabButton("practice", "Üben")}
        ${tabButton("lessons", "Lektionen")}
        ${tabButton("settings", "Einstellungen")}
      </nav>
      <main class="panel">${content}</main>
      <p class="footer-note">Daten bleiben lokal in deinem Browser. Exportiere unter Einstellungen, um mit DaRrel zu teilen.</p>
    `;

    app.querySelectorAll(".nav-tabs button").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeTab = btn.dataset.tab;
        flashcardFlipped = false;
        render();
      });
    });

    bindPanelEvents();
  }

  function tabButton(id, label) {
    const active = activeTab === id ? " active" : "";
    return `<button type="button" data-tab="${id}" class="${active.trim()}" ${active ? 'aria-current="page"' : ""}>${label}</button>`;
  }

  function renderDashboard() {
    const openHw = state.homework.filter((h) => !h.done);
    const nextDue = openHw
      .slice()
      .sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""))[0];
    const vocabCount = state.vocab.length;
    const lessonCount = state.lessons.length;
    const nextLesson = state.settings.nextLessonDate;
    const daysToLesson = daysUntil(nextLesson);

    return `
      <div class="grid-3">
        <div class="card">
          <h2>Nächste Stunde mit DaRrel</h2>
          <p class="stat-value">${nextLesson ? formatDate(nextLesson) : "—"}</p>
          <p class="card-muted">${daysToLesson != null && daysToLesson >= 0 ? `In ${daysToLesson} Tag${daysToLesson === 1 ? "" : "en"}` : "Termin in Einstellungen setzen"}</p>
        </div>
        <div class="card">
          <h2>Offene Hausaufgaben</h2>
          <p class="stat-value">${openHw.length}</p>
          <p class="card-muted">${nextDue ? `Als Nächstes: ${escapeHtml(nextDue.title)}` : "Alles erledigt – gut gemacht!"}</p>
        </div>
        <div class="card">
          <h2>Vokabeln gesamt</h2>
          <p class="stat-value">${vocabCount}</p>
          <p class="card-muted">${lessonCount} Lektion${lessonCount === 1 ? "" : "en"} dokumentiert</p>
        </div>
      </div>
      <div class="grid-2" style="margin-top: 1rem">
        <div class="card">
          <h2>Heute üben</h2>
          <p class="practice-prompt">${escapeHtml(pickRandom(WRITING_PROMPTS))}</p>
          <div class="btn-group">
            <button type="button" class="btn btn-primary" data-action="goto-practice">Zum Übungsbereich</button>
            <button type="button" class="btn btn-secondary" data-action="log-practice" data-type="writing">Als erledigt markieren</button>
          </div>
        </div>
        <div class="card">
          <h2>Schnellcheck vor der Stunde</h2>
          <ul class="list">
            <li class="list-item"><span class="item-main">Hausaufgaben durchgehen und Fragen notieren</span></li>
            <li class="list-item"><span class="item-main">3 Vokabeln laut auf Englisch verwenden</span></li>
            <li class="list-item"><span class="item-main">Letztes Feedback von DaRrel noch einmal lesen</span></li>
          </ul>
        </div>
      </div>
    `;
  }

  function renderVocab() {
    const cards = state.vocab;
    const current = cards[flashcardIndex];

    const flashSection =
      cards.length === 0
        ? `<div class="empty-state">Noch keine Vokabeln. Füge welche aus der letzten Stunde hinzu.</div>`
        : `
        <div class="toolbar">
          <span class="card-muted">Karte ${flashcardIndex + 1} / ${cards.length}</span>
          <button type="button" class="btn btn-secondary" data-action="flip-card">${flashcardFlipped ? "Vorderseite" : "Umdrehen"}</button>
        </div>
        <div class="flashcard${flashcardFlipped ? " flipped" : ""}" data-action="flip-card-area">
          <div class="flashcard-inner">
            <div class="flashcard-face front">
              <div class="word">${escapeHtml(current.english.trim())}</div>
              <div class="hint">Tippe zum Umdrehen · ${formatDate(current.lessonDate)}</div>
            </div>
            <div class="flashcard-face back">
              <div class="word">${escapeHtml(current.german)}</div>
              <div class="hint">${escapeHtml(current.example || "—")}</div>
            </div>
          </div>
        </div>
        <div class="btn-group">
          <button type="button" class="btn btn-secondary" data-action="prev-card">← Zurück</button>
          <button type="button" class="btn btn-secondary" data-action="next-card">Weiter →</button>
          <button type="button" class="btn btn-primary" data-action="know-card">Kann ich ✓</button>
        </div>
      `;

    const listItems = cards
      .map(
        (v) => `
      <li class="list-item">
        <div class="item-main">
          <p class="item-title">${escapeHtml(v.english)}</p>
          <p class="item-meta">${escapeHtml(v.german)} · ${formatDate(v.lessonDate)}</p>
        </div>
        <button type="button" class="btn btn-danger" data-action="delete-vocab" data-id="${v.id}">Löschen</button>
      </li>`
      )
      .join("");

    return `
      <div class="grid-2">
        <div class="card">
          <h2>Karteikarten</h2>
          ${flashSection}
        </div>
        <div class="card">
          <h2>Neue Vokabel</h2>
          <form id="vocab-form">
            <div class="form-row">
              <label for="v-en">Englisch</label>
              <input id="v-en" name="english" required placeholder="e.g. nevertheless" />
            </div>
            <div class="form-row">
              <label for="v-de">Deutsch / Erklärung</label>
              <input id="v-de" name="german" required placeholder="dennoch" />
            </div>
            <div class="form-row">
              <label for="v-ex">Beispielsatz (English)</label>
              <textarea id="v-ex" name="example" placeholder="Optional"></textarea>
            </div>
            <div class="form-row">
              <label for="v-date">Aus Lektion vom</label>
              <input id="v-date" name="lessonDate" type="date" value="${todayISO()}" />
            </div>
            <button type="submit" class="btn btn-primary">Speichern</button>
          </form>
        </div>
      </div>
      <div class="card" style="margin-top: 1rem">
        <h2>Alle Vokabeln</h2>
        <ul class="list">${listItems || '<li class="empty-state">Liste ist leer</li>'}</ul>
      </div>
    `;
  }

  function renderHomework() {
    const items = state.homework
      .slice()
      .sort((a, b) => Number(a.done) - Number(b.done) || (a.dueDate || "").localeCompare(b.dueDate || ""));

    const list = items
      .map((h) => {
        const days = daysUntil(h.dueDate);
        let tag = "";
        if (h.done) tag = '<span class="tag tag-done">Erledigt</span>';
        else if (days != null && days <= 2 && days >= 0)
          tag = '<span class="tag tag-due-soon">Bald fällig</span>';
        return `
        <li class="list-item${h.done ? " done" : ""}">
          <label class="checkbox-wrap">
            <input type="checkbox" data-action="toggle-hw" data-id="${h.id}" ${h.done ? "checked" : ""} />
          </label>
          <div class="item-main">
            <p class="item-title">${escapeHtml(h.title)} ${tag}</p>
            <p class="item-meta">${h.fromDarrel ? "Von DaRrel · " : ""}Fällig: ${formatDate(h.dueDate)}</p>
            ${h.notes ? `<p class="item-meta">${escapeHtml(h.notes)}</p>` : ""}
          </div>
          <button type="button" class="btn btn-danger" data-action="delete-hw" data-id="${h.id}">Löschen</button>
        </li>`;
      })
      .join("");

    return `
      <div class="grid-2">
        <div class="card">
          <h2>Aufgabenliste</h2>
          <ul class="list">${list || '<li class="empty-state">Keine Hausaufgaben</li>'}</ul>
        </div>
        <div class="card">
          <h2>Neue Aufgabe</h2>
          <form id="hw-form">
            <div class="form-row">
              <label for="hw-title">Titel</label>
              <input id="hw-title" name="title" required placeholder="Grammar worksheet p. 12" />
            </div>
            <div class="form-row">
              <label for="hw-due">Fällig am</label>
              <input id="hw-due" name="dueDate" type="date" value="${addDaysISO(7)}" />
            </div>
            <div class="form-row">
              <label for="hw-notes">Notizen</label>
              <textarea id="hw-notes" name="notes" placeholder="Was genau sollst du üben?"></textarea>
            </div>
            <div class="form-row checkbox-wrap">
              <input id="hw-darrel" name="fromDarrel" type="checkbox" checked />
              <label for="hw-darrel">Von DaRrel gegeben</label>
            </div>
            <button type="submit" class="btn btn-primary">Hinzufügen</button>
          </form>
        </div>
      </div>
    `;
  }

  function renderPractice() {
    const writing = pickRandom(WRITING_PROMPTS);
    const speaking = pickRandom(SPEAKING_TOPICS);
    const grammar = pickRandom(GRAMMAR_FOCUS);

    return `
      <div class="grid-2">
        <div class="card">
          <h2>Schreiben (Writing)</h2>
          <p class="practice-prompt" id="writing-prompt">${escapeHtml(writing)}</p>
          <div class="btn-group">
            <button type="button" class="btn btn-secondary" data-action="new-writing">Neue Aufgabe</button>
            <button type="button" class="btn btn-primary" data-action="log-practice" data-type="writing">Heute geübt</button>
          </div>
          <div class="form-row" style="margin-top: 1rem">
            <label for="writing-draft">Dein Entwurf (wird lokal gespeichert)</label>
            <textarea id="writing-draft" placeholder="Schreib hier deinen Text…"></textarea>
          </div>
        </div>
        <div class="card">
          <h2>Sprechen mit DaRrel</h2>
          <p class="practice-prompt" id="speaking-prompt">${escapeHtml(speaking)}</p>
          <div class="btn-group">
            <button type="button" class="btn btn-secondary" data-action="new-speaking">Neues Thema</button>
            <button type="button" class="btn btn-primary" data-action="log-practice" data-type="speaking">Heute geübt</button>
          </div>
          <h3 style="margin-top: 1.25rem">Grammatik-Fokus heute</h3>
          <p class="practice-prompt" style="border-color: var(--teal)">${escapeHtml(grammar)}</p>
        </div>
      </div>
    `;
  }

  function renderLessons() {
    const sorted = state.lessons.slice().sort((a, b) => b.date.localeCompare(a.date));
    const list = sorted
      .map(
        (l) => `
      <li class="list-item">
        <div class="item-main">
          <p class="item-title">${formatDate(l.date)} – ${escapeHtml(l.topics || "Lektion")}</p>
          ${l.darrelFeedback ? `<p class="item-meta"><strong>DaRrel:</strong> ${escapeHtml(l.darrelFeedback)}</p>` : ""}
          ${l.myNotes ? `<p class="item-meta"><strong>Du:</strong> ${escapeHtml(l.myNotes)}</p>` : ""}
        </div>
        <button type="button" class="btn btn-danger" data-action="delete-lesson" data-id="${l.id}">Löschen</button>
      </li>`
      )
      .join("");

    return `
      <div class="grid-2">
        <div class="card">
          <h2>Lektionsprotokolle</h2>
          <ul class="list">${list || '<li class="empty-state">Noch keine Lektionen</li>'}</ul>
        </div>
        <div class="card">
          <h2>Neue Lektion</h2>
          <form id="lesson-form">
            <div class="form-row">
              <label for="l-date">Datum</label>
              <input id="l-date" name="date" type="date" value="${todayISO()}" />
            </div>
            <div class="form-row">
              <label for="l-topics">Themen</label>
              <input id="l-topics" name="topics" placeholder="e.g. Past simple, vocabulary: travel" />
            </div>
            <div class="form-row">
              <label for="l-feedback">Feedback von DaRrel</label>
              <textarea id="l-feedback" name="darrelFeedback" placeholder="Was hat DaRrel angemerkt?"></textarea>
            </div>
            <div class="form-row">
              <label for="l-notes">Deine Notizen / Hausaufgabe</label>
              <textarea id="l-notes" name="myNotes"></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Speichern</button>
          </form>
        </div>
      </div>
    `;
  }

  function renderSettings() {
    return `
      <div class="grid-2">
        <div class="card">
          <h2>Profil</h2>
          <form id="settings-form">
            <div class="form-row">
              <label for="s-name">Dein Name (optional)</label>
              <input id="s-name" name="studentName" value="${escapeHtml(state.settings.studentName)}" />
            </div>
            <div class="form-row">
              <label for="s-next">Nächste Stunde mit DaRrel</label>
              <input id="s-next" name="nextLessonDate" type="date" value="${state.settings.nextLessonDate || ""}" />
            </div>
            <button type="submit" class="btn btn-primary">Speichern</button>
          </form>
        </div>
        <div class="card">
          <h2>Daten sichern</h2>
          <p class="card-muted">Exportiere deine Vokabeln, Hausaufgaben und Lektionen als JSON – z. B. per E-Mail an DaRrel oder zum Backup.</p>
          <div class="btn-group">
            <button type="button" class="btn btn-primary" data-action="export">Export (JSON)</button>
            <label class="btn btn-secondary" style="cursor:pointer">
              Import
              <input type="file" accept="application/json" data-action="import-file" hidden />
            </label>
            <button type="button" class="btn btn-danger" data-action="reset">Alles zurücksetzen</button>
          </div>
        </div>
      </div>
    `;
  }

  function render() {
    let content;
    switch (activeTab) {
      case "vocab":
        content = renderVocab();
        break;
      case "homework":
        content = renderHomework();
        break;
      case "practice":
        content = renderPractice();
        break;
      case "lessons":
        content = renderLessons();
        break;
      case "settings":
        content = renderSettings();
        break;
      default:
        content = renderDashboard();
    }
    renderShell(content);

    const draftKey = "darrel-writing-draft";
    const draftEl = document.getElementById("writing-draft");
    if (draftEl) {
      draftEl.value = localStorage.getItem(draftKey) || "";
      draftEl.addEventListener("input", () => {
        localStorage.setItem(draftKey, draftEl.value);
      });
    }
  }

  function bindPanelEvents() {
    const root = app;

    root.querySelector('[data-action="goto-practice"]')?.addEventListener("click", () => {
      activeTab = "practice";
      render();
    });

    root.querySelectorAll('[data-action="log-practice"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        logPractice(btn.dataset.type || "general");
        render();
      });
    });

    root.querySelector('[data-action="flip-card"]')?.addEventListener("click", () => {
      flashcardFlipped = !flashcardFlipped;
      render();
    });

    root.querySelector('[data-action="flip-card-area"]')?.addEventListener("click", () => {
      flashcardFlipped = !flashcardFlipped;
      render();
    });

    root.querySelector('[data-action="prev-card"]')?.addEventListener("click", () => {
      if (!state.vocab.length) return;
      flashcardIndex = (flashcardIndex - 1 + state.vocab.length) % state.vocab.length;
      flashcardFlipped = false;
      render();
    });

    root.querySelector('[data-action="next-card"]')?.addEventListener("click", () => {
      if (!state.vocab.length) return;
      flashcardIndex = (flashcardIndex + 1) % state.vocab.length;
      flashcardFlipped = false;
      render();
    });

    root.querySelector('[data-action="know-card"]')?.addEventListener("click", () => {
      logPractice("vocab");
      if (state.vocab.length) {
        flashcardIndex = (flashcardIndex + 1) % state.vocab.length;
        flashcardFlipped = false;
      }
      render();
    });

    root.querySelectorAll('[data-action="delete-vocab"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        state.vocab = state.vocab.filter((v) => v.id !== btn.dataset.id);
        flashcardIndex = Math.min(flashcardIndex, Math.max(0, state.vocab.length - 1));
        saveState(state);
        render();
      });
    });

    root.querySelector("#vocab-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      state.vocab.unshift({
        id: crypto.randomUUID(),
        english: String(fd.get("english") || "").trim(),
        german: String(fd.get("german") || "").trim(),
        example: String(fd.get("example") || "").trim(),
        lessonDate: fd.get("lessonDate") || todayISO(),
      });
      saveState(state);
      flashcardIndex = 0;
      flashcardFlipped = false;
      render();
    });

    root.querySelectorAll('[data-action="toggle-hw"]').forEach((input) => {
      input.addEventListener("change", () => {
        const item = state.homework.find((h) => h.id === input.dataset.id);
        if (item) item.done = input.checked;
        saveState(state);
        render();
      });
    });

    root.querySelectorAll('[data-action="delete-hw"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        state.homework = state.homework.filter((h) => h.id !== btn.dataset.id);
        saveState(state);
        render();
      });
    });

    root.querySelector("#hw-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      state.homework.push({
        id: crypto.randomUUID(),
        title: String(fd.get("title") || "").trim(),
        dueDate: fd.get("dueDate") || addDaysISO(7),
        notes: String(fd.get("notes") || "").trim(),
        done: false,
        fromDarrel: fd.get("fromDarrel") === "on",
      });
      saveState(state);
      render();
    });

    root.querySelector('[data-action="new-writing"]')?.addEventListener("click", () => {
      const el = document.getElementById("writing-prompt");
      if (el) el.textContent = pickRandom(WRITING_PROMPTS);
    });

    root.querySelector('[data-action="new-speaking"]')?.addEventListener("click", () => {
      const el = document.getElementById("speaking-prompt");
      if (el) el.textContent = pickRandom(SPEAKING_TOPICS);
    });

    root.querySelectorAll('[data-action="delete-lesson"]').forEach((btn) => {
      btn.addEventListener("click", () => {
        state.lessons = state.lessons.filter((l) => l.id !== btn.dataset.id);
        saveState(state);
        render();
      });
    });

    root.querySelector("#lesson-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      state.lessons.unshift({
        id: crypto.randomUUID(),
        date: fd.get("date") || todayISO(),
        topics: String(fd.get("topics") || "").trim(),
        darrelFeedback: String(fd.get("darrelFeedback") || "").trim(),
        myNotes: String(fd.get("myNotes") || "").trim(),
      });
      saveState(state);
      render();
    });

    root.querySelector("#settings-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      state.settings.studentName = String(fd.get("studentName") || "").trim();
      state.settings.nextLessonDate = fd.get("nextLessonDate") || "";
      saveState(state);
      render();
    });

    root.querySelector('[data-action="export"]')?.addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `darrel-english-${todayISO()}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    });

    root.querySelector('[data-action="import-file"]')?.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const imported = JSON.parse(reader.result);
          state = { ...defaultState(), ...imported };
          saveState(state);
          alert("Import erfolgreich.");
          render();
        } catch {
          alert("Die Datei konnte nicht gelesen werden.");
        }
      };
      reader.readAsText(file);
    });

    root.querySelector('[data-action="reset"]')?.addEventListener("click", () => {
      if (confirm("Wirklich alle lokalen Daten löschen?")) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem("darrel-writing-draft");
        state = defaultState();
        saveState(state);
        render();
      }
    });
  }

  render();
})();
