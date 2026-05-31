// ===== State Management =====
let stage = 'intro';
let fillProgress = 0;
let bottleOffset = 0;
let heroAnimationComplete = false;
let accumulatedScroll = 0;

// Desktop: bottles go left/right
const MAX_OFFSET = 450;
// Mobile: bottles go up/down
const MAX_OFFSET_MOBILE = 220;

// Touch tracking
let lastTouchY = 0;

// ===== DOM Elements =====
const introScreen = document.getElementById('intro-screen');
const introSpacer = document.getElementById('intro-spacer');
const ageGate = document.getElementById('age-gate');
const mainSite = document.getElementById('main-site');
const introFill = document.querySelector('.intro-text-fill');
const scrollHint = document.querySelector('.scroll-hint');

const ageYesBtn = document.getElementById('age-yes');
const ageNoBtn = document.getElementById('age-no');

const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const menuIcon = document.getElementById('menu-icon');
const closeIcon = document.getElementById('close-icon');

const bottleLeft = document.getElementById('bottle-left');
const bottleRight = document.getElementById('bottle-right');
const lightLeak = document.getElementById('light-leak');
const heroContent = document.getElementById('hero-content');
const heroScrollHint = document.getElementById('hero-scroll-hint');

// ===== Helpers =====
function isMobile() {
  return window.innerWidth < 768;
}

// ===== Check Session Storage =====
function checkAgeVerification() {
  if (sessionStorage.getItem('ageVerified') === 'true') {
    showMainSite();
  }
}

// ===== Intro Animation =====
function handleIntroScroll() {
  if (stage !== 'intro') return;
  fillProgress = Math.min((window.scrollY / window.innerHeight) * 100, 100);
  if (introFill) {
    introFill.style.clipPath = `inset(0 ${100 - fillProgress}% 0 0)`;
  }
  if (fillProgress >= 100) setTimeout(showAgeGate, 300);
}

// ===== Show Age Gate =====
function showAgeGate() {
  stage = 'age-gate';
  introScreen.classList.add('hidden');
  introSpacer.classList.add('hidden');
  scrollHint.classList.add('hidden');
  ageGate.classList.remove('hidden');
  ageGate.classList.add('animate-fadeIn');
  window.scrollTo(0, 0);
}

// ===== Age Verification =====
function handleAgeVerification(isOfAge) {
  if (isOfAge) {
    sessionStorage.setItem('ageVerified', 'true');
    showMainSite();
  } else {
    window.location.href = 'https://google.com';
  }
}

// ===== Show Main Site =====
function showMainSite() {
  stage = 'main';
  introScreen.classList.add('hidden');
  introSpacer.classList.add('hidden');
  scrollHint.classList.add('hidden');
  ageGate.classList.add('hidden');
  mainSite.classList.remove('hidden');

  setTimeout(() => mainSite.classList.add('visible'), 10);

  // On mobile, set bottles to starting position of 90deg immediately
  if (isMobile()) {
    if (bottleLeft) bottleLeft.style.transform = 'translateX(-50%) translateY(-50%) rotate(90deg)';
    if (bottleRight) bottleRight.style.transform = 'translateX(-50%) translateY(-50%) rotate(90deg)';
  }

  // Lock scroll for hero animation on both mobile and desktop
  document.body.style.overflow = 'hidden';
  window.scrollTo(0, 0);

  // Desktop: wheel
  window.addEventListener('wheel', handleHeroWheel, { passive: false });
  // Mobile & tablet: touch
  window.addEventListener('touchstart', handleHeroTouchStart, { passive: true });
  window.addEventListener('touchmove', handleHeroTouchMove, { passive: false });

  initScrollAnimations();
}

// ===== Update bottle positions =====
function updateBottlePositions(offset) {
  if (isMobile()) {
    const maxOffset = MAX_OFFSET_MOBILE;
    const progress = offset / maxOffset; // 0 to 1
    // Start at 90deg, end at 180deg
    const rotation = 90 + (progress * 90);
    // Both bottles centered via CSS (left:50%, top:50%)
    // Left bottle moves UP, right bottle moves DOWN
    bottleLeft.style.transform = `translateX(-50%) translateY(calc(-50% - ${offset}px)) rotate(${rotation}deg)`;
    bottleRight.style.transform = `translateX(-50%) translateY(calc(-50% + ${offset}px)) rotate(${rotation}deg)`;
  } else {
    bottleLeft.style.transform = `translateX(calc(-50% - ${offset}px))`;
    bottleRight.style.transform = `translateX(calc(50% + ${offset}px))`;
  }
  lightLeak.style.opacity = Math.min(offset / 150, 1);
  heroContent.style.opacity = Math.min(offset / (isMobile() ? 120 : 200), 1);
}

// ===== Hero Wheel (Desktop) =====
function handleHeroWheel(e) {
  if (heroAnimationComplete) return;
  e.preventDefault();

  accumulatedScroll += e.deltaY * 0.8;
  accumulatedScroll = Math.max(0, Math.min(accumulatedScroll, MAX_OFFSET * 2));
  bottleOffset = Math.min(accumulatedScroll * 0.5, MAX_OFFSET);

  updateBottlePositions(bottleOffset);

  if (bottleOffset >= MAX_OFFSET) finishHeroAnimation();
}

// ===== Hero Touch (Mobile/Tablet) =====
function handleHeroTouchStart(e) {
  if (heroAnimationComplete) return;
  lastTouchY = e.touches[0].clientY;
}

function handleHeroTouchMove(e) {
  if (heroAnimationComplete) return;
  e.preventDefault();

  const currentY = e.touches[0].clientY;
  const deltaY = lastTouchY - currentY; // positive = swiping up
  lastTouchY = currentY;

  const maxOffset = isMobile() ? MAX_OFFSET_MOBILE : MAX_OFFSET;
  const sensitivity = isMobile() ? 2.5 : 1.5;

  accumulatedScroll += deltaY * sensitivity;
  accumulatedScroll = Math.max(0, Math.min(accumulatedScroll, maxOffset * 2));
  bottleOffset = Math.min(accumulatedScroll * 0.5, maxOffset);

  updateBottlePositions(bottleOffset);

  if (bottleOffset >= maxOffset) finishHeroAnimation();
}

// ===== Finish Hero Animation =====
function finishHeroAnimation() {
  heroAnimationComplete = true;
  if (heroScrollHint) heroScrollHint.textContent = 'Scroll to explore';
  document.body.style.overflow = '';
  window.removeEventListener('wheel', handleHeroWheel);
  window.removeEventListener('touchstart', handleHeroTouchStart);
  window.removeEventListener('touchmove', handleHeroTouchMove);
}

// ===== Mobile Menu =====
function toggleMobileMenu() {
  mobileMenu.classList.toggle('hidden');
  menuIcon.classList.toggle('hidden');
  closeIcon.classList.toggle('hidden');
}

// ===== Scroll Animations =====
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    }),
    { threshold: 0.1 }
  );
  document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
}

// ===== Event Listeners =====
window.addEventListener('scroll', handleIntroScroll);
if (ageYesBtn) ageYesBtn.addEventListener('click', () => handleAgeVerification(true));
if (ageNoBtn) ageNoBtn.addEventListener('click', () => handleAgeVerification(false));
if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', toggleMobileMenu);
if (mobileMenu) {
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      menuIcon.classList.remove('hidden');
      closeIcon.classList.add('hidden');
    });
  });
}

// ===== Initialize =====
checkAgeVerification();