document.addEventListener("DOMContentLoaded", () => {
  // Security Sanitizer (Prevents DOM Cross-Site Scripting (XSS))
  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Google Sheets integration configurations
  // 1. Student Registration Web App URL (Old/Original Settings)
  const REGISTRATION_SHEET_URL = "https://script.google.com/macros/s/AKfycbziLjxRfWxV3J2yTiN177B241LwBXnTexvpFErpfBSydWrQWrCsbRoBv-drvAjdh7Oexg/exec";

  // 2. Dedicated Event Management Web App URL (Schedules, Event Names, Categories from Google Sheets)
  const EVENT_MGMT_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby1LjaGIgQhQxhvAwLjX-04dB7JdXb3A1FwuhYs46bE41hKPJ6ngObyibVmLgMYthB2/exec";
  const GOOGLE_SHEET_DRIVE_URL = "https://docs.google.com/spreadsheets";

  // Initialize Lucide Icons
  lucide.createIcons();

  // App Navigation Screens & Tabs
  const screens = {
    home: document.getElementById("screen-home"),
    categories: document.getElementById("screen-categories"),
    detail: document.getElementById("screen-detail"),
    schedule: document.getElementById("screen-schedule"),
    register: document.getElementById("screen-register"),
    confirmation: document.getElementById("screen-confirmation"),
    contact: document.getElementById("screen-contact"),
    adminLogin: document.getElementById("screen-admin-login"),
    admin: document.getElementById("screen-admin")
  };

  const tabs = {
    home: document.getElementById("tab-home"),
    categories: document.getElementById("tab-events"),
    schedule: document.getElementById("tab-schedule"),
    register: document.getElementById("tab-register"),
    contact: document.getElementById("tab-contact")
  };

  const adminTabs = document.querySelectorAll(".admin-tab");
  const adminSections = {
    sql: document.getElementById("admin-sec-sql"),
    events: document.getElementById("admin-sec-events"),
    schedule: document.getElementById("admin-sec-schedule"),
    categories: document.getElementById("admin-sec-categories")
  };

  // LocalStorage Persistence Keys
  const STORAGE_KEYS = {
    EVENTS: "triquetra_events_db_v1",
    CATEGORIES: "triquetra_categories_db_v1",
    SCHEDULE: "triquetra_schedule_db_v1",
    REGISTRATIONS: "triquetra_registrations_db_v1"
  };

  // Default Mock SQL Database state
  const DEFAULT_REGISTRATIONS_DB = [
    { id: 1, name: "Karan Sharma", registerNumber: "511122104015", department: "AI&DS", year: "III", event: "Tech Talk", receipt: "TQ26-1001", status: "Registered", timestamp: "27 Aug 2026, 08:30 PM" },
    { id: 2, name: "Arthi Murali", registerNumber: "511122104003", department: "AI&DS", year: "III", event: "Tech Talk", receipt: "TQ26-1002", status: "Registered", timestamp: "27 Aug 2026, 08:45 PM" },
    { id: 3, name: "Deepak Raj", registerNumber: "511121104008", department: "CSBS", year: "IV", event: "Cognify", receipt: "TQ26-1003", status: "Registered", timestamp: "27 Aug 2026, 09:00 PM" },
    { id: 4, name: "Sneha V", registerNumber: "511123104022", department: "IT", year: "II", event: "Tech Talk", receipt: "TQ26-1004", status: "Registered", timestamp: "27 Aug 2026, 09:15 PM" }
  ];

  // Default Core Events Details Database (Synced with Google Sheets)
  const DEFAULT_EVENTS_DB = {
    "Tech Talk": {
      name: "Tech Talk",
      category: "Technical",
      date: "28-08-2026",
      time: "3:00PM to 4:30PM",
      venue: "AI & DS - AI&DS Lab, IT - IT Lab, CSBS - CSBS Lab",
      teamSize: "Individual",
      fee: "Free",
      desc: "Think Fast. Speak Smart. Make an Impact. Tech Talk — Where ideas meet confidence and communication.",
      about: "Tech Talk is an individual presentation event designed to test participants’ ability to think quickly, analyze unfamiliar topics, and communicate their ideas effectively. Participants will receive a topic randomly on the spot, prepare within a limited time, and present their views before the judges. The event emphasizes knowledge, logical thinking, clarity, confidence, and effective communication.",
      rules: [
        "Individual participation only.",
        "Topics will be assigned randomly on the spot.",
        "Participants will be given limited time to analyze and prepare.",
        "Each participant must present within the allotted time.",
        "Content must be relevant to the assigned topic.",
        "Participants should communicate clearly and confidently.",
        "Use of inappropriate or offensive content is strictly prohibited.",
        "Winners will be selected based on content relevance, clarity, and communication.",
        "Judges’ decision will be final."
      ]
    },
    Cognify: {
      name: "Cognify",
      category: "Technical",
      date: "27-08-2026",
      time: "3:00PM - 4:30PM",
      venue: "AI&DS Lab",
      teamSize: "Individual",
      fee: "Free",
      desc: "Put your analytical problem-solving and cognitive intelligence to the test in this technical challenge.",
      about: "Cognify challenges participants across algorithmic problem-solving, cognitive reasoning, and fast-paced technological aptitude rounds.",
      rules: [
        "Individual participation only.",
        "Strict adherence to event schedule and time limits.",
        "Judges' evaluation is final and binding."
      ]
    }
  };

  // Default Event Schedule Database (Synced with Google Sheets)
  const DEFAULT_SCHEDULE_DB = {
    "27-08-2026": [
      { id: 2137, time: "3:00PM - 4:30PM", event: "Cognify", loc: "AI&DS Lab", icon: "code" }
    ],
    "28-08-2026": [
      { id: 7352, time: "3:00PM to 4:30PM", event: "Tech Talk", loc: "AI & DS - AI&DS Lab, IT - IT Lab, CSBS - CSBS Lab", icon: "lightbulb" }
    ]
  };

  // Default Event Categories Database (Synced with Google Sheets)
  const DEFAULT_CATEGORIES_DB = {
    Technical: { id: "cat-technical", name: "Technical", desc: "Technical symposium events and tech talks", icon: "code" },
    "Non-Technical": { id: "cat-non-technical", name: "Non-Technical", desc: "Managerial and business tasks", icon: "briefcase" }
  };

  // Safe LocalStorage Loader Helper
  function loadStoredDb(key, defaultValue) {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null && stored !== undefined) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Could not load from localStorage for key:", key, e);
    }
    return JSON.parse(JSON.stringify(defaultValue));
  }

  // Safe LocalStorage Saver Helper
  function saveStoredDb(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn("Could not save to localStorage for key:", key, e);
    }
  }

  // Initialize Databases from LocalStorage (or Fallback to Defaults)
  let registrationsDb = loadStoredDb(STORAGE_KEYS.REGISTRATIONS, DEFAULT_REGISTRATIONS_DB);
  let eventsDb = loadStoredDb(STORAGE_KEYS.EVENTS, DEFAULT_EVENTS_DB);
  let scheduleDb = loadStoredDb(STORAGE_KEYS.SCHEDULE, DEFAULT_SCHEDULE_DB);
  let categoriesDb = loadStoredDb(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES_DB);

  // ================= GOOGLE CLOUD EVENT MANAGEMENT SYNC ENGINE =================
  function sendCloudAction(action, payload) {
    if (!EVENT_MGMT_SCRIPT_URL || EVENT_MGMT_SCRIPT_URL === "YOUR_DEPLOYED_WEB_APP_URL_HERE") return;
    try {
      const dataStr = (typeof payload === "object") ? JSON.stringify(payload) : String(payload);
      
      // 1. Send via GET query parameter (Instant across mobile and web)
      const url = `${EVENT_MGMT_SCRIPT_URL}?action=${encodeURIComponent(action)}&data=${encodeURIComponent(dataStr)}&_t=${Date.now()}`;
      fetch(url, { method: "GET", mode: "no-cors" })
        .then(() => console.log(`[Event Management Cloud Sync GET] '${action}' synced to Google Sheets.`))
        .catch(() => {});

      // 2. Also send via Hidden Form POST to hidden iframe (Transmits large payloads without 302 redirect body-drops)
      let hiddenIframe = document.getElementById("gscript-sync-iframe");
      if (!hiddenIframe) {
        hiddenIframe = document.createElement("iframe");
        hiddenIframe.id = "gscript-sync-iframe";
        hiddenIframe.name = "gscript-sync-iframe";
        hiddenIframe.style.display = "none";
        document.body.appendChild(hiddenIframe);
      }

      const syncForm = document.createElement("form");
      syncForm.method = "POST";
      syncForm.action = EVENT_MGMT_SCRIPT_URL;
      syncForm.target = "gscript-sync-iframe";
      syncForm.style.display = "none";

      const actionInput = document.createElement("input");
      actionInput.type = "hidden";
      actionInput.name = "action";
      actionInput.value = action;
      syncForm.appendChild(actionInput);

      const dataInput = document.createElement("input");
      dataInput.type = "hidden";
      dataInput.name = "data";
      dataInput.value = dataStr;
      syncForm.appendChild(dataInput);

      document.body.appendChild(syncForm);
      syncForm.submit();
      setTimeout(() => {
        if (syncForm.parentNode) syncForm.parentNode.removeChild(syncForm);
      }, 3000);

    } catch (e) {
      console.warn("[Event Management Cloud Sync Exception]:", e);
    }
  }

  // Database Persistence Sync Helpers (Saves to both Local Cache & Google Cloud)
  function persistRegistrationsDb() {
    saveStoredDb(STORAGE_KEYS.REGISTRATIONS, registrationsDb);
  }

  function persistEventsDb() {
    saveStoredDb(STORAGE_KEYS.EVENTS, eventsDb);
    sendCloudAction("save_events", eventsDb);
  }

  function persistScheduleDb() {
    saveStoredDb(STORAGE_KEYS.SCHEDULE, scheduleDb);
    sendCloudAction("save_schedule", scheduleDb);
  }

  function persistCategoriesDb() {
    saveStoredDb(STORAGE_KEYS.CATEGORIES, categoriesDb);
    sendCloudAction("save_categories", categoriesDb);
  }

  // Global Cloud Initializer (Fetches live event management data directly from Google Sheets on load)
  function fetchCloudData() {
    if (!EVENT_MGMT_SCRIPT_URL || EVENT_MGMT_SCRIPT_URL === "YOUR_DEPLOYED_WEB_APP_URL_HERE") return;

    const callbackName = "triquetraCloudCallback_" + Date.now();
    window[callbackName] = function(cloudData) {
      try {
        delete window[callbackName];
      } catch (e) {
        window[callbackName] = undefined;
      }

      if (cloudScript && cloudScript.parentNode) {
        cloudScript.parentNode.removeChild(cloudScript);
      }

      if (cloudData && cloudData.status === "success") {
        let hasUpdates = false;

        if (cloudData.categories && typeof cloudData.categories === "object") {
          categoriesDb = cloudData.categories;
          saveStoredDb(STORAGE_KEYS.CATEGORIES, categoriesDb);
          hasUpdates = true;
        }

        if (cloudData.events && typeof cloudData.events === "object") {
          eventsDb = cloudData.events;
          saveStoredDb(STORAGE_KEYS.EVENTS, eventsDb);
          hasUpdates = true;
        }

        if (cloudData.schedule && typeof cloudData.schedule === "object") {
          scheduleDb = cloudData.schedule;
          saveStoredDb(STORAGE_KEYS.SCHEDULE, scheduleDb);
          hasUpdates = true;
        }

        if (cloudData.registrations && Array.isArray(cloudData.registrations) && cloudData.registrations.length > 0) {
          cloudData.registrations.forEach(cloudReg => {
            const exists = registrationsDb.some(r => (r.receipt && r.receipt === cloudReg.receipt) || (r.registerNumber === cloudReg.registerNumber && r.event === cloudReg.event));
            if (!exists) {
              registrationsDb.push(cloudReg);
            }
          });
          persistRegistrationsDb();
          hasUpdates = true;
        }

        if (hasUpdates) {
          const availEvts = Object.keys(eventsDb);
          if (!eventsDb[appState.registration.selectedEvent] && availEvts.length > 0) {
            appState.registration.selectedEvent = availEvts[0];
          }

          const availDays = Object.keys(scheduleDb);
          if (!scheduleDb[appState.selectedDate] && availDays.length > 0) {
            appState.selectedDate = availDays[0];
          }

          renderCategoryCards();
          populateCategoryOptions();
          populateEventDropdown();
          renderRegistrationEventCard(appState.registration.selectedEvent);
          renderEventDetails(appState.registration.selectedEvent);
          renderScheduleTabs();
          filterTimeline(appState.selectedDate);
          populateExportEventDropdown();

          if (appState.isAdminAuthenticated) {
            refreshAdminData();
          }
          console.log("[Triquetra Cloud] Live Event Management data loaded from Google Sheets!");
        }
      }
    };

    const cloudScript = document.createElement("script");
    cloudScript.src = `${EVENT_MGMT_SCRIPT_URL}?action=get_data&callback=${callbackName}&_t=${Date.now()}`;
    cloudScript.onerror = function() {
      console.warn("[Triquetra Cloud] Fallback to cached store (Offline/First run).");
      if (cloudScript && cloudScript.parentNode) {
        cloudScript.parentNode.removeChild(cloudScript);
      }
    };
    document.body.appendChild(cloudScript);
  }

  // Active State (Restores admin session from sessionStorage)
  let appState = {
    currentScreen: "home",
    selectedDate: "27-08-2026",
    selectedCategory: "Technical",
    isAdminAuthenticated: (typeof window !== "undefined" && window.sessionStorage && sessionStorage.getItem("triquetra_admin_auth") === "true"),
    registration: {
      fullName: "",
      registerNumber: "",
      selectedEvent: "Tech Talk",
      dept: "",
      year: "",
      agreeRules: false
    }
  };

  // Screen Transition Controller
  function navigateTo(screenId) {
    if (!screens[screenId]) return;

    // Guard admin screen
    if (screenId === "admin" && !appState.isAdminAuthenticated) {
      screenId = "adminLogin";
    }

    // Remove active class from all screens
    Object.keys(screens).forEach(key => {
      if (screens[key]) screens[key].classList.remove("active");
    });

    // Add active class to target screen
    screens[screenId].classList.add("active");
    
    appState.currentScreen = screenId;

    // Update URL hash smoothly
    try {
      if (window.location.hash !== "#" + screenId) {
        history.replaceState ? history.replaceState(null, null, "#" + screenId) : (window.location.hash = screenId);
      }
    } catch (e) {}

    // Scroll page body or container to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const viewWrapper = document.getElementById("app-content-wrapper");
    if (viewWrapper) viewWrapper.scrollTop = 0;

    // Update Bottom Nav active indicator
    Object.keys(tabs).forEach(key => {
      if (tabs[key]) tabs[key].classList.remove("active");
    });
    
    // Highlight relevant bottom tab (if any matches)
    if (screenId === "home" && tabs.home) tabs.home.classList.add("active");
    else if ((screenId === "categories" || screenId === "detail") && tabs.categories) tabs.categories.classList.add("active");
    else if (screenId === "schedule" && tabs.schedule) tabs.schedule.classList.add("active");
    else if (screenId === "register" && tabs.register) tabs.register.classList.add("active");
    else if (screenId === "contact" && tabs.contact) tabs.contact.classList.add("active");

    // Dynamic Header Title Updates
    const headerTitle = document.getElementById("header-title");
    if (headerTitle) {
      if (screenId === "detail") {
        headerTitle.textContent = "EVENT DETAIL";
      } else if (screenId === "register") {
        headerTitle.textContent = "REGISTER";
      } else if (screenId === "confirmation") {
        headerTitle.textContent = "CONFIRMED";
        renderConfirmationDetails();
      } else if (screenId === "admin" || screenId === "adminLogin") {
        headerTitle.textContent = "ADMIN PANEL";
      } else {
        headerTitle.textContent = "TRIQUETRA";
      }
    }

    // Refresh icons on screen navigation
    if (typeof lucide !== "undefined" && lucide.createIcons) {
      lucide.createIcons();
    }
  }

  // Bind Bottom Nav Tabs
  if (tabs.home) tabs.home.addEventListener("click", () => navigateTo("home"));
  if (tabs.categories) tabs.categories.addEventListener("click", () => navigateTo("categories"));
  if (tabs.schedule) tabs.schedule.addEventListener("click", () => navigateTo("schedule"));
  if (tabs.register) tabs.register.addEventListener("click", () => navigateTo("register"));
  if (tabs.contact) tabs.contact.addEventListener("click", () => navigateTo("contact"));

  // Open Admin Workspace & switch to a specific section
  function openAdminSection(secName) {
    if (appState.isAdminAuthenticated) {
      navigateTo("admin");
      refreshAdminData();
      if (adminTabs && adminSections) {
        adminTabs.forEach(t => {
          if (t.getAttribute("data-section") === secName) {
            t.classList.add("active");
          } else {
            t.classList.remove("active");
          }
        });
        Object.keys(adminSections).forEach(key => {
          if (adminSections[key]) {
            adminSections[key].style.display = (key === secName) ? "block" : "none";
          }
        });
      }
    } else {
      navigateTo("adminLogin");
    }
  }

  // Header Admin Button click navigation (Direct to panel if logged in, else login page)
  const btnAdminPortal = document.getElementById("btn-admin-portal");
  if (btnAdminPortal) {
    btnAdminPortal.addEventListener("click", () => {
      openAdminSection("sql");
    });
  }

  // Quick Manage Categories Button on Screen 2
  const btnQuickManageCats = document.getElementById("btn-quick-manage-cats");
  if (btnQuickManageCats) {
    btnQuickManageCats.addEventListener("click", () => {
      openAdminSection("categories");
    });
  }

  // Bind Buttons inside Screens
  const exploreBtn = document.getElementById("btn-explore-events");
  if (exploreBtn) {
    exploreBtn.addEventListener("click", () => navigateTo("categories"));
  }

  const registerNowBtn = document.getElementById("btn-register-now");
  if (registerNowBtn) {
    registerNowBtn.addEventListener("click", () => navigateTo("register"));
  }

  const backHomeBtn = document.getElementById("btn-back-to-home");
  if (backHomeBtn) {
    backHomeBtn.addEventListener("click", () => {
      resetForm();
      navigateTo("home");
    });
  }

  // Render and Bind Date Tabs/Pills dynamically from scheduleDb
  function renderScheduleTabs() {
    const tabsContainer = document.querySelector(".date-tabs-container");
    if (!tabsContainer) return;

    tabsContainer.innerHTML = "";
    const days = Object.keys(scheduleDb);
    
    if (days.length === 0) {
      tabsContainer.innerHTML = "<div style='color:var(--text-gray); font-size:0.8rem;'>No schedule days configured.</div>";
      return;
    }

    if (!days.includes(appState.selectedDate)) {
      appState.selectedDate = days[0];
    }

    days.forEach(day => {
      const pill = document.createElement("div");
      pill.className = "date-pill";
      if (day === appState.selectedDate) {
        pill.classList.add("active");
      }
      pill.textContent = day;
      
      pill.addEventListener("click", () => {
        const allPills = tabsContainer.querySelectorAll(".date-pill");
        allPills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        
        appState.selectedDate = day;
        filterTimeline(day);
      });
      
      tabsContainer.appendChild(pill);
    });
  }

  // Populate registration event select dropdown
  function populateEventDropdown() {
    const selectEl = document.getElementById("reg-event-select");
    if (!selectEl) return;
    
    selectEl.innerHTML = "";
    Object.keys(eventsDb).forEach(key => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = `${eventsDb[key].name} (${eventsDb[key].category})`;
      selectEl.appendChild(option);
    });
    
    if (eventsDb[appState.registration.selectedEvent]) {
      selectEl.value = appState.registration.selectedEvent;
    } else {
      const firstKey = Object.keys(eventsDb)[0] || "";
      appState.registration.selectedEvent = firstKey;
      if (firstKey) selectEl.value = firstKey;
    }

    if (typeof populateExportEventDropdown === "function") {
      populateExportEventDropdown();
    }
  }

  // Render registration event card summary info
  function renderRegistrationEventCard(eventName) {
    const activeEvent = eventName || appState.registration.selectedEvent || Object.keys(eventsDb)[0];
    const data = eventsDb[activeEvent];
    const formCard = document.querySelector(".event-summary-card .event-summary-info");
    if (formCard && data) {
      formCard.innerHTML = `
        <div class="event-summary-title-row">
          <span class="event-summary-title">${escapeHtml(data.name)}</span>
          <span class="event-summary-tag">${escapeHtml(data.category)}</span>
        </div>
        <div class="event-summary-specs">
          <div class="event-summary-spec-item"><i data-lucide="calendar"></i><span>${escapeHtml(data.date)}</span></div>
          <div class="event-summary-spec-item"><i data-lucide="map-pin"></i><span>${escapeHtml(data.venue)}</span></div>
          <div class="event-summary-spec-item"><i data-lucide="clock"></i><span>${escapeHtml(data.time)}</span></div>
          <div class="event-summary-spec-item"><i data-lucide="users"></i><span>${escapeHtml(data.teamSize)}</span></div>
        </div>
      `;
    }

    // Update Fee Display
    const feeAmount = document.querySelector(".fee-amount");
    if (feeAmount && data) {
      feeAmount.textContent = data.fee || "Free";
    }

    lucide.createIcons();
  }

  // Render event details dynamically based on selected event
  function renderEventDetails(eventName) {
    let activeKey = eventName || appState.registration.selectedEvent;
    if (!eventsDb[activeKey]) {
      activeKey = Object.keys(eventsDb)[0] || "";
    }
    const data = eventsDb[activeKey];

    // 1. Breadcrumb
    const breadcrumbCat = document.getElementById("detail-breadcrumb-cat");
    if (breadcrumbCat) breadcrumbCat.textContent = (data && data.name) || activeKey || "Event";
    
    const breadcrumbLink = document.getElementById("breadcrumb-category-link");
    if (breadcrumbLink) {
      breadcrumbLink.textContent = "All Events";
      breadcrumbLink.onclick = () => navigateTo("categories");
    }

    // 2. All Events Switcher (Pills)
    const switcher = document.getElementById("category-events-switcher");
    if (switcher) {
      switcher.innerHTML = "";
      const allKeys = Object.keys(eventsDb);

      if (allKeys.length > 1) {
        switcher.style.display = "flex";
        allKeys.forEach(key => {
          const pill = document.createElement("button");
          pill.type = "button";
          pill.className = `evt-pill ${key === activeKey ? 'active' : ''}`;
          pill.textContent = eventsDb[key].name;
          pill.addEventListener("click", () => {
            appState.registration.selectedEvent = key;
            renderEventDetails(key);
          });
          switcher.appendChild(pill);
        });
      } else {
        switcher.style.display = "none";
      }
    }

    // If event exists
    if (data) {
      // Category Tag
      const bannerTag = document.getElementById("detail-banner-tag");
      if (bannerTag) {
        const tagText = document.getElementById("detail-tag-text");
        if (tagText) tagText.textContent = data.category || "Event";
        else bannerTag.textContent = data.category || "Event";
      }

      // Title & Tagline
      const titleEl = document.getElementById("detail-title");
      if (titleEl) titleEl.textContent = data.name;

      const descEl = document.getElementById("detail-desc");
      if (descEl) descEl.textContent = data.desc || `Participate in ${data.name} and demonstrate your technical and creative skills.`;

      // About
      const aboutEl = document.getElementById("detail-about");
      if (aboutEl) {
        aboutEl.textContent = data.about || `${data.name} is one of the premier events at Triquetra 2026. Review the rules and format, prepare your tools, and register early to secure your spot.`;
      }

      // Rules List - Structured & Numbered Premium Format
      const rulesList = document.getElementById("detail-rules-list");
      if (rulesList) {
        rulesList.innerHTML = "";
        let rulesArr = [];
        if (Array.isArray(data.rules)) {
          rulesArr = data.rules;
        } else if (typeof data.rules === "string" && data.rules.trim()) {
          rulesArr = data.rules.split("\n").map(r => r.trim()).filter(Boolean);
        }
        if (rulesArr.length === 0) {
          rulesArr = [
            "Participants must bring valid college identification cards.",
            "Decision of the judges and faculty coordinators will be final and binding.",
            "Any malpractice or violation of conduct will lead to immediate disqualification."
          ];
        }
        rulesArr.forEach((rule, idx) => {
          const ruleNum = String(idx + 1).padStart(2, "0");
          const item = document.createElement("div");
          item.className = "rule-item";
          item.innerHTML = `
            <div class="rule-num-badge">${ruleNum}</div>
            <div class="rule-content">
              <p class="rule-text">${escapeHtml(rule)}</p>
            </div>
          `;
          rulesList.appendChild(item);
        });
      }

      // Info Grid
      const infoGrid = document.getElementById("detail-info-grid");
      if (infoGrid) {
        infoGrid.innerHTML = `
          <div class="info-item">
            <div class="info-item-icon"><i data-lucide="calendar"></i></div>
            <div class="info-item-text">
              <span class="info-item-label">Date</span>
              <span class="info-item-value">${escapeHtml(data.date || 'TBA')}</span>
            </div>
          </div>
          <div class="info-item">
            <div class="info-item-icon"><i data-lucide="clock"></i></div>
            <div class="info-item-text">
              <span class="info-item-label">Time</span>
              <span class="info-item-value">${escapeHtml(data.time || 'TBA')}</span>
            </div>
          </div>
          <div class="info-item">
            <div class="info-item-icon"><i data-lucide="map-pin"></i></div>
            <div class="info-item-text">
              <span class="info-item-label">Venue</span>
              <span class="info-item-value">${escapeHtml(data.venue || 'Campus')}</span>
            </div>
          </div>
          <div class="info-item">
            <div class="info-item-icon"><i data-lucide="users"></i></div>
            <div class="info-item-text">
              <span class="info-item-label">Team Size</span>
              <span class="info-item-value">${escapeHtml(data.teamSize || '1 Member')}</span>
            </div>
          </div>
        `;
      }

      // Register Button handler
      const regBtn = document.getElementById("btn-register-now");
      if (regBtn) {
        regBtn.onclick = () => {
          appState.registration.selectedEvent = data.name;
          const selectEl = document.getElementById("reg-event-select");
          if (selectEl) selectEl.value = data.name;
          renderRegistrationEventCard(data.name);
          navigateTo("register");
        };
      }
    } else {
      const titleEl = document.getElementById("detail-title");
      if (titleEl) titleEl.textContent = `Event Not Found`;
      const descEl = document.getElementById("detail-desc");
      if (descEl) descEl.textContent = `Please select an event from the Events page.`;
      const aboutEl = document.getElementById("detail-about");
      if (aboutEl) aboutEl.textContent = "Check back soon or add events through the administrator console.";
      const rulesList = document.getElementById("detail-rules-list");
      if (rulesList) rulesList.innerHTML = "<div class='rule-item'><div class='rule-num-badge'>--</div><div class='rule-content'><p class='rule-text'>No rules specified for this event.</p></div></div>";
      const infoGrid = document.getElementById("detail-info-grid");
      if (infoGrid) infoGrid.innerHTML = "";
    }

    renderRegistrationEventCard(appState.registration.selectedEvent);
    lucide.createIcons();
  }

  function filterTimeline(date) {
    const scheduleList = document.getElementById("schedule-list");
    if (!scheduleList) return;

    scheduleList.innerHTML = "";
    const items = scheduleDb[date] || [];

    if (items.length === 0) {
      scheduleList.innerHTML = "<div style='text-align:center; padding: 2rem; color: var(--text-gray); font-size: 0.8rem;'>No events scheduled for this day.</div>";
      return;
    }

    items.forEach((item) => {
      const timelineItem = document.createElement("div");
      timelineItem.className = "timeline-item";
      timelineItem.innerHTML = `
        <div class="timeline-time">${escapeHtml(item.time)}</div>
        <div class="timeline-card">
          <div class="timeline-icon-chip">
            <i data-lucide="${escapeHtml(item.icon || 'calendar')}"></i>
          </div>
          <div class="timeline-details">
            <span class="timeline-event-name">${escapeHtml(item.event)}</span>
            <span class="timeline-event-loc">${escapeHtml(item.loc)}</span>
          </div>
        </div>
      `;
      scheduleList.appendChild(timelineItem);
    });

    lucide.createIcons();
  }

  // Get dynamic category event count - automatically computed from eventsDb
  function getCategoryEventCount(catName) {
    if (!catName) return 0;
    let count = 0;
    const target = catName.trim().toLowerCase();
    Object.keys(eventsDb).forEach(key => {
      const evtCat = (eventsDb[key].category || "").trim().toLowerCase();
      if (evtCat === target) {
        count++;
      }
    });
    return count;
  }

  // Render All Live Events Dynamically on the Events Screen
  function renderCategoryCards() {
    const container = document.getElementById("categories-list-container");
    if (!container) return;

    container.innerHTML = "";
    const eventKeys = Object.keys(eventsDb);

    if (eventKeys.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem; background: var(--card-white); border-radius: 20px; border: 1px dashed var(--border-color);">
          <i data-lucide="calendar" style="width:36px;height:36px; color:var(--text-light); margin-bottom:0.75rem;"></i>
          <h3 style="font-size:1.1rem; font-weight:800; color:var(--text-dark); margin-bottom:0.5rem;">No Events Listed Yet</h3>
          <p style="font-size:0.85rem; color:var(--text-gray);">Events configured by administrators will appear here in real-time.</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    eventKeys.forEach(key => {
      const evt = eventsDb[key];
      const card = document.createElement("div");
      card.className = "event-card";
      card.innerHTML = `
        <div>
          <div class="event-card-header">
            <h3 class="event-card-title">${escapeHtml(evt.name)}</h3>
            <span class="event-summary-tag">${escapeHtml(evt.category || 'Event')}</span>
          </div>
          <p class="event-card-desc">${escapeHtml(evt.desc || '')}</p>
        </div>

        <div>
          <div class="event-card-meta">
            <div class="event-card-meta-item">
              <i data-lucide="calendar"></i>
              <span>${escapeHtml(evt.date || 'TBA')}</span>
            </div>
            <div class="event-card-meta-item">
              <i data-lucide="clock"></i>
              <span>${escapeHtml(evt.time || 'TBA')}</span>
            </div>
            <div class="event-card-meta-item">
              <i data-lucide="map-pin"></i>
              <span>${escapeHtml(evt.venue || 'Campus')}</span>
            </div>
            <div class="event-card-meta-item">
              <i data-lucide="users"></i>
              <span>${escapeHtml(evt.teamSize || '1 Member')}</span>
            </div>
          </div>

          <div class="event-card-footer">
            <span class="event-card-fee">${escapeHtml(evt.fee || 'Free')}</span>
            <span class="event-card-btn">
              View Rules & Details <i data-lucide="arrow-right" style="width:14px;height:14px"></i>
            </span>
          </div>
        </div>
      `;

      card.addEventListener("click", () => {
        appState.registration.selectedEvent = key;
        renderEventDetails(key);
        navigateTo("detail");
      });

      container.appendChild(card);
    });

    lucide.createIcons();
  }

  // Initialize filters & data
  populateEventDropdown();
  renderRegistrationEventCard(appState.registration.selectedEvent);
  renderEventDetails(appState.registration.selectedEvent);
  renderScheduleTabs();
  renderCategoryCards();
  filterTimeline(appState.selectedDate || Object.keys(scheduleDb)[0] || "27-08-2026");
  populateExportEventDropdown();

  // Synchronize with live Google Cloud Database (Across all visitors & devices)
  fetchCloudData();

  // Handle URL Hash navigation on load and browser back/forward (e.g. #admin, #categories)
  function handleHashNavigation() {
    const rawHash = (window.location.hash || "").replace("#", "").trim();
    if (rawHash && screens[rawHash]) {
      if (rawHash === "admin") {
        if (appState.isAdminAuthenticated) {
          navigateTo("admin");
          refreshAdminData();
        } else {
          navigateTo("adminLogin");
        }
      } else {
        navigateTo(rawHash);
      }
    }
  }

  handleHashNavigation();
  window.addEventListener("hashchange", handleHashNavigation);

  // Configure spreadsheet link button href
  const sheetLinkBtn = document.getElementById("btn-google-sheets-link");
  if (sheetLinkBtn) {
    if (GOOGLE_SHEET_DRIVE_URL && GOOGLE_SHEET_DRIVE_URL !== "https://docs.google.com/spreadsheets/d/your-spreadsheet-id/edit") {
      sheetLinkBtn.href = GOOGLE_SHEET_DRIVE_URL;
    } else {
      sheetLinkBtn.href = "https://docs.google.com/spreadsheets";
    }
  }

  // Select Event Listener
  const regEventSelect = document.getElementById("reg-event-select");
  if (regEventSelect) {
    regEventSelect.addEventListener("change", (e) => {
      appState.registration.selectedEvent = e.target.value;
      renderRegistrationEventCard(e.target.value);
    });
  }

  // Registration Form Logic
  const formFields = {
    name: document.getElementById("reg-name"),
    registerNumber: document.getElementById("reg-num"),
    dept: document.getElementById("reg-dept"),
    year: document.getElementById("reg-year"),
    agree: document.getElementById("reg-agree"),
    btnPay: document.getElementById("btn-proceed-pay")
  };

  // Sync Input States to App State
  if (formFields.name) {
    formFields.name.addEventListener("input", (e) => {
      appState.registration.fullName = e.target.value.trim();
    });
  }

  if (formFields.registerNumber) {
    formFields.registerNumber.addEventListener("input", (e) => {
      appState.registration.registerNumber = e.target.value.trim();
    });
  }

  if (formFields.dept) {
    formFields.dept.addEventListener("change", (e) => {
      appState.registration.dept = e.target.value;
    });
  }

  if (formFields.year) {
    formFields.year.addEventListener("change", (e) => {
      appState.registration.year = e.target.value;
    });
  }

  if (formFields.agree) {
    formFields.agree.addEventListener("change", (e) => {
      appState.registration.agreeRules = e.target.checked;
    });
  }

  function resetForm() {
    if (formFields.name) formFields.name.value = "";
    if (formFields.registerNumber) formFields.registerNumber.value = "";
    if (formFields.dept) formFields.dept.value = "";
    if (formFields.year) formFields.year.value = "";
    if (formFields.agree) formFields.agree.checked = false;

    const defaultEvent = Object.keys(eventsDb)[0] || "CodeCraze";
    appState.registration = {
      fullName: "",
      registerNumber: "",
      selectedEvent: defaultEvent,
      dept: "",
      year: "",
      agreeRules: false
    };

    const selectEl = document.getElementById("reg-event-select");
    if (selectEl) {
      selectEl.value = defaultEvent;
    }
  }

  // Payment Proceed & Checkout Loading Simulator
  if (formFields.btnPay) {
    formFields.btnPay.addEventListener("click", (e) => {
      e.preventDefault();

      // Form validation & security sanitization
      const fullName = (appState.registration.fullName || "").trim();
      const regNum = (appState.registration.registerNumber || "").trim();
      const dept = (appState.registration.dept || "").trim();
      const year = (appState.registration.year || "").trim();

      if (!fullName || fullName.length < 2) {
        alert("Please enter a valid Full Name (at least 2 characters).");
        return;
      }
      if (fullName.length > 80) {
        alert("Name cannot exceed 80 characters.");
        return;
      }
      if (!regNum || regNum.length < 4 || regNum.length > 30) {
        alert("Please enter a valid Register Number (4 to 30 characters).");
        return;
      }
      if (!dept) {
        alert("Please select your Department.");
        return;
      }
      if (!year) {
        alert("Please select your Year.");
        return;
      }
      if (!appState.registration.agreeRules) {
        alert("You must agree to the event rules and guidelines to participate.");
        return;
      }

      // Generate Unique Registration Receipt ID for Triquetra 2026
      const receiptId = generateReceiptNumber();
      const formattedTimestamp = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      // Start Payment Simulation
      const paymentModal = document.getElementById("payment-modal");
      if (paymentModal) {
        paymentModal.style.display = "flex";

        const activeEventKey = appState.registration.selectedEvent || Object.keys(eventsDb)[0] || "CodeCraze";
        const eventName = eventsDb[activeEventKey] ? eventsDb[activeEventKey].name : activeEventKey;

        // Calculate next numerical ID
        const nextId = (registrationsDb && registrationsDb.length > 0)
          ? Math.max(...registrationsDb.map(r => parseInt(r.id, 10) || 0)) + 1
          : 1;

        // Create new Database record
        const newRecord = {
          id: nextId,
          name: fullName,
          registerNumber: regNum,
          department: dept,
          year: year,
          event: eventName,
          receipt: receiptId,
          timestamp: formattedTimestamp,
          status: "Registered"
        };

        // Cache last registration so page reload never clears receipt
        try {
          localStorage.setItem("tq26_last_registration", JSON.stringify(newRecord));
        } catch (e) {}

        // Set dynamic registration summary for Confirmation Screen immediately
        renderConfirmationDetails(newRecord);

        // Simulate Gateway Delay
        setTimeout(() => {
          // Push to database and persist to localStorage
          registrationsDb.push(newRecord);
          persistRegistrationsDb();
          
          // Google Sheets sync integration trigger (Using GET query parameters to prevent body drops on redirect)
          if (REGISTRATION_SHEET_URL && REGISTRATION_SHEET_URL !== "YOUR_DEPLOYED_WEB_APP_URL_HERE") {
            const queryParams = new URLSearchParams({
              id: newRecord.id,
              name: newRecord.name,
              registerNumber: newRecord.registerNumber,
              department: newRecord.department,
              year: newRecord.year,
              event: newRecord.event,
              receipt: newRecord.receipt,
              receiptId: newRecord.receipt,
              status: newRecord.status
            });
            fetch(`${REGISTRATION_SHEET_URL}?${queryParams.toString()}`, {
              method: "GET",
              mode: "no-cors"
            })
            .then(() => console.log("Student registration synced to Google Sheets successfully."))
            .catch(err => console.error("Student registration sync failed:", err));

            if (EVENT_MGMT_SCRIPT_URL && EVENT_MGMT_SCRIPT_URL !== REGISTRATION_SHEET_URL) {
              fetch(`${EVENT_MGMT_SCRIPT_URL}?${queryParams.toString()}`, {
                method: "GET",
                mode: "no-cors"
              }).catch(() => {});
            }
          }

          paymentModal.style.display = "none";
          navigateTo("confirmation");
        }, 1800);
      }
    });
  }

  // Dedicated generator for standardized, sequential, and unique Symposium Receipt Numbers
  function generateReceiptNumber() {
    let highest = 1000;
    (registrationsDb || []).forEach(r => {
      if (r && r.receipt) {
        const m = String(r.receipt).match(/\d+/g);
        if (m && m.length > 0) {
          const num = parseInt(m[m.length - 1], 10);
          if (num > highest) highest = num;
        }
      }
    });

    const storedCounter = parseInt(localStorage.getItem("tq26_receipt_counter") || "0", 10);
    if (storedCounter > highest) {
      highest = storedCounter;
    }

    const nextSeq = highest + 1;
    localStorage.setItem("tq26_receipt_counter", nextSeq.toString());
    return `TQ26-${nextSeq}`;
  }

  // Restore and render confirmation screen details dynamically from database/storage
  function renderConfirmationDetails(record) {
    let rec = record;
    if (!rec) {
      try {
        rec = JSON.parse(localStorage.getItem("tq26_last_registration") || "null");
      } catch (e) {
        rec = null;
      }
    }
    if (!rec && registrationsDb && registrationsDb.length > 0) {
      rec = registrationsDb[registrationsDb.length - 1];
    }
    if (rec) {
      const idEl = document.getElementById("conf-val-id");
      const nameEl = document.getElementById("conf-val-name");
      const regEl = document.getElementById("conf-val-reg-num");
      const deptEl = document.getElementById("conf-val-dept");
      const eventEl = document.getElementById("conf-val-event");
      const timeEl = document.getElementById("conf-val-time");

      if (idEl) idEl.textContent = rec.receipt || "TQ26-1001";
      if (nameEl) nameEl.textContent = rec.name || "-";
      if (regEl) regEl.textContent = rec.registerNumber || "-";
      if (deptEl) deptEl.textContent = `${rec.department || '-'} (${rec.year || '-'} Year)`;
      if (eventEl) eventEl.textContent = rec.event || "-";
      if (timeEl) timeEl.textContent = rec.timestamp || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    }
  }

  // Print / Save Receipt Button Action
  const btnPrintReceipt = document.getElementById("btn-print-receipt");
  if (btnPrintReceipt) {
    btnPrintReceipt.addEventListener("click", () => {
      window.print();
    });
  }

  // ================= ADMIN CONSOLE LOGIN AUTHENTICATION =================
  const formAdminLogin = document.getElementById("admin-login-form");
  const loginErrorMsg = document.getElementById("login-error-msg");

  if (formAdminLogin) {
    formAdminLogin.addEventListener("submit", (e) => {
      e.preventDefault();
      loginErrorMsg.style.display = "none";

      const username = document.getElementById("admin-login-email").value.trim().toLowerCase();
      const pass = document.getElementById("admin-login-pass").value.trim();

      // Validate Credentials
      if ((username === "triquetra26" || username === "triquetra26@gmail.com") && pass === "24007") {
        // Authenticate & save persistent session
        appState.isAdminAuthenticated = true;
        try {
          sessionStorage.setItem("triquetra_admin_auth", "true");
        } catch (e) {}

        navigateTo("admin");
        refreshAdminData();
      } else {
        if (loginErrorMsg) {
          loginErrorMsg.style.display = "block";
          loginErrorMsg.textContent = "Invalid administrator username or password.";
        }
      }
    });
  }

  // Admin Logout Button
  const btnAdminLogout = document.getElementById("btn-admin-logout");
  if (btnAdminLogout) {
    btnAdminLogout.addEventListener("click", () => {
      appState.isAdminAuthenticated = false;
      try {
        sessionStorage.removeItem("triquetra_admin_auth");
      } catch (e) {}
      if (typeof resetScheduleForm === "function") {
        resetScheduleForm();
      }
      navigateTo("home");
    });
  }

  // ================= ADMIN CONSOLE TABS & DATABASE INTERACTIONS =================
  adminTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      adminTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const secName = tab.getAttribute("data-section");
      Object.keys(adminSections).forEach(key => {
        if (adminSections[key]) {
          adminSections[key].style.display = (key === secName) ? "block" : "none";
        }
      });
    });
  });

  let editingEventKey = null;

  function loadEventToEditForm(key) {
    editingEventKey = key;
    const evt = eventsDb[key];
    if (!evt) return;

    const formTitle = document.getElementById("admin-evt-form-title");
    if (formTitle) {
      formTitle.textContent = `Edit "${evt.name}" Event Details`;
    }

    document.getElementById("admin-evt-name").value = evt.name;
    document.getElementById("admin-evt-date").value = evt.date;
    document.getElementById("admin-evt-time").value = evt.time;
    document.getElementById("admin-evt-venue").value = evt.venue;
    document.getElementById("admin-evt-team").value = evt.teamSize;
    document.getElementById("admin-evt-fee").value = evt.fee;

    const descEl = document.getElementById("admin-evt-desc");
    if (descEl) descEl.value = evt.desc || "";

    const aboutEl = document.getElementById("admin-evt-about");
    if (aboutEl) aboutEl.value = evt.about || "";

    const rulesEl = document.getElementById("admin-evt-rules");
    if (rulesEl) {
      if (Array.isArray(evt.rules)) {
        rulesEl.value = evt.rules.join("\n");
      } else if (typeof evt.rules === "string") {
        rulesEl.value = evt.rules;
      } else {
        rulesEl.value = "";
      }
    }

    const catSelect = document.getElementById("admin-evt-category");
    if (catSelect) {
      catSelect.value = evt.category || "Technical";
    }

    const submitBtn = document.getElementById("btn-evt-submit");
    if (submitBtn) {
      submitBtn.innerHTML = `Update Event Details <i data-lucide="save" style="width:14px;height:14px"></i>`;
    }

    const cancelBtn = document.getElementById("btn-evt-cancel");
    if (cancelBtn) {
      cancelBtn.style.display = "inline-flex";
    }

    lucide.createIcons();
  }

  function resetEventForm() {
    editingEventKey = null;

    const formTitle = document.getElementById("admin-evt-form-title");
    if (formTitle) {
      formTitle.textContent = "Add / Edit Event Details";
    }

    document.getElementById("admin-evt-name").value = "";
    document.getElementById("admin-evt-date").value = "";
    document.getElementById("admin-evt-time").value = "";
    document.getElementById("admin-evt-venue").value = "";
    document.getElementById("admin-evt-team").value = "";
    document.getElementById("admin-evt-fee").value = "Free";

    const descEl = document.getElementById("admin-evt-desc");
    if (descEl) descEl.value = "";

    const aboutEl = document.getElementById("admin-evt-about");
    if (aboutEl) aboutEl.value = "";

    const rulesEl = document.getElementById("admin-evt-rules");
    if (rulesEl) rulesEl.value = "";

    const submitBtn = document.getElementById("btn-evt-submit");
    if (submitBtn) {
      submitBtn.innerHTML = `Save Event Details <i data-lucide="save" style="width:14px;height:14px"></i>`;
    }

    const cancelBtn = document.getElementById("btn-evt-cancel");
    if (cancelBtn) {
      cancelBtn.style.display = "none";
    }

    lucide.createIcons();
  }

  const btnEvtNew = document.getElementById("btn-evt-new");
  if (btnEvtNew) {
    btnEvtNew.addEventListener("click", () => {
      resetEventForm();
    });
  }

  const btnEvtCancel = document.getElementById("btn-evt-cancel");
  if (btnEvtCancel) {
    btnEvtCancel.addEventListener("click", () => {
      resetEventForm();
    });
  }

  function refreshAdminEventsTable() {
    const listBody = document.getElementById("admin-events-list-body");
    const selectAllChk = document.getElementById("chk-evt-select-all");
    const deleteSelectedBtn = document.getElementById("btn-evt-delete-selected");
    const selectedCountSpan = document.getElementById("count-evt-selected");

    if (!listBody) return;

    if (selectAllChk) selectAllChk.checked = false;
    if (deleteSelectedBtn) deleteSelectedBtn.style.display = "none";
    if (selectedCountSpan) selectedCountSpan.textContent = "0";

    listBody.innerHTML = "";
    Object.keys(eventsDb).forEach(key => {
      const evt = eventsDb[key];
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="text-align:center;">
          <input type="checkbox" class="chk-evt-item table-checkbox" data-key="${escapeHtml(key)}">
        </td>
        <td><strong>${escapeHtml(evt.name)}</strong></td>
        <td><span class="event-summary-tag">${escapeHtml(evt.category)}</span></td>
        <td><span style="font-size:0.75rem;">${escapeHtml(evt.date)} • ${escapeHtml(evt.venue)}</span></td>
        <td>
          <div style="display:flex; gap: 8px;">
            <button class="btn-evt-edit" data-key="${escapeHtml(key)}" style="background:none; border:none; color:var(--primary-teal); cursor:pointer; font-weight:700">
              Edit
            </button>
            <button class="btn-evt-delete" data-key="${escapeHtml(key)}" style="background:none; border:none; color:#EF4444; cursor:pointer; font-weight:700">
              Delete
            </button>
          </div>
        </td>
      `;
      listBody.appendChild(tr);
    });

    lucide.createIcons();

    // Checkbox selection listener
    function updateEvtSelectedUI() {
      const itemChks = listBody.querySelectorAll(".chk-evt-item");
      const checkedBoxes = listBody.querySelectorAll(".chk-evt-item:checked");
      const count = checkedBoxes.length;

      if (selectedCountSpan) selectedCountSpan.textContent = count;
      if (deleteSelectedBtn) deleteSelectedBtn.style.display = count > 0 ? "inline-flex" : "none";
      if (selectAllChk) selectAllChk.checked = (itemChks.length > 0 && count === itemChks.length);
    }

    if (selectAllChk) {
      selectAllChk.onclick = () => {
        const itemChks = listBody.querySelectorAll(".chk-evt-item");
        itemChks.forEach(chk => chk.checked = selectAllChk.checked);
        updateEvtSelectedUI();
      };
    }

    const itemChks = listBody.querySelectorAll(".chk-evt-item");
    itemChks.forEach(chk => {
      chk.onchange = () => updateEvtSelectedUI();
    });

    // Delete Selected Batch Button
    if (deleteSelectedBtn) {
      deleteSelectedBtn.onclick = () => {
        const checkedBoxes = listBody.querySelectorAll(".chk-evt-item:checked");
        const count = checkedBoxes.length;
        if (count === 0) return;

        if (confirm(`Are you sure you want to delete ${count} selected event(s)? This will remove them from the cloud and website.`)) {
          checkedBoxes.forEach(chk => {
            const key = chk.getAttribute("data-key");
            delete eventsDb[key];
            if (editingEventKey === key) resetEventForm();
            if (appState.registration.selectedEvent === key) {
              const remaining = Object.keys(eventsDb);
              appState.registration.selectedEvent = remaining.length > 0 ? remaining[0] : "";
            }
          });

          persistEventsDb();
          populateEventDropdown();
          renderEventDetails();
          refreshAdminEventsTable();
          renderCategoryCards();
          alert(`${count} event(s) deleted and saved to Google Sheets successfully!`);
        }
      };
    }

    const editBtns = document.querySelectorAll(".btn-evt-edit");
    editBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-key");
        loadEventToEditForm(key);
      });
    });

    const deleteBtns = document.querySelectorAll(".btn-evt-delete");
    deleteBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-key");
        if (confirm(`Are you sure you want to delete the event "${eventsDb[key].name}"?`)) {
          delete eventsDb[key];
          persistEventsDb();
          if (editingEventKey === key) {
            resetEventForm();
          }
          if (appState.registration.selectedEvent === key) {
            const remaining = Object.keys(eventsDb);
            appState.registration.selectedEvent = remaining.length > 0 ? remaining[0] : "";
          }
          populateEventDropdown();
          renderEventDetails();
          refreshAdminEventsTable();
          renderCategoryCards();
          alert("Event deleted successfully!");
        }
      });
    });
  }

  // Refresh admin tables
  function refreshAdminData() {
    // 1. Populate current registrations in default view
    executeSql("SELECT * FROM registrations;");
    
    // Populate event edit form category dropdown options
    populateCategoryOptions();

    // Populate candidates export event filter dropdown (works dynamically for all events)
    populateExportEventDropdown();

    // 2. Populate schedule admin table
    refreshAdminScheduleTable();

    // 3. Populate events admin list
    refreshAdminEventsTable();

    // 4. Populate categories admin list
    refreshAdminCategoriesTable();
  }

  // SQL Query Executor Engine
  const btnRunSql = document.getElementById("btn-run-sql");
  const sqlInput = document.getElementById("sql-query-input");
  
  if (btnRunSql && sqlInput) {
    btnRunSql.addEventListener("click", () => {
      const query = sqlInput.value.trim();
      executeSql(query);
    });
  }

  // Bind SQL Presets
  const sqlPresets = document.querySelectorAll(".sql-preset");
  sqlPresets.forEach(preset => {
    preset.addEventListener("click", () => {
      const queryText = preset.getAttribute("data-sql");
      if (queryText) {
        if (sqlInput) sqlInput.value = queryText;
        executeSql(queryText);
      }
    });
  });

  function executeSql(query) {
    const errorBox = document.getElementById("sql-error-box");
    const resultsTable = document.getElementById("sql-results-table");
    const resultsCount = document.getElementById("sql-rows-count");

    if (!errorBox || !resultsTable || !resultsCount) return;

    errorBox.style.display = "none";
    resultsTable.innerHTML = "";
    resultsCount.textContent = "0 rows returned";

    // Clean query normalization
    const cleanQuery = query.replace(/\s+/g, " ").replace(/;$/, "").trim().toLowerCase();

    if (!cleanQuery.startsWith("select")) {
      errorBox.style.display = "block";
      errorBox.innerHTML = "<strong>SQL Security Block:</strong> Only SELECT read queries are permitted in this console view to protect table structures.";
      return;
    }

    try {
      let filteredData = [...registrationsDb];
      
      // Basic SELECT parsing
      if (cleanQuery.includes("where")) {
        const whereClause = cleanQuery.split("where")[1].trim();
        
        if (whereClause.includes("department")) {
          const deptMatch = whereClause.match(/department\s*=\s*['"]([^'"]+)['"]/i);
          if (deptMatch) {
            const deptVal = deptMatch[1].replace(/[\s&]+/g, "").toUpperCase();
            filteredData = filteredData.filter(row => {
              const rowDept = (row.department || "").replace(/[\s&]+/g, "").toUpperCase();
              return rowDept === deptVal;
            });
          }
        } else if (whereClause.includes("event")) {
          const evtMatch = whereClause.match(/event\s*=\s*['"]([^'"]+)['"]/i);
          if (evtMatch) {
            const evtVal = evtMatch[1].toLowerCase();
            filteredData = filteredData.filter(row => (row.event || "").toLowerCase() === evtVal);
          }
        } else if (whereClause.includes("id")) {
          const idMatch = whereClause.match(/id\s*=\s*(\d+)/i);
          if (idMatch) {
            const idVal = parseInt(idMatch[1]);
            filteredData = filteredData.filter(row => row.id === idVal);
          }
        }
      }

      // GROUP BY Support
      if (cleanQuery.includes("group by")) {
        const isDeptGroup = cleanQuery.includes("department");
        const counts = {};
        filteredData.forEach(row => {
          const key = isDeptGroup ? (row.department || "Unknown") : (row.event || "Unknown");
          counts[key] = (counts[key] || 0) + 1;
        });

        const thead = document.createElement("thead");
        thead.innerHTML = `
          <tr>
            <th>${isDeptGroup ? "Department" : "Event"}</th>
            <th>Total Registrations</th>
            <th>Percentage</th>
          </tr>
        `;
        resultsTable.appendChild(thead);

        const tbody = document.createElement("tbody");
        const total = filteredData.length;
        Object.keys(counts).forEach(k => {
          const count = counts[k];
          const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0";
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td><strong>${escapeHtml(k)}</strong></td>
            <td><span class="event-summary-tag">${count}</span></td>
            <td><span style="font-weight:600; color:var(--text-gray);">${pct}%</span></td>
          `;
          tbody.appendChild(tr);
        });
        resultsTable.appendChild(tbody);
        resultsCount.textContent = `${Object.keys(counts).length} group(s) returned (${total} total records)`;
        return;
      }

      // Render SQL Results Table Headers
      const thead = document.createElement("thead");
      thead.innerHTML = `
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Reg No</th>
          <th>Dept</th>
          <th>Year</th>
          <th>Event</th>
          <th>Receipt</th>
          <th>Status</th>
        </tr>
      `;
      resultsTable.appendChild(thead);

      // Render SQL Rows with XSS Protection
      const tbody = document.createElement("tbody");
      filteredData.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${escapeHtml(row.id)}</td>
          <td>${escapeHtml(row.name)}</td>
          <td><span style="font-family:monospace; font-size:0.75rem;">${escapeHtml(row.registerNumber)}</span></td>
          <td><span class="event-summary-tag">${escapeHtml(row.department)}</span></td>
          <td>${escapeHtml(row.year)}</td>
          <td><strong>${escapeHtml(row.event)}</strong></td>
          <td><span style="font-family:monospace; font-size:0.75rem; color:var(--primary-teal);">${escapeHtml(row.receipt)}</span></td>
          <td><span style="color:#10B981; font-weight:600; font-size:0.75rem;">${escapeHtml(row.status)}</span></td>
        </tr>`;
        tbody.appendChild(tr);
      });
      resultsTable.appendChild(tbody);
      
      resultsCount.textContent = `${filteredData.length} row(s) returned`;

    } catch (e) {
      errorBox.style.display = "block";
      errorBox.innerHTML = `<strong>SQL Syntax Error:</strong> Could not parse statement. Check formatting. (${escapeHtml(e.message)})`;
    }
  }

  // ================= CANDIDATES EXPORT & DOWNLOAD SYSTEM (PDF FORMAT) =================
  // Helper to generate & download official candidate list as a formatted PDF
  function downloadCandidatesPdf(deptFilter, eventFilter) {
    let list = [...registrationsDb];

    // Filter by Department (Strictly normalizes IT, AI&DS, CSBS)
    if (deptFilter && deptFilter !== "ALL") {
      const cleanDept = deptFilter.replace(/[\s&]+/g, "").toUpperCase();
      list = list.filter(r => (r.department || "").replace(/[\s&]+/g, "").toUpperCase() === cleanDept);
    }

    // Filter by Event (Dynamically works for every existing and future event)
    if (eventFilter && eventFilter !== "ALL") {
      const cleanEvt = eventFilter.trim().toLowerCase();
      list = list.filter(r => (r.event || "").trim().toLowerCase() === cleanEvt);
    }

    if (list.length === 0) {
      const deptLabel = deptFilter !== "ALL" ? deptFilter : "All Departments";
      const evtLabel = eventFilter !== "ALL" ? eventFilter : "All Events";
      alert(`No registered candidates found matching "${deptLabel}" and "${evtLabel}".`);
      return;
    }

    const deptTitle = deptFilter === "ALL" ? "All Departments (IT, AI&DS, CSBS)" : deptFilter;
    const evtTitle = eventFilter === "ALL" ? "All Events" : eventFilter;
    const currentDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    let filename = "Triquetra_2026_Candidates";
    if (deptFilter && deptFilter !== "ALL") filename += `_${deptFilter.replace(/[^a-zA-Z0-9]/g, "")}`;
    if (eventFilter && eventFilter !== "ALL") filename += `_${eventFilter.replace(/[^a-zA-Z0-9]/g, "")}`;
    filename += `_${new Date().toISOString().slice(0, 10)}.pdf`;

    // 1. Direct Native PDF Generation via jsPDF + AutoTable
    if (window.jspdf && window.jspdf.jsPDF) {
      try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
          orientation: "portrait",
          unit: "pt",
          format: "a4"
        });

        // Top Royal Header Banner
        doc.setFillColor(30, 64, 175); // Royal Sapphire (#1E40AF)
        doc.rect(0, 0, 595, 78, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("TRIQUETRA 2026 - CANDIDATES LIST", 40, 32);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.text("Department of IT, AI & DS and CSBS", 40, 49);
        doc.text("Ganadipathy Tulsi's Jain Engineering College", 40, 64);

        // Metadata block
        doc.setTextColor(30, 41, 59);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(`Department: ${deptTitle}`, 40, 102);
        doc.text(`Event: ${evtTitle}`, 320, 102);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`Generated On: ${currentDate}`, 40, 118);
        doc.text(`Total Candidates: ${list.length}`, 320, 118);

        // Table Rows
        const head = [["S.No", "Receipt No", "Participant Name", "Register No", "Dept", "Year", "Registered Event", "Status"]];
        const body = list.map((r, idx) => [
          idx + 1,
          r.receipt || "-",
          r.name || "-",
          r.registerNumber || "-",
          r.department || "-",
          r.year || "-",
          r.event || "-",
          r.status || "Registered"
        ]);

        doc.autoTable({
          head: head,
          body: body,
          startY: 132,
          theme: "striped",
          styles: {
            font: "helvetica",
            fontSize: 8.5,
            cellPadding: 5.5,
            textColor: [30, 41, 59],
            lineColor: [226, 232, 240],
            lineWidth: 0.5
          },
          headStyles: {
            fillColor: [30, 64, 175],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 8.5
          },
          alternateRowStyles: {
            fillColor: [248, 250, 253]
          },
          columnStyles: {
            0: { cellWidth: 32, halign: "center" },
            1: { cellWidth: 68, fontStyle: "bold", textColor: [30, 64, 175] },
            2: { cellWidth: 105 },
            3: { cellWidth: 80 },
            4: { cellWidth: 50, halign: "center" },
            5: { cellWidth: 35, halign: "center" },
            6: { cellWidth: 90 },
            7: { cellWidth: 55, halign: "center", textColor: [16, 185, 129] }
          },
          didDrawPage: function(data) {
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text("Triquetra 2026 Official Document | Ganadipathy Tulsi's Jain Engineering College", 40, 820);
            doc.text(`Page ${data.pageNumber} of ${pageCount}`, 510, 820);
          }
        });

        doc.save(filename);
        return;
      } catch (err) {
        console.warn("[PDF Generation Exception, falling back to print-to-PDF]:", err);
      }
    }

    // 2. High-Fidelity Print-to-PDF Fallback
    printReportWindowFallback(list, deptTitle, evtTitle, currentDate);
  }

  // Helper to export current SQL Query Results as PDF
  function downloadCurrentTablePdf() {
    const table = document.getElementById("sql-results-table");
    if (!table) return;

    const rows = table.querySelectorAll("tr");
    if (rows.length === 0) {
      alert("No data available in query results to export.");
      return;
    }

    const currentDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
    });

    if (window.jspdf && window.jspdf.jsPDF) {
      try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

        // Header Banner
        doc.setFillColor(30, 64, 175);
        doc.rect(0, 0, 595, 75, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(15);
        doc.text("TRIQUETRA 2026 - QUERY RESULTS REPORT", 40, 32);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text("Department of IT, AI & DS and CSBS | Ganadipathy Tulsi's Jain Engineering College", 40, 49);
        doc.text(`Generated On: ${currentDate}`, 40, 63);

        doc.autoTable({
          html: "#sql-results-table",
          startY: 90,
          theme: "striped",
          styles: { font: "helvetica", fontSize: 8.5, cellPadding: 5.5, textColor: [30, 41, 59] },
          headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255], fontStyle: "bold" },
          alternateRowStyles: { fillColor: [248, 250, 253] }
        });

        doc.save(`Triquetra_2026_Query_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
        return;
      } catch (err) {
        console.warn("[PDF Query Report fallback]:", err);
      }
    }

    window.print();
  }

  // Printable window fallback (triggers browser print / Save-as-PDF)
  function printReportWindowFallback(list, deptTitle, evtTitle, currentDate) {
    const printWin = window.open("", "_blank", "width=850,height=900");
    if (!printWin) {
      alert("Please allow popups to download/print the PDF document.");
      return;
    }

    let rowsHtml = "";
    list.forEach((r, i) => {
      rowsHtml += `
        <tr style="background:${i % 2 === 1 ? '#F8FAFD' : '#FFFFFF'};">
          <td style="text-align:center; padding:6px 8px; border-bottom:1px solid #E2E8F0;">${i + 1}</td>
          <td style="font-weight:bold; color:#1E40AF; padding:6px 8px; border-bottom:1px solid #E2E8F0;">${r.receipt || '-'}</td>
          <td style="padding:6px 8px; border-bottom:1px solid #E2E8F0;">${r.name || '-'}</td>
          <td style="font-family:monospace; padding:6px 8px; border-bottom:1px solid #E2E8F0;">${r.registerNumber || '-'}</td>
          <td style="text-align:center; padding:6px 8px; border-bottom:1px solid #E2E8F0;">${r.department || '-'}</td>
          <td style="text-align:center; padding:6px 8px; border-bottom:1px solid #E2E8F0;">${r.year || '-'}</td>
          <td style="padding:6px 8px; border-bottom:1px solid #E2E8F0;">${r.event || '-'}</td>
          <td style="text-align:center; color:#10B981; font-weight:600; padding:6px 8px; border-bottom:1px solid #E2E8F0;">${r.status || 'Registered'}</td>
        </tr>
      `;
    });

    const docHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Triquetra 2026 Candidates List - ${deptTitle}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 20px; color: #1E293B; }
          .header { background: #1E40AF; color: #FFFFFF; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .header h1 { margin: 0 0 6px; font-size: 20px; }
          .header p { margin: 2px 0; font-size: 12px; opacity: 0.9; }
          .meta { display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 13px; background: #F1F5F9; padding: 12px; border-radius: 6px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #1E40AF; color: #FFFFFF; text-align: left; padding: 8px; font-size: 11px; text-transform: uppercase; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>TRIQUETRA 2026 - CANDIDATES LIST</h1>
          <p>Department of IT, AI & DS and CSBS</p>
          <p>Ganadipathy Tulsi's Jain Engineering College</p>
        </div>
        <div class="meta">
          <div><strong>Department:</strong> ${deptTitle} | <strong>Event:</strong> ${evtTitle}</div>
          <div><strong>Total Candidates:</strong> ${list.length} | <strong>Date:</strong> ${currentDate}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="text-align:center;">S.No</th>
              <th>Receipt No</th>
              <th>Participant Name</th>
              <th>Register No</th>
              <th style="text-align:center;">Dept</th>
              <th style="text-align:center;">Year</th>
              <th>Event</th>
              <th style="text-align:center;">Status</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </body>
      </html>
    `;

    printWin.document.open();
    printWin.document.write(docHtml);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => {
      printWin.print();
    }, 500);
  }

  // Populate dynamic event list in export dropdown (works for every event present and future)
  function populateExportEventDropdown() {
    const selectEl = document.getElementById("export-event-filter");
    if (!selectEl) return;

    const currentVal = selectEl.value || "ALL";
    selectEl.innerHTML = '<option value="ALL">All Events</option>';

    const eventNames = [];
    if (eventsDb) {
      Object.keys(eventsDb).forEach(key => {
        const item = eventsDb[key];
        const name = (item && item.name) ? item.name : key;
        if (name && !eventNames.includes(name)) {
          eventNames.push(name);
        }
      });
    }

    (registrationsDb || []).forEach(r => {
      if (r && r.event && !eventNames.includes(r.event)) {
        eventNames.push(r.event);
      }
    });

    eventNames.sort().forEach(name => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      selectEl.appendChild(opt);
    });

    selectEl.value = currentVal;
  }

  // Bind Candidates Export Buttons (PDF Format)
  const btnExportIt = document.getElementById("btn-export-it");
  if (btnExportIt) {
    btnExportIt.addEventListener("click", () => downloadCandidatesPdf("IT", "ALL"));
  }

  const btnExportAids = document.getElementById("btn-export-aids");
  if (btnExportAids) {
    btnExportAids.addEventListener("click", () => downloadCandidatesPdf("AI&DS", "ALL"));
  }

  const btnExportCsbs = document.getElementById("btn-export-csbs");
  if (btnExportCsbs) {
    btnExportCsbs.addEventListener("click", () => downloadCandidatesPdf("CSBS", "ALL"));
  }

  const btnExportAll = document.getElementById("btn-export-all");
  if (btnExportAll) {
    btnExportAll.addEventListener("click", () => downloadCandidatesPdf("ALL", "ALL"));
  }

  const btnExportFiltered = document.getElementById("btn-export-filtered");
  if (btnExportFiltered) {
    btnExportFiltered.addEventListener("click", () => {
      const deptVal = document.getElementById("export-dept-filter") ? document.getElementById("export-dept-filter").value : "ALL";
      const eventVal = document.getElementById("export-event-filter") ? document.getElementById("export-event-filter").value : "ALL";
      downloadCandidatesPdf(deptVal, eventVal);
    });
  }

  const btnExportTable = document.getElementById("btn-export-table");
  if (btnExportTable) {
    btnExportTable.addEventListener("click", () => downloadCurrentTablePdf());
  }

  // Update / Add Event Form submit
  const formEditEvent = document.getElementById("admin-form-event");
  if (formEditEvent) {
    formEditEvent.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const evtName = document.getElementById("admin-evt-name").value.trim();
      const descVal = document.getElementById("admin-evt-desc") ? document.getElementById("admin-evt-desc").value.trim() : "";
      const aboutVal = document.getElementById("admin-evt-about") ? document.getElementById("admin-evt-about").value.trim() : "";
      const rulesRaw = document.getElementById("admin-evt-rules") ? document.getElementById("admin-evt-rules").value.trim() : "";
      const rulesArr = rulesRaw ? rulesRaw.split("\n").map(r => r.trim()).filter(Boolean) : [];

      const updated = {
        name: evtName,
        category: document.getElementById("admin-evt-category").value,
        date: document.getElementById("admin-evt-date").value.trim(),
        time: document.getElementById("admin-evt-time").value.trim(),
        venue: document.getElementById("admin-evt-venue").value.trim(),
        teamSize: document.getElementById("admin-evt-team").value.trim(),
        fee: document.getElementById("admin-evt-fee").value.trim(),
        desc: descVal || `Participate in ${evtName} and showcase your technical and creative skills.`,
        about: aboutVal || `${evtName} is an official event at Triquetra 2026. Review rules, prepare your tools, and register early.`,
        rules: rulesArr.length > 0 ? rulesArr : [
          "Participants must follow all event guidelines and timings.",
          "Decisions of the jury panel are conclusive and final."
        ]
      };

      const isEdit = Boolean(editingEventKey);
      const previousName = (editingEventKey && eventsDb[editingEventKey]) ? eventsDb[editingEventKey].name : "";

      if (editingEventKey && editingEventKey !== evtName) {
        delete eventsDb[editingEventKey];
      }

      eventsDb[evtName] = updated;
      persistEventsDb();
      
      // Update registration event selector dropdown, details view, admin table, and home categories cards
      populateEventDropdown();
      renderEventDetails(evtName);
      refreshAdminEventsTable();
      renderCategoryCards();

      // Sync matching schedule entries
      if (previousName) {
        Object.keys(scheduleDb).forEach(day => {
          scheduleDb[day].forEach(item => {
            if (item.event === previousName) {
              item.event = updated.name;
              item.time = updated.time;
              item.loc = updated.venue;
            }
          });
        });
        persistScheduleDb();
        filterTimeline(appState.selectedDate);
        refreshAdminScheduleTable();
      }

      alert(isEdit ? `Event "${evtName}" updated successfully!` : `New event "${evtName}" created successfully!`);
      resetEventForm();
    });
  }

  // ================= SCHEDULE MANAGEMENT ENGINE =================
  let editingScheduleItem = null;

  function loadScheduleToEditForm(day, id) {
    if (!scheduleDb[day]) return;
    const item = scheduleDb[day].find(slot => slot.id === id);
    if (!item) return;

    editingScheduleItem = { day, id };

    const formTitle = document.getElementById("admin-sch-form-title");
    if (formTitle) {
      formTitle.textContent = `Edit "${item.event}" Slot`;
    }

    document.getElementById("admin-sch-day").value = day;
    document.getElementById("admin-sch-time").value = item.time;
    document.getElementById("admin-sch-name").value = item.event;
    document.getElementById("admin-sch-venue").value = item.loc;
    
    const iconSelect = document.getElementById("admin-sch-icon");
    if (iconSelect) {
      iconSelect.value = item.icon || "calendar";
    }

    const submitBtn = document.getElementById("btn-sch-submit");
    if (submitBtn) {
      submitBtn.innerHTML = `Update Timeline Slot <i data-lucide="save" style="width:14px;height:14px"></i>`;
    }

    const cancelBtn = document.getElementById("btn-sch-cancel");
    if (cancelBtn) {
      cancelBtn.style.display = "inline-flex";
    }

    lucide.createIcons();
  }

  function resetScheduleForm() {
    editingScheduleItem = null;

    const formTitle = document.getElementById("admin-sch-form-title");
    if (formTitle) {
      formTitle.textContent = "Add Timeline Event";
    }

    document.getElementById("admin-sch-day").value = "";
    document.getElementById("admin-sch-time").value = "";
    document.getElementById("admin-sch-name").value = "";
    document.getElementById("admin-sch-venue").value = "";
    
    const iconSelect = document.getElementById("admin-sch-icon");
    if (iconSelect) {
      iconSelect.value = "calendar";
    }

    const submitBtn = document.getElementById("btn-sch-submit");
    if (submitBtn) {
      submitBtn.innerHTML = `Add to Schedule <i data-lucide="plus" style="width:14px;height:14px"></i>`;
    }

    const cancelBtn = document.getElementById("btn-sch-cancel");
    if (cancelBtn) {
      cancelBtn.style.display = "none";
    }

    lucide.createIcons();
  }

  const btnSchCancel = document.getElementById("btn-sch-cancel");
  if (btnSchCancel) {
    btnSchCancel.addEventListener("click", () => {
      resetScheduleForm();
    });
  }

  // Add / Edit schedule slot submit handler
  const formAddSchedule = document.getElementById("admin-form-schedule");
  if (formAddSchedule) {
    formAddSchedule.addEventListener("submit", (e) => {
      e.preventDefault();

      const day = document.getElementById("admin-sch-day").value.trim();
      const time = document.getElementById("admin-sch-time").value.trim();
      const eventName = document.getElementById("admin-sch-name").value.trim();
      const loc = document.getElementById("admin-sch-venue").value.trim();
      const icon = document.getElementById("admin-sch-icon").value;

      if (editingScheduleItem) {
        const prevDay = editingScheduleItem.day;
        const prevId = editingScheduleItem.id;

        if (prevDay === day) {
          // Update in place for same date
          if (scheduleDb[day]) {
            const idx = scheduleDb[day].findIndex(slot => slot.id === prevId);
            if (idx !== -1) {
              scheduleDb[day][idx] = {
                id: prevId,
                time: time,
                event: eventName,
                loc: loc,
                icon: icon
              };
            }
          }
        } else {
          // Date was modified - move from prevDay to new day
          if (scheduleDb[prevDay]) {
            scheduleDb[prevDay] = scheduleDb[prevDay].filter(slot => slot.id !== prevId);
            if (scheduleDb[prevDay].length === 0) {
              delete scheduleDb[prevDay];
            }
          }
          if (!scheduleDb[day]) scheduleDb[day] = [];
          scheduleDb[day].push({
            id: prevId,
            time: time,
            event: eventName,
            loc: loc,
            icon: icon
          });
        }

        if (scheduleDb[day]) {
          scheduleDb[day].sort((a, b) => a.time.localeCompare(b.time));
        }

        alert(`Schedule entry "${eventName}" updated successfully!`);
        resetScheduleForm();
      } else {
        // Add new timeline slot
        const newSlot = {
          id: Math.floor(1000 + Math.random() * 9000),
          time: time,
          event: eventName,
          loc: loc,
          icon: icon
        };

        if (!scheduleDb[day]) scheduleDb[day] = [];
        scheduleDb[day].push(newSlot);
        scheduleDb[day].sort((a, b) => a.time.localeCompare(b.time));

        document.getElementById("admin-sch-time").value = "";
        document.getElementById("admin-sch-name").value = "";
        document.getElementById("admin-sch-venue").value = "";

        alert(`Added "${eventName}" to ${day} schedule successfully!`);
      }

      persistScheduleDb();
      renderScheduleTabs();
      refreshAdminScheduleTable();
      filterTimeline(appState.selectedDate);
    });
  }

  // Refresh Schedule Admin view
  function refreshAdminScheduleTable() {
    const listBody = document.getElementById("admin-schedule-list-body");
    const selectAllChk = document.getElementById("chk-sch-select-all");
    const deleteSelectedBtn = document.getElementById("btn-sch-delete-selected");
    const selectedCountSpan = document.getElementById("count-sch-selected");
    const saveAllBtn = document.getElementById("btn-sch-save-all");

    if (!listBody) return;

    if (selectAllChk) selectAllChk.checked = false;
    if (deleteSelectedBtn) deleteSelectedBtn.style.display = "none";
    if (selectedCountSpan) selectedCountSpan.textContent = "0";

    listBody.innerHTML = "";
    
    Object.keys(scheduleDb).forEach(day => {
      scheduleDb[day].forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td style="text-align:center;">
            <input type="checkbox" class="chk-sch-item table-checkbox" data-day="${escapeHtml(day)}" data-id="${escapeHtml(item.id)}">
          </td>
          <td><span class="event-summary-tag">${escapeHtml(day)}</span></td>
          <td><strong>${escapeHtml(item.time)}</strong></td>
          <td><strong>${escapeHtml(item.event)}</strong></td>
          <td>${escapeHtml(item.loc)}</td>
          <td>
            <div style="display:flex; gap: 8px;">
              <button class="btn-sch-edit" data-day="${escapeHtml(day)}" data-id="${escapeHtml(item.id)}" style="background:none; border:none; color:var(--primary-teal); cursor:pointer; font-weight:700">
                Edit
              </button>
              <button class="btn-sch-delete" data-day="${escapeHtml(day)}" data-id="${escapeHtml(item.id)}" style="background:none; border:none; color:#EF4444; cursor:pointer; font-weight:700">
                Delete
              </button>
            </div>
          </td>
        `;
        listBody.appendChild(tr);
      });
    });

    lucide.createIcons();

    // Checkbox selection listener
    function updateSchSelectedUI() {
      const itemChks = listBody.querySelectorAll(".chk-sch-item");
      const checkedBoxes = listBody.querySelectorAll(".chk-sch-item:checked");
      const count = checkedBoxes.length;

      if (selectedCountSpan) selectedCountSpan.textContent = count;
      if (deleteSelectedBtn) deleteSelectedBtn.style.display = count > 0 ? "inline-flex" : "none";
      if (selectAllChk) selectAllChk.checked = (itemChks.length > 0 && count === itemChks.length);
    }

    if (selectAllChk) {
      selectAllChk.onclick = () => {
        const itemChks = listBody.querySelectorAll(".chk-sch-item");
        itemChks.forEach(chk => chk.checked = selectAllChk.checked);
        updateSchSelectedUI();
      };
    }

    const itemChks = listBody.querySelectorAll(".chk-sch-item");
    itemChks.forEach(chk => {
      chk.onchange = () => updateSchSelectedUI();
    });

    // Delete Selected Batch Button
    if (deleteSelectedBtn) {
      deleteSelectedBtn.onclick = () => {
        const checkedBoxes = listBody.querySelectorAll(".chk-sch-item:checked");
        const count = checkedBoxes.length;
        if (count === 0) return;

        if (confirm(`Are you sure you want to delete ${count} selected schedule slot(s)?`)) {
          checkedBoxes.forEach(chk => {
            const day = chk.getAttribute("data-day");
            const id = parseInt(chk.getAttribute("data-id"));
            if (scheduleDb[day]) {
              scheduleDb[day] = scheduleDb[day].filter(item => item.id !== id);
              if (scheduleDb[day].length === 0) delete scheduleDb[day];
            }
            if (editingScheduleItem && editingScheduleItem.day === day && editingScheduleItem.id === id) {
              resetScheduleForm();
            }
          });

          persistScheduleDb();
          renderScheduleTabs();
          refreshAdminScheduleTable();
          filterTimeline(appState.selectedDate);
          alert(`${count} timeline slot(s) deleted and saved to Google Sheets successfully!`);
        }
      };
    }

    // Save Schedule Button
    if (saveAllBtn) {
      saveAllBtn.onclick = () => {
        persistScheduleDb();
        renderScheduleTabs();
        filterTimeline(appState.selectedDate);
        alert("✓ Schedule timeline saved permanently to Google Sheets!");
      };
    }

    const editBtns = document.querySelectorAll(".btn-sch-edit");
    editBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const day = btn.getAttribute("data-day");
        const id = parseInt(btn.getAttribute("data-id"));
        loadScheduleToEditForm(day, id);
      });
    });

    const deleteBtns = document.querySelectorAll(".btn-sch-delete");
    deleteBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const day = btn.getAttribute("data-day");
        const id = parseInt(btn.getAttribute("data-id"));
        
        if (confirm("Are you sure you want to remove this slot from the schedule?")) {
          scheduleDb[day] = scheduleDb[day].filter(item => item.id !== id);
          if (scheduleDb[day].length === 0) {
            delete scheduleDb[day];
          }
          persistScheduleDb();
          if (editingScheduleItem && editingScheduleItem.day === day && editingScheduleItem.id === id) {
            resetScheduleForm();
          }
          renderScheduleTabs();
          refreshAdminScheduleTable();
          filterTimeline(appState.selectedDate);
        }
      });
    });
  }

  // ================= CATEGORIES MANAGEMENT ENGINE =================
  let editingCategoryKey = null;

  function loadCategoryToEditForm(key) {
    editingCategoryKey = key;
    const cat = categoriesDb[key];
    if (!cat) return;

    const formTitle = document.getElementById("admin-cat-form-title");
    if (formTitle) {
      formTitle.textContent = `Edit "${cat.name}" Category`;
    }

    document.getElementById("admin-cat-name").value = cat.name;
    document.getElementById("admin-cat-desc").value = cat.desc || "";
    document.getElementById("admin-cat-icon").value = cat.icon || "code";

    const submitBtn = document.getElementById("btn-cat-submit");
    if (submitBtn) {
      submitBtn.innerHTML = `Update Category <i data-lucide="save" style="width:14px;height:14px"></i>`;
    }

    const cancelBtn = document.getElementById("btn-cat-cancel");
    if (cancelBtn) {
      cancelBtn.style.display = "inline-flex";
    }

    lucide.createIcons();
  }

  function resetCategoryForm() {
    editingCategoryKey = null;

    const formTitle = document.getElementById("admin-cat-form-title");
    if (formTitle) {
      formTitle.textContent = "Add / Edit Category";
    }

    document.getElementById("admin-cat-name").value = "";
    document.getElementById("admin-cat-desc").value = "";
    document.getElementById("admin-cat-icon").value = "code";

    const submitBtn = document.getElementById("btn-cat-submit");
    if (submitBtn) {
      submitBtn.innerHTML = `Save Category <i data-lucide="save" style="width:14px;height:14px"></i>`;
    }

    const cancelBtn = document.getElementById("btn-cat-cancel");
    if (cancelBtn) {
      cancelBtn.style.display = "none";
    }

    lucide.createIcons();
  }

  const btnCatNew = document.getElementById("btn-cat-new");
  if (btnCatNew) {
    btnCatNew.addEventListener("click", () => {
      resetCategoryForm();
    });
  }

  const btnCatCancel = document.getElementById("btn-cat-cancel");
  if (btnCatCancel) {
    btnCatCancel.addEventListener("click", () => {
      resetCategoryForm();
    });
  }

  function populateCategoryOptions() {
    const selectEl = document.getElementById("admin-evt-category");
    if (!selectEl) return;

    selectEl.innerHTML = "";
    Object.keys(categoriesDb).forEach(key => {
      const option = document.createElement("option");
      option.value = categoriesDb[key].name;
      option.textContent = categoriesDb[key].name;
      selectEl.appendChild(option);
    });
  }

  function refreshAdminCategoriesTable() {
    const listBody = document.getElementById("admin-categories-list-body");
    const selectAllChk = document.getElementById("chk-cat-select-all");
    const deleteSelectedBtn = document.getElementById("btn-cat-delete-selected");
    const selectedCountSpan = document.getElementById("count-cat-selected");

    if (!listBody) return;

    if (selectAllChk) selectAllChk.checked = false;
    if (deleteSelectedBtn) deleteSelectedBtn.style.display = "none";
    if (selectedCountSpan) selectedCountSpan.textContent = "0";

    listBody.innerHTML = "";
    Object.keys(categoriesDb).forEach(key => {
      const cat = categoriesDb[key];
      const count = getCategoryEventCount(cat.name);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="text-align:center;">
          <input type="checkbox" class="chk-cat-item table-checkbox" data-key="${escapeHtml(key)}">
        </td>
        <td><strong>${escapeHtml(cat.name)}</strong> <span style="font-size:0.75rem; color:var(--primary-teal); font-weight:700">(${count} ${count === 1 ? 'event' : 'events'})</span></td>
        <td><i data-lucide="${escapeHtml(cat.icon || 'tag')}" style="width:14px;height:14px"></i></td>
        <td>
          <div style="display:flex; gap: 8px;">
            <button class="btn-cat-edit" data-key="${escapeHtml(key)}" style="background:none; border:none; color:var(--primary-teal); cursor:pointer; font-weight:700">
              Edit
            </button>
            <button class="btn-cat-delete" data-key="${escapeHtml(key)}" style="background:none; border:none; color:#EF4444; cursor:pointer; font-weight:700">
              Delete
            </button>
          </div>
        </td>
      `;
      listBody.appendChild(tr);
    });

    lucide.createIcons();

    // Checkbox selection listener
    function updateCatSelectedUI() {
      const itemChks = listBody.querySelectorAll(".chk-cat-item");
      const checkedBoxes = listBody.querySelectorAll(".chk-cat-item:checked");
      const count = checkedBoxes.length;

      if (selectedCountSpan) selectedCountSpan.textContent = count;
      if (deleteSelectedBtn) deleteSelectedBtn.style.display = count > 0 ? "inline-flex" : "none";
      if (selectAllChk) selectAllChk.checked = (itemChks.length > 0 && count === itemChks.length);
    }

    if (selectAllChk) {
      selectAllChk.onclick = () => {
        const itemChks = listBody.querySelectorAll(".chk-cat-item");
        itemChks.forEach(chk => chk.checked = selectAllChk.checked);
        updateCatSelectedUI();
      };
    }

    const itemChks = listBody.querySelectorAll(".chk-cat-item");
    itemChks.forEach(chk => {
      chk.onchange = () => updateCatSelectedUI();
    });

    // Delete Selected Batch Button
    if (deleteSelectedBtn) {
      deleteSelectedBtn.onclick = () => {
        const checkedBoxes = listBody.querySelectorAll(".chk-cat-item:checked");
        const count = checkedBoxes.length;
        if (count === 0) return;

        if (confirm(`Are you sure you want to delete ${count} selected category(ies)? This will also remove any events in these categories.`)) {
          checkedBoxes.forEach(chk => {
            const key = chk.getAttribute("data-key");
            const catName = categoriesDb[key] ? categoriesDb[key].name : key;
            delete categoriesDb[key];

            // Remove child events
            Object.keys(eventsDb).forEach(evtKey => {
              if (eventsDb[evtKey].category === catName) delete eventsDb[evtKey];
            });

            if (editingCategoryKey === key) resetCategoryForm();
          });

          persistCategoriesDb();
          persistEventsDb();
          renderCategoryCards();
          populateCategoryOptions();
          populateEventDropdown();
          refreshAdminCategoriesTable();
          refreshAdminEventsTable();
          renderEventDetails();
          alert(`${count} category(ies) deleted and saved to Google Sheets successfully!`);
        }
      };
    }

    const editBtns = document.querySelectorAll(".btn-cat-edit");
    editBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-key");
        loadCategoryToEditForm(key);
      });
    });

    const deleteBtns = document.querySelectorAll(".btn-cat-delete");
    deleteBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-key");
        if (confirm(`Are you sure you want to delete the category "${categoriesDb[key].name}"?`)) {
          const catName = categoriesDb[key].name;
          delete categoriesDb[key];
          
          Object.keys(eventsDb).forEach(evtKey => {
            if (eventsDb[evtKey].category === catName) {
              delete eventsDb[evtKey];
            }
          });

          persistCategoriesDb();
          persistEventsDb();
          
          if (editingCategoryKey === key) {
            resetCategoryForm();
          }

          renderCategoryCards();
          populateCategoryOptions();
          populateEventDropdown();
          refreshAdminCategoriesTable();
          refreshAdminEventsTable();
          renderEventDetails();
          alert(`Category "${catName}" deleted and saved successfully!`);
        }
      });
    });
  }

  // Add/Edit category submit handler
  const formAddCategory = document.getElementById("admin-form-category");
  if (formAddCategory) {
    formAddCategory.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("admin-cat-name").value.trim();
      const desc = document.getElementById("admin-cat-desc").value.trim();
      const icon = document.getElementById("admin-cat-icon").value;

      const categoryData = {
        id: `cat-${name.toLowerCase().replace(/\s+/g, '-')}`,
        name: name,
        desc: desc,
        icon: icon
      };

      const oldName = editingCategoryKey;
      if (editingCategoryKey && editingCategoryKey !== name) {
        delete categoriesDb[editingCategoryKey];
        // Cascade category rename to any events that had the old category name!
        Object.keys(eventsDb).forEach(k => {
          if (eventsDb[k].category === oldName) {
            eventsDb[k].category = name;
          }
        });
        persistEventsDb();
      }

      categoriesDb[name] = categoryData;
      persistCategoriesDb();

      alert(`Category "${name}" saved successfully!`);
      resetCategoryForm();

      renderCategoryCards();
      populateCategoryOptions();
      refreshAdminCategoriesTable();
      renderEventDetails();
    });
  }

  // Explicit Save Categories button
  const btnCatSaveAll = document.getElementById("btn-cat-save-all");
  if (btnCatSaveAll) {
    btnCatSaveAll.addEventListener("click", () => {
      persistCategoriesDb();
      persistEventsDb();
      renderCategoryCards();
      refreshAdminCategoriesTable();
      alert("✓ All category changes saved permanently to Google Sheets!");
    });
  }

  // Explicit Save Events button
  const btnEvtSaveAll = document.getElementById("btn-evt-save-all");
  if (btnEvtSaveAll) {
    btnEvtSaveAll.addEventListener("click", () => {
      persistEventsDb();
      persistScheduleDb();
      renderCategoryCards();
      populateEventDropdown();
      refreshAdminEventsTable();
      alert("✓ All event changes saved permanently to Google Sheets!");
    });
  }
});
