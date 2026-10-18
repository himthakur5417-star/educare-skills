import { icons } from './icons.js';

export function createNavbar() {
  const header = document.createElement('header');
  header.className = 'site-header';
  header.id = 'site-header';

  header.innerHTML = `
    <div class="container">
      <nav class="navbar" aria-label="Main Navigation">
        <!-- Brand Identity -->
        <a href="#home" class="brand-logo" aria-label="EDUCARE SKILLS ACADEMY">
          <div class="brand-text">
            <span class="brand-title">EDUCARE SKILLS ACADEMY</span>
            <span class="brand-sub">Education Fair (Demo)</span>
          </div>
        </a>

        <!-- Desktop Navigation Menu -->
        <ul class="nav-menu">
          <li><a href="#home" class="nav-link active">Home</a></li>
          <li><a href="#about" class="nav-link">About the Fair</a></li>
          <li><a href="#floorplan" class="nav-link">Floor Plan</a></li>
          <li><a href="#packages" class="nav-link">Packages</a></li>
          <li><a href="#booking" class="nav-link">Stall Booking</a></li>
          <li><a href="#contact" class="nav-link">Contact</a></li>
        </ul>

        <!-- Action CTA & Mobile Hamburger -->
        <div class="nav-actions">
          <a href="#floorplan" class="btn-3d btn-primary-3d nav-cta-btn">
            Explore Available Stalls
          </a>
          <button class="mobile-toggle" id="mobile-toggle-btn" aria-label="Toggle Navigation Menu">
            ${icons.menu}
          </button>
        </div>
      </nav>
    </div>

    <!-- Mobile Drawer Menu (Hidden on desktop via CSS display: none) -->
    <div class="mobile-drawer" id="mobile-drawer">
      <a href="#home" class="nav-link">Home</a>
      <a href="#about" class="nav-link">About the Fair</a>
      <a href="#floorplan" class="nav-link">Exhibition Floor Plan</a>
      <a href="#packages" class="nav-link">Participation Packages</a>
      <a href="#booking" class="nav-link">Stall Booking</a>
      <a href="#contact" class="nav-link">Contact</a>
      <div style="margin-top: 10px;">
        <a href="#floorplan" class="btn-3d btn-primary-3d" style="width: 100%; text-decoration: none;">
          Explore Stalls
        </a>
      </div>
    </div>
  `;

  // Scroll listener for sticky header styling
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile drawer toggle listener
  const toggleBtn = header.querySelector('#mobile-toggle-btn');
  const drawer = header.querySelector('#mobile-drawer');

  if (toggleBtn && drawer) {
    toggleBtn.addEventListener('click', () => {
      drawer.classList.toggle('active');
    });

    // Close drawer when link clicked
    drawer.querySelectorAll('.nav-link, a').forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('active');
      });
    });
  }

  return header;
}
