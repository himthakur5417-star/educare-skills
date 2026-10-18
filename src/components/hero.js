import { icons } from './icons.js';

export function createHero() {
  const section = document.createElement('section');
  section.className = 'hero-section';
  section.id = 'home';

  section.innerHTML = `
    <div class="container">
      <div class="hero-grid">
        <!-- Hero Text Content -->
        <div class="hero-content">
          <div class="hero-badge-wrap">
            <span class="hero-badge">
              EDUCARE SKILLS ACADEMY • EDUCATION FAIR (DEMO)
            </span>
          </div>

          <h1 class="hero-heading">
            Exhibition Stall <span class="gold-text">Booking</span>
          </h1>

          <p class="hero-lead">
            Connect with prospective Class 12 students (Demo Estimate: 1,000–1,500). View the exhibition floor plan and explore available stalls for your institution.
          </p>

          <div class="hero-actions">
            <a href="#floorplan" class="btn-3d btn-primary-3d">
              Explore Available Stalls
            </a>
            <a href="#packages" class="btn-3d btn-secondary-3d">
              Choose a Package
            </a>
          </div>

          <!-- Hero Key Statistics -->
          <div class="hero-stats">
            <div class="hero-stat-card">
              <div class="hero-stat-number">1,000–1,500*</div>
              <div class="hero-stat-label">Estimated Students (Demo)</div>
            </div>
            <div class="hero-stat-card">
              <div class="hero-stat-number">40</div>
              <div class="hero-stat-label">Stalls (Demo Layout)</div>
            </div>
            <div class="hero-stat-card">
              <div class="hero-stat-number">50+*</div>
              <div class="hero-stat-label">Target Institutions (Demo)</div>
            </div>
          </div>
          <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 10px;">
            *Figures and layout are demo projections subject to official confirmation.
          </div>
        </div>

        <!-- Education Fair Exhibition Preview Visual -->
        <div class="hero-visual-wrap">
          <div class="hero-exhibition-showcase">
            <!-- Showcase Top Bar -->
            <div class="showcase-topbar">
              <div class="showcase-title-wrap">
                <span class="showcase-dot"></span>
                <span class="showcase-title">EXHIBITION FLOOR PLAN PREVIEW</span>
              </div>
              <span class="showcase-badge">40 STALLS • 2 WINGS (DEMO)</span>
            </div>

            <!-- Realistic Exhibition Booths Showcase Visual -->
            <div class="showcase-arena">
              <!-- Stage Indicator at Top of Concourse -->
              <div class="showcase-stage-line">
                <span>↑ CENTRAL PRESENTATION STAGE & AUDITORIUM ↑</span>
              </div>

              <!-- Cluster of 3 Physical Exhibition Stalls -->
              <div class="showcase-booths-cluster">
                <!-- Booth S01 -->
                <div class="showcase-booth-card booth-available">
                  <div class="booth-fascia">
                    <span class="booth-num">S01</span>
                    <span class="booth-status-tag">AVAILABLE</span>
                  </div>
                  <div class="booth-inner">
                    <div class="booth-backwall">
                      <span class="booth-inst-label">UNIVERSITY BOOTH</span>
                    </div>
                    <div class="booth-counter">
                      <span class="counter-top">RECEPTION</span>
                    </div>
                    <div class="booth-chairs-row">
                      <span class="mini-chair" title="Visitor Seat"></span>
                      <span class="mini-chair" title="Visitor Seat"></span>
                      <span class="mini-chair" title="Visitor Seat"></span>
                      <span class="mini-chair" title="Visitor Seat"></span>
                    </div>
                  </div>
                  <div class="booth-wing-label">Left Wing • Front Aisle</div>
                </div>

                <!-- Booth S02 (Highlighted/Selected Demo) -->
                <div class="showcase-booth-card booth-selected">
                  <div class="booth-fascia fascia-gold">
                    <span class="booth-num">S02</span>
                    <span class="booth-status-tag tag-gold">SELECTED ★</span>
                  </div>
                  <div class="booth-inner">
                    <div class="booth-backwall backwall-gold">
                      <span class="booth-inst-label">PRIME BOOTH</span>
                    </div>
                    <div class="booth-counter counter-gold">
                      <span class="counter-top">COUNSELING</span>
                    </div>
                    <div class="booth-chairs-row">
                      <span class="mini-chair chair-gold"></span>
                      <span class="mini-chair chair-gold"></span>
                      <span class="mini-chair chair-gold"></span>
                      <span class="mini-chair chair-gold"></span>
                    </div>
                  </div>
                  <div class="booth-wing-label" style="color: var(--champagne-gold);">Left Wing • Near Stage</div>
                </div>

                <!-- Booth S03 -->
                <div class="showcase-booth-card booth-available">
                  <div class="booth-fascia">
                    <span class="booth-num">S03</span>
                    <span class="booth-status-tag">AVAILABLE</span>
                  </div>
                  <div class="booth-inner">
                    <div class="booth-backwall">
                      <span class="booth-inst-label">COLLEGE BOOTH</span>
                    </div>
                    <div class="booth-counter">
                      <span class="counter-top">RECEPTION</span>
                    </div>
                    <div class="booth-chairs-row">
                      <span class="mini-chair"></span>
                      <span class="mini-chair"></span>
                      <span class="mini-chair"></span>
                      <span class="mini-chair"></span>
                    </div>
                  </div>
                  <div class="booth-wing-label">Left Wing • Standard</div>
                </div>
              </div>

              <!-- Main Entrance Gate Line at Bottom -->
              <div class="showcase-entrance-line">
                <span>↓ MAIN VISITOR ENTRANCE GATE ↓</span>
              </div>
            </div>

            <!-- Showcase Footer -->
            <div class="showcase-footer">
              <div class="showcase-counts">
                <span><b style="color: #FFFFFF;">34</b> Available</span>
                <span><b style="color: #10B981;">4</b> Booked</span>
                <span><b style="color: #F59E0B;">2</b> Reserved</span>
              </div>
              <a href="#floorplan" class="showcase-link">
                View Full Floor Plan →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return section;
}
