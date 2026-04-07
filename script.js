// script.js
const fallbackStatus = {
  creativeOutput: 3,
  stamina: 42,
  focus: "UNSTABLE",
  discipline: "RECOVERING",
  boss: "RUSTLING DOUBT",
  campfireEntries: 18,
  activePrompt: "Finish 1 file before midnight",
  dailyMission: "Creative Prompt > Fight Boss > Campfire Log",
  bootUser: "THEO SOLACE",
  systemStatus: "ACTIVE"
};

const bootFrame = document.getElementById("bootFrame");
const bootContent = document.getElementById("bootContent");
const typedLines = document.getElementById("typedLines");
const bootDirective = document.getElementById("bootDirective");
const progressFill = document.getElementById("progressFill");
const bootOverlay = document.getElementById("bootOverlay");
const menuShell = document.getElementById("menuShell");
const skipBoot = document.getElementById("skipBoot");

function setClock() {
  const now = new Date();
  document.getElementById("bootClock").textContent = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
  document.getElementById("dateStamp").textContent = now.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

setClock();
setInterval(setClock, 30000);

async function loadStatus() {
  try {
    const response = await fetch("./status.json", { cache: "no-store" });
    if (!response.ok) throw new Error("status.json not found");
    const live = await response.json();
    return { ...fallbackStatus, ...live };
  } catch {
    return fallbackStatus;
  }
}

function populateSidebar(status) {
  document.getElementById("creativeOutputDisplay").textContent =
    `${status.creativeOutput} FILE${status.creativeOutput === 1 ? "" : "S"}`;
  document.getElementById("staminaDisplay").textContent = `${status.stamina}%`;
  document.getElementById("focusDisplay").textContent = status.focus;
  document.getElementById("disciplineDisplay").textContent = status.discipline;
  document.getElementById("bossDisplay").textContent = status.boss;
  document.getElementById("campfireDisplay").textContent = status.campfireEntries;
  document.getElementById("directiveMain").textContent = status.activePrompt;
  document.getElementById("directiveSub").textContent = status.dailyMission;
}

function buildBootLines(status) {
  return [
    `USER: ${status.bootUser}`,
    `STATUS: ${status.systemStatus}`,
    `CREATIVE OUTPUT: ${status.creativeOutput} FILE${status.creativeOutput === 1 ? "" : "S"}`,
    `STAMINA: ${status.stamina}%`,
    `FOCUS: ${status.focus}`,
    `DISCIPLINE: ${status.discipline}`,
    `BOSS THREAT: ${status.boss}`,
    `CAMPFIRE LOGS: ${status.campfireEntries}`
  ];
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function typeLine(text, index, total) {
  const line = document.createElement("div");
  line.className = "typed-line";
  typedLines.appendChild(line);
  line.classList.add("show");

  let out = "";
  const speed = index < 2 ? 18 : 13;

  for (const ch of text) {
    out += ch;
    line.textContent = out;
    progressFill.style.width =
      `${Math.min(100, ((index + out.length / text.length) / total) * 92 + 8)}%`;
    await wait(speed);
  }

  await wait(70);
}

let bootFinished = false;

async function runBoot(status) {
  populateSidebar(status);
  const lines = buildBootLines(status);

  await wait(280);
  bootFrame.classList.add("expanded");
  await wait(380);
  bootContent.classList.add("visible");

  for (let i = 0; i < lines.length; i++) {
    if (bootFinished) return;
    await typeLine(lines[i], i, lines.length);
  }

  bootDirective.innerHTML = `RECOMMENDED ACTION:<br>&gt; ${status.activePrompt.toUpperCase()}`;
  bootDirective.classList.add("show");
  progressFill.style.width = "100%";

  await wait(1150);
  finishBoot();
}

function finishBoot() {
  if (bootFinished) return;
  bootFinished = true;
  bootOverlay.classList.add("hidden");
  bootOverlay.setAttribute("aria-hidden", "true");
  menuShell.classList.add("ready");
}

skipBoot.addEventListener("click", finishBoot);

bootOverlay.addEventListener("click", event => {
  if (event.target === bootOverlay) finishBoot();
});

loadStatus().then(runBoot);
