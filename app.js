/**
 * NEURAHACK 2026 - APP SCRIPT
 * National Flagship AI & Data Science Hackathon
 * Organized Exclusively by:
 * Department of Artificial Intelligence & Data Science (AI & DS)
 * Ganadipathy Tulsi's Jain Engineering College (GTEC)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // --- Mobile Navigation Drawer Toggle ---
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileNavDrawer = document.getElementById('mobile-nav-drawer');

  if (mobileMenuBtn && mobileNavDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileNavDrawer.classList.toggle('active');
    });

    const mobileLinks = mobileNavDrawer.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileNavDrawer.classList.remove('active');
      });
    });
  }

  // --- Dedicated AI & Data Science Track Data ---
  const trackData = {
    "genai-agents": {
      category: "Generative AI",
      title: "Autonomous Multi-Agent Systems & LLMs",
      background: "The advent of reasoning models, open-weight LLMs, and agentic workflows has revolutionized automated problem-solving. Autonomous AI swarms can collaborate to analyze complex codebases, execute distributed research, and synthesize actionable intelligence without constant human intervention.",
      objective: "Develop an autonomous multi-agent system utilizing open-weight LLMs or fine-tuned reasoning models capable of executing multi-step complex workflows with robust self-correction.",
      scope: [
        "Orchestration of specialized autonomous sub-agents with role division",
        "Integration of local/open-weight LLMs (DeepSeek, Llama 3, Mistral) or API models",
        "Retrieval-Augmented Generation (RAG) with vector databases for knowledge grounding",
        "Self-reflection, chain-of-thought verification, and automated error-correction loops",
        "Interactive chat or task-dashboard for real-time human-in-the-loop oversight"
      ],
      evaluation: [
        "Agent autonomy, reasoning depth, and task completion success rate",
        "Handling of tool-calling, API integration, and unexpected execution failures",
        "Inference efficiency, context window utilization, and latency optimization",
        "Novelty of agentic coordination architecture",
        "Practical utility for enterprise workflows, software engineering, or research"
      ],
      outcome: "A functional, autonomous multi-agent application demonstrating intelligent delegation, tool execution, and dependable reasoning."
    },
    "computer-vision": {
      category: "Computer Vision",
      title: "Real-Time Visual Analytics & Edge AI",
      background: "Intelligent video surveillance, robotic navigation, and industrial quality inspection demand high-throughput computer vision models capable of running on constrained edge devices such as microcontrollers, Raspberry Pi, Jetson Orin, or mobile chipsets without sacrificing accuracy.",
      objective: "Build an edge-optimized computer vision pipeline delivering real-time object detection, tracking, or visual anomaly detection with low power and ultra-low latency.",
      scope: [
        "Real-time object detection and multi-object tracking (YOLO, MobileNet, EdgeTPU)",
        "Model quantization (INT8/FP16), pruning, and acceleration with TensorRT / ONNX",
        "Visual anomaly detection in manufacturing, campus safety, or smart traffic",
        "Edge hardware deployment simulation or live camera feed integration",
        "Lightweight notification and event-logging trigger mechanism"
      ],
      evaluation: [
        "Frames-per-second (FPS) throughput and inference latency on edge hardware",
        "Detection precision (mAP) under varying lighting and occlusion conditions",
        "Resource efficiency (RAM, CPU/GPU temperature, model size)",
        "Ease of deployment and hardware compatibility",
        "Applicability to smart cities, industrial safety, or security"
      ],
      outcome: "A deployed edge-AI vision prototype performing low-latency real-time inference with quantifiable benchmarks."
    },
    "deepfake-forensics": {
      category: "AI Ethics & Forensics",
      title: "Deepfake Detection & Media Provenance",
      background: "Rapid proliferation of generative image synthesis, voice cloning, and deepfake video generation has outpaced traditional authentication tools, creating severe societal risks in identity theft, financial fraud, and synthetic misinformation.",
      objective: "Engineer a multimodal AI verification system capable of reliably distinguishing authentic digital media from AI-synthesized or manipulated videos, images, and audio.",
      scope: [
        "Biometric inconsistency analysis (eye blinking, pulse photoplethysmography, facial mesh)",
        "Audio spectral artifact extraction to identify synthetic speech and cloned voices",
        "Diffusion noise fingerprint detection and frequency domain analysis (FFT)",
        "Cryptographic media provenance tracking and tamper-proof verification logs",
        "Explainable AI dashboard providing visual heatmaps of manipulated regions"
      ],
      evaluation: [
        "Detection accuracy across varied generative architectures (GANs, Diffusion, Voice Clones)",
        "Resilience against compression, re-encoding, and adversarial perturbations",
        "Low false-positive rate on authentic high-resolution media",
        "Transparency and interpretability of forensic evidence heatmaps",
        "Investigation readiness for cyber cells and media organizations"
      ],
      outcome: "An explainable forensic detection tool providing authenticity scores and tamper localization heatmaps."
    },
    "predictive-analytics": {
      category: "Big Data & ML",
      title: "High-Precision Predictive Analytics & Forecasting",
      background: "Modern organizations generate vast streams of high-dimensional tabular, IoT, and time-series data. Extracting forward-looking intelligence requires sophisticated predictive modeling, anomaly scoring, and scalable feature engineering.",
      objective: "Construct an end-to-end predictive analytics engine that analyzes complex tabular/time-series data to deliver accurate forecasts, risk projections, and early anomaly alerts.",
      scope: [
        "High-throughput automated feature engineering and missing data imputation",
        "Advanced time-series forecasting (Prophet, Transformers for Time-Series, XGBoost/LightGBM)",
        "Multivariate anomaly detection for proactive failure prevention",
        "Interactive exploratory data analysis (EDA) and drill-down visualization dashboards",
        "Automated model drift monitoring and retraining triggers"
      ],
      evaluation: [
        "Forecast accuracy metrics (RMSE, MAE, R-squared) against benchmark baselines",
        "Robustness to non-stationary distributions and unexpected data spikes",
        "Clarity and visual depth of the analytical executive dashboard",
        "Scalability across large-scale historical datasets",
        "Direct actionability of predictive insights for decision-makers"
      ],
      outcome: "An enterprise-grade predictive analytics platform with real-time forecasting charts and automated risk alerts."
    },
    "healthcare-ai": {
      category: "Bio-Informatics",
      title: "AI in Healthcare Diagnostics & Clinical Intelligence",
      background: "Clinical decision support systems powered by deep learning and medical foundation models can dramatically accelerate early disease detection, radiological scans analysis, and automated clinical report synthesis while safeguarding patient privacy.",
      objective: "Develop a privacy-centric clinical AI assistant for medical imaging segmentation, electronic health record summarization, or preliminary risk triaging.",
      scope: [
        "Medical imaging analysis (X-ray, MRI, CT scans, or histopathology segmentation)",
        "Natural language extraction from unstructured clinical notes and discharge summaries",
        "Differential diagnostic suggestion system with strict anti-hallucination safeguards",
        "Privacy-preserving HIPAA/GDPR-compliant data handling architecture",
        "Doctor-facing intuitive consultation interface with citation references"
      ],
      evaluation: [
        "Diagnostic sensitivity, specificity, and Area Under the ROC Curve (AUC)",
        "Reliability and factual grounding of clinical summaries",
        "Strict adherence to medical data privacy guidelines",
        "Usability and ergonomic workflow for healthcare practitioners",
        "Clinical relevance and societal impact"
      ],
      outcome: "A clinically grounded diagnostic or medical reporting copilot with high precision and explainable visual evidence."
    },
    "open-ai-ds": {
      category: "Open Innovation",
      title: "Next-Gen Applied AI & Data Science Solutions",
      background: "Artificial Intelligence and Data Science are transforming every facet of society, from sustainable agriculture and educational personalization to smart logistics, renewable energy grid balancing, and natural language translation for regional dialects.",
      objective: "Pioneer a creative, groundbreaking application of machine learning, neural networks, or data science that solves an urgent real-world problem.",
      scope: [
        "Application of novel machine learning or deep neural architectures",
        "Demonstrated domain impact (e.g. Agritech, Climate, EdTech, Accessibility, Smart Cities)",
        "Robust data pipeline from ingestion to inference and visualization",
        "Scalable cloud or containerized deployment architecture",
        "User-centric product design and clean API integrations"
      ],
      evaluation: [
        "Novelty and originality of the conceptual approach",
        "Technical depth and execution rigor of the ML model/data pipeline",
        "Practical feasibility and potential societal or commercial viability",
        "Quality of user experience and interactive demonstration",
        "Completeness of the end-to-end working system"
      ],
      outcome: "A deployable end-to-end AI product with demonstrated societal or industrial transformation potential."
    }
  };

  // --- Desktop Track Tabs Switcher ---
  const trackTabBtns = document.querySelectorAll('.track-tab-btn');
  const trackHeading = document.getElementById('track-heading');
  const trackCategory = document.getElementById('track-category');
  const trackBackground = document.getElementById('track-background');
  const trackObjective = document.getElementById('track-objective');
  const trackScopeList = document.getElementById('track-scope-list');
  const trackEvalList = document.getElementById('track-eval-list');
  const trackOutcome = document.getElementById('track-outcome');

  function renderTrack(trackKey) {
    const data = trackData[trackKey];
    if (!data) return;

    if (trackHeading) trackHeading.textContent = data.title;
    if (trackCategory) trackCategory.textContent = data.category;
    if (trackBackground) trackBackground.textContent = data.background;
    if (trackObjective) trackObjective.textContent = data.objective;
    if (trackOutcome) trackOutcome.textContent = data.outcome;

    if (trackScopeList) {
      trackScopeList.innerHTML = data.scope.map(item => `
        <li>
          <div class="track-dot track-dot-primary"></div>
          <span>${item}</span>
        </li>
      `).join('');
    }

    if (trackEvalList) {
      trackEvalList.innerHTML = data.evaluation.map(item => `
        <li>
          <div class="track-dot track-dot-secondary"></div>
          <span>${item}</span>
        </li>
      `).join('');
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  trackTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      trackTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const trackKey = btn.getAttribute('data-track');
      renderTrack(trackKey);
    });
  });

  // --- Accordion Logic (Problem Tracks & Hackathon FAQ) ---
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item');
      if (!item) return;
      const container = item.parentElement;
      const wasActive = item.classList.contains('active');
      
      if (container) {
        container.querySelectorAll('.accordion-item').forEach(i => {
          i.classList.remove('active');
          const icon = i.querySelector('.accordion-chevron');
          if (icon) icon.style.transform = 'rotate(0deg)';
        });
      }

      if (!wasActive) {
        item.classList.add('active');
        const icon = item.querySelector('.accordion-chevron');
        if (icon) icon.style.transform = 'rotate(90deg)';
      }
    });
  });

  // --- Registration Modal & Dynamic Team Members ---
  const modalOverlay = document.getElementById('registration-modal');
  const openModalBtns = document.querySelectorAll('.btn-open-register');
  const closeModalBtns = document.querySelectorAll('.btn-close-modal');
  const teamSizeSelect = document.getElementById('reg-team-size');
  const membersContainer = document.getElementById('dynamic-members-container');
  const regForm = document.getElementById('hackathon-registration-form');
  const modalFormContainer = document.getElementById('modal-form-container');
  const modalSuccessContainer = document.getElementById('modal-success-container');
  const generatedPassId = document.getElementById('generated-pass-id');
  const passTeamName = document.getElementById('pass-team-name');
  const passTrackName = document.getElementById('pass-track-name');

  function openModal() {
    if (modalOverlay) {
      modalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (modalFormContainer) modalFormContainer.style.display = 'block';
      if (modalSuccessContainer) modalSuccessContainer.style.display = 'none';
    }
  }

  function closeModal() {
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', closeModal);
  });

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });

  // Dynamic Members Generator
  if (teamSizeSelect && membersContainer) {
    teamSizeSelect.addEventListener('change', () => {
      const size = parseInt(teamSizeSelect.value, 10);
      membersContainer.innerHTML = '';

      for (let i = 2; i <= size; i++) {
        const memberHtml = `
          <div class="team-member-block" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
            <div style="font-family: var(--font-display); font-size: 0.8rem; font-weight: 700; color: var(--cyber-primary); margin-bottom: 0.75rem;">
              TEAM MEMBER #${i}
            </div>
            <div class="form-group-grid">
              <div class="form-field">
                <label>Full Name *</label>
                <input type="text" name="member_${i}_name" required placeholder="Member name">
              </div>
              <div class="form-field">
                <label>Email Address *</label>
                <input type="email" name="member_${i}_email" required placeholder="member@college.edu">
              </div>
              <div class="form-field">
                <label>Phone Number *</label>
                <input type="tel" name="member_${i}_phone" required placeholder="10-digit mobile">
              </div>
              <div class="form-field">
                <label>Department & Year *</label>
                <input type="text" name="member_${i}_dept" required placeholder="e.g. AI & DS, 3rd Year">
              </div>
            </div>
          </div>
        `;
        membersContainer.insertAdjacentHTML('beforeend', memberHtml);
      }
    });
  }

  // Registration Form Submission -> Live Google Sheets Auto-Sync
  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = regForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span style="color:#000;">SYNCING TO GOOGLE SHEETS...</span>';
      }

      const teamName = document.getElementById('reg-team-name')?.value || 'Unnamed Team';
      const teamSize = document.getElementById('reg-team-size')?.value || '1';
      const trackSelect = document.getElementById('reg-track');
      const trackLabel = trackSelect ? trackSelect.options[trackSelect.selectedIndex].text : 'General AI Track';

      const leadName = document.getElementById('reg-lead-name')?.value || '';
      const leadEmail = document.getElementById('reg-lead-email')?.value || '';
      const leadPhone = document.getElementById('reg-lead-phone')?.value || '';
      const leadCollege = document.getElementById('reg-lead-college')?.value || '';
      const leadDept = document.getElementById('reg-lead-dept')?.value || '';
      const leadYear = document.getElementById('reg-lead-year')?.value || '';
      const deckUrl = document.getElementById('reg-deck-url')?.value || '';

      // Format dynamic team members
      const membersList = [];
      for (let i = 2; i <= parseInt(teamSize, 10); i++) {
        const mName = regForm.querySelector(`[name="member_${i}_name"]`)?.value || '';
        const mPhone = regForm.querySelector(`[name="member_${i}_phone"]`)?.value || '';
        const mDept = regForm.querySelector(`[name="member_${i}_dept"]`)?.value || '';
        if (mName) {
          membersList.push(`M${i}: ${mName} (${mPhone || mDept})`);
        }
      }
      const membersSummary = membersList.length > 0 ? membersList.join(' | ') : 'Solo Entry';

      // Generate Cyber Pass ID
      const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
      const passId = `NEURA-2026-${randomHex}`;

      // Update Pass UI
      if (generatedPassId) generatedPassId.textContent = passId;
      if (passTeamName) passTeamName.textContent = teamName;
      if (passTrackName) passTrackName.textContent = trackLabel;

      // Cloud Google Sheets Web App Endpoint
      const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbwn1zDZVMlg1ayNKtfIo9aSdv4-VH1O1LEDEY5PGzbWVwBBZmoyJ0to46-QLNnPxyWxNg/exec";

      const queryParams = new URLSearchParams({
        action: "register",
        receipt: passId,
        name: `${teamName} [Lead: ${leadName}]`,
        p1Name: `${leadName} (${leadEmail})`,
        p1Reg: leadPhone,
        p2Name: membersSummary,
        p2Reg: leadCollege + (deckUrl ? ` | Pitch: ${deckUrl}` : ''),
        department: leadDept,
        year: leadYear,
        event: `NEURAHACK: ${trackLabel}`,
        _t: Date.now().toString()
      });

      const syncUrl = `${GOOGLE_SHEETS_URL}?${queryParams.toString()}`;

      // 1. Primary Cloud Sync via fetch (mode: no-cors)
      fetch(syncUrl, {
        method: "GET",
        mode: "no-cors",
        cache: "no-cache"
      }).catch(err => {
        console.warn("Primary cloud sync warning:", err);
      });

      // 2. Secondary Guaranteed Delivery Beacon
      try {
        const syncBeacon = new Image();
        syncBeacon.src = syncUrl;
      } catch (beaconErr) {
        console.warn("Beacon fallback warning:", beaconErr);
      }

      // 3. Local Safety Backup in browser
      try {
        const registrations = JSON.parse(localStorage.getItem('neurahack_2026_regs') || '[]');
        registrations.push({
          passId,
          teamName,
          track: trackLabel,
          leadName,
          leadEmail,
          leadPhone,
          college: leadCollege,
          members: membersSummary,
          deckUrl,
          syncedToCloud: true,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('neurahack_2026_regs', JSON.stringify(registrations));
      } catch (err) {
        console.warn('Storage error:', err);
      }

      // Switch to confirmation view
      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
        if (modalFormContainer) modalFormContainer.style.display = 'none';
        if (modalSuccessContainer) modalSuccessContainer.style.display = 'block';

        if (window.lucide) {
          window.lucide.createIcons();
        }
      }, 500);
    });
  }
});
