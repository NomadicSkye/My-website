
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

  // Update the XP progress bar.
  const currentLevelXP = totalXP % xpNeeded;
  const progressPercent = (currentLevelXP / xpNeeded) * 100;

  const progressFill = document.getElementById("xp-progress-fill");
  const progressText = document.getElementById("xp-progress-text");
  const progressBar = document.getElementById("xp-progress-bar");

  if (progressFill) {
    progressFill.style.width = `${progressPercent}%`;
  }

  if (progressText) {
    progressText.textContent = `${currentLevelXP} / ${xpNeeded} XP`;
  }

  if (progressBar) {
    progressBar.setAttribute("aria-valuenow", currentLevelXP);
  }

  // Update the floating XP bar.
  const floatingLevel = document.getElementById("floating-xp-level");
  const floatingText = document.getElementById("floating-xp-text");
  const floatingFill = document.getElementById("floating-xp-fill");

  if (floatingLevel) {
    floatingLevel.textContent = `LEVEL ${level}`;
  }

  if (floatingText) {
    floatingText.textContent = `${xp} / ${xpNeeded} XP`;
  }

  if (floatingFill) {
    floatingFill.style.width = `${(xp / xpNeeded) * 100}%`;
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


/* XP GAIN POP-UP */

function showXPGain(amount) {
  if (amount <= 0) return;

  const popup = document.createElement("div");
  popup.className = "xp-gain-popup";
  popup.textContent = `✦ +${amount} XP`;

  popup.setAttribute("role", "status");
  popup.setAttribute("aria-live", "polite");

  document.body.appendChild(popup);

  setTimeout(() => {
    popup.remove();
  }, 1500);
}

function changeXP(amount) {
  const previousLevel = Math.floor(totalXP / xpNeeded) + 1;

  totalXP = Math.max(0, totalXP + amount);
  if (amount > 0) {
  showXPGain(amount);
}

  const newLevel = Math.floor(totalXP / xpNeeded) + 1;

  saveProgress();
  updateXPDisplay();
  checkAchievements();

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


/* QUEST COMPLETION CELEBRATION */

function celebrateQuestCompletion(checkboxes) {
  if (!checkboxes.length) return;

  // Find the card containing this quest's objectives.
  const questCard = checkboxes[0].closest(".quest-card");
  if (!questCard) return;

  // Avoid displaying duplicate banners.
  if (questCard.querySelector(".quest-complete-banner")) return;

  questCard.classList.add("quest-complete-glow");

  const banner = document.createElement("div");
  banner.className = "quest-complete-banner";
  banner.textContent = "✦ QUEST COMPLETE! ✦";
  banner.setAttribute("role", "status");

  questCard.appendChild(banner);
}


/* UPDATE QUEST STATISTICS */

function updateQuestStats() {
  const questCards = Array.from(
    document.querySelectorAll(".quest-card")
  );

  const totalQuests = questCards.length;
  let completedQuests = 0;
  let completedObjectives = 0;
  let totalObjectives = 0;

  questCards.forEach((card) => {
    const checkboxes = Array.from(
      card.querySelectorAll('input[type="checkbox"]')
    );

    totalObjectives += checkboxes.length;

    const completed = checkboxes.filter(
      (checkbox) => checkbox.checked
    ).length;

    completedObjectives += completed;

    if (checkboxes.length > 0 && completed === checkboxes.length) {
      completedQuests++;
    }
  });

  const percentage = totalObjectives > 0
    ? Math.round((completedObjectives / totalObjectives) * 100)
    : 0;

  const questsDisplay = document.getElementById("quests-completed");
  const objectivesDisplay = document.getElementById("objectives-completed");
  const percentageDisplay = document.getElementById("quest-completion-percent");
  const progressFill = document.getElementById("quest-stats-fill");

  if (questsDisplay) {
    questsDisplay.textContent = `${completedQuests} / ${totalQuests}`;
  }

  if (objectivesDisplay) {
    objectivesDisplay.textContent =
      `${completedObjectives} / ${totalObjectives}`;
  }

  if (percentageDisplay) {
    percentageDisplay.textContent = `${percentage}%`;
  }

  if (progressFill) {
    progressFill.style.width = `${percentage}%`;
  }
}


/* ACHIEVEMENT SYSTEM */

const achievementDefinitions = [
  {
    id: "first-steps",
    icon: "👣",
    name: "First Steps",
    description: "Complete your first objective.",
    condition: () =>
      Array.from(
        document.querySelectorAll(
          '.quest-card input[type="checkbox"]'
        )
      ).some((checkbox) => checkbox.checked)
  },
  {
    id: "quest-hunter",
    icon: "🏆",
    name: "Quest Hunter",
    description: "Complete an entire quest.",
    condition: () =>
      Array.from(
        document.querySelectorAll(".quest-card")
      ).some((card) => {
        const boxes = Array.from(
          card.querySelectorAll('input[type="checkbox"]')
        );
        return boxes.length === 3 &&
          boxes.every((box) => box.checked);
      })
  },
  {
    id: "rising-developer",
    icon: "⚡",
    name: "Rising Developer",
    description: "Reach Level 5.",
    condition: () =>
      Math.floor(totalXP / xpNeeded) + 1 >= 5
  },
  {
    id: "completionist",
    icon: "👑",
    name: "Completionist",
    description: "Complete every quest objective.",
    condition: () => {
      const boxes = Array.from(
        document.querySelectorAll(
          '.quest-card input[type="checkbox"]'
        )
      );
      return boxes.length > 0 &&
        boxes.every((box) => box.checked);
    }
  }
];

function getUnlockedAchievements() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("unlockedAchievements") || "[]"
    );

    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function renderAchievements() {
  const grid = document.getElementById("achievement-grid");
  if (!grid) return;

  const unlocked = getUnlockedAchievements();

  grid.innerHTML = achievementDefinitions.map((achievement) => {
    const isUnlocked = unlocked.includes(achievement.id);

    return `
      <div class="achievement-card ${isUnlocked ? "unlocked" : ""}">
        <span class="achievement-icon">${achievement.icon}</span>
        <div>
          <p class="achievement-name">${achievement.name}</p>
          <p class="achievement-description">${achievement.description}</p>
          <div class="achievement-status">
            ${isUnlocked ? "✓ UNLOCKED" : "🔒 LOCKED"}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function checkAchievements() {
  const unlocked = getUnlockedAchievements();
  let changed = false;

  achievementDefinitions.forEach((achievement) => {
    if (
      !unlocked.includes(achievement.id) &&
      achievement.condition()
    ) {
      unlocked.push(achievement.id);
      changed = true;

      const toast = document.createElement("div");
      toast.className = "achievement-toast";
      toast.textContent =
        `🏆 ACHIEVEMENT UNLOCKED: ${achievement.name}!`;

      document.body.appendChild(toast);

      setTimeout(() => toast.remove(), 2500);
    }
  });

  if (changed) {
    localStorage.setItem(
      "unlockedAchievements",
      JSON.stringify(unlocked)
    );
  }

  renderAchievements();
}

/* RESTORE COMPLETED QUESTS */

function restoreCompletedQuests() {
  const questCards = document.querySelectorAll(".quest-card");

  questCards.forEach((questCard) => {
    const checkboxes = Array.from(
      questCard.querySelectorAll('input[type="checkbox"]')
    );

    const allComplete =
      checkboxes.length === 3 &&
      checkboxes.every((checkbox) => checkbox.checked);

    if (allComplete) {
      celebrateQuestCompletion(checkboxes);
    }
  });
}

restoreCompletedQuests();

/* QUEST COMPLETION REWARDS */

questCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      changeXP(questReward);
    } else {
      changeXP(-questReward);
    }

    // Find the objectives belonging to this quest.
    const questCard = checkbox.closest(".quest-card");

    if (!questCard) return;

    const checkboxesInQuest = Array.from(
      questCard.querySelectorAll('input[type="checkbox"]')
    );

    const allComplete =
      checkboxesInQuest.length === 3 &&
      checkboxesInQuest.every((item) => item.checked);

    if (allComplete) {
      celebrateQuestCompletion(checkboxesInQuest);
    } else {
      questCard.classList.remove("quest-complete-glow");
      questCard.querySelector(".quest-complete-banner")?.remove();
    }updateQuestStats();
    checkAchievements();
  });
  });


/* INITIAL DISPLAY */

updateXPDisplay();

updateQuestStats();
