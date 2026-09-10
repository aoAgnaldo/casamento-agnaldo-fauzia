/* V8.39 — painel administrativo escuro, directo e orientado a decisões. */
(function () {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const esc = value => String(value == null ? '' : value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;'
  })[char]);
  const initials = value => String(value || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || '?';

  document.body.classList.add('admin-v839');

  function dashboardData() {
    const guests = Array.isArray(window.guests) ? window.guests : [];
    const gifts = Array.isArray(window.gifts) ? window.gifts : [];
    const confirmed = guests.filter(guest => guest.rsvp_status === 'confirmed');
    const pending = guests.filter(guest => guest.rsvp_status === 'pending');
    const unseated = confirmed.filter(guest => !guest.table_id);
    const arrived = confirmed.filter(guest => Boolean(guest.checked_in));
    const reserved = gifts.filter(gift => Boolean(gift.reserved));
    return { guests, gifts, confirmed, pending, unseated, arrived, reserved };
  }

  function displayTime(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  }

  function arrivalMarkup(guest) {
    return `<div class="v839-arrival-row"><i>${esc(initials(guest.full_name))}</i><div><strong>${esc(guest.full_name)}</strong><span>${esc(guest.table_name || 'Sem mesa')}</span></div><time>${displayTime(guest.checked_in_at)}</time></div>`;
  }

  window.renderV839Dashboard = function renderV839Dashboard(root) {
    if (!root) return;
    const data = dashboardData();
    const name = ($('#adminHeaderName')?.textContent || 'Agnaldo').trim().split(/\s+/)[0] || 'Agnaldo';
    const arrivals = data.arrived.slice().sort((a, b) => new Date(b.checked_in_at || 0) - new Date(a.checked_in_at || 0)).slice(0, 3);
    const tasks = [
      { complete: true, title: 'Programa do dia revisto', copy: 'Todos os momentos estão definidos', href: '#programa-admin' },
      { complete: false, title: 'Confirmar convidados pendentes', copy: data.pending.length === 1 ? '1 convite ainda não respondeu' : `${data.pending.length} convites ainda não responderam`, href: '#convidados' },
      { complete: false, title: 'Organizar pessoas sem mesa', copy: data.unseated.length === 1 ? '1 pessoa aguarda distribuição' : `${data.unseated.length} pessoas aguardam distribuição`, href: '#mesas' }
    ];
    root.innerHTML = `
      <header class="v839-dash-heading">
        <div><h1>Bom dia, <em>${esc(name)}.</em></h1><span>Três coisas precisam da sua atenção antes do grande dia.</span></div>
        <div class="v839-date-chip"><i aria-hidden="true">◷</i><span>Grande dia<strong>29 de Maio de 2027</strong></span></div>
      </header>
      <div class="v839-overview-stats" aria-label="Resumo do casamento">
        <a href="#convidados" class="v839-stat"><i>◌</i><span>Confirmações<small>${data.pending.length === 1 ? '1 convite aguarda resposta' : `${data.pending.length} convites aguardam resposta`}</small></span><b>${data.pending.length}</b></a>
        <a href="#mesas" class="v839-stat"><i>▱</i><span>Mesas<small>${data.unseated.length === 1 ? '1 pessoa ainda sem lugar' : `${data.unseated.length} pessoas ainda sem lugar`}</small></span><b>${data.unseated.length}</b></a>
        <a href="#presentes" class="v839-stat"><i>♡</i><span>Presentes<small>${data.reserved.length === 1 ? '1 presente reservado' : `${data.reserved.length} presentes reservados`}</small></span><b>${data.reserved.length}</b></a>
      </div>
      <div class="v839-dash-grid">
        <section class="v839-panel v839-steps-panel"><header><h2>Próximos passos</h2><a href="#tarefas">Ver planeamento</a></header><div class="v839-step-list">${tasks.map(task => `<a href="${task.href}" class="v839-step ${task.complete ? 'is-complete' : ''}"><i aria-hidden="true">${task.complete ? '✓' : ''}</i><span><strong>${esc(task.title)}</strong><small>${esc(task.copy)}</small></span><b aria-hidden="true">›</b></a>`).join('')}</div></section>
        <section class="v839-panel v839-arrivals-panel"><header><h2>Chegadas recentes</h2><a href="#checkin">Abrir recepção</a></header><div class="v839-arrivals">${arrivals.length ? arrivals.map(arrivalMarkup).join('') : '<p class="v839-empty">Ainda não há entradas registadas.</p>'}</div></section>
      </div>`;
  };

  function relabel(selector, label) {
    const link = $(selector);
    const text = link?.querySelector('.nav-icon + span');
    if (text) text.textContent = label;
  }

  function applyLabels() {
    const primaryTitle = $('.admin-sidebar-section-label strong');
    if (primaryTitle) primaryTitle.textContent = 'Gerir o casamento';
    relabel('.admin-sidebar-nav a[href="#mesas"]', 'Mesas e lugares');
    relabel('.admin-sidebar-nav a[href="#protocolos"]', 'Equipa e recepção');
    const contentTitle = $('.admin-sidebar-content-title:not(.admin-sidebar-planning-title)');
    const contentNav = $('.admin-sidebar-subnav[aria-label="Conteúdo do convite"]');
    if (contentTitle) contentTitle.innerHTML = '<strong>Convite</strong>';
    if (contentNav) {
      contentNav.classList.add('v839-compact-content-nav');
      contentNav.innerHTML = '<a href="#site-editor"><span class="nav-icon" aria-hidden="true">✎</span><span>Conteúdo do site</span></a><a href="#tarefas"><span class="nav-icon" aria-hidden="true">☷</span><span>Planeamento</span></a>';
      const syncCompactNav = () => {
        const hash = location.hash || '#visao-geral';
        contentNav.querySelectorAll('a').forEach(link => {
          const isContent = link.getAttribute('href') === '#site-editor' && (hash === '#site-editor' || hash.startsWith('#content-') || hash === '#site-capa' || hash === '#site-historia');
          link.classList.toggle('active', isContent || link.getAttribute('href') === hash);
        });
      };
      if (contentNav.dataset.v839Routes !== 'true') {
        contentNav.dataset.v839Routes = 'true';
        window.addEventListener('hashchange', syncCompactNav);
      }
      syncCompactNav();
    }

    const protocolHeading = $('#protocolos .section-title-row h2');
    if (protocolHeading) protocolHeading.textContent = 'Equipa de recepção';
    const checkinHeading = $('#checkin .section-title-row h2');
    if (checkinHeading) checkinHeading.textContent = 'Recepção';
    const checkinCopy = $('#checkin .section-title-row .muted');
    if (checkinCopy) checkinCopy.textContent = 'A equipa e o estado do acolhimento num só lugar.';
    const programHeading = $('#programa-admin .section-title-row h2');
    if (programHeading) programHeading.textContent = 'Programa do casamento';
    const taskHeading = $('#tarefas .section-title-row h2');
    if (taskHeading) taskHeading.textContent = 'O que merece atenção';
    const note = $('.admin-sidebar-note p');
    if (note) note.innerHTML = '“Cada detalhe tem o seu<br>lugar.”';
    const date = $('.admin-sidebar-brand small');
    if (date) date.innerHTML = '29 de Maio de<br>2027';
  }

  function enableDarkPanel() {
    document.body.classList.add('admin-v839');
    applyLabels();
    const root = $('#v838Dashboard');
    if (root) window.renderV839Dashboard(root);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => window.setTimeout(enableDarkPanel, 0), { once: true });
  else window.setTimeout(enableDarkPanel, 0);
})();
