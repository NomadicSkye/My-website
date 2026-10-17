
/* XP SYSTEM */

const levelButton = document.querySelector("#levelUp");
const levelMessage = document.querySelector("#levelMessage");
const xpText = document.querySelector("#xpText");
const xpBar = document.querySelector("#xpBar");

const xpNeeded = 100;
const questReward = 25;

const XP_STORAGE_KEY = "skylarPortfolioXP";
const QUEST_STORAGE_KEY = "skylarPortfolioQuests";

let totalXP = Number(localStorage.getItem(XP_STORAGE_KEY)) || 0;

/* RESTORE SAVED QUEST CHECKBOXES */

const questCheckboxes = document.querySelectorAll(".quest-checkbox");

try {
  const savedQuests = JSON.parse(
    localStorage.getItem(QUEST_STORAGE_KEY) || "[]"
  );

  questCheckboxes.forEach((checkbox, index) => {
    checkbox.checked = savedQuests[index] === true;
  });
} catch (error) {
  console.warn("Could not restore quest progress.", error);
}

/* UPDATE LEVEL AND XP DISPLAY */

function updateXPDisplay() {
  const level = Math.floor(totalXP / xpNeeded) + 1;
  const xp = totalXP % xpNeeded;

  if (levelMessage) {
    levelMessage.textContent =
      `LEVEL ${level} // KEEP GOING! ⚡`;
  }

  if (xpText) {
    xpText.textContent = `XP: ${xp} / ${xpNeeded}`;
  }

  if (xpBar) {
    xpBar.style.width = `${(xp / xpNeeded) * 100}%`;
  }
}

/* SAVE XP AND QUEST PROGRESS */

function saveProgress() {
  localStorage.setItem(XP_STORAGE_KEY, String(totalXP));

  const questProgress = Array.from(questCheckboxes).map(
    (checkbox) => checkbox.checked
  );

  localStorage.setItem(
    QUEST_STORAGE_KEY,
    JSON.stringify(questProgress)
  );
}


/* LEVEL-UP NOTIFICATION */

function showLevelUpNotification(level) {
  // Remove an older notification if one is still visible.
  document.querySelector(".level-up-toast")?.remove();

  // Create the notification.
  const toast = document.createElement("div");
  toast.className = "level-up-toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");

  const title = document.createElement("p");
  title.className = "level-up-toast-title";
  title.textContent = "✦ LEVEL UP ACHIEVED ✦";

  const message = document.createElement("p");
  message.className = "level-up-toast-message";
  message.textContent = `LEVEL ${level} UNLOCKED`;

  const subtitle = document.createElement("p");
  subtitle.className = "level-up-toast-subtitle";
  subtitle.textContent = "Your journey continues. Keep pushing forward!";

  toast.append(title, message, subtitle);
  document.body.appendChild(toast);

  // Glow the existing XP panel.
  const xpPanel = document.querySelector(".level-panel");

  if (xpPanel) {
    xpPanel.classList.remove("level-up-glow");

    // Restart the animation if the panel glowed recently.
    void xpPanel.offsetWidth;

    xpPanel.classList.add("level-up-glow");

    setTimeout(() => {
      xpPanel.classList.remove("level-up-glow");
    }, 1000);
  }

  // Animate the notification away after a short delay.
  setTimeout(() => {
    if (!toast.isConnected) return;

    toast.style.animation = "levelUpExit 0.3s ease-in forwards";

    setTimeout(() => {
      toast.remove();
    }, 320);
  }, 3200);
}


/* ADD OR REMOVE XP */

function changeXP(amount) {
  const previousLevel = Math.floor(totalXP / xpNeeded) + 1;

  totalXP = Math.max(0, totalXP + amount);

  const newLevel = Math.floor(totalXP / xpNeeded) + 1;

  saveProgress();
  updateXPDisplay();

  if (newLevel > previousLevel) {
    showLevelUpNotification(newLevel);
  }
}

/* LEVEL UP BUTTON */


if (levelButton) {
  levelButton.addEventListener("click", () => {
    changeXP(25);
  });
}

/* EXPANDABLE QUEST OBJECTIVES */

document.querySelectorAll(".quest-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".quest-card");
    const details = card.querySelector(".quest-details");

    const isExpanded =
      button.getAttribute("aria-expanded") === "true";

    button.setAttribute("aria-expanded", String(!isExpanded));
    details.hidden = isExpanded;

    const expandLabel =
      button.querySelector(".quest-expand-label");

    expandLabel.textContent = isExpanded
      ? "VIEW OBJECTIVES"
      : "HIDE OBJECTIVES";
  });
});

/* QUEST COMPLETION REWARDS */

questCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      changeXP(questReward);
    } else {
      changeXP(-questReward);
    }
  });
});

/* INITIAL DISPLAY */

updateXPDisplay();
