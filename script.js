/**
 * ==============================================================================
 * AI IN EDUCATION — INTERACTIVE CLIENT SCRIPT
 * Features:
 *   1. Full HTML5 Audio Player for ElevenLabs voice (play/pause, seek, volume, speed, visualizer)
 *   2. Theme Switcher (Dark / Light mode with LocalStorage persistence)
 *   3. Mobile Navigation Drawer & Smooth Scrolling with ScrollSpy
 *   4. Interactive "Explore an AI Fact" Generator with Clipboard Copy & Toast
 *   5. Complete 3-Question Multiple Choice Quiz with Instant Feedback & Score Tracking
 *   6. Scroll-reveal Animations & Interactive 3D Card Hover Effects
 *   7. Back-to-Top Floating Button
 * ==============================================================================
 */

// Run when the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ==========================================================================
     MODULE 1: THEME TOGGLE (DARK / LIGHT MODE)
     ========================================================================== */
  const themeToggleBtn = document.getElementById('themeToggle');
  const htmlRoot = document.documentElement;

  // Retrieve saved theme from localStorage, or default to dark mode
  const savedTheme = localStorage.getItem('eduai-theme') || 'dark';
  htmlRoot.setAttribute('data-theme', savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlRoot.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      htmlRoot.setAttribute('data-theme', newTheme);
      localStorage.setItem('eduai-theme', newTheme);
      showToast(`Switched to ${newTheme} theme`);
    });
  }

  /* ==========================================================================
     MODULE 2: MOBILE NAVIGATION & SMOOTH SCROLLING
     ========================================================================== */
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Toggle mobile navigation drawer
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      menuToggle.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close mobile menu when a nav link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        menuToggle.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Active section indicator (ScrollSpy)
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      const matchingLink = document.querySelector(`.nav-link[href*="${sectionId}"]`);

      if (matchingLink) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          matchingLink.classList.add('active');
        } else {
          matchingLink.classList.remove('active');
        }
      }
    });
  }, { passive: true });

  /* ==========================================================================
     MODULE 3: ELEVENLABS AUDIO PLAYER CONTROLS
     Source: audio/elevenlabs.mp3
     ========================================================================== */
  const audio = document.getElementById('audioElement');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const iconPlay = playPauseBtn ? playPauseBtn.querySelector('.icon-play') : null;
  const iconPause = playPauseBtn ? playPauseBtn.querySelector('.icon-pause') : null;
  const rewindBtn = document.getElementById('rewindBtn');
  const forwardBtn = document.getElementById('forwardBtn');
  const progressWrapper = document.getElementById('progressWrapper');
  const progressFill = document.getElementById('progressFill');
  const progressThumb = document.getElementById('progressThumb');
  const currentTimeEl = document.getElementById('currentTime');
  const totalDurationEl = document.getElementById('totalDuration');
  const volumeSlider = document.getElementById('volumeSlider');
  const muteBtn = document.getElementById('muteBtn');
  const volumeHighIcon = muteBtn ? muteBtn.querySelector('.volume-high-icon') : null;
  const volumeMutedIcon = muteBtn ? muteBtn.querySelector('.volume-muted-icon') : null;
  const volumePercent = document.getElementById('volumePercent');
  const speedButtons = document.querySelectorAll('.speed-btn');
  const playerStatusBadge = document.getElementById('playerStatusBadge');
  const playerStatusText = document.getElementById('playerStatusText');
  const visualizerContainer = document.getElementById('visualizerContainer');
  const audioErrorAlert = document.getElementById('audioErrorAlert');
  const transcriptToggle = document.getElementById('transcriptToggle');
  const transcriptContent = document.getElementById('transcriptContent');

  let isAudioSeeking = false;
  let previousVolume = 0.85;

  /**
   * Helper function: format seconds into MM:SS format
   * @param {number} sec - Time in seconds
   * @returns {string} Formatted time string
   */
  function formatTime(sec) {
    if (isNaN(sec) || sec < 0) return '00:00';
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    const mm = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const ss = seconds < 10 ? `0${seconds}` : `${seconds}`;
    return `${mm}:${ss}`;
  }

  // Update total duration when metadata is ready
  if (audio) {
    audio.addEventListener('loadedmetadata', () => {
      if (totalDurationEl && !isNaN(audio.duration)) {
        totalDurationEl.textContent = formatTime(audio.duration);
      }
      if (audioErrorAlert) audioErrorAlert.style.display = 'none';
    });

    audio.addEventListener('durationchange', () => {
      if (totalDurationEl && !isNaN(audio.duration)) {
        totalDurationEl.textContent = formatTime(audio.duration);
      }
    });

    // Update progress bar and current time during playback
    audio.addEventListener('timeupdate', () => {
      if (!isAudioSeeking && audio.duration) {
        const percent = (audio.currentTime / audio.duration) * 100;
        if (progressFill) progressFill.style.width = `${percent}%`;
        if (progressThumb) progressThumb.style.left = `${percent}%`;
        if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
      }
    });

    // Audio Play State Transition
    audio.addEventListener('play', () => {
      if (iconPlay) iconPlay.style.display = 'none';
      if (iconPause) iconPause.style.display = 'block';
      if (playerStatusBadge) {
        playerStatusBadge.classList.add('playing');
        playerStatusText.textContent = 'Playing Audio';
      }
      if (visualizerContainer) {
        visualizerContainer.classList.add('playing');
      }
    });

    // Audio Pause State Transition
    audio.addEventListener('pause', () => {
      if (iconPlay) iconPlay.style.display = 'block';
      if (iconPause) iconPause.style.display = 'none';
      if (playerStatusBadge) {
        playerStatusBadge.classList.remove('playing');
        playerStatusText.textContent = 'Paused';
      }
      if (visualizerContainer) {
        visualizerContainer.classList.remove('playing');
      }
    });

    // Audio Ended State Transition
    audio.addEventListener('ended', () => {
      if (iconPlay) iconPlay.style.display = 'block';
      if (iconPause) iconPause.style.display = 'none';
      if (playerStatusBadge) {
        playerStatusBadge.classList.remove('playing');
        playerStatusText.textContent = 'Completed';
      }
      if (visualizerContainer) {
        visualizerContainer.classList.remove('playing');
      }
      if (progressFill) progressFill.style.width = '0%';
      if (progressThumb) progressThumb.style.left = '0%';
      if (currentTimeEl) currentTimeEl.textContent = '00:00';
    });

    // Handle media error gracefully if audio/elevenlabs.mp3 is missing
    audio.addEventListener('error', () => {
      if (audioErrorAlert) audioErrorAlert.style.display = 'flex';
      if (playerStatusText) playerStatusText.textContent = 'Audio File Missing';
      if (iconPlay) iconPlay.style.display = 'block';
      if (iconPause) iconPause.style.display = 'none';
    });
  }

  // Play / Pause Button Click Handler
  if (playPauseBtn && audio) {
    playPauseBtn.addEventListener('click', () => {
      if (audio.paused || audio.ended) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.warn('Playback error or audio file not loaded yet:', err);
            if (audioErrorAlert) audioErrorAlert.style.display = 'flex';
            showToast('Please place elevenlabs.mp3 into the audio/ folder');
          });
        }
      } else {
        audio.pause();
      }
    });
  }

  // Rewind 10 Seconds
  if (rewindBtn && audio) {
    rewindBtn.addEventListener('click', () => {
      audio.currentTime = Math.max(0, audio.currentTime - 10);
      showToast('Rewound -10s');
    });
  }

  // Forward 10 Seconds
  if (forwardBtn && audio) {
    forwardBtn.addEventListener('click', () => {
      if (!isNaN(audio.duration)) {
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
        showToast('Skipped +10s');
      }
    });
  }

  // Seekable Progress Bar Interaction
  if (progressWrapper && audio) {
    const handleSeek = (e) => {
      const rect = progressWrapper.getBoundingClientRect();
      const clickPosition = (e.clientX - rect.left) / rect.width;
      const boundedPosition = Math.max(0, Math.min(1, clickPosition));
      
      if (!isNaN(audio.duration) && audio.duration > 0) {
        audio.currentTime = boundedPosition * audio.duration;
        const percent = boundedPosition * 100;
        if (progressFill) progressFill.style.width = `${percent}%`;
        if (progressThumb) progressThumb.style.left = `${percent}%`;
        if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
      }
    };

    progressWrapper.addEventListener('click', handleSeek);
  }

  // Playback Speed Selector (0.75x, 1.0x, 1.25x, 1.5x)
  speedButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      speedButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const speed = parseFloat(btn.dataset.speed);
      if (audio) audio.playbackRate = speed;
      showToast(`Playback speed set to ${speed}x`);
    });
  });

  // Volume Slider Control
  if (volumeSlider && audio) {
    volumeSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      audio.volume = val;
      audio.muted = (val === 0);
      updateVolumeUI(val);
    });
  }

  // Mute / Unmute Toggle Button
  if (muteBtn && audio) {
    muteBtn.addEventListener('click', () => {
      if (audio.muted || audio.volume === 0) {
        audio.muted = false;
        audio.volume = previousVolume > 0 ? previousVolume : 0.85;
        if (volumeSlider) volumeSlider.value = audio.volume;
        updateVolumeUI(audio.volume);
      } else {
        previousVolume = audio.volume;
        audio.muted = true;
        audio.volume = 0;
        if (volumeSlider) volumeSlider.value = 0;
        updateVolumeUI(0);
      }
    });
  }

  /**
   * Helper function: updates volume icon and percentage display
   * @param {number} vol - Volume between 0.0 and 1.0
   */
  function updateVolumeUI(vol) {
    const percentage = Math.round(vol * 100);
    if (volumePercent) volumePercent.textContent = `${percentage}%`;

    if (vol === 0) {
      if (volumeHighIcon) volumeHighIcon.style.display = 'none';
      if (volumeMutedIcon) volumeMutedIcon.style.display = 'block';
    } else {
      if (volumeHighIcon) volumeHighIcon.style.display = 'block';
      if (volumeMutedIcon) volumeMutedIcon.style.display = 'none';
    }
  }

  // Audio Transcript Collapsible Accordion
  if (transcriptToggle && transcriptContent) {
    transcriptToggle.addEventListener('click', () => {
      const isExpanded = transcriptToggle.classList.toggle('expanded');
      transcriptContent.classList.toggle('open');
      transcriptToggle.setAttribute('aria-expanded', String(isExpanded));
    });
  }

  /* ==========================================================================
     MODULE 4: EXPLORE AN AI FACT (DYNAMIC FACT GENERATOR)
     ========================================================================== */
  const aiFacts = [
    {
      category: "Personalized Learning",
      text: "According to a UNESCO report, AI-driven adaptive learning systems can improve student proficiency scores by up to 30% compared to traditional, one-size-fits-all curricula.",
      source: "UNESCO Global Education Monitoring Report"
    },
    {
      category: "Teacher Productivity",
      text: "A McKinsey & Company study found that educators spend 20% to 40% of their weekly hours on administrative tasks like grading, which AI automation can cut in half.",
      source: "McKinsey & Company: How AI will transform teaching"
    },
    {
      category: "Neural Audio Synthesis",
      text: "Voice AI engines like ElevenLabs use deep neural synthesis to convert textbooks into human-like audiobooks with emotive context, aiding students with dyslexia and ADHD.",
      source: "MIT Technology Review & Speech AI Research"
    },
    {
      category: "Language Inclusivity",
      text: "AI neural translation models now support real-time multilingual transcription across over 100 languages, allowing immigrant and international students to understand university lectures seamlessly.",
      source: "OECD Future of Education and Skills 2030"
    },
    {
      category: "Intelligent Tutoring",
      text: "Controlled studies from Carnegie Mellon University revealed that students using cognitive AI tutors mastered algebra concepts in nearly half the time of control groups.",
      source: "Carnegie Mellon Open Learning Initiative"
    },
    {
      category: "Student Retention",
      text: "Predictive early-warning machine learning models help universities spot students at risk of failing up to 6 weeks before midterms, boosting retention rates by 35%.",
      source: "Stanford Educational Data Mining Conference"
    },
    {
      category: "Formative Feedback",
      text: "Automated feedback systems provide instant, iterative code and essay critiques, leading to a 42% higher rate of student assignment revision before final submission.",
      source: "Harvard Graduate School of Education"
    },
    {
      category: "Global Accessibility",
      text: "Over 1.5 billion students worldwide have gained access to on-demand AI study companions, democratizing access to high-caliber personalized tutoring beyond wealthy school districts.",
      source: "World Economic Forum Education 4.0 Report"
    }
  ];

  let currentFactIndex = 0;
  const factBadge = document.getElementById('factCategory');
  const factCounter = document.getElementById('factCounter');
  const factDisplay = document.getElementById('factDisplay');
  const factSource = document.getElementById('factSource');
  const nextFactBtn = document.getElementById('nextFactBtn');
  const copyFactBtn = document.getElementById('copyFactBtn');

  /**
   * Display a new fact with smooth CSS transition
   * @param {number} index - Index of the fact to show
   */
  function displayFact(index) {
    if (!factDisplay) return;

    // Apply fade-out effect
    factDisplay.classList.add('fade-out');

    setTimeout(() => {
      const fact = aiFacts[index];
      if (factBadge) factBadge.textContent = fact.category;
      if (factCounter) factCounter.textContent = `Fact ${index + 1} of ${aiFacts.length}`;
      if (factDisplay) factDisplay.textContent = fact.text;
      if (factSource) factSource.textContent = `Source: ${fact.source}`;

      // Apply fade-in effect
      factDisplay.classList.remove('fade-out');
      factDisplay.classList.add('fade-in');
      setTimeout(() => factDisplay.classList.remove('fade-in'), 300);
    }, 200);
  }

  if (nextFactBtn) {
    nextFactBtn.addEventListener('click', () => {
      currentFactIndex = (currentFactIndex + 1) % aiFacts.length;
      displayFact(currentFactIndex);
    });
  }

  // Copy Fact to Clipboard
  if (copyFactBtn) {
    copyFactBtn.addEventListener('click', () => {
      const current = aiFacts[currentFactIndex];
      const textToCopy = `"${current.text}" — ${current.source}`;
      
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast('AI Fact copied to clipboard!');
      }).catch(() => {
        showToast('Unable to copy to clipboard');
      });
    });
  }

  /* ==========================================================================
     MODULE 5: INTERACTIVE 3-QUESTION MULTIPLE CHOICE QUIZ
     ========================================================================== */
  const quizData = [
    {
      question: "What is the primary objective of AI-driven adaptive learning systems in schools?",
      options: [
        { letter: "A", text: "To replace human educators and automate classroom leadership." },
        { letter: "B", text: "To dynamically calibrate content pacing and difficulty to each student's mastery.", correct: true },
        { letter: "C", text: "To eliminate textbooks and abolish formal examinations entirely." },
        { letter: "D", text: "To enforce a uniform, rigid curriculum where all students learn at the exact same speed." }
      ],
      explanation: "Adaptive learning uses cognitive diagnostic models to detect individual knowledge gaps and calibrate difficulty, helping students master material up to 2.5x faster."
    },
    {
      question: "Which artificial intelligence technology enables platforms like ElevenLabs to generate natural, expressive voice narration?",
      options: [
        { letter: "A", text: "Deep neural networks and acoustic transformer text-to-speech models.", correct: true },
        { letter: "B", text: "Mechanical analog audio loops pre-recorded in the 1980s." },
        { letter: "C", text: "Basic lookup tables that concatenate robotic robotic soundbites without tone." },
        { letter: "D", text: "Radio frequency synthesis with no contextual language understanding." }
      ],
      explanation: "ElevenLabs uses deep learning neural vocoders and transformer models that capture human rhythm, emotion, and nuance for lifelike auditory learning."
    },
    {
      question: "How does automated AI assessment and grading most positively impact teachers?",
      options: [
        { letter: "A", text: "It allows teachers to completely ignore student evaluations." },
        { letter: "B", text: "It only works on simple binary yes/no questions." },
        { letter: "C", text: "It automates repetitive grading, freeing teachers for 1-on-1 mentorship and creative lessons.", correct: true },
        { letter: "D", text: "It reduces student contact hours down to zero." }
      ],
      explanation: "By taking over hours of repetitive grading, AI frees up educators' time to focus on empathetic guidance, creative discussion, and individual mentorship."
    }
  ];

  let currentQuizStep = 0;
  let userScore = 0;
  let answerChosen = false;

  const quizStepText = document.getElementById('quizStepText');
  const quizScoreTracker = document.getElementById('quizScoreTracker');
  const quizProgressFill = document.getElementById('quizProgressFill');
  const quizQuestion = document.getElementById('quizQuestion');
  const quizOptions = document.getElementById('quizOptions');
  const quizFeedback = document.getElementById('quizFeedback');
  const feedbackIcon = document.getElementById('feedbackIcon');
  const feedbackText = document.getElementById('feedbackText');
  const quizNextBtn = document.getElementById('quizNextBtn');
  const quizCard = document.getElementById('quizCard');
  const quizResultsCard = document.getElementById('quizResultsCard');
  const finalScoreDisplay = document.getElementById('finalScoreDisplay');
  const scorePercent = document.getElementById('scorePercent');
  const resultsDescription = document.getElementById('resultsDescription');
  const retakeQuizBtn = document.getElementById('retakeQuizBtn');

  /**
   * Load and render the current quiz question
   */
  function loadQuestion(stepIndex) {
    answerChosen = false;
    const currentQ = quizData[stepIndex];

    // Update Header indicators
    if (quizStepText) quizStepText.textContent = `Question ${stepIndex + 1} of ${quizData.length}`;
    if (quizScoreTracker) quizScoreTracker.textContent = `Score: ${userScore} / ${quizData.length}`;
    if (quizProgressFill) {
      const progressPercent = ((stepIndex + 1) / quizData.length) * 100;
      quizProgressFill.style.width = `${progressPercent}%`;
    }

    // Set Question Title
    if (quizQuestion) quizQuestion.textContent = currentQ.question;

    // Reset Feedback Box and Next Button
    if (quizFeedback) {
      quizFeedback.style.display = 'none';
      quizFeedback.className = 'quiz-feedback-box';
    }
    if (quizNextBtn) {
      quizNextBtn.disabled = true;
      quizNextBtn.textContent = (stepIndex === quizData.length - 1) ? 'View Final Results \u2192' : 'Next Question \u2192';
    }

    // Render Option Buttons
    if (quizOptions) {
      quizOptions.innerHTML = '';
      currentQ.options.forEach((opt, idx) => {
        const optionBtn = document.createElement('button');
        optionBtn.className = 'quiz-option-btn';
        optionBtn.setAttribute('data-index', idx);

        optionBtn.innerHTML = `
          <span class="option-letter">${opt.letter}</span>
          <span class="option-text">${opt.text}</span>
        `;

        optionBtn.addEventListener('click', () => handleOptionSelection(optionBtn, opt, currentQ));
        quizOptions.appendChild(optionBtn);
      });
    }
  }

  /**
   * Handle user choice click
   */
  function handleOptionSelection(selectedBtn, chosenOption, questionData) {
    if (answerChosen) return; // Prevent multiple choices for the same question
    answerChosen = true;

    const allButtons = quizOptions.querySelectorAll('.quiz-option-btn');
    allButtons.forEach(btn => btn.disabled = true);

    if (chosenOption.correct) {
      // Correct choice
      userScore++;
      selectedBtn.classList.add('correct');
      if (quizFeedback) {
        quizFeedback.className = 'quiz-feedback-box correct';
        if (feedbackIcon) feedbackIcon.textContent = '\u2714';
        if (feedbackText) feedbackText.innerHTML = `<strong>Correct!</strong> ${questionData.explanation}`;
        quizFeedback.style.display = 'flex';
      }
    } else {
      // Incorrect choice: highlight chosen in red and the true answer in green
      selectedBtn.classList.add('incorrect');
      allButtons.forEach((btn, idx) => {
        if (questionData.options[idx].correct) {
          btn.classList.add('correct');
        }
      });
      if (quizFeedback) {
        quizFeedback.className = 'quiz-feedback-box incorrect';
        if (feedbackIcon) feedbackIcon.textContent = '\u2716';
        if (feedbackText) feedbackText.innerHTML = `<strong>Not quite.</strong> ${questionData.explanation}`;
        quizFeedback.style.display = 'flex';
      }
    }

    // Update Score Indicator
    if (quizScoreTracker) quizScoreTracker.textContent = `Score: ${userScore} / ${quizData.length}`;

    // Enable next button
    if (quizNextBtn) quizNextBtn.disabled = false;
  }

  // Next Question / View Results Button Handler
  if (quizNextBtn) {
    quizNextBtn.addEventListener('click', () => {
      if (currentQuizStep < quizData.length - 1) {
        currentQuizStep++;
        loadQuestion(currentQuizStep);
      } else {
        showQuizResults();
      }
    });
  }

  /**
   * Show final score and assessment summary
   */
  function showQuizResults() {
    if (quizCard) quizCard.style.display = 'none';
    if (quizResultsCard) quizResultsCard.style.display = 'block';

    const percentage = Math.round((userScore / quizData.length) * 100);
    if (finalScoreDisplay) finalScoreDisplay.textContent = userScore;
    if (scorePercent) scorePercent.textContent = `${percentage}%`;

    if (resultsDescription) {
      if (percentage === 100) {
        resultsDescription.textContent = 'Phenomenal! Perfect score! You demonstrate a comprehensive mastery of AI in education, speech synthesis, and adaptive pedagogy.';
      } else if (percentage >= 66) {
        resultsDescription.textContent = 'Great job! You have a solid grasp of how AI augments modern education and empowers personalized instruction.';
      } else {
        resultsDescription.textContent = 'Good effort! Review the AI voice narration and benefits section above to strengthen your understanding of educational AI.';
      }
    }
  }

  // Retake Quiz Handler
  if (retakeQuizBtn) {
    retakeQuizBtn.addEventListener('click', () => {
      currentQuizStep = 0;
      userScore = 0;
      if (quizResultsCard) quizResultsCard.style.display = 'none';
      if (quizCard) quizCard.style.display = 'block';
      loadQuestion(0);
      showToast('Quiz reset. Good luck!');
    });
  }

  // Initialize first question
  loadQuestion(0);

  /* ==========================================================================
     MODULE 6: INTERACTIVE CARD HOVER & SCROLL REVEAL
     ========================================================================== */
  // Reveal elements on scroll using Intersection Observer
  const revealElements = document.querySelectorAll('.benefit-card, .perspective-card');
  revealElements.forEach(el => el.classList.add('reveal-item'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach(el => observer.observe(el));

  // Subtle 3D Card Tilt Effect on Mouse Move
  revealElements.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ==========================================================================
     MODULE 7: BACK TO TOP BUTTON
     ========================================================================== */
  const backToTopBtn = document.getElementById('backToTopBtn');

  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 350) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }, { passive: true });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  /* ==========================================================================
     MODULE 8: REUSABLE TOAST NOTIFICATION UTILITY
     ========================================================================== */
  const toast = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');
  let toastTimer = null;

  /**
   * Display floating toast feedback
   * @param {string} msg - Message to display
   */
  function showToast(msg) {
    if (!toast || !toastMessage) return;
    toastMessage.textContent = msg;
    toast.classList.add('show');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

});
