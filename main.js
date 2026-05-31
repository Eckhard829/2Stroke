// ===== State Management =====
let stage = 'intro'; // 'intro' | 'age-gate' | 'main'
let fillProgress = 0;
let bottleOffset = 0;
let heroAnimationComplete = false;
let accumulatedScroll = 0;
const MAX_OFFSET = 450;

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

// ===== Check Session Storage =====
function checkAgeVerification() {
  const verified = sessionStorage.getItem('ageVerified');
  if (verified === 'true') {
    showMainSite();
  }
}

// ===== Intro Animation =====
function handleIntroScroll() {
  if (stage !== 'intro') return;
  
  const scrollY = window.scrollY;
  const windowHeight = window.innerHeight;
  fillProgress = Math.min((scrollY / windowHeight) * 100, 100);
  
  if (introFill) {
    introFill.style.clipPath = `inset(0 ${100 - fillProgress}% 0 0)`;
  }
  
  if (fillProgress >= 100) {
    setTimeout(showAgeGate, 300);
  }
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
  
  // Trigger fade in
  setTimeout(() => {
    mainSite.classList.add('visible');
  }, 10);
  
  // Lock scroll initially
  document.body.style.overflow = 'hidden';
  window.scrollTo(0, 0);
  
  // Add hero wheel listener
  window.addEventListener('wheel', handleHeroWheel, { passive: false });
  
  // Initialize scroll animations
  initScrollAnimations();
}

// ===== Hero Wheel Animation =====
function handleHeroWheel(e) {
  if (heroAnimationComplete) return;
  
  e.preventDefault();
  
  accumulatedScroll += e.deltaY * 0.8;
  accumulatedScroll = Math.max(0, Math.min(accumulatedScroll, MAX_OFFSET * 2));
  
  bottleOffset = Math.min(accumulatedScroll * 0.5, MAX_OFFSET);
  
  // Update bottle positions
  bottleLeft.style.transform = `translateX(calc(-50% - ${bottleOffset}px))`;
  bottleRight.style.transform = `translateX(calc(50% + ${bottleOffset}px))`;
  
  // Update light leak opacity
  lightLeak.style.opacity = Math.min(bottleOffset / 150, 1);
  
  // Update hero content opacity
  heroContent.style.opacity = Math.min(bottleOffset / 200, 1);
  
  // Update scroll hint text
  if (bottleOffset >= MAX_OFFSET) {
    heroAnimationComplete = true;
    heroScrollHint.textContent = 'Scroll to explore';
    document.body.style.overflow = '';
  }
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
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.1 }
  );
  
  const animatedSections = document.querySelectorAll('[data-animate]');
  animatedSections.forEach((section) => observer.observe(section));
}

// ===== Event Listeners =====
window.addEventListener('scroll', handleIntroScroll);

if (ageYesBtn) {
  ageYesBtn.addEventListener('click', () => handleAgeVerification(true));
}

if (ageNoBtn) {
  ageNoBtn.addEventListener('click', () => handleAgeVerification(false));
}

if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener('click', toggleMobileMenu);
}

// Close mobile menu when clicking a link
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
