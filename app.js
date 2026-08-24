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
  const EVENT_MGMT_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxbzc0NZXQRy7QJ4-8DGsjvqL1guKqi48GspHkyZePsdNtGQKyDCb9TY3Vk2dBD-5bi/exec";
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
    { id: 1, name: "Karan Sharma", registerNumber: "511122104015", department: "AI&DS", year: "III", event: "CodeCraze", receipt: "TQ01", status: "Registered" },
    { id: 2, name: "Arthi Murali", registerNumber: "511122104003", department: "AI&DS", year: "III", event: "CodeCraze", receipt: "TQ02", status: "Registered" },
    { id: 3, name: "Deepak Raj", registerNumber: "511121104008", department: "CSE", year: "IV", event: "QuizMaster", receipt: "TQ03", status: "Registered" },
    { id: 4, name: "Sneha V", registerNumber: "511123104022", department: "IT", year: "II", event: "RoboWar", receipt: "TQ04", status: "Registered" }
  ];

  // Default Core Events Details Database
  const DEFAULT_EVENTS_DB = {
    // Technical (4)
    CodeCraze: {
      name: "CodeCraze",
      category: "Technical",
      date: "24 May 2026",
      time: "10:00 AM",
      venue: "Computer Lab 3",
      teamSize: "1-3 Members",
      fee: "Free",
      desc: "Put your coding skills to the test in this ultimate speed-programming challenge. Solve complex algorithms, fix bug-ridden code, and optimize runtime under tight deadlines.",
      about: "CodeCraze tests your syntax mastery, logic compilation, and complexity tracking. Supported compilers are GNU C/C++, Java 17, and Python 3. The event consists of a 20-minute debugging preliminary screening, followed by a 60-minute core algorithm optimization phase.",
      rules: [
        "Calculators, pre-written code snippets, and custom packages are strictly prohibited.",
        "In case of a tie, execution runtime efficiency and memory utilization metrics will decide.",
        "Any form of plagiarism or screen sharing will lead to immediate disqualification."
      ]
    },
    WebCraft: {
      name: "WebCraft",
      category: "Technical",
      date: "24 May 2026",
      time: "01:30 PM",
      venue: "IT Lab 2",
      teamSize: "1-2 Members",
      fee: "Free",
      desc: "Build responsive, high-performance web applications and sleek landing interfaces matching real-world UI design specifications.",
      about: "Participants will be given an interactive UI wireframe and asset pack to implement within 90 minutes using modern frontend technologies.",
      rules: [
        "Internet access is permitted only for standard framework documentation.",
        "Pre-built full website templates are strictly prohibited.",
        "Cross-device responsiveness and accessibility are primary judging criteria."
      ]
    },
    BugHunt: {
      name: "BugHunt",
      category: "Technical",
      date: "24 May 2026",
      time: "11:30 AM",
      venue: "Computer Lab 1",
      teamSize: "1 Member",
      fee: "Free",
      desc: "Identify logical flaws, memory leaks, and syntax vulnerabilities across complex codebases under ticking clock conditions.",
      about: "BugHunt provides contestants with faulty codebases containing intentional edge-case errors, concurrency issues, and race conditions. Contestants must isolate and patch bugs with minimal code alterations.",
      rules: [
        "Individual participation only.",
        "Submissions are scored on the number of passed unit test cases.",
        "No external AI copilot assistance allowed during the hunt."
      ]
    },
    AlgoRush: {
      name: "AlgoRush",
      category: "Technical",
      date: "25 May 2026",
      time: "10:00 AM",
      venue: "AI&DS Lab",
      teamSize: "1-2 Members",
      fee: "Free",
      desc: "Fast-paced competitive programming showdown focusing on dynamic programming, graph theory, and greedy algorithms.",
      about: "Two rounds of intense algorithmic problem solving. Round 1 features rapid-fire medium difficulty questions; Round 2 features deep graph, tree, and string manipulation challenges.",
      rules: [
        "Standard competitive programming submission guidelines apply.",
        "Time penalty applied for incorrect submissions.",
        "Judges' automated test suite decides test validation."
      ]
    },

    // Non-Technical (3)
    AdMad: {
      name: "AdMad",
      category: "Non-Technical",
      date: "24 May 2026",
      time: "04:00 PM",
      venue: "Seminar Hall 2",
      teamSize: "2-4 Members",
      fee: "Free",
      desc: "Showcase your marketing genius, humorous scripts, and advertising creativity to pitch unexpected and quirky products.",
      about: "Teams receive an unexpected on-the-spot product theme and have 10 minutes preparation time followed by a 3-minute live commercial pitch and jingle act in front of the jury.",
      rules: [
        "No offensive content, vulgar language, or defamatory remarks.",
        "Props and creative costuming are encouraged.",
        "Time limits will be strictly monitored with buzzer signals."
      ]
    },
    CorporateClash: {
      name: "CorporateClash",
      category: "Non-Technical",
      date: "24 May 2026",
      time: "02:00 PM",
      venue: "Seminar Hall 3",
      teamSize: "2-3 Members",
      fee: "Free",
      desc: "Tackle realistic corporate dilemmas, managerial crisis scenarios, and executive board-room decision simulations.",
      about: "Simulated boardroom battle where teams resolve emergency brand reputation crises, workforce restructuring, and supply chain breakdowns through strategic negotiation.",
      rules: [
        "Teams will be evaluated on crisis management, leadership, and diplomacy.",
        "Strict adherence to executive decorum and speaking times.",
        "Cross-questioning rounds will challenge strategy depth."
      ]
    },
    PitchPerfect: {
      name: "PitchPerfect",
      category: "Non-Technical",
      date: "25 May 2026",
      time: "11:00 AM",
      venue: "Conference Room A",
      teamSize: "1-3 Members",
      fee: "Free",
      desc: "Elevator pitch marathon: present high-impact venture ideas and commercialization plans in 180 seconds.",
      about: "Pitch your startup concept to venture judges. Highlight market size, monetization strategy, competitive moat, and target customer acquisition.",
      rules: [
        "Presentation deck capped at 5 visual slides.",
        "Strict 3-minute pitch followed by 2-minute judge Q&A.",
        "Financial projections must be justified."
      ]
    },

    // Design (2)
    DesignSprint: {
      name: "DesignSprint",
      category: "Design",
      date: "24 May 2026",
      time: "11:30 AM",
      venue: "Design Lab 1",
      teamSize: "1-2 Members",
      fee: "Free",
      desc: "Design intuitive user interfaces, micro-interactions, and design systems for next-generation mobile and web applications.",
      about: "Given a problem statement, teams must produce high-fidelity Figma prototypes with interactive flows and design tokens.",
      rules: [
        "Figma or Adobe XD are the accepted prototyping tools.",
        "Stock design kits must be declared; original UI components score higher.",
        "Interactive prototypes must be clickable and demonstrable."
      ]
    },
    PosterCraft: {
      name: "PosterCraft",
      category: "Design",
      date: "25 May 2026",
      time: "02:00 PM",
      venue: "Media Studio",
      teamSize: "1 Member",
      fee: "Free",
      desc: "Create impactful digital posters and visual storytelling graphics exploring technological revolutions.",
      about: "Solo creative contest where digital artists compose stunning promotional artwork around contemporary AI, sustainability, or space-tech themes.",
      rules: [
        "Accepted tools: Photoshop, Illustrator, Canva, or Figma.",
        "Final export must be high-resolution 300 DPI PDF or PNG.",
        "Generative AI artwork must be credited with prompts provided."
      ]
    },

    // Innovation (2)
    AIIdeathon: {
      name: "AIIdeathon",
      category: "Innovation",
      date: "23 May 2026",
      time: "02:00 PM",
      venue: "Seminar Hall 2",
      teamSize: "2-4 Members",
      fee: "Free",
      desc: "Formulate disruptive applications of GenAI, computer vision, and NLP to address real-world socio-economic problems.",
      about: "Teams pitch novel solutions leveraging AI architectures, demonstrating architectural flowcharts, dataset curation approaches, and feasibility studies.",
      rules: [
        "Idea must be original and technically grounded.",
        "Presentation should cover feasibility, tech stack, and social impact.",
        "Working POC or architectural prototype awards bonus points."
      ]
    },
    ModelExpo: {
      name: "ModelExpo",
      category: "Innovation",
      date: "25 May 2026",
      time: "09:30 AM",
      venue: "Exhibition Center",
      teamSize: "2-4 Members",
      fee: "Free",
      desc: "Display working hardware prototypes, IoT devices, robotics systems, and embedded computing solutions.",
      about: "Hands-on exhibition where student inventors demonstrate functional prototypes to industry evaluators and symposium attendees.",
      rules: [
        "All hardware setups must adhere to electrical safety standards.",
        "Each team must provide a project banner/display board.",
        "Judges will evaluate innovation, build quality, and live demonstration."
      ]
    },

    // Presentation (3)
    TechPaper: {
      name: "TechPaper",
      category: "Presentation",
      date: "24 May 2026",
      time: "10:00 AM",
      venue: "Seminar Hall 1",
      teamSize: "1-2 Members",
      fee: "Free",
      desc: "Present peer-reviewed research, emerging paradigms, and technological breakthroughs before an expert panel.",
      about: "Paper presentation track inviting technical papers in AI/ML, Cloud Architecture, Quantum Computing, IoT, and Cyber Security.",
      rules: [
        "IEEE paper format required (max 6 pages).",
        "Presentation duration: 8 minutes presentation + 3 minutes Q&A.",
        "Plagiarism index must be below 15%."
      ]
    },
    CaseStudy: {
      name: "CaseStudy",
      category: "Presentation",
      date: "25 May 2026",
      time: "01:30 PM",
      venue: "Seminar Hall 2",
      teamSize: "1-3 Members",
      fee: "Free",
      desc: "Analyze famous engineering failures, software post-mortems, and technology turnaround sagas.",
      about: "Contestants break down landmark engineering cases, examining architectural flaws, human factors, recovery strategies, and lessons learned.",
      rules: [
        "Teams are judged on analytical depth and clear takeaway recommendations.",
        "Slides should cite empirical post-mortem reports.",
        "Time limit is 10 minutes total."
      ]
    },
    ProjectDisplay: {
      name: "ProjectDisplay",
      category: "Presentation",
      date: "25 May 2026",
      time: "09:30 AM",
      venue: "Main Auditorium",
      teamSize: "2-4 Members",
      fee: "Free",
      desc: "Capstone software showcase featuring full-stack applications, mobile apps, and machine learning deployments.",
      about: "Finalists display full working software deployments, live databases, and user experiences to panel reviewers.",
      rules: [
        "Live demo is mandatory (slides alone will not suffice).",
        "Source code repository must be presented during review.",
        "Architecture, UI design, and database normalization are evaluated."
      ]
    },

    // Fun & Creative (4)
    QuizMaster: {
      name: "QuizMaster",
      category: "Fun & Creative",
      date: "24 May 2026",
      time: "02:00 PM",
      venue: "Seminar Hall 1",
      teamSize: "1-2 Members",
      fee: "Free",
      desc: "Test your quick reflexes and encyclopedic knowledge across tech trivia, sci-fi pop culture, and computing history.",
      about: "Exciting multi-stage quiz including rapid buzzer rounds, visual identify-the-logo segments, audio-visual clues, and tech riddle showdowns.",
      rules: [
        "No electronic devices permitted during rounds.",
        "Quizmaster's decisions are conclusive and final.",
        "Negative points for false buzzer triggers."
      ]
    },
    RoboWar: {
      name: "RoboWar",
      category: "Fun & Creative",
      date: "25 May 2026",
      time: "11:00 AM",
      venue: "Main Courtyard",
      teamSize: "2-4 Members",
      fee: "Free",
      desc: "Remote-controlled combat bots clash inside the battle arena in high-voltage destruction matches.",
      about: "Bots compete in 1v1 arena rounds. Points awarded for aggression, arena hazards utilization, immobilizations, and armor integrity.",
      rules: [
        "Bot weight must adhere to category weight classifications (max 15kg).",
        "No dangerous chemical or projectile weapons.",
        "Safety fail-safes are inspected prior to qualification."
      ]
    },
    LensCraft: {
      name: "LensCraft",
      category: "Fun & Creative",
      date: "23 May 2026",
      time: "04:30 PM",
      venue: "Central Lawn",
      teamSize: "1 Member",
      fee: "Free",
      desc: "Capture the spirit of Triquetra 2026 through candid photography, architectural perspectives, and creative reel making.",
      about: "Participants shoot themed photography across the symposium events and submit their best edited photographs and 30-second reels.",
      rules: [
        "All submitted photographs must be captured on campus during the symposium.",
        "Basic color correction permitted; heavy CGI manipulation is prohibited.",
        "Raw EXIF data must be preserved."
      ]
    },
    MemeMania: {
      name: "MemeMania",
      category: "Fun & Creative",
      date: "24 May 2026",
      time: "03:30 PM",
      venue: "Seminar Hall 3",
      teamSize: "1 Member",
      fee: "Free",
      desc: "Create hilarious, viral-worthy memes depicting programmer struggles, college life, and artificial intelligence quirks.",
      about: "Contestants get surprise funny scenarios and 20 minutes to generate top-tier original memes using custom templates.",
      rules: [
        "No vulgarity, hate speech, or targeted personal attacks.",
        "Must be 100% original creations generated in the session.",
        "Judged by audience laughter and jury ratings."
      ]
    }
  };

  // Default Event Schedule Database
  const DEFAULT_SCHEDULE_DB = {
    "23 May 2026": [
      { id: 101, time: "09:00 AM", event: "Inauguration Ceremony", loc: "Main Auditorium", icon: "sparkles" },
      { id: 102, time: "10:30 AM", event: "Keynote Address: GenAI", loc: "Main Auditorium", icon: "presentation" },
      { id: 103, time: "01:00 PM", event: "Lunch Break", loc: "Campus Cafeteria", icon: "coffee" },
      { id: 104, time: "02:00 PM", event: "AIIdeathon", loc: "Seminar Hall 2", icon: "lightbulb" },
      { id: 105, time: "04:30 PM", event: "LensCraft", loc: "Central Lawn", icon: "users" }
    ],
    "24 May 2026": [
      { id: 201, time: "10:00 AM", event: "CodeCraze", loc: "Computer Lab 3", icon: "code" },
      { id: 202, time: "10:00 AM", event: "TechPaper", loc: "Seminar Hall 1", icon: "presentation" },
      { id: 203, time: "11:30 AM", event: "BugHunt", loc: "Computer Lab 1", icon: "code" },
      { id: 204, time: "11:30 AM", event: "DesignSprint", loc: "Design Lab 1", icon: "palette" },
      { id: 205, time: "01:00 PM", event: "Lunch Break", loc: "Campus Cafeteria", icon: "coffee" },
      { id: 206, time: "01:30 PM", event: "WebCraft", loc: "IT Lab 2", icon: "code" },
      { id: 207, time: "02:00 PM", event: "QuizMaster", loc: "Seminar Hall 1", icon: "help-circle" },
      { id: 208, time: "02:00 PM", event: "CorporateClash", loc: "Seminar Hall 3", icon: "briefcase" },
      { id: 209, time: "03:30 PM", event: "MemeMania", loc: "Seminar Hall 3", icon: "smile" },
      { id: 210, time: "04:00 PM", event: "AdMad", loc: "Seminar Hall 2", icon: "briefcase" }
    ],
    "25 May 2026": [
      { id: 301, time: "09:30 AM", event: "ModelExpo", loc: "Exhibition Center", icon: "monitor" },
      { id: 302, time: "09:30 AM", event: "ProjectDisplay", loc: "Main Auditorium", icon: "monitor" },
      { id: 303, time: "10:00 AM", event: "AlgoRush", loc: "AI&DS Lab", icon: "code" },
      { id: 304, time: "11:00 AM", event: "RoboWar", loc: "Main Courtyard", icon: "activity" },
      { id: 305, time: "11:00 AM", event: "PitchPerfect", loc: "Conference Room A", icon: "briefcase" },
      { id: 306, time: "01:30 PM", event: "CaseStudy", loc: "Seminar Hall 2", icon: "presentation" },
      { id: 307, time: "02:00 PM", event: "PosterCraft", loc: "Media Studio", icon: "palette" },
      { id: 308, time: "03:30 PM", event: "Valedictory & Prize Distribution", loc: "Main Auditorium", icon: "award" }
    ]
  };

  // Default Event Categories Database
  const DEFAULT_CATEGORIES_DB = {
    Technical: { id: "cat-technical", name: "Technical", desc: "Coding matches & debugging", icon: "code" },
    "Non-Technical": { id: "cat-non-technical", name: "Non-Technical", desc: "Managerial and business tasks", icon: "briefcase" },
    Design: { id: "cat-design", name: "Design", desc: "UI/UX and creative graphics", icon: "palette" },
    Innovation: { id: "cat-innovation", name: "Innovation", desc: "Idea pitching and models", icon: "lightbulb" },
    Presentation: { id: "cat-presentation", name: "Presentation", desc: "Paper & PPT presentations", icon: "presentation" },
    "Fun & Creative": { id: "cat-fun", name: "Fun & Creative", desc: "Gaming, photography & quizzes", icon: "smile" }
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
      
      // Send as POST request with text/plain body to avoid CORS issues and URL length limits
      fetch(EVENT_MGMT_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: action, data: dataStr })
      })
      .then(() => console.log(`[Event Management Cloud Sync] '${action}' synced to Google Sheets.`))
      .catch(err => {
        console.warn(`[Event Management Cloud Sync POST fallback to GET] '${action}':`, err);
        const url = `${EVENT_MGMT_SCRIPT_URL}?action=${encodeURIComponent(action)}&data=${encodeURIComponent(dataStr)}`;
        fetch(url, { method: "GET", mode: "no-cors" });
      });
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

  function resetAllDatabasesToDefault() {
    registrationsDb = JSON.parse(JSON.stringify(DEFAULT_REGISTRATIONS_DB));
    eventsDb = JSON.parse(JSON.stringify(DEFAULT_EVENTS_DB));
    scheduleDb = JSON.parse(JSON.stringify(DEFAULT_SCHEDULE_DB));
    categoriesDb = JSON.parse(JSON.stringify(DEFAULT_CATEGORIES_DB));

    persistRegistrationsDb();
    persistEventsDb();
    persistScheduleDb();
    persistCategoriesDb();
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

        if (cloudData.categories && typeof cloudData.categories === "object" && Object.keys(cloudData.categories).length > 0) {
          categoriesDb = cloudData.categories;
          saveStoredDb(STORAGE_KEYS.CATEGORIES, categoriesDb);
          hasUpdates = true;
        }

        if (cloudData.events && typeof cloudData.events === "object" && Object.keys(cloudData.events).length > 0) {
          eventsDb = cloudData.events;
          saveStoredDb(STORAGE_KEYS.EVENTS, eventsDb);
          hasUpdates = true;
        }

        if (cloudData.schedule && typeof cloudData.schedule === "object" && Object.keys(cloudData.schedule).length > 0) {
          scheduleDb = cloudData.schedule;
          saveStoredDb(STORAGE_KEYS.SCHEDULE, scheduleDb);
          hasUpdates = true;
        }

        if (hasUpdates) {
          renderCategoryCards();
          populateCategoryOptions();
          populateEventDropdown();
          renderEventDetails();
          renderScheduleTabs();
          filterTimeline(appState.selectedDate || "23 May 2026");
          if (appState.isAdminAuthenticated) {
            refreshAdminData();
          }
          console.log("[Triquetra Cloud] Live Event Management data loaded from Google Sheets!");
        }
      }
    };

    const cloudScript = document.createElement("script");
    cloudScript.src = `${EVENT_MGMT_SCRIPT_URL}?action=get_data&callback=${callbackName}`;
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
    selectedDate: "23 May 2026",
    selectedCategory: "Technical",
    isAdminAuthenticated: (typeof window !== "undefined" && window.sessionStorage && sessionStorage.getItem("triquetra_admin_auth") === "true"),
    registration: {
      fullName: "",
      registerNumber: "",
      selectedEvent: "CodeCraze",
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
      } else if (screenId === "admin" || screenId === "adminLogin") {
        headerTitle.textContent = "ADMIN PANEL";
      } else {
        headerTitle.textContent = "TRIQUETRA";
      }
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

  // Render event details dynamically based on selected event & category
  function renderEventDetails(eventName, categoryFallback) {
    const activeKey = eventName || appState.registration.selectedEvent || Object.keys(eventsDb)[0];
    const data = eventsDb[activeKey];
    const catName = (data && data.category) || categoryFallback || appState.selectedCategory || "Technical";

    // 1. Breadcrumb
    const breadcrumbCat = document.getElementById("detail-breadcrumb-cat");
    if (breadcrumbCat) breadcrumbCat.textContent = catName;
    
    const breadcrumbLink = document.getElementById("breadcrumb-category-link");
    if (breadcrumbLink) {
      breadcrumbLink.onclick = () => navigateTo("categories");
    }

    // 2. Category Events Switcher (Pills)
    const switcher = document.getElementById("category-events-switcher");
    if (switcher) {
      switcher.innerHTML = "";
      const siblingKeys = Object.keys(eventsDb).filter(k => {
        return (eventsDb[k].category || "").trim().toLowerCase() === catName.trim().toLowerCase();
      });

      if (siblingKeys.length > 1) {
        switcher.style.display = "flex";
        siblingKeys.forEach(key => {
          const pill = document.createElement("button");
          pill.type = "button";
          pill.className = `evt-pill ${key === activeKey ? 'active' : ''}`;
          pill.textContent = eventsDb[key].name;
          pill.addEventListener("click", () => {
            appState.registration.selectedEvent = key;
            renderEventDetails(key, catName);
          });
          switcher.appendChild(pill);
        });
      } else {
        switcher.style.display = "none";
      }
    }

    // If event exists
    if (data) {
      // Banner Tag
      const bannerTag = document.getElementById("detail-banner-tag");
      if (bannerTag) bannerTag.textContent = data.category || catName;

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

      // Rules List
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
            "Decision of the judges and faculty coordinators will be final.",
            "Any malpractice or violation of conduct will lead to immediate disqualification."
          ];
        }
        rulesArr.forEach(rule => {
          const li = document.createElement("li");
          li.textContent = rule;
          rulesList.appendChild(li);
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
              <span class="info-item-value">${escapeHtml(data.venue || 'TBA')}</span>
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
      // Empty category placeholder
      const titleEl = document.getElementById("detail-title");
      if (titleEl) titleEl.textContent = `No Events in ${catName}`;
      const descEl = document.getElementById("detail-desc");
      if (descEl) descEl.textContent = `There are currently no events registered under the ${catName} category.`;
      const aboutEl = document.getElementById("detail-about");
      if (aboutEl) aboutEl.textContent = "Check back soon or add events through the administrator console.";
      const rulesList = document.getElementById("detail-rules-list");
      if (rulesList) rulesList.innerHTML = "<li>No rules specified.</li>";
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

  // Render Category Cards Dynamically with Auto-Fetched Counts
  function renderCategoryCards() {
    const container = document.getElementById("categories-list-container");
    if (!container) return;

    container.innerHTML = "";
    Object.keys(categoriesDb).forEach(key => {
      const cat = categoriesDb[key];
      const count = getCategoryEventCount(cat.name);
      
      const card = document.createElement("div");
      card.className = "category-card";
      card.id = cat.id || `cat-${cat.name.toLowerCase().replace(/\s+/g, '-')}`;
      card.innerHTML = `
        <div class="category-icon-chip">
          <i data-lucide="${escapeHtml(cat.icon || 'tag')}"></i>
        </div>
        <div>
          <h3 class="category-name">${escapeHtml(cat.name)}</h3>
          <p class="category-desc">${escapeHtml(cat.desc || '')}</p>
        </div>
        <span class="category-count">${count} ${count === 1 ? 'Event' : 'Events'}</span>
      `;
      
      card.addEventListener("click", () => {
        appState.selectedCategory = cat.name;
        // Find matching events in this category
        const matchingKeys = Object.keys(eventsDb).filter(k => {
          return (eventsDb[k].category || "").trim().toLowerCase() === cat.name.trim().toLowerCase();
        });
        
        if (matchingKeys.length > 0) {
          appState.registration.selectedEvent = matchingKeys[0];
          renderEventDetails(matchingKeys[0], cat.name);
        } else {
          renderEventDetails(null, cat.name);
        }
        navigateTo("detail");
      });
      
      container.appendChild(card);
    });
    
    lucide.createIcons();
  }

  // Initialize filters & data
  populateEventDropdown();
  renderEventDetails();
  renderScheduleTabs();
  renderCategoryCards();
  filterTimeline("23 May 2026");

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

      // Generate Registration ID (Sequential starting from TQ01)
      const nextNum = registrationsDb.length + 1;
      const receiptId = `TQ${nextNum.toString().padStart(2, '0')}`;

      // Start Payment Simulation
      const paymentModal = document.getElementById("payment-modal");
      if (paymentModal) {
        paymentModal.style.display = "flex";

        const activeEventKey = appState.registration.selectedEvent || Object.keys(eventsDb)[0] || "CodeCraze";
        const eventName = eventsDb[activeEventKey] ? eventsDb[activeEventKey].name : activeEventKey;

        // Create new Database record
        const newRecord = {
          id: registrationsDb.length + 1,
          name: fullName,
          registerNumber: regNum,
          department: dept,
          year: year,
          event: eventName,
          receipt: receiptId,
          status: "Registered"
        };

        // Set dynamic registration summary for Confirmation Screen
        document.getElementById("conf-val-id").textContent = receiptId;
        document.getElementById("conf-val-name").textContent = fullName;
        document.getElementById("conf-val-reg-num").textContent = regNum;
        document.getElementById("conf-val-dept").textContent = `${dept} (${year} Year)`;
        document.getElementById("conf-val-event").textContent = eventName;

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
              status: newRecord.status
            });
            fetch(`${REGISTRATION_SHEET_URL}?${queryParams.toString()}`, {
              method: "GET",
              mode: "no-cors"
            })
            .then(() => console.log("Student registration synced to Google Sheets successfully."))
            .catch(err => console.error("Student registration sync failed:", err));
          }

          paymentModal.style.display = "none";
          navigateTo("confirmation");
        }, 1800);
      }
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
      if (sqlInput) sqlInput.value = queryText;
      executeSql(queryText);
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
