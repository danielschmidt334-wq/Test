(function () {
  const questions = window.QUIZ_QUESTIONS;
  const screens = {
    start: document.getElementById("screen-start"),
    quiz: document.getElementById("screen-quiz"),
    results: document.getElementById("screen-results"),
  };

  const els = {
    studentName: document.getElementById("student-name"),
    btnStart: document.getElementById("btn-start"),
    progressLabel: document.getElementById("progress-label"),
    progressPct: document.getElementById("progress-pct"),
    progressBar: document.getElementById("progress-bar"),
    progressFill: document.getElementById("progress-fill"),
    questionTag: document.getElementById("question-tag"),
    questionText: document.getElementById("question-text"),
    choices: document.getElementById("choices"),
    btnNext: document.getElementById("btn-next"),
    scoreValue: document.getElementById("score-value"),
    scoreMessage: document.getElementById("score-message"),
    resultsList: document.getElementById("results-list"),
    btnRetry: document.getElementById("btn-retry"),
  };

  let index = 0;
  /** @type {number[]} */
  let answers = [];

  function showScreen(name) {
    Object.values(screens).forEach((s) => s.classList.remove("screen--active"));
    screens[name].classList.add("screen--active");
  }

  function setProgress(i) {
    const total = questions.length;
    const pct = Math.round((i / total) * 100);
    els.progressLabel.textContent = `Frage ${Math.min(i + 1, total)} von ${total}`;
    els.progressPct.textContent = `${pct}%`;
    els.progressFill.style.width = `${pct}%`;
    els.progressBar.setAttribute("aria-valuenow", String(pct));
  }

  function renderQuestion() {
    const q = questions[index];
    setProgress(index);
    els.questionTag.textContent = q.tag;
    els.questionText.textContent = q.question;
    els.choices.innerHTML = "";
    els.btnNext.disabled = true;
    els.btnNext.textContent =
      index === questions.length - 1 ? "Ergebnis anzeigen" : "Nächste Frage";

    q.options.forEach((text, optIndex) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice";
      btn.setAttribute("role", "option");
      btn.textContent = text;
      btn.addEventListener("click", () => selectOption(optIndex, btn));
      els.choices.appendChild(btn);
    });
  }

  function selectOption(optIndex, clickedBtn) {
    answers[index] = optIndex;
    els.choices.querySelectorAll(".choice").forEach((c) => {
      c.classList.remove("choice--selected");
      c.disabled = false;
    });
    clickedBtn.classList.add("choice--selected");
    els.btnNext.disabled = false;
  }

  function scoreMessageFor(score, total) {
    const pct = score / total;
    const name = els.studentName.value.trim();
    const prefix = name ? `${name}, ` : "";
    if (pct >= 0.9) return `${prefix}sehr gut — Excellent work!`;
    if (pct >= 0.7) return `${prefix}gut gemacht — Well done!`;
    if (pct >= 0.5) return `${prefix} solide — Keep practising!`;
    return `${prefix}übe weiter — You can do better next time!`;
  }

  function showResults() {
    let score = 0;
    els.resultsList.innerHTML = "";

    questions.forEach((q, i) => {
      const chosen = answers[i];
      const ok = chosen === q.correct;
      if (ok) score += 1;

      const item = document.createElement("div");
      item.className = `result-item ${ok ? "result-item--ok" : "result-item--fail"}`;
      const chosenText =
        chosen !== undefined ? q.options[chosen] : "— nicht beantwortet";
      item.innerHTML = `
        <p class="result-q">${i + 1}. ${escapeHtml(q.question)}</p>
        <p class="result-a">${ok ? "✓" : "✗"} Deine Antwort: ${escapeHtml(chosenText)}${
          ok ? "" : ` · Richtig: ${escapeHtml(q.options[q.correct])}`
        }</p>`;
      els.resultsList.appendChild(item);
    });

    els.scoreValue.textContent = `${score} / ${questions.length}`;
    els.scoreMessage.textContent = scoreMessageFor(score, questions.length);
    showScreen("results");
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function startQuiz() {
    index = 0;
    answers = new Array(questions.length);
    showScreen("quiz");
    renderQuestion();
  }

  function resetQuiz() {
    els.studentName.value = "";
    showScreen("start");
  }

  els.btnStart.addEventListener("click", startQuiz);
  els.btnNext.addEventListener("click", () => {
    if (answers[index] === undefined) return;
    if (index < questions.length - 1) {
      index += 1;
      renderQuestion();
    } else {
      showResults();
    }
  });
  els.btnRetry.addEventListener("click", resetQuiz);
})();
