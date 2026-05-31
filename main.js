let stage = 'intro';
let fillProgress = 0;
let heroAnimationComplete = false;
let accumulatedScroll = 0;
const MAX_OFFSET = 450;
let lastTouchY = 0;

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

function isMobile() { return window.innerWidth < 768; }

function checkAgeVerification() {
  if (sessionStorage.getItem('ageVerified') === 'true') showMainSite();
}

function handleIntroScroll() {
  if (stage !== 'intro') return;
  fillProgress = Math.min((window.scrollY / window.innerHeight) * 100, 100);
  if (introFill) introFill.style.clipPath = `inset(0 ${100 - fillProgress}% 0 0)`;
  if (fillProgress >= 100) setTimeout(showAgeGate, 300);
}

function showAgeGate() {
  stage = 'age-gate';
  introScreen.classList.add('hidden');
  introSpacer.classList.add('hidden');
  scrollHint.classList.add('hidden');
  ageGate.classList.remove('hidden');
  ageGate.classList.add('animate-fadeIn');
  window.scrollTo(0, 0);
}

function handleAgeVerification(isOfAge) {
  if (isOfAge) {
    sessionStorage.setItem('ageVerified', 'true');
    showMainSite();
  } else {
    window.location.href = 'https://google.com';
  }
}

function showMainSite() {
  stage = 'main';
  introScreen.classList.add('hidden');
  introSpacer.classList.add('hidden');
  scrollHint.classList.add('hidden');
  ageGate.classList.add('hidden');
  mainSite.classList.remove('hidden');
  setTimeout(() => mainSite.classList.add('visible'), 10);

  document.body.style.overflow = 'hidden';
  window.scrollTo(0, 0);

  window.addEventListener('wheel', handleHeroWheel, { passive: false });
  window.addEventListener('touchstart', handleHeroTouchStart, { passive: true });
  window.addEventListener('touchmove', handleHeroTouchMove, { passive: false });

  initScrollAnimations();
}

function updateBottlePositions(offset) {
  const maxOffset = isMobile() ? Math.round(window.innerHeight * 0.5 - 160) : MAX_OFFSET;
  const progress = Math.min(offset / maxOffset, 1);

  if (isMobile()) {
    const rotation = Math.min(progress * 180, 180);
    bottleLeft.style.transform = `translate(-50%, calc(-50% - ${offset}px)) rotate(${rotation}deg)`;
    bottleRight.style.transform = `translate(-50%, calc(-50% + ${offset}px)) rotate(${rotation}deg)`;
  } else {
    bottleLeft.style.transform = `translateX(calc(-50% - ${offset}px))`;
    bottleRight.style.transform = `translateX(calc(50% + ${offset}px))`;
  }

  lightLeak.style.opacity = Math.min(offset / 150, 1);
  heroContent.style.opacity = Math.min(offset / 200, 1);
}

function handleHeroWheel(e) {
  if (heroAnimationComplete) return;
  e.preventDefault();
  const maxOffset = isMobile() ? Math.round(window.innerHeight * 0.5 - 160) : MAX_OFFSET;
  accumulatedScroll += e.deltaY * 0.8;
  accumulatedScroll = Math.max(0, Math.min(accumulatedScroll, maxOffset * 2));
  const offset = Math.min(accumulatedScroll * 0.5, maxOffset);
  updateBottlePositions(offset);
  if (offset >= maxOffset) finishHeroAnimation();
}

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
  const maxOffset = isMobile() ? Math.round(window.innerHeight * 0.5 - 160) : MAX_OFFSET;
  accumulatedScroll += deltaY * 2;
  accumulatedScroll = Math.max(0, Math.min(accumulatedScroll, maxOffset * 2));
  const offset = Math.min(accumulatedScroll * 0.5, maxOffset);
  updateBottlePositions(offset);
  if (offset >= maxOffset) finishHeroAnimation();
}

function finishHeroAnimation() {
  heroAnimationComplete = true;
  if (heroScrollHint) heroScrollHint.textContent = 'Scroll to explore';
  document.body.style.overflow = '';
  window.removeEventListener('wheel', handleHeroWheel);
  window.removeEventListener('touchstart', handleHeroTouchStart);
  window.removeEventListener('touchmove', handleHeroTouchMove);
}

function toggleMobileMenu() {
  mobileMenu.classList.toggle('hidden');
  menuIcon.classList.toggle('hidden');
  closeIcon.classList.toggle('hidden');
}

function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    }),
    { threshold: 0.1 }
  );
  document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
}

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