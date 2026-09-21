/**
 * GTEC CYBER HACKATHON v4.0 - APP SCRIPT
 * Reference: cyberhack-hackathon.vercel.app
 * Instituted for: Ganadipathy Tulsi's Jain Engineering College (GTEC)
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

  // --- Track / Problem Statement Data ---
  const trackData = {
    "ai-forensics": {
      category: "AI Forensics",
      title: "Deepfake & AI Content Detection",
      background: "The rapid advancement of Artificial Intelligence has enabled the creation of highly realistic synthetic media such as deepfake videos, AI-generated images, cloned voices, and manipulated digital content. These technologies are increasingly being misused for misinformation, impersonation, financial fraud, and cybercrime.",
      objective: "Develop a system capable of detecting AI-generated or manipulated media content and assisting law enforcement agencies in verifying authenticity.",
      scope: [
        "Detection of deepfake videos, images, or audio",
        "Identification of AI-generated content signatures",
        "Metadata and visual frequency spectrum analysis",
        "Confidence scoring for media authenticity",
        "Real-time or near real-time forensic scanning capability"
      ],
      evaluation: [
        "Detection accuracy - identifying source AI model/website",
        "Scalability and inference latency",
        "Ease of use for investigative teams",
        "Innovation in biometric/artifact detection approach",
        "Practical applicability for cyber forensics"
      ],
      outcome: "A production-grade prototype tool that can assist cyber investigators in identifying manipulated or synthetic digital media reliably."
    },
    "blockchain": {
      category: "Blockchain Analysis",
      title: "Cryptocurrency Fund Tracing & Forensic Graph",
      background: "Cryptocurrency transactions are frequently used in cybercrime, ransomware attacks, and illegal marketplaces due to pseudonymity and cross-border transfers. Tracking the flow of illicit funds across complex multi-hop wallet networks and decentralized exchanges remains a paramount challenge for cybercrime wings.",
      objective: "Design a system that traces the movement of cryptocurrency funds across blockchain transactions and identifies suspicious multi-hop fund flows.",
      scope: [
        "Visual graph analysis of transaction chains and token flows",
        "Suspicious wallet cluster and linkage identification",
        "Mixing service and privacy coin heuristic detection",
        "Risk scoring and sanction list cross-referencing",
        "Automated multi-hop transaction tracing and export"
      ],
      evaluation: [
        "Accuracy of wallet linkage and path calculation",
        "Clarity and responsiveness of forensic graph visualization",
        "Depth of heuristic anomaly detection",
        "Usability for cybercrime investigation units",
        "Technical feasibility across Bitcoin, Ethereum, and Tron networks"
      ],
      outcome: "A visualization and analysis platform that simplifies cryptocurrency investigation and aids in identifying fund laundering patterns."
    },
    "digital-forensics": {
      category: "Digital Forensics",
      title: "Cyber Forensic Triage & Rapid Evidence Discovery",
      background: "Digital forensic investigations often involve analyzing massive volumes of seized electronic devices and storage drives. Investigators require quick triage tools on-site to prioritize evidence, extract artifacts, and detect critical evidence before forensic imaging.",
      objective: "Develop a cyber forensic triage software that helps investigators quickly identify critical digital evidence from seized devices.",
      scope: [
        "Rapid non-destructive scanning of target storage media",
        "Identification of deleted, hidden, or encrypted files",
        "Instant extraction of high-value artifacts (browser history, logs, registry, chat databases)",
        "Automated chronological event timeline generation",
        "Priority-based evidence classification with forensic hashing"
      ],
      evaluation: [
        "Triage speed and system resource efficiency",
        "Accuracy of forensic artifact discovery",
        "Integrity of data extraction without tampering source files",
        "Automated report generation with cryptographic verification",
        "Investigation workflow relevance"
      ],
      outcome: "A lightweight forensic triage tool that significantly reduces investigation backlog and improves evidence prioritization."
    },
    "threat-intel": {
      category: "Threat Intelligence",
      title: 'Remote Suspect Attribution & Geo-Locating "Digital Tripwire"',
      background: "In many investigations—such as cyber-extortion, kidnapping, or anonymous threats—suspects hide behind VPNs, Proxies, or the Tor network. Traditional IP logging at the server level often only reveals the datacenter IP rather than the true location or device identity. Investigators need an ethical mechanism to lure a suspect into revealing their actual digital footprint.",
      objective: 'Develop a secure "Canary" platform that allows Law Enforcement Officers (LEOs) to generate trackable digital assets which, when accessed by a suspect, bypass common obfuscation to log forensic-grade identification data.',
      scope: [
        "Multi-Vector Bait Generation: Barbed links, PDF/DOCX canary beacons, and trackable images",
        "Advanced Attribution: WebRTC IP leak checks, Canvas ID, hardware specs, OS version, GPU renderer",
        "On-Demand High-Precision Geo-Fencing prompts disguised as verification",
        "Real-Time Tactical Alerts (centralized dashboard notification upon trigger)",
        "Tamper-proof Chain of Custody logging admissible in legal proceedings"
      ],
      evaluation: [
        "Stealth and cross-browser reliability",
        "De-anonymization capability against standard VPNs",
        "Forensic integrity and non-repudiation audit trails",
        "Operational security (OpSec) architecture",
        "Speed and clarity of tactical alerts"
      ],
      outcome: "A stealthy, browser-agnostic tracking platform providing investigators with verified location and device attribution data."
    },
    "secure-ai": {
      category: "Secure AI",
      title: "Offline LLM for Advanced Cyber Investigation",
      background: "Cyber investigations involve highly sensitive, confidential, and classified data that cannot be sent to cloud-based AI providers due to privacy laws and strict security boundaries. Investigative cells need intelligent AI assistance running purely on isolated, air-gapped forensic machines.",
      objective: "Develop an offline Large Language Model (LLM)-based assistant that supports cybercrime investigation workflows completely without internet connectivity.",
      scope: [
        "100% Offline document analysis and forensic log summarization",
        "Natural language querying over extracted forensic timelines",
        "Cyber law (IT Act) and procedural reference lookup",
        "Automated incident summary generation for charge sheets",
        "Secure, containerized local deployment using open-weight models"
      ],
      evaluation: [
        "True air-gapped offline operation without telemetry",
        "Accuracy, citation fidelity, and lack of hallucinations",
        "Strict local privacy and data security compliance",
        "Inference efficiency on standard investigative workstations",
        "Practical utility for case officers"
      ],
      outcome: "An offline AI assistant that drastically accelerates evidence synthesis while preserving total data confidentiality."
    },
    "web3-innovation": {
      category: "Open Innovation",
      title: "Smart Campus & Web3 Security Ecosystem",
      background: "Modern educational and corporate campuses face expanding attack surfaces, from IoT access control vulnerabilities to unverified credentials and phishing. Next-generation systems require decentralized identity and automated threat mitigation.",
      objective: "Create a decentralized identity and automated security enforcement framework for campus credentials and smart infrastructure.",
      scope: [
        "Verifiable digital credentials using decentralized identifiers (DIDs)",
        "Zero-Knowledge Proofs (ZKP) for privacy-preserving authentication",
        "Automated smart contract security auditing and vulnerability scanning",
        "Real-time campus network anomaly detection and intrusion alerting",
        "Unified mobile dashboard for students and security administrators"
      ],
      evaluation: [
        "Security robustness and cryptographic sound architecture",
        "Practical implementation on campus networks",
        "User experience and barrier to entry",
        "Scalability for thousands of concurrent users",
        "Novelty and technical depth"
      ],
      outcome: "A tamper-proof identity and campus security infrastructure that prevents credential forgery and unauthorized access."
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

  // --- Mobile Accordion Logic ---
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item');
      const wasActive = item.classList.contains('active');
      
      document.querySelectorAll('.accordion-item').forEach(i => {
        i.classList.remove('active');
        const icon = i.querySelector('.accordion-chevron');
        if (icon) icon.style.transform = 'rotate(0deg)';
      });

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
                <input type="text" name="member_${i}_dept" required placeholder="e.g. IT, 3rd Year">
              </div>
            </div>
          </div>
        `;
        membersContainer.insertAdjacentHTML('beforeend', memberHtml);
      }
    });
  }

  // Registration Form Submission
  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const teamName = document.getElementById('reg-team-name').value;
      const trackSelect = document.getElementById('reg-track');
      const trackLabel = trackSelect.options[trackSelect.selectedIndex].text;

      // Generate Cyber Pass ID
      const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
      const passId = `GTEC-CYBER-${randomHex}`;

      if (generatedPassId) generatedPassId.textContent = passId;
      if (passTeamName) passTeamName.textContent = teamName;
      if (passTrackName) passTrackName.textContent = trackLabel;

      if (modalFormContainer) modalFormContainer.style.display = 'none';
      if (modalSuccessContainer) modalSuccessContainer.style.display = 'block';

      // Save to localStorage
      try {
        const registrations = JSON.parse(localStorage.getItem('gtec_cyberhack_regs') || '[]');
        registrations.push({
          passId,
          teamName,
          track: trackLabel,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('gtec_cyberhack_regs', JSON.stringify(registrations));
      } catch (err) {
        console.warn('Storage error:', err);
      }

      if (window.lucide) {
        window.lucide.createIcons();
      }
    });
  }
});
