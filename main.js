// ===== State Management =====
let stage = 'intro';
let fillProgress = 0;
let heroAnimationComplete = false;
let accumulatedScroll = 0;

const MAX_OFFSET = 450;       // desktop: how far bottles go left/right
const MAX_OFFSET_MOBILE = 200; // mobile: how far bottles go up/down

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

function isMobile() {
  return window.innerWidth < 768;
}

// ===== Check Session Storage =====
function checkAgeVerification() {
  if (sessionStorage.getItem('ageVerified') === 'true') showMainSite();
}

// ===== Intro Animation =====
function handleIntroScroll() {
  if (stage !== 'intro') return;
  fillProgress = Math.min((window.scrollY / window.innerHeight) * 100, 100);
  if (introFill) introFill.style.clipPath = `inset(0 ${100 - fillProgress}% 0 0)`;
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

  // Set initial bottle positions
  setInitialBottlePositions();

  // Lock scroll for hero animation
  document.body.style.overflow = 'hidden';
  window.scrollTo(0, 0);

  window.addEventListener('wheel', handleHeroWheel, { passive: false });
  window.addEventListener('touchstart', handleHeroTouchStart, { passive: true });
  window.addEventListener('touchmove', handleHeroTouchMove, { passive: false });

  initScrollAnimations();
}

// ===== Set initial bottle positions =====
function setInitialBottlePositions() {
  if (isMobile()) {
    // Center both bottles horizontally, side by side, rotated 90deg
    // hero center = 50% from top
    // left bottle: left quarter of screen, centered vertically
    // right bottle: right quarter of screen, centered vertically
    bottleLeft.style.position = 'absolute';
    bottleLeft.style.left = '25%';
    bottleLeft.style.top = '50%';
    bottleLeft.style.transform = 'translate(-50%, -50%) rotate(90deg)';

    bottleRight.style.position = 'absolute';
    bottleRight.style.left = '75%';
    bottleRight.style.top = '50%';
    bottleRight.style.transform = 'translate(-50%, -50%) rotate(90deg)';
  }
}

// ===== Update bottle positions during animation =====
function updateBottlePositions(offset) {
  const maxOffset = isMobile() ? MAX_OFFSET_MOBILE : MAX_OFFSET;
  const progress = Math.min(offset / maxOffset, 1);

  if (isMobile()) {
    // Bottles move: left one goes UP toward center-top, right one goes DOWN toward center-bottom
    // X: both converge toward center (50%) as they move
    // Y: left goes up, right goes down from 50%
    const rotation = 90 + (progress * 90); // 90deg -> 180deg
    const leftX = 25 + (progress * 25); // 25% -> 50%
    const rightX = 75 - (progress * 25); // 75% -> 50%
    const yOffset = progress * MAX_OFFSET_MOBILE; // 0 -> 200px

    bottleLeft.style.transform = `translate(-50%, calc(-50% - ${yOffset}px)) rotate(${rotation}deg)`;
    bottleRight.style.transform = `translate(-50%, calc(-50% + ${yOffset}px)) rotate(${rotation}deg)`;
    bottleLeft.style.left = `${leftX}%`;
    bottleRight.style.left = `${rightX}%`;
  } else {
    bottleLeft.style.transform = `translateX(calc(-50% - ${offset}px))`;
    bottleRight.style.transform = `translateX(calc(50% + ${offset}px))`;
  }

  lightLeak.style.opacity = Math.min(progress * 1.5, 1);
  heroContent.style.opacity = Math.min(progress * 1.5, 1);
}

// ===== Hero Wheel (Desktop) =====
function handleHeroWheel(e) {
  if (heroAnimationComplete) return;
  e.preventDefault();

  accumulatedScroll += e.deltaY * 0.8;
  accumulatedScroll = Math.max(0, Math.min(accumulatedScroll, MAX_OFFSET * 2));
  const offset = Math.min(accumulatedScroll * 0.5, MAX_OFFSET);
  updateBottlePositions(offset);
  if (offset >= MAX_OFFSET) finishHeroAnimation();
}

// ===== Hero Touch (Mobile) =====
function handleHeroTouchStart(e) {
  if (heroAnimationComplete) return;
  lastTouchY = e.touches[0].clientY;
}

function handleHeroTouchMove(e) {
  if (heroAnimationComplete) return;
  e.preventDefault();

  const currentY = e.touches[0].clientY;
  const deltaY = lastTouchY - currentY;
  lastTouchY = currentY;

  const maxOffset = isMobile() ? MAX_OFFSET_MOBILE : MAX_OFFSET;
  accumulatedScroll += deltaY * 2;
  accumulatedScroll = Math.max(0, Math.min(accumulatedScroll, maxOffset * 2));
  const offset = Math.min(accumulatedScroll * 0.5, maxOffset);
  updateBottlePositions(offset);
  if (offset >= maxOffset) finishHeroAnimation();
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

checkAgeVerification();