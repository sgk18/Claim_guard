/**
 * ClaimGuard Interactive Presentation Engine
 * Controls 16:9 navigation, speaker notes drawer, overview grid, and keyboard shortcuts.
 */

document.addEventListener('DOMContentLoaded', () => {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const totalSlides = slides.length;
  let currentSlide = 0;

  // Chrome Elements
  const currentNumEl = document.getElementById('current-slide-num');
  const totalNumEl = document.getElementById('total-slide-num');
  const progressBar = document.getElementById('deck-progress-bar');
  const prevBtn = document.getElementById('btn-prev');
  const nextBtn = document.getElementById('btn-next');
  const notesBtn = document.getElementById('btn-notes');
  const overviewBtn = document.getElementById('btn-overview');
  const fullscreenBtn = document.getElementById('btn-fullscreen');

  // Drawers & Modals
  const notesDrawer = document.getElementById('speaker-notes-drawer');
  const closeNotesBtn = document.getElementById('btn-close-notes');
  const notesSlideTitle = document.getElementById('notes-slide-title');
  const notesSayContent = document.getElementById('notes-say-content');
  const notesSimpleContent = document.getElementById('notes-simple-content');
  const notesTechContent = document.getElementById('notes-tech-content');
  const notesCaveatContent = document.getElementById('notes-caveat-content');

  const overviewModal = document.getElementById('deck-overview-modal');
  const closeOverviewBtn = document.getElementById('btn-close-overview');
  const overviewGrid = document.getElementById('overview-grid');

  if (totalNumEl) totalNumEl.textContent = totalSlides.toString();

  // Populate Overview Grid
  slides.forEach((slide, idx) => {
    const titleEl = slide.querySelector('.slide-title');
    const titleText = titleEl ? titleEl.textContent : `Slide ${idx + 1}`;
    
    const thumb = document.createElement('div');
    thumb.className = `overview-thumb ${idx === 0 ? 'current' : ''}`;
    thumb.innerHTML = `
      <div class="thumb-num">SLIDE ${idx + 1 < 10 ? '0' + (idx + 1) : idx + 1}</div>
      <div class="thumb-title">${titleText}</div>
    `;
    thumb.addEventListener('click', () => {
      goToSlide(idx);
      closeOverview();
    });
    overviewGrid.appendChild(thumb);
  });

  function updateOverviewHighlight() {
    const thumbs = overviewGrid.querySelectorAll('.overview-thumb');
    thumbs.forEach((t, i) => {
      t.classList.toggle('current', i === currentSlide);
    });
  }

  function updateSlideDisplay() {
    slides.forEach((slide, index) => {
      slide.classList.toggle('active', index === currentSlide);
    });

    if (currentNumEl) {
      currentNumEl.textContent = (currentSlide + 1).toString();
    }

    if (progressBar) {
      const pct = ((currentSlide + 1) / totalSlides) * 100;
      progressBar.style.width = `${pct}%`;
    }

    updateNotesContent();
    updateOverviewHighlight();
  }

  function goToSlide(index) {
    if (index >= 0 && index < totalSlides) {
      currentSlide = index;
      updateSlideDisplay();
    }
  }

  function nextSlide() {
    if (currentSlide < totalSlides - 1) {
      goToSlide(currentSlide + 1);
    }
  }

  function prevSlide() {
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1);
    }
  }

  // Speaker Notes Management
  function updateNotesContent() {
    const activeSlide = slides[currentSlide];
    if (!activeSlide) return;

    const noteData = activeSlide.dataset;
    const titleEl = activeSlide.querySelector('.slide-title');
    
    if (notesSlideTitle) {
      notesSlideTitle.textContent = `Slide ${currentSlide + 1}: ${titleEl ? titleEl.textContent : ''}`;
    }

    if (notesSayContent) {
      notesSayContent.textContent = noteData.say || "Deliver key takeaway for this slide.";
    }

    if (notesSimpleContent) {
      notesSimpleContent.textContent = noteData.simple || "Non-technical executive explanation.";
    }

    if (notesTechContent) {
      notesTechContent.textContent = noteData.tech || "Engineering and architecture details.";
    }

    if (notesCaveatContent) {
      notesCaveatContent.textContent = noteData.caveat || "Key guardrail and limitation.";
    }
  }

  function toggleNotes() {
    notesDrawer.classList.toggle('open');
    if (notesBtn) notesBtn.classList.toggle('active');
  }

  function toggleOverview() {
    overviewModal.classList.toggle('open');
    if (overviewBtn) overviewBtn.classList.toggle('active');
  }

  function closeOverview() {
    overviewModal.classList.remove('open');
    if (overviewBtn) overviewBtn.classList.remove('active');
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  // Event Listeners
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (notesBtn) notesBtn.addEventListener('click', toggleNotes);
  if (closeNotesBtn) closeNotesBtn.addEventListener('click', toggleNotes);
  if (overviewBtn) overviewBtn.addEventListener('click', toggleOverview);
  if (closeOverviewBtn) closeOverviewBtn.addEventListener('click', closeOverview);
  if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    // If overview is open, handle Esc to close
    if (overviewModal.classList.contains('open')) {
      if (e.key === 'Escape') {
        closeOverview();
        return;
      }
    }

    // Handle Spacebar navigation (e.key is " " or "Spacebar"; e.code is "Space")
    if (e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar' || e.key === 'Space') {
      e.preventDefault();
      if (e.shiftKey) {
        prevSlide();
      } else {
        nextSlide();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowRight':
      case 'PageDown':
        e.preventDefault();
        nextSlide();
        break;
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault();
        prevSlide();
        break;
      case 'Home':
        e.preventDefault();
        goToSlide(0);
        break;
      case 'End':
        e.preventDefault();
        goToSlide(totalSlides - 1);
        break;
      case 'p':
      case 'P':
        e.preventDefault();
        toggleNotes();
        break;
      case 'f':
      case 'F':
        e.preventDefault();
        toggleFullscreen();
        break;
      case 'Escape':
        e.preventDefault();
        toggleOverview();
        break;
    }
  });

  // Initialize
  updateSlideDisplay();
});
