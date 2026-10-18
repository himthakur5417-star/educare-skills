import { icons } from './icons.js';
import { PACKAGES_DATA } from './packages.js';
import { isWhatsAppConfigured, getWhatsAppNumber } from '../config.js';

export class BookingFormUI {
  constructor(containerElement, floorPlanInstance, onPackageChangeCallback) {
    this.container = containerElement;
    this.floorPlan = floorPlanInstance;
    this.onPackageChange = onPackageChangeCallback;

    this.selectedStall = null;
    this.selectedPackage = PACKAGES_DATA.find(p => p.id === 'elite') || PACKAGES_DATA[0];

    this.errors = {};
    this.hasAttemptedSubmit = false;

    this.render();
    this.setupListeners();
    this.updateStallDisplayUI();
    this.updatePackageLiveCardUI();
  }

  render() {
    this.container.innerHTML = `
      <section class="booking-section" id="booking">
        <div class="container">
          <div class="section-header">
            <span class="section-tag">Stall Booking Enquiry</span>
            <h2 class="section-title">Enter <span>Your Details</span></h2>
            <p class="section-desc">
              Select an available stall from the demo floor plan, choose a package, and preview your booking enquiry.
            </p>
          </div>

          <div class="booking-form-box">
            <form id="stall-booking-form" novalidate>
              <div class="form-grid">
                <!-- 1. College / University Name -->
                <div class="form-group full-width">
                  <div class="form-label-row">
                    <label class="form-label" for="college-name">
                      College / University Name <span class="req">*</span>
                    </label>
                  </div>
                  <input 
                    type="text" 
                    id="college-name" 
                    name="collegeName"
                    class="form-input" 
                    placeholder="Enter college or university name" 
                    autocomplete="organization"
                    required 
                  />
                  <div class="form-error-msg" id="error-college-name" style="display: none;"></div>
                </div>

                <!-- 2. Contact Person -->
                <div class="form-group">
                  <div class="form-label-row">
                    <label class="form-label" for="contact-person">
                      Contact Person <span class="req">*</span>
                    </label>
                  </div>
                  <input 
                    type="text" 
                    id="contact-person" 
                    name="contactPerson"
                    class="form-input" 
                    placeholder="Enter contact person name" 
                    autocomplete="name"
                    required 
                  />
                  <div class="form-error-msg" id="error-contact-person" style="display: none;"></div>
                </div>

                <!-- Designation (Optional) -->
                <div class="form-group">
                  <div class="form-label-row">
                    <label class="form-label" for="representative-designation">
                      Official Designation
                    </label>
                    <span class="label-info-text">Optional</span>
                  </div>
                  <input 
                    type="text" 
                    id="representative-designation" 
                    name="designation"
                    class="form-input" 
                    placeholder="e.g. Dean of Admissions / Director" 
                  />
                </div>

                <!-- 3. Mobile Number -->
                <div class="form-group">
                  <div class="form-label-row">
                    <label class="form-label" for="contact-phone">
                      Mobile Number <span class="req">*</span>
                    </label>
                    <span class="label-info-text">10-Digit Mobile</span>
                  </div>
                  <input 
                    type="tel" 
                    id="contact-phone" 
                    name="contactPhone"
                    class="form-input" 
                    placeholder="e.g. 9876543210" 
                    autocomplete="tel"
                    required 
                  />
                  <div class="form-error-msg" id="error-contact-phone" style="display: none;"></div>
                </div>

                <!-- 4. Email Address -->
                <div class="form-group">
                  <div class="form-label-row">
                    <label class="form-label" for="contact-email">
                      Email Address <span class="req">*</span>
                    </label>
                  </div>
                  <input 
                    type="email" 
                    id="contact-email" 
                    name="contactEmail"
                    class="form-input" 
                    placeholder="e.g. admissions@institution.edu.in" 
                    autocomplete="email"
                    required 
                  />
                  <div class="form-error-msg" id="error-contact-email" style="display: none;"></div>
                </div>

                <!-- 5. Institution Address -->
                <div class="form-group full-width">
                  <div class="form-label-row">
                    <label class="form-label" for="institution-address">
                      Institution Address <span class="req">*</span>
                    </label>
                  </div>
                  <input 
                    type="text" 
                    id="institution-address" 
                    name="institutionAddress"
                    class="form-input" 
                    placeholder="Enter campus address, city, state" 
                    autocomplete="street-address"
                    required 
                  />
                  <div class="form-error-msg" id="error-institution-address" style="display: none;"></div>
                </div>

                <!-- 6. Selected Stall (Automatically populated and read-only) -->
                <div class="form-group full-width">
                  <div class="form-label-row">
                    <label class="form-label" for="selected-stall-display">
                      Selected Stall <span class="req">*</span>
                    </label>
                    <span class="label-badge-readonly">READ-ONLY</span>
                  </div>
                  
                  <div class="stall-display-wrapper">
                    <input 
                      type="text" 
                      id="selected-stall-display" 
                      class="form-input form-input-readonly" 
                      readonly 
                      placeholder="No stall selected. Please select an available stall on the floor plan above." 
                      value=""
                      aria-readonly="true"
                    />
                    
                    <div id="stall-details-container">
                      <!-- Dynamic stall details rendered here -->
                    </div>
                  </div>
                  <div class="form-error-msg" id="error-selected-stall" style="display: none;"></div>
                </div>

                <!-- 7. Participation Package -->
                <div class="form-group full-width">
                  <div class="form-label-row">
                    <label class="form-label" for="package-dropdown">
                      Participation Package <span class="req">*</span>
                    </label>
                    <span class="label-info-text">Indicative pricing for demo</span>
                  </div>

                  <div class="package-selector-wrapper">
                    <select id="package-dropdown" class="form-select" required>
                      ${PACKAGES_DATA.map(p => `
                        <option value="${p.name}" ${p.id === 'elite' ? 'selected' : ''}>
                          ${p.name} Package — ${p.priceFormatted} (Demo)
                        </option>
                      `).join('')}
                    </select>

                    <div id="package-live-card">
                      <!-- Dynamic package price rendered here -->
                    </div>
                  </div>
                  <div class="form-error-msg" id="error-selected-package" style="display: none;"></div>
                </div>
              </div>

              <!-- Development / Demo Notice for WhatsApp Number Configuration -->
              <div id="whatsapp-dev-notice" style="margin-top: 24px; padding: 14px 18px; border-radius: 8px; background: rgba(245, 158, 11, 0.1); border: 1px solid #F59E0B; color: #FBBF24; font-size: 0.88rem;">
                <strong>Demo Mode Notice:</strong><br />
                <span style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.5; display: block; margin-top: 4px;">
                  The destination WhatsApp number is not configured in <code>src/config.js</code>. Submitting below displays a message preview only. <b>No message will be sent and no enquiry will be recorded.</b>
                </span>
              </div>

              <div class="form-footer">
                <button type="submit" class="btn-3d btn-primary-3d" id="btn-submit-booking" style="padding: 16px 36px; font-size: 1rem; display: inline-flex; align-items: center; gap: 8px;">
                  ${icons.whatsapp} Preview WhatsApp Enquiry (Demo)
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- WhatsApp Enquiry Preview Modal (Shown when destination number is unconfigured or to review message) -->
        <div class="modal-overlay" id="whatsapp-modal-overlay">
          <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="modal-enquiry-title">
            <button class="modal-close-btn" id="modal-close-btn" aria-label="Close Modal">
              ${icons.close}
            </button>

            <h3 class="voucher-title" id="modal-enquiry-title">Demo Preview: WhatsApp Enquiry</h3>
            <p class="voucher-subtitle" id="modal-enquiry-sub">
              No message has been sent. The destination WhatsApp number is not configured.
            </p>

            <div id="modal-status-banner" style="background: rgba(245, 158, 11, 0.12); border: 1px solid #F59E0B; color: #FBBF24; padding: 14px 18px; border-radius: 10px; font-size: 0.88rem; margin-bottom: 20px;">
              <strong>Notice: Enquiry Not Sent (Demo Mode)</strong><br />
              <span style="font-size: 0.82rem; color: var(--text-secondary); display: block; margin-top: 4px;">
                No message has been transmitted and no enquiry has been received. The destination WhatsApp number is not configured in <code>src/config.js</code>. Below is a preview of the message that will be generated once an official number is configured.
              </span>
            </div>

            <div style="background: rgba(16, 26, 53, 0.9); border: 1px solid var(--border-gold); border-radius: 12px; padding: 18px; margin-bottom: 24px;">
              <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px;">
                Pre-Filled Message Format:
              </div>
              <pre id="modal-message-preview" style="white-space: pre-wrap; font-family: inherit; font-size: 0.88rem; color: var(--ivory-white); line-height: 1.6; margin: 0;"></pre>
            </div>

            <div style="display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;">
              <button class="btn-3d btn-primary-3d" id="modal-action-btn" style="padding: 12px 28px;">
                Close Demo Preview
              </button>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  setupListeners() {
    const form = this.container.querySelector('#stall-booking-form');
    const packageDropdown = this.container.querySelector('#package-dropdown');
    const modalOverlay = this.container.querySelector('#whatsapp-modal-overlay');
    const modalCloseBtn = this.container.querySelector('#modal-close-btn');
    const modalActionBtn = this.container.querySelector('#modal-action-btn');

    // Input elements for live validation
    const collegeInput = this.container.querySelector('#college-name');
    const contactInput = this.container.querySelector('#contact-person');
    const phoneInput = this.container.querySelector('#contact-phone');
    const emailInput = this.container.querySelector('#contact-email');
    const addressInput = this.container.querySelector('#institution-address');

    // Live validation & error clearing on input
    collegeInput.addEventListener('input', () => {
      if (this.errors.collegeName || this.hasAttemptedSubmit) {
        this.validateCollegeName();
      }
    });

    contactInput.addEventListener('input', () => {
      if (this.errors.contactPerson || this.hasAttemptedSubmit) {
        this.validateContactPerson();
      }
    });

    phoneInput.addEventListener('input', () => {
      if (this.errors.contactPhone || this.hasAttemptedSubmit) {
        this.validatePhone();
      }
    });

    emailInput.addEventListener('input', () => {
      if (this.errors.contactEmail || this.hasAttemptedSubmit) {
        this.validateEmail();
      }
    });

    addressInput.addEventListener('input', () => {
      if (this.errors.institutionAddress || this.hasAttemptedSubmit) {
        this.validateAddress();
      }
    });

    // Package dropdown change
    packageDropdown.addEventListener('change', (e) => {
      const selectedName = e.target.value;
      const pkg = PACKAGES_DATA.find(p => p.name === selectedName);
      if (pkg) {
        this.selectedPackage = pkg;
        this.updatePackageLiveCardUI();
        this.clearFieldError('selected-package');
        if (this.onPackageChange) {
          this.onPackageChange(pkg.name, pkg.price);
        }
      }
    });

    // Stall actions inside stall-details-container
    const stallContainer = this.container.querySelector('#stall-details-container');
    stallContainer.addEventListener('click', (e) => {
      const deselectBtn = e.target.closest('#btn-form-deselect-stall');
      if (deselectBtn) {
        e.preventDefault();
        this.floorPlan.deselectCurrentStall();
        return;
      }

      const changeLink = e.target.closest('#btn-change-stall-link');
      if (changeLink) {
        e.preventDefault();
        const floorPlanSec = document.querySelector('#floorplan');
        if (floorPlanSec) {
          floorPlanSec.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });

    // Form submission -> WhatsApp flow
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.hasAttemptedSubmit = true;
      this.handleWhatsAppSubmit();
    });

    // Modal close
    const closeModal = () => modalOverlay.classList.remove('active');
    modalCloseBtn.addEventListener('click', closeModal);
    modalActionBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  // --- STALL SYNCHRONIZATION ---

  setStall(stall) {
    if (stall && stall.status !== 'available') {
      return;
    }

    this.selectedStall = stall;
    this.updateStallDisplayUI();

    if (stall) {
      this.clearFieldError('selected-stall');
    } else if (this.hasAttemptedSubmit) {
      this.validateStall();
    }
  }

  updateStallDisplayUI() {
    const displayInput = this.container.querySelector('#selected-stall-display');
    const detailsContainer = this.container.querySelector('#stall-details-container');

    if (!displayInput || !detailsContainer) return;

    if (!this.selectedStall) {
      displayInput.value = '';
      displayInput.placeholder = 'No stall selected. Please select an available stall on the floor plan above.';
      detailsContainer.innerHTML = `
        <div class="no-stall-selected-notice">
          <div class="no-stall-body">
            <span>${icons.info}</span>
            <div>
              <strong>No Stall Selected:</strong> Please choose an available stall on the floor plan above.
            </div>
          </div>
          <a href="#floorplan" class="btn-jump-floorplan">
            Select on Floor Plan
          </a>
        </div>
      `;
      return;
    }

    const s = this.selectedStall;
    displayInput.value = `${s.name} (${s.wing}) — Available`;

    detailsContainer.innerHTML = `
      <div class="selected-stall-card">
        <div class="selected-stall-meta">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="stall-tag-available">Selected</span>
            <span class="stall-coord-text"><b>${s.name}</b> • ${s.positionText}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 14px;">
            <a href="#floorplan" class="btn-link-action" id="btn-change-stall-link">
              Change Stall
            </a>
            <button type="button" class="btn-link-action deselect-action" id="btn-form-deselect-stall">
              ✕ Deselect
            </button>
          </div>
        </div>

        <div class="selected-stall-specs">
          <span><b>Area:</b> ${s.specs.area}</span>
          <span>•</span>
          <span><b>Front Seating:</b> ${s.specs.visitorSeats} Chairs</span>
          <span>•</span>
          <span><b>Behind Desk:</b> ${s.specs.representativeChairs} Chairs</span>
          <span>•</span>
          <span><b>Power:</b> ${s.specs.power}</span>
        </div>
      </div>
    `;
  }

  // --- PACKAGE SYNCHRONIZATION ---

  setPackage(packageName) {
    const pkg = PACKAGES_DATA.find(p => p.name.toUpperCase() === packageName.toUpperCase());
    if (!pkg) return;

    this.selectedPackage = pkg;
    const dropdown = this.container.querySelector('#package-dropdown');
    if (dropdown) {
      dropdown.value = pkg.name;
    }

    this.updatePackageLiveCardUI();
    this.clearFieldError('selected-package');
  }

  updatePackageLiveCardUI() {
    const cardEl = this.container.querySelector('#package-live-card');
    if (!cardEl || !this.selectedPackage) return;

    const pkg = this.selectedPackage;
    cardEl.innerHTML = `
      <div class="package-live-card">
        <div class="package-live-main">
          <div class="package-live-name-price">
            <span class="package-live-title">${pkg.name} PACKAGE</span>
            <span class="package-live-price-tag">${pkg.priceFormatted}</span>
          </div>
          <div class="package-live-subtitle">
            ${pkg.subtitle}
          </div>
        </div>
        <div class="package-live-features-tag">
          ${pkg.features.slice(0, 2).join(' • ')} • <span style="color: var(--champagne-gold);">*Indicative Demo Pricing</span>
        </div>
      </div>
    `;
  }

  // --- VALIDATION LOGIC ---

  validateCollegeName() {
    const input = this.container.querySelector('#college-name');
    const val = input.value.trim();
    if (!val) {
      this.showFieldError('college-name', 'Please enter your college or university name.');
      return false;
    }
    this.clearFieldError('college-name');
    return true;
  }

  validateContactPerson() {
    const input = this.container.querySelector('#contact-person');
    const val = input.value.trim();
    if (!val) {
      this.showFieldError('contact-person', 'Please enter contact person name.');
      return false;
    }
    this.clearFieldError('contact-person');
    return true;
  }

  validatePhone() {
    const input = this.container.querySelector('#contact-phone');
    const val = input.value.trim();
    if (!val) {
      this.showFieldError('contact-phone', 'Please enter a valid mobile number.');
      return false;
    }

    const cleaned = val.replace(/[\s\-\(\)]/g, '');
    const indianMobileRegex = /^(?:(?:\+?91[\-\s]?)?|0?)([6-9]\d{9})$/;

    if (!indianMobileRegex.test(cleaned)) {
      this.showFieldError('contact-phone', 'Please enter a valid mobile number.');
      return false;
    }

    this.clearFieldError('contact-phone');
    return true;
  }

  validateEmail() {
    const input = this.container.querySelector('#contact-email');
    const val = input.value.trim();
    if (!val) {
      this.showFieldError('contact-email', 'Please enter a valid email address.');
      return false;
    }

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!emailRegex.test(val)) {
      this.showFieldError('contact-email', 'Please enter a valid email address.');
      return false;
    }

    this.clearFieldError('contact-email');
    return true;
  }

  validateAddress() {
    const input = this.container.querySelector('#institution-address');
    const val = input.value.trim();
    if (!val) {
      this.showFieldError('institution-address', 'Please enter your institution address.');
      return false;
    }
    this.clearFieldError('institution-address');
    return true;
  }

  validateStall() {
    if (!this.selectedStall || this.selectedStall.status !== 'available') {
      this.showFieldError('selected-stall', 'Please select a stall.');
      return false;
    }
    this.clearFieldError('selected-stall');
    return true;
  }

  validatePackage() {
    if (!this.selectedPackage) {
      this.showFieldError('selected-package', 'Please select a package.');
      return false;
    }
    this.clearFieldError('selected-package');
    return true;
  }

  showFieldError(fieldId, message) {
    this.errors[fieldId] = message;
    const errorEl = this.container.querySelector(`#error-${fieldId}`);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }

    const inputEl = this.container.querySelector(`#${fieldId}`) || this.container.querySelector(`#${fieldId}-display`);
    if (inputEl) {
      inputEl.classList.add('input-error');
      inputEl.setAttribute('aria-invalid', 'true');
    }
  }

  clearFieldError(fieldId) {
    delete this.errors[fieldId];
    const errorEl = this.container.querySelector(`#error-${fieldId}`);
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }

    const inputEl = this.container.querySelector(`#${fieldId}`) || this.container.querySelector(`#${fieldId}-display`);
    if (inputEl) {
      inputEl.classList.remove('input-error');
      inputEl.removeAttribute('aria-invalid');
    }
  }

  validateAll() {
    const isCollegeValid = this.validateCollegeName();
    const isContactValid = this.validateContactPerson();
    const isPhoneValid = this.validatePhone();
    const isEmailValid = this.validateEmail();
    const isAddressValid = this.validateAddress();
    const isStallValid = this.validateStall();
    const isPackageValid = this.validatePackage();

    return (
      isCollegeValid &&
      isContactValid &&
      isPhoneValid &&
      isEmailValid &&
      isAddressValid &&
      isStallValid &&
      isPackageValid
    );
  }

  // --- WHATSAPP MESSAGE PREPARATION ---

  formatWhatsAppMessage() {
    const collegeName = this.container.querySelector('#college-name').value.trim();
    const contactPerson = this.container.querySelector('#contact-person').value.trim();
    const phone = this.container.querySelector('#contact-phone').value.trim();
    const email = this.container.querySelector('#contact-email').value.trim();
    const address = this.container.querySelector('#institution-address').value.trim();
    const stallNumber = this.selectedStall ? this.selectedStall.name : '';
    const packageName = this.selectedPackage ? this.selectedPackage.name : '';

    return [
      'Hello EDUCARE SKILLS ACADEMY,',
      '',
      'I would like to enquire about booking an exhibition stall.',
      '',
      `College / University: ${collegeName}`,
      `Contact Person: ${contactPerson}`,
      `Mobile Number: ${phone}`,
      `Email: ${email}`,
      `Address: ${address}`,
      '',
      `Selected Stall: ${stallNumber} (Demo Floor Plan)`,
      `Participation Package: ${packageName} (Indicative Pricing)`,
      '',
      'Please share the next steps.',
      '',
      'Thank you.'
    ].join('\n');
  }

  // --- FORM SUBMISSION BEHAVIOUR ---

  handleWhatsAppSubmit() {
    const isValid = this.validateAll();
    if (!isValid) {
      const firstError = this.container.querySelector('.form-input.input-error, .form-error-msg[style*="display: block"]');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const messageText = this.formatWhatsAppMessage();
    const configuredNumber = getWhatsAppNumber();

    if (isWhatsAppConfigured() && configuredNumber) {
      // Build WhatsApp click-to-chat URL: https://wa.me/WHATSAPP_NUMBER?text=ENCODED_MESSAGE
      const encodedMessage = encodeURIComponent(messageText);
      const waUrl = `https://wa.me/${configuredNumber}?text=${encodedMessage}`;

      // Open WhatsApp in a new tab. Visitor must manually click Send in WhatsApp.
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Destination WhatsApp number is not configured yet
      const modalOverlay = this.container.querySelector('#whatsapp-modal-overlay');
      const messagePreview = this.container.querySelector('#modal-message-preview');
      const devNotice = this.container.querySelector('#whatsapp-dev-notice');

      if (devNotice) devNotice.style.display = 'block';
      if (messagePreview) messagePreview.textContent = messageText;
      if (modalOverlay) modalOverlay.classList.add('active');
    }
  }
}
