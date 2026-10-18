import { icons } from './icons.js';

export function createOverview() {
  const section = document.createElement('section');
  section.className = 'overview-section';
  section.id = 'about';

  section.innerHTML = `
    <div class="container">
      <div class="section-header">
        <span class="section-tag">Event Highlights (Demo)</span>
        <h2 class="section-title">Why Participate in <span>Educare Fair</span></h2>
        <p class="section-desc">
          Connect with prospective Class 12 students and parents seeking higher education admissions (Demo overview).
        </p>
      </div>

      <div class="overview-grid">
        <!-- Card 1: The Fair -->
        <div class="card-3d">
          <div class="card-icon-wrap">
            ${icons.stage}
          </div>
          <h3 class="card-title">Education Fair</h3>
          <p class="card-desc">
            Organized by EDUCARE SKILLS ACADEMY, connecting colleges and universities with aspiring students under one roof.
          </p>
          <ul class="card-features-list">
            <li>${icons.check} Central auditorium and stage</li>
            <li>${icons.check} Career guidance sessions</li>
            <li>${icons.check} Clean, organized visitor concourse</li>
          </ul>
        </div>

        <!-- Card 2: Student Cohorts -->
        <div class="card-3d">
          <div class="card-icon-wrap">
            ${icons.students}
          </div>
          <h3 class="card-title">Projected Students (Demo)</h3>
          <p class="card-desc">
            Estimated 1,000–1,500 Class 12 students seeking undergraduate admissions (Demo figure subject to official confirmation).
          </p>
          <ul class="card-features-list">
            <li>${icons.check} High school students seeking admissions (Projected)</li>
            <li>${icons.check} Accompanied by parents and guardians</li>
            <li>${icons.check} Face-to-face counseling time</li>
          </ul>
        </div>

        <!-- Card 3: Physical Stalls -->
        <div class="card-3d">
          <div class="card-icon-wrap">
            ${icons.booth}
          </div>
          <h3 class="card-title">Furnished Stalls (Standard Layout)</h3>
          <p class="card-desc">
            Each 3m x 3m modular stall is prepared for admission representatives (Demo specifications).
          </p>
          <ul class="card-features-list">
            <li>${icons.check} 4 Visitor chairs in front of stall</li>
            <li>${icons.check} 2 Representative chairs behind desk</li>
            <li>${icons.check} 5A Power point and custom name fascia</li>
          </ul>
        </div>

        <!-- Card 4: Attendee Data Access -->
        <div class="card-3d">
          <div class="card-icon-wrap">
            ${icons.analytics}
          </div>
          <h3 class="card-title">Attendee Directory</h3>
          <p class="card-desc">
            Receive registered attendee contact details and post-fair outreach support (Per package terms).
          </p>
          <ul class="card-features-list">
            <li>${icons.check} Fair attendee dataset (Subject to registration)</li>
            <li>${icons.check} Directory listing in fair guide</li>
            <li>${icons.check} Event promotions and branding</li>
          </ul>
        </div>
      </div>
    </div>
  `;

  return section;
}
