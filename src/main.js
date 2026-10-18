import './style.css';
import { icons } from './components/icons.js';
import { createNavbar } from './components/navbar.js';
import { createHero } from './components/hero.js';
import { createOverview } from './components/overview.js';
import { FloorPlan3D, STALL_STATUS } from './components/floorplan3d.js';
import { StallPanel } from './components/stallPanel.js';
import { createPackages } from './components/packages.js';
import { BookingFormUI } from './components/bookingForm.js';
import { createFooter } from './components/footer.js';
import { init3DCardTiltEffects } from './components/cards3d.js';

// Main Application Coordinator
function initApp() {
  const app = document.querySelector('#app');
  app.innerHTML = '';

  // 1. Navbar
  const navbar = createNavbar();
  app.appendChild(navbar);

  // 2. Hero Section
  const hero = createHero();
  app.appendChild(hero);

  // 3. Overview Section
  const overview = createOverview();
  app.appendChild(overview);

  // 4. Interactive 3D Exhibition Floor Plan Section
  const floorPlanSection = document.createElement('section');
  floorPlanSection.className = 'floorplan-section';
  floorPlanSection.id = 'floorplan';
  floorPlanSection.innerHTML = `
    <div class="container">
      <div class="section-header">
        <span class="section-tag">Floor Plan (Demo Layout)</span>
        <h2 class="section-title">Exhibition <span>Floor Plan</span></h2>
        <p class="section-desc">
          Select an available stall from the demo layout to view details and start an enquiry.
        </p>
      </div>

      <div class="floorplan-wrapper">
        <!-- 3D Viewport Box -->
        <div class="viewport-panel">
          <div class="viewport-header">
            <div class="viewport-title-area">
              <h3>Exhibition Hall A</h3>
              <span class="viewport-badge">40 STALLS • 2 WINGS (DEMO LAYOUT)</span>
            </div>

            <!-- Visual Legend -->
            <div class="floor-legend" id="floor-legend">
              <span class="legend-item"><i class="legend-dot available"></i> Available (<span id="leg-avail-count">34</span>)</span>
              <span class="legend-item"><i class="legend-dot booked"></i> Booked (4)</span>
              <span class="legend-item"><i class="legend-dot reserved"></i> Reserved (2)</span>
              <span class="legend-item"><i class="legend-dot selected"></i> Selected (<span id="leg-sel-count">0</span>)</span>
            </div>
          </div>

          <!-- WebGL 3D Canvas Container -->
          <div class="scene-3d-container" id="floorplan-container">
            <canvas id="floorplan-canvas"></canvas>

            <!-- Camera Perspective HUD Controls (Top Left) -->
            <div class="hud-controls-top">
              <button class="camera-preset-btn active" data-preset="isometric" title="Switch to Isometric View">
                Isometric View
              </button>
              <button class="camera-preset-btn" data-preset="top" title="Switch to Top-Down Plan">
                Top-Down View
              </button>
              <button class="camera-preset-btn" data-preset="stage" title="Perspective from Keynote Stage">
                Stage View
              </button>
              <button class="camera-preset-btn" data-preset="entrance" title="Perspective from Main Entrance">
                Entrance View
              </button>
            </div>

            <!-- Zoom & Reset HUD Controls (Bottom Right) -->
            <div class="hud-controls-right">
              <button class="hud-action-btn" id="btn-zoom-in" title="Zoom In" aria-label="Zoom In">
                ${icons.zoomIn}
              </button>
              <button class="hud-action-btn" id="btn-zoom-out" title="Zoom Out" aria-label="Zoom Out">
                ${icons.zoomOut}
              </button>
              <button class="hud-action-btn" id="btn-reset-view" title="Reset Camera Perspective" aria-label="Reset View">
                ${icons.resetView}
              </button>
            </div>

            <!-- Hint overlay -->
            <div class="hud-hint-bar">
              Drag mouse to rotate • Scroll to zoom • Click any stall to select
            </div>
          </div>

          <!-- Bottom Filter Pills -->
          <div class="filter-pills-bar" id="floor-filters">
            <button class="filter-pill active" data-filter="all">All 40 Stalls (Demo)</button>
            <button class="filter-pill" data-filter="available">Available Only (34)</button>
            <button class="filter-pill" data-filter="left">Left Wing (S01–S20)</button>
            <button class="filter-pill" data-filter="right">Right Wing (S21–S40)</button>
            <button class="filter-pill" data-filter="booked">Booked (4)</button>
            <button class="filter-pill" data-filter="reserved">Reserved (2)</button>
          </div>
        </div>

        <!-- Sidebar Stall Information Panel -->
        <div id="stall-panel-mount"></div>
      </div>
    </div>
  `;
  app.appendChild(floorPlanSection);

  // 5. Booking Form container mount
  const bookingContainer = document.createElement('div');
  app.appendChild(bookingContainer);

  // Initialize Three.js Floor Plan
  const containerEl = floorPlanSection.querySelector('#floorplan-container');
  let floorPlanInstance = null;
  let stallPanelInstance = null;
  let bookingFormInstance = null;

  floorPlanInstance = new FloorPlan3D(containerEl, (stall, warningMessage) => {
    // When a stall is clicked or deselected in 3D, update sidebar, legend, and booking form
    stallPanelInstance.updateSelection(stall, warningMessage);

    // Update legend counters
    const isSelected = !!stall;
    const legAvail = floorPlanSection.querySelector('#leg-avail-count');
    const legSel = floorPlanSection.querySelector('#leg-sel-count');
    if (legAvail) legAvail.textContent = isSelected ? '33' : '34';
    if (legSel) legSel.textContent = isSelected ? '1' : '0';

    if (stall && stall.status === STALL_STATUS.AVAILABLE) {
      bookingFormInstance.setStall(stall);
    } else if (!stall) {
      bookingFormInstance.setStall(null);
    }
  });

  // Initialize Stall Sidebar Panel
  const panelMount = floorPlanSection.querySelector('#stall-panel-mount');
  stallPanelInstance = new StallPanel(panelMount, floorPlanInstance, (selectedStall) => {
    // When user clicks "Proceed with S[XX]", scroll to booking form
    bookingFormInstance.setStall(selectedStall);
    const bookingSec = document.querySelector('#booking');
    if (bookingSec) {
      bookingSec.scrollIntoView({ behavior: 'smooth' });
    }
  });

  // 6. Packages Section (placed above booking form)
  let packagesSection = null;
  packagesSection = createPackages((packageName, packageAmount) => {
    bookingFormInstance.setPackage(packageName);
    if (packagesSection && packagesSection.setSelectedPackage) {
      packagesSection.setSelectedPackage(packageName);
    }
    const bookingSec = document.querySelector('#booking');
    if (bookingSec) {
      bookingSec.scrollIntoView({ behavior: 'smooth' });
    }
  });
  // Insert packages before booking section for logical flow
  app.insertBefore(packagesSection, bookingContainer);

  // Initialize Booking Form with FloorPlan and Packages sync callback
  bookingFormInstance = new BookingFormUI(bookingContainer, floorPlanInstance, (packageName) => {
    if (packagesSection && packagesSection.setSelectedPackage) {
      packagesSection.setSelectedPackage(packageName);
    }
  });

  // 7. Footer
  const footer = createFooter();
  app.appendChild(footer);

  // Setup HUD Camera Controls
  const presetBtns = floorPlanSection.querySelectorAll('.camera-preset-btn');
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const preset = btn.dataset.preset;
      floorPlanInstance.setCameraPreset(preset);
    });
  });

  floorPlanSection.querySelector('#btn-zoom-in').addEventListener('click', () => {
    floorPlanInstance.zoomIn();
  });

  floorPlanSection.querySelector('#btn-zoom-out').addEventListener('click', () => {
    floorPlanInstance.zoomOut();
  });

  floorPlanSection.querySelector('#btn-reset-view').addEventListener('click', () => {
    presetBtns.forEach(b => b.classList.remove('active'));
    presetBtns[0].classList.add('active');
    floorPlanInstance.setCameraPreset('isometric');
  });

  // Setup Floor Filter Pills
  const filterPills = floorPlanSection.querySelectorAll('.filter-pill');
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const filter = pill.dataset.filter;

      // Highlight/focus appropriate booths
      if (filter === 'left') {
        floorPlanInstance.setCameraPreset('isometric');
        floorPlanInstance.selectStall(1);
      } else if (filter === 'right') {
        floorPlanInstance.setCameraPreset('isometric');
        floorPlanInstance.selectStall(21);
      } else if (filter === 'available') {
        floorPlanInstance.selectStall(1);
      } else if (filter === 'booked') {
        floorPlanInstance.selectStall(4);
      } else if (filter === 'reserved') {
        floorPlanInstance.selectStall(6);
      } else {
        floorPlanInstance.setCameraPreset('isometric');
      }
    });
  });

  // Initialize 3D Card Physics Tilt
  init3DCardTiltEffects();

  // Highlight active nav links on scroll
  const sections = document.querySelectorAll('section[id], footer[id]');
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 200;
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        document.querySelectorAll('.site-header .nav-link').forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
