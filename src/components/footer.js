import { icons } from './icons.js';

export function createFooter() {
  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.id = 'contact';

  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <!-- Col 1: Brand Info -->
        <div>
          <a href="#home" class="brand-logo" style="margin-bottom: 16px;">
            <div class="brand-text">
              <span class="brand-title">EDUCARE SKILLS ACADEMY</span>
              <span class="brand-sub">Education Fair (Demo)</span>
            </div>
          </a>
          <p class="footer-brand-desc">
            Education Fair exhibition and stall enquiry demo platform for EDUCARE SKILLS ACADEMY.
          </p>
        </div>

        <!-- Col 2: Quick Links -->
        <div>
          <h4 class="footer-col-title">Navigation</h4>
          <ul class="footer-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About the Fair</a></li>
            <li><a href="#floorplan">Floor Plan</a></li>
            <li><a href="#packages">Packages</a></li>
            <li><a href="#booking">Stall Booking</a></li>
          </ul>
        </div>

        <!-- Col 3: Fair Guidelines -->
        <div>
          <h4 class="footer-col-title">Information</h4>
          <ul class="footer-links">
            <li><a href="#floorplan">Stall Specifications</a></li>
            <li><a href="#packages">Package Inclusions</a></li>
            <li><a href="#booking">Exhibition Policy</a></li>
            <li><a href="#floorplan">Floor Plan Layout</a></li>
          </ul>
        </div>

        <!-- Col 4: Contact & Venue (Demo Placeholders) -->
        <div>
          <h4 class="footer-col-title">Contact</h4>
          <div class="footer-contact-item">
            ${icons.mail}
            <div>
              <b>Email:</b><br />
              <span>contact@yourdomain.com (Demo placeholder)</span>
            </div>
          </div>
          <div class="footer-contact-item">
            ${icons.booth}
            <div>
              <b>Organizing Committee:</b><br />
              <span>EDUCARE SKILLS ACADEMY</span>
            </div>
          </div>
          <div class="footer-contact-item">
            ${icons.mapPin}
            <div>
              <b>Venue:</b><br />
              <span>To be announced (Demo: New Delhi NCR)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Bottom Bar -->
      <div class="footer-bottom">
        <div>
          © EDUCARE SKILLS ACADEMY. All rights reserved. (Demo Platform)
        </div>
        <div style="display: flex; gap: 20px;">
          <a href="#home" style="color: var(--champagne-gold); text-decoration: none;">Back to Top ↑</a>
        </div>
      </div>
    </div>
  `;

  return footer;
}
