import { icons } from './icons.js';
import { STALL_STATUS } from './floorplan3d.js';

export class StallPanel {
  constructor(containerElement, floorPlanInstance, onProceedToBooking) {
    this.container = containerElement;
    this.floorPlan = floorPlanInstance;
    this.onProceedToBooking = onProceedToBooking;
    this.selectedStall = null;
    this.warningMessage = null;
    this.warningTimeout = null;

    this.render();
    this.setupListeners();
  }

  render() {
    const stalls = this.floorPlan.stalls;
    const totalAvailable = stalls.filter(s => s.status === STALL_STATUS.AVAILABLE).length;
    const isSelected = !!this.selectedStall;
    const availableCount = isSelected ? totalAvailable - 1 : totalAvailable;
    const bookedCount = stalls.filter(s => s.status === STALL_STATUS.BOOKED).length;
    const reservedCount = stalls.filter(s => s.status === STALL_STATUS.RESERVED).length;
    const selectedCount = isSelected ? 1 : 0;

    this.container.innerHTML = `
      <div class="stall-sidebar-panel">
        <!-- Live Statistics Mini-Bar -->
        <div class="stats-counter-strip">
          <div class="counter-box">
            <span class="counter-num avail" id="cnt-avail">${availableCount}</span>
            <span class="counter-label">Available</span>
          </div>
          <div class="counter-box">
            <span class="counter-num book" id="cnt-book">${bookedCount}</span>
            <span class="counter-label">Booked</span>
          </div>
          <div class="counter-box">
            <span class="counter-num res" id="cnt-res">${reservedCount}</span>
            <span class="counter-label">Reserved</span>
          </div>
          <div class="counter-box">
            <span class="counter-num sel" id="cnt-sel">${selectedCount}</span>
            <span class="counter-label">Selected</span>
          </div>
        </div>

        <!-- Dedicated Selected Stall Card -->
        <div class="stall-details-card" id="stall-card-content">
          ${this.getCardContentHTML()}
        </div>

        <!-- Stall Inclusions Box -->
        <div class="benefits-sidebar-card">
          <h4 class="benefits-sidebar-title">
            Stall Inclusions (Standard Demo Layout)
          </h4>
          <ul class="stall-specs-list">
            <li>${icons.check} 3m x 3m (9 sq.m) Furnished Modular Space</li>
            <li>${icons.check} 4 Visitor / Student Seats in Front of Stall</li>
            <li>${icons.check} 2 Executive Representative Chairs Behind Desk</li>
            <li>${icons.check} 1 Reception Table & Custom Header Fascia</li>
            <li>${icons.check} 5A Multi-Pin Power Socket & 2 LED Spotlights</li>
            <li>${icons.check} Attendee Directory Access (Per Package)</li>
          </ul>
        </div>
      </div>
    `;
  }

  getCardContentHTML() {
    const warningHTML = this.warningMessage ? `
      <div style="background: rgba(245, 158, 11, 0.15); border: 1px solid var(--status-reserved); color: #FBBF24; padding: 12px 14px; border-radius: 10px; font-size: 0.84rem; margin-bottom: 18px; display: flex; align-items: flex-start; gap: 8px;">
        <span style="font-size: 1.1rem; line-height: 1;">⚠</span>
        <span>${this.warningMessage}</span>
      </div>
    ` : '';

    if (!this.selectedStall) {
      return `
        ${warningHTML}
        <div class="stall-empty-state">
          <div class="empty-icon-wrap">
            ${icons.booth}
          </div>
          <h4 class="empty-title">Select an available stall to view its details.</h4>
          <p class="empty-text">
            Click on any booth in the exhibition floor plan to view its location, seating arrangement, and package options.
          </p>
          <div class="quick-pick-stalls">
            <span style="font-size: 0.72rem; color: var(--text-muted); width: 100%; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
              Quick Select Available Stalls:
            </span>
            <button class="quick-pick-btn" data-stall-id="1">S01</button>
            <button class="quick-pick-btn" data-stall-id="5">S05</button>
            <button class="quick-pick-btn" data-stall-id="10">S10</button>
            <button class="quick-pick-btn" data-stall-id="21">S21</button>
            <button class="quick-pick-btn" data-stall-id="25">S25</button>
            <button class="quick-pick-btn" data-stall-id="35">S35</button>
          </div>
        </div>
      `;
    }

    const s = this.selectedStall;
    const isBooked = s.status === STALL_STATUS.BOOKED;
    const isReserved = s.status === STALL_STATUS.RESERVED;

    let statusClass = 'status-selected';
    let statusLabel = 'AVAILABLE';

    if (isBooked) {
      statusClass = 'status-booked';
      statusLabel = 'BOOKED / OCCUPIED';
    } else if (isReserved) {
      statusClass = 'status-reserved';
      statusLabel = 'RESERVED / UNDER REVIEW';
    }

    return `
      ${warningHTML}
      <div class="stall-card-header">
        <div>
          <div class="stall-badge-sub">${s.positionText}</div>
          <div class="stall-big-number selected-gold">${s.name}</div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
          <div class="stall-status-pill ${statusClass}">
            ${statusLabel}
          </div>
          <button class="btn-deselect-stall" id="btn-deselect-stall" style="background: none; border: none; color: var(--text-muted); font-size: 0.75rem; text-decoration: underline; cursor: pointer; padding: 2px 4px;">
            Deselect Stall ✕
          </button>
        </div>
      </div>

      <div class="stall-price-tag">
        <div class="price-sub">Indicative Package Starting At (Demo)</div>
        <div class="price-val">₹60,000* <span style="font-size: 0.82rem; color: var(--text-muted); font-weight: normal;">(Standard Tier)</span></div>
        <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 3px;">*Indicative demo pricing; subject to official confirmation.</div>
      </div>

      <ul class="stall-specs-list">
        <li>${icons.booth} <b>Floor Space:</b> ${s.specs.area}</li>
        <li>${icons.students} <b>Front Seating:</b> ${s.specs.visitorSeats} Visitor / Student Chairs</li>
        <li>${icons.stage} <b>Representative Area:</b> ${s.specs.representativeChairs} Executive Chairs</li>
        <li>${icons.check} <b>Power & Tech:</b> ${s.specs.power}</li>
        <li>${icons.crest} <b>Lighting & Signage:</b> ${s.specs.lighting}</li>
      </ul>

      <button 
        class="btn-3d btn-primary-3d stall-action-btn" 
        id="btn-confirm-stall-selection"
        ${(isBooked || isReserved) ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
      >
        ${(isBooked || isReserved) ? 'Stall Unavailable' : `Proceed with ${s.name} ${icons.arrowRight}`}
      </button>
    `;
  }

  setupListeners() {
    this.container.addEventListener('click', (e) => {
      // Quick pick buttons
      const quickBtn = e.target.closest('.quick-pick-btn');
      if (quickBtn) {
        const id = parseInt(quickBtn.dataset.stallId, 10);
        this.floorPlan.selectStall(id);
        return;
      }

      // Deselect button in card header
      const deselectBtn = e.target.closest('#btn-deselect-stall');
      if (deselectBtn) {
        this.floorPlan.deselectCurrentStall();
        return;
      }

      // Proceed to booking
      const bookBtn = e.target.closest('#btn-confirm-stall-selection');
      if (bookBtn && this.selectedStall && this.selectedStall.status === STALL_STATUS.AVAILABLE) {
        if (this.onProceedToBooking) {
          this.onProceedToBooking(this.selectedStall);
        }
      }
    });
  }

  updateSelection(stall, warningMessage = null) {
    this.selectedStall = stall;
    this.warningMessage = warningMessage;

    if (this.warningTimeout) {
      clearTimeout(this.warningTimeout);
    }

    if (warningMessage) {
      this.warningTimeout = setTimeout(() => {
        this.warningMessage = null;
        this.renderCardOnly();
      }, 5000);
    }

    this.render();
  }

  renderCardOnly() {
    const cardContent = this.container.querySelector('#stall-card-content');
    if (cardContent) {
      cardContent.innerHTML = this.getCardContentHTML();
    }
  }
}
