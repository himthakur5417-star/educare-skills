import { icons } from './icons.js';

export const PACKAGES_DATA = [
  {
    id: 'standard',
    name: 'STANDARD',
    price: 60000,
    priceFormatted: '₹60,000*',
    subtitle: 'Essential Exhibition Presence',
    isRecommended: false,
    badge: null,
    features: [
      'Furnished 3m x 3m Exhibition Stall',
      '4 Visitor Seats in Front + 2 Rep Chairs Behind',
      'Institutional Logo on Fair Marketing',
      'Registered Attendee Directory Access',
      '2 Official Representative Event Badges',
      'Basic Directory Listing in Fair Guide'
    ]
  },
  {
    id: 'premium',
    name: 'PREMIUM',
    price: 80000,
    priceFormatted: '₹80,000*',
    subtitle: 'Enhanced Digital & Physical Reach',
    isRecommended: false,
    badge: null,
    features: [
      'All Standard Package Benefits Included',
      'Prime Stall Allocation Priority',
      'Dedicated Social Media Spotlight Posts',
      'Video Promotion & Representative Interview',
      '4 Official Representative Event Badges',
      'Featured Listing on Official Website'
    ]
  },
  {
    id: 'elite',
    name: 'ELITE',
    price: 125000,
    priceFormatted: '₹1,25,000*',
    subtitle: 'Comprehensive Lead Generation',
    isRecommended: true,
    badge: 'MOST POPULAR',
    features: [
      'All Premium Package Benefits Included',
      'Additional Qualified Pre-Screened Student Leads (Demo)',
      'Exclusive Institutional Feature Video',
      'Fair Guide Directory Half-Page Color Ad',
      '6 Official Representative Badges',
      'Refreshment Lounge Access for Counselors'
    ]
  },
  {
    id: 'platinum',
    name: 'PLATINUM',
    price: 175000,
    priceFormatted: '₹1,75,000*',
    subtitle: 'Headline Keynote & Maximum Visibility',
    isRecommended: false,
    badge: 'VIP PARTNER',
    features: [
      'All Elite Package Benefits Included',
      'Fair Guide Directory Full-Page Prime Ad',
      '15-Minute Keynote Presentation on Main Stage',
      'Top-Tier Branding on Entrance & Stage Backdrops',
      '8 Representative VIP All-Access Badges',
      'Post-Fair Dedicated Email Blast to Registered Students (Demo)'
    ]
  }
];

export function createPackages(onSelectPackageCallback) {
  const section = document.createElement('section');
  section.className = 'packages-section';
  section.id = 'packages';

  let currentSelectedPackageName = 'ELITE';

  section.innerHTML = `
    <div class="container">
      <div class="section-header">
        <span class="section-tag">Participation Packages (Demo Pricing)</span>
        <h2 class="section-title">Choose a <span>Package</span></h2>
        <p class="section-desc">
          Sample participation packages and indicative pricing for customer demo. Final packages and tariffs are subject to official confirmation.
        </p>
      </div>

      <div class="packages-grid">
        ${PACKAGES_DATA.map(pkg => `
          <div class="package-card card-3d ${pkg.isRecommended ? 'recommended' : ''}" data-package-id="${pkg.id}" data-package-name="${pkg.name}">
            ${pkg.badge ? `<div class="package-ribbon">${pkg.badge}</div>` : ''}

            <div class="package-header">
              <h3 class="package-name">${pkg.name}</h3>
              <div class="package-price-wrap">
                <span class="package-amount">${pkg.priceFormatted}</span>
              </div>
              <div class="package-note">${pkg.subtitle} • <span style="color: var(--champagne-gold); font-size: 0.72rem;">*Indicative Demo Price</span></div>
            </div>

            <ul class="package-features">
              ${pkg.features.map(f => `
                <li>${icons.check} <span>${f}</span></li>
              `).join('')}
            </ul>

            <button 
              type="button"
              class="btn-3d ${pkg.isRecommended ? 'btn-primary-3d' : 'btn-secondary-3d'} package-cta-btn" 
              data-package-name="${pkg.name}"
              data-package-amount="${pkg.price}"
            >
              Select ${pkg.name} Package
            </button>
          </div>
        `).join('')}
      </div>
      <div style="text-align: center; font-size: 0.76rem; color: var(--text-muted); margin-top: 24px;">
        *All package pricing, lead figures, and inclusions shown are indicative demo values subject to official confirmation.
      </div>
    </div>
  `;

  // Function to update visual highlight on cards
  section.setSelectedPackage = (packageName) => {
    if (!packageName) return;
    currentSelectedPackageName = packageName;
    const cards = section.querySelectorAll('.package-card');
    cards.forEach(card => {
      const cardPkgName = card.dataset.packageName;
      const btn = card.querySelector('.package-cta-btn');
      const isSelected = cardPkgName.toUpperCase() === packageName.toUpperCase();

      if (isSelected) {
        card.classList.add('selected-package');
        if (btn) {
          btn.innerHTML = `${icons.check} Selected Package`;
          btn.classList.add('btn-primary-3d');
          btn.classList.remove('btn-secondary-3d');
        }
      } else {
        card.classList.remove('selected-package');
        if (btn) {
          btn.innerHTML = `Select ${cardPkgName} Package`;
          const pkgData = PACKAGES_DATA.find(p => p.name === cardPkgName);
          if (pkgData && pkgData.isRecommended) {
            btn.classList.add('btn-primary-3d');
            btn.classList.remove('btn-secondary-3d');
          } else {
            btn.classList.remove('btn-primary-3d');
            btn.classList.add('btn-secondary-3d');
          }
        }
      }
    });
  };

  section.getSelectedPackage = () => {
    return PACKAGES_DATA.find(p => p.name.toUpperCase() === currentSelectedPackageName.toUpperCase()) || PACKAGES_DATA[2];
  };

  // Attach click listener for buttons and cards
  section.querySelectorAll('.package-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const pkgName = card.dataset.packageName;
      const pkg = PACKAGES_DATA.find(p => p.name === pkgName);
      if (!pkg) return;

      section.setSelectedPackage(pkgName);

      if (onSelectPackageCallback) {
        onSelectPackageCallback(pkg.name, pkg.price);
      }
    });
  });

  // Set default initial highlight
  section.setSelectedPackage(currentSelectedPackageName);

  return section;
}

