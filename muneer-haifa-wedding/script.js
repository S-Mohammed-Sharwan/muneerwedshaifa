// ── ScrollTrigger setup ───────────────────────────────────────────────────
gsap.registerPlugin(ScrollTrigger);

if ("scrollRestoration" in history) history.scrollRestoration = "manual";

// ── Schedule flower — tracks scroll through the timeline ──────────────────
function initScheduleFlower() {
  const flower   = document.getElementById('timelineFlower');
  const timeline = document.getElementById('scheduleTimeline');
  if (!flower || !timeline) return;

  const items = timeline.querySelectorAll('.schedule-item');
  if (!items.length) return;

  const tlTop   = timeline.getBoundingClientRect().top + window.scrollY;
  const first   = items[0].getBoundingClientRect();
  const last    = items[items.length - 1].getBoundingClientRect();
  const startY  = (first.top + window.scrollY - tlTop) + first.height / 2;
  const endY    = (last.top  + window.scrollY - tlTop) + last.height  / 2;

  gsap.set(flower, { top: startY });
  gsap.to(flower, {
    top: endY,
    ease: 'none',
    scrollTrigger: {
      trigger: timeline,
      start:   'top 70%',
      end:     'bottom 30%',
      scrub:   1,
    },
  });
}

window.addEventListener('load', () => {
  if (window.innerWidth < 768) return;
  initScheduleFlower();
});

// ── Details flowers — set rotations matching hero bouquet ─────────────────
gsap.set("#detailsFlowers .df-red-small", { rotate: -18, transformOrigin: "bottom right" });
gsap.set("#detailsFlowers .df-red-large", { rotate:   8, transformOrigin: "bottom left"  });

// ── Hero entrance animation (GSAP) ───────────────────────────────────────
function animateHero(delay = 0) {
  gsap.set(".f-red-small", { rotate: -18, transformOrigin: "bottom right" });
  gsap.set(".f-red-large", { rotate:   8, transformOrigin: "bottom left"  });

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.set(".hero-video", { scale: reduce ? 1 : 1.16, transformOrigin: "50% 40%" });

  const tl = gsap.timeline({ defaults: { ease: "power3.out" }, delay });
  if (!reduce) {
    tl.to(".hero-video", { scale: 1.04, duration: 6, ease: "power1.out" }, 0);
  }
  tl.from(".hero-overlay",          { opacity: 0, duration: 1.4 }, 0)
    .from(".hero-bismillah",        { opacity: 0, y: 16, duration: 1.0 }, 0.25)
    .from(".hero-kicker",           { opacity: 0, y: 12, duration: 0.85 }, 0.4)
    .from(".hero-name--a",          { opacity: 0, y: 36, duration: 1.15 }, 0.55)
    .from(".hero-copy h1 .ampersand", { opacity: 0, scale: 0.7, duration: 0.8 }, 0.85)
    .from(".hero-name--b",          { opacity: 0, y: 36, duration: 1.15 }, 0.95)
    .from(".hero-ornament",         { opacity: 0, scaleX: 0, duration: 0.9 }, 1.25);

  if (!reduce) {
    gsap.to(".hero-copy h1", {
      y: -6,
      duration: 4.2,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      delay: delay + 2.2,
    });
  }
}

// ── Mobile detection ──────────────────────────────────────────────────────
const isMobile = window.innerWidth < 768;

const introOverlay      = document.getElementById("introOverlay");
const invitationContent = document.getElementById("invitationContent");

const ENVELOPE_IMG_URLS = [
  "./assets/top_envelope_flap_true_transparent.webp",
  "./assets/bottomenvelope.webp",
  "./assets/leftenvelope.webp",
  "./assets/rightenvelope.webp",
  "./assets/wax-seal-v2.webp",
];

function preloadEnvelopeImages(urls) {
  return Promise.all(
    urls.map(
      (src) =>
        new Promise((resolve) => {
          const im = new Image();
          im.onload = () => resolve();
          im.onerror = () => resolve();
          im.src = src;
        })
    )
  );
}

function lockIntroScroll() {
  document.documentElement.classList.add("intro-scroll-lock");
  document.body.classList.add("intro-scroll-lock");
}

function unlockIntroScroll() {
  document.documentElement.classList.remove("intro-scroll-lock");
  document.body.classList.remove("intro-scroll-lock");
}

let scrollHintInited = false;

function initScrollHintAfterReveal() {
  if (scrollHintInited || window.innerWidth >= 768) return;
  scrollHintInited = true;

  const dismiss = () => {
    invitationContent.classList.add("scroll-hint-done");
    window.removeEventListener("scroll", onScroll, { passive: true });
    clearTimeout(autoFadeId);
  };

  function onScroll() {
    if (window.scrollY > 40) dismiss();
  }

  const autoFadeId = setTimeout(dismiss, 9000);

  requestAnimationFrame(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
  });
}

function revealContent() {
  try {
    document.activeElement?.blur();
  } catch (_) {
    /* noop */
  }
  introOverlay.classList.add("overlay-hidden");
  introOverlay.setAttribute("inert", "");
  invitationContent.classList.add("content-visible");
  invitationContent.setAttribute("aria-hidden", "false");
  unlockIntroScroll();
  requestAnimationFrame(() => {
    try {
      ScrollTrigger.refresh();
    } catch (_) {
      /* noop */
    }
    initScheduleFlower();
  });
}

function startAutoScrollAfterOpen() {
  // Make movement visible soon after the envelope opens while keeping it
  // slow enough to read as a gentle invitation scroll.
  const speed = 105;
  let frame = 0;
  let lastTime = 0;
  let stopped = false;

  const stop = () => {
    if (stopped) return;
    stopped = true;
    if (frame) cancelAnimationFrame(frame);
    window.removeEventListener("wheel", stop, true);
    window.removeEventListener("pointerdown", stop, true);
    window.removeEventListener("touchstart", stop, true);
    window.removeEventListener("keydown", stop, true);
  };

  window.addEventListener("wheel", stop, { capture: true, passive: true });
  // Give the browser's native gesture full control as soon as the guest touches
  // the page. Stopping on touchmove can race the first drag frame on mobile and
  // make the page feel stuck after the auto-scroll pauses.
  window.addEventListener("pointerdown", stop, { capture: true, passive: true });
  window.addEventListener("touchstart", stop, { capture: true, passive: true });
  window.addEventListener("keydown", stop, true);

  const tick = (time) => {
    if (stopped) return;
    const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
    lastTime = time;
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    if (window.scrollY >= maxScroll - 1) {
      stop();
      return;
    }
    window.scrollTo(0, Math.min(maxScroll, window.scrollY + speed * dt));
    frame = requestAnimationFrame(tick);
  };

  frame = requestAnimationFrame(tick);
}

function playHeroVideo(video) {
  if (!video) return;
  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");

  const requestPlay = () => {
    if (!video.paused) return;
    const playRequest = video.play();
    if (playRequest && typeof playRequest.catch === "function") {
      playRequest.catch(() => {});
    }
  };

  video.addEventListener("canplay", requestPlay);
  if (video.networkState === HTMLMediaElement.NETWORK_EMPTY) video.load();
  requestPlay();
}

// Keep the video itself out of the hit-testing tree so mobile swipes can scroll.
// A plain tap on the hero still retries playback through its containing panel.
const heroPanel = document.querySelector(".hero-panel");
heroPanel?.addEventListener("click", () => playHeroVideo(document.getElementById("heroVideo")));

if (!isMobile) {
  invitationContent.setAttribute("aria-hidden", "false");
  playHeroVideo(document.getElementById("heroVideo"));
  // Slight delay for the video to start before text animates in
  animateHero(0.6);
} else {
  // Mobile: 4-flap cinematic envelope
  const envScene = document.getElementById("envScene");
  const sealArea = document.getElementById("sealArea");
  const sealBtn  = document.getElementById("sealBtn");
  const sealRipple = document.getElementById("sealRipple");
  const heroVideo = document.getElementById("heroVideo");
  let opened = false;

  lockIntroScroll();
  introOverlay.setAttribute("aria-busy", "true");

  const ENV_PRELOAD_MAX_WAIT_MS = 2500;
  Promise.race([
    preloadEnvelopeImages(ENVELOPE_IMG_URLS),
    new Promise((resolve) => setTimeout(resolve, ENV_PRELOAD_MAX_WAIT_MS)),
  ]).finally(() => {
    introOverlay.classList.add("env-ready");
    introOverlay.setAttribute("aria-busy", "false");
  });

  function startInviteMusic() {
    const audio = document.getElementById("weddingAudio");
    if (!audio) return;
    // Native looping waits for the complete track before starting it again.
    audio.loop = true;
    if (audio.networkState === HTMLMediaElement.NETWORK_EMPTY) audio.load();
    if (audio.paused || audio.ended) {
      if (audio.ended) audio.currentTime = 0;
      const playRequest = audio.play();
      if (playRequest && typeof playRequest.catch === "function") {
        playRequest.catch(() => {});
      }
    }
  }

  /* Wax seal zoom+fade (~1s), then flaps open — timings must match styles.css */
  const SEAL_EXIT_MS = 650;
  const FLAP_LONGEST_MS = 180 + 900; /* bottom flap delay + duration */

  sealBtn.addEventListener("click", () => {
    if (opened) return;
    opened = true;
    introOverlay.classList.add("is-opening");
    invitationContent.classList.add("scroll-hint-on");
    initScrollHintAfterReveal();
    try { sealBtn.blur(); } catch (_) { /* noop */ }

    startInviteMusic();
    playHeroVideo(heroVideo);

    sealRipple.classList.add("is-bursting");
    sealArea.classList.add("is-tapped");

    // Hero starts as the envelope begins to open (after seal exits).
    animateHero(SEAL_EXIT_MS / 1000);

    window.setTimeout(() => {
      envScene.classList.add("is-open");
    }, SEAL_EXIT_MS);

    window.setTimeout(() => {
      revealContent();
      window.setTimeout(startAutoScrollAfterOpen, 700);
    }, SEAL_EXIT_MS + FLAP_LONGEST_MS + 200);
  });
}

// ── Countdown timer ───────────────────────────────────────────────────────
// Nikah: Thursday 8 October 2026, 11:30 AM IST.
const weddingDate = new Date("2026-11-23T11:30:00+05:30");

function pad(n) { return String(n).padStart(2, "0"); }

function tick() {
  const diff = weddingDate - Date.now();

  if (diff <= 0) {
    ["cd-days", "cd-hours", "cd-mins", "cd-secs"].forEach(
      (id) => (document.getElementById(id).textContent = "00")
    );
    return;
  }

  document.getElementById("cd-days").textContent  = pad(Math.floor(diff / 86400000));
  document.getElementById("cd-hours").textContent = pad(Math.floor((diff % 86400000) / 3600000));
  document.getElementById("cd-mins").textContent  = pad(Math.floor((diff % 3600000)  / 60000));
  document.getElementById("cd-secs").textContent  = pad(Math.floor((diff % 60000)    / 1000));
}

tick();
setInterval(tick, 1000);

// ── RSVP form (guard: form is removed if section is replaced) ────────────
const rsvpForm = document.getElementById("rsvpForm");
if (rsvpForm) {
  rsvpForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!e.target.checkValidity()) { e.target.reportValidity(); return; }
    e.target.hidden = true;
    document.getElementById("rsvpThanks").hidden = false;
  });
}

// ── RSVP modal → Formspree (free inbox at https://formspree.io) ─────────
(function initRsvpDialog() {
  const dialog = document.getElementById("rsvpDialog");
  const openBtn = document.getElementById("rsvpOpenBtn");
  const closeX = document.getElementById("rsvpDialogCloseX");
  const form = document.getElementById("rsvpModalForm");
  const formWrap = document.getElementById("rsvpDialogFormWrap");
  const thanks = document.getElementById("rsvpDialogThanks");
  const thanksClose = document.getElementById("rsvpDialogThanksClose");
  const dismissBtn = document.getElementById("rsvpDialogDismiss");
  const errEl = document.getElementById("rsvpDialogError");
  const submitBtn = document.getElementById("rsvpDialogSubmit");
  const guestInput = document.getElementById("rsvpGuestCount");
  const guestHint = document.getElementById("rsvpGuestCountHint");

  if (!dialog || !openBtn || typeof dialog.showModal !== "function") return;

  const FORMSPREE_PLACEHOLDER = "YOUR_FORMSPREE_FORM_ID";

  function syncGuestFieldForAttend() {
    if (!form || !guestInput || !guestHint) return;
    const sel = form.querySelector('input[name="will_attend"]:checked');
    if (!sel) {
      guestInput.disabled = true;
      guestInput.value = "";
      guestHint.textContent = "Select whether you will attend first.";
      return;
    }
    if (sel.value === "Yes") {
      guestInput.disabled = false;
      guestHint.textContent = "Include yourself in the total.";
    } else {
      guestInput.disabled = true;
      guestInput.value = "";
      guestHint.textContent = "Not needed if you cannot attend.";
    }
  }

  function hideError() {
    if (!errEl) return;
    errEl.hidden = true;
    errEl.textContent = "";
  }

  function showError(msg) {
    if (!errEl) return;
    errEl.textContent = msg;
    errEl.hidden = false;
  }

  function resetModalState() {
    if (form) form.reset();
    syncGuestFieldForAttend();
    if (formWrap) formWrap.hidden = false;
    if (thanks) thanks.hidden = true;
    hideError();
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit RSVP";
    }
  }

  openBtn.addEventListener("click", () => {
    resetModalState();
    dialog.showModal();
    syncGuestFieldForAttend();
  });

  if (closeX) closeX.addEventListener("click", () => dialog.close());
  if (dismissBtn) dismissBtn.addEventListener("click", () => dialog.close());
  if (thanksClose) thanksClose.addEventListener("click", () => dialog.close());

  dialog.addEventListener("close", resetModalState);

  form?.querySelectorAll('input[name="will_attend"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      hideError();
      syncGuestFieldForAttend();
    });
  });

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();

    const action = form.getAttribute("action") || "";
    if (action.includes(FORMSPREE_PLACEHOLDER)) {
      showError(
        "RSVP form is not connected yet. Replace YOUR_FORMSPREE_FORM_ID in index.html with your Formspree form ID (see comment above the dialog)."
      );
      return;
    }

    const attend = form.querySelector('input[name="will_attend"]:checked');
    if (!attend) {
      showError("Please choose whether you will attend.");
      return;
    }

    if (attend.value === "Yes") {
      const n = parseInt(String(guestInput?.value || "").trim(), 10);
      if (!Number.isFinite(n) || n < 1) {
        showError("Please enter how many people will attend (at least 1, including you).");
        guestInput?.focus();
        return;
      }
    } else if (guestInput) {
      guestInput.disabled = false;
      guestInput.value = "0";
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";

    try {
      const fd = new FormData(form);
      const res = await fetch(form.action, {
        method: "POST",
        body: fd,
        headers: { Accept: "application/json" },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          (data && data.error) ||
          (Array.isArray(data.errors) && data.errors[0] && data.errors[0].message) ||
          "Something went wrong. Please try again later.";
        showError(typeof msg === "string" ? msg : "Submission failed. Please try again.");
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit RSVP";
        syncGuestFieldForAttend();
        return;
      }

      if (formWrap) formWrap.hidden = true;
      if (thanks) thanks.hidden = false;
    } catch {
      showError("Network error. Check your connection and try again.");
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit RSVP";
      syncGuestFieldForAttend();
    }
  });

  syncGuestFieldForAttend();
})();


