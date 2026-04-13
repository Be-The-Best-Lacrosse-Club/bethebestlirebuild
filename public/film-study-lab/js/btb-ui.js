/* ================================================
   BTB FILM STUDY LAB — UI Components & Navigation
   Shared across all pages
   ================================================ */

// ============= MOBILE NAV TOGGLE =============
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      toggle.textContent = nav.classList.contains('open') ? '✕' : '☰';
    });
  }

  // Mark current page active in nav
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a').forEach(link => {
    const href = link.getAttribute('href').split('/').pop();
    if (href === currentPath) {
      link.classList.add('active');
    }
  });
});

// ============= TAXONOMY RENDERER =============
function renderTaxonomyGrid(taxonomy, program, containerId, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  const { onConceptClick, showStatus = true, filterActive = false } = options;

  Object.keys(taxonomy).forEach(catKey => {
    const category = taxonomy[catKey];
    const card = document.createElement('div');
    card.className = 'category-card';

    let headerHTML = `
      <div class="category-header" data-cat="${catKey}">
        <span class="category-title">${category.icon} ${category.title}</span>
        <span class="expand-icon">▼</span>
      </div>
    `;

    let contentHTML = '<div class="category-content">';
    Object.keys(category.subcategories).forEach(subKey => {
      const items = category.subcategories[subKey];
      const filteredItems = filterActive ? items.filter(i => isConceptActive(i)) : items;
      if (filterActive && filteredItems.length === 0) return;

      contentHTML += `<div class="subcategory">
        <div class="subcategory-header">${subKey}</div>`;

      filteredItems.forEach(item => {
        const name = getConceptName(item);
        const active = isConceptActive(item);
        const statusClass = active ? 'active' : 'coming';
        const statusText = active ? 'ACTIVE' : 'COMING SOON';

        contentHTML += `
          <div class="concept-item" data-concept="${name}" data-program="${program}" data-active="${active}">
            <span>${name}</span>
            ${showStatus ? `
              <div class="concept-status">
                <span class="status-dot ${statusClass}"></span>
                <span class="status-label" style="color: ${active ? '#CC0000' : '#999'};">${statusText}</span>
              </div>
            ` : ''}
          </div>
        `;
      });
      contentHTML += '</div>';
    });
    contentHTML += '</div>';

    card.innerHTML = headerHTML + contentHTML;
    container.appendChild(card);
  });

  // Expand/collapse
  container.querySelectorAll('.category-header').forEach(header => {
    header.addEventListener('click', () => {
      header.closest('.category-card').classList.toggle('expanded');
    });
  });

  // Concept click
  if (onConceptClick) {
    container.querySelectorAll('.concept-item').forEach(item => {
      item.addEventListener('click', () => {
        onConceptClick(item.dataset.concept, item.dataset.program, item.dataset.active === 'true');
      });
    });
  }
}

// ============= MODAL SYSTEM =============
function openModal(contentHTML) {
  let modal = document.getElementById('btbModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'btbModal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="modal-close">&times;</span>
        <div class="modal-body"></div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  modal.querySelector('.modal-body').innerHTML = contentHTML;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('btbModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Escape key closes modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ============= CONCEPT DETAIL RENDERER =============
function renderConceptDetail(conceptName, program, level) {
  const content = getConceptContent(program, conceptName);

  if (!content) {
    return `
      <h2 style="font-size:1.5rem;text-transform:uppercase;border-bottom:3px solid #CC0000;padding-bottom:0.5rem;margin-bottom:1rem;">${conceptName}</h2>
      <div style="padding:1.5rem;background:#f0f0f0;border-radius:6px;text-align:center;">
        <p style="color:#666;">Film clips and coaching notes for this concept are coming soon.</p>
        <p style="color:#999;font-size:0.85rem;margin-top:0.5rem;">Check back regularly as we add new content!</p>
      </div>
    `;
  }

  // Video section
  let videosHTML = '';
  if (content.videos && content.videos.length > 0) {
    videosHTML = '<div style="margin-bottom:1.5rem;">';
    content.videos.forEach(v => {
      videosHTML += createVideoCard(v.id, v.title, v.notes);
    });
    videosHTML += '</div>';
  }

  // Build tier content
  function renderTier(tierData) {
    if (!tierData) return '';
    let html = `<div class="tier-label">${tierData.label}</div>`;
    html += `<p style="margin-bottom:0.75rem;">${tierData.text}</p>`;

    if (tierData.points) {
      html += '<div class="tier-heading">Key Points:</div><ul style="margin-left:1rem;margin-bottom:0.75rem;">';
      tierData.points.forEach(p => html += `<li>${p}</li>`);
      html += '</ul>';
    }
    if (tierData.activity) {
      html += `<div class="tier-heading">Try It Yourself:</div><p>${tierData.activity}</p>`;
    }
    if (tierData.mistakes) {
      html += `<div class="tier-heading">Common Mistakes:</div><p>${tierData.mistakes}</p>`;
    }
    if (tierData.filmCues) {
      html += `<div class="tier-heading">Film Study Cues:</div><p>${tierData.filmCues}</p>`;
    }
    return html;
  }

  const tiers = {
    dev: renderTier(content.dev),
    int: renderTier(content.int),
    adv: renderTier(content.adv)
  };

  const tierLabels = { dev: 'Developmental', int: 'Intermediate', adv: 'Advanced' };

  return `
    <h2 style="font-size:1.5rem;text-transform:uppercase;border-bottom:3px solid #CC0000;padding-bottom:0.5rem;margin-bottom:1.5rem;">${conceptName}</h2>
    ${videosHTML}
    <div style="display:flex;gap:0.5rem;margin-bottom:1.5rem;">
      ${['dev','int','adv'].map(t => `
        <button class="btn tier-toggle ${t === level ? 'active' : ''}" data-tier="${t}">${tierLabels[t]}</button>
      `).join('')}
    </div>
    <div class="tier-content">
      ${['dev','int','adv'].map(t => `
        <div class="tier-section ${t === level ? 'active' : ''}" data-tier="${t}">
          ${tiers[t]}
        </div>
      `).join('')}
    </div>
  `;
}

// After rendering modal, wire up tier toggles
function wireConceptModalTiers() {
  document.querySelectorAll('.tier-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const tier = btn.dataset.tier;
      document.querySelectorAll('.tier-toggle').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tier-section').forEach(s => s.classList.remove('active'));
      document.querySelector(`.tier-section[data-tier="${tier}"]`)?.classList.add('active');
    });
  });
}

// ============= GAME ARCHIVE RENDERER =============
function renderGameArchive(containerId, programFilter = 'all') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const games = programFilter === 'all'
    ? GAME_ARCHIVE
    : GAME_ARCHIVE.filter(g => g.program === programFilter);

  if (games.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🎬</div>
        <p>No games in the archive yet.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = games.map(game => `
    <div class="game-entry" data-program="${game.program}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:0.5rem;">
        <div>
          <div class="game-title">${game.title}</div>
          <div class="game-meta">${game.date}</div>
        </div>
        <span class="badge ${game.program === 'boys' ? 'badge-black' : 'badge-red'}">
          ${game.program === 'boys' ? 'BOYS' : 'GIRLS'}
        </span>
      </div>
      <div style="margin-top:0.75rem;">
        ${game.concepts.map(c => `<span class="game-tag">${c}</span>`).join('')}
      </div>
      <div class="game-meta" style="margin-top:0.5rem;">${game.clips} clips &mdash; ${game.summary}</div>
      ${game.videoId ? `<a href="https://www.youtube.com/watch?v=${game.videoId}" target="_blank" style="display:inline-block;margin-top:0.5rem;font-size:0.85rem;">Watch Full Game ↗</a>` : ''}
    </div>
  `).join('');
}
