/* V8.38 — navegação editorial, painel de prioridades e acções contextuais. */
(function () {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const esc = value => String(value == null ? '' : value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;'
  })[char]);
  const initials = value => String(value || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || '?';

  function setHash(id) {
    const next = `#${id}`;
    if (location.hash !== next) location.hash = next;
  }

  function editorTab(tabId) {
    const button = document.querySelector(`[data-v837-tab="${tabId}"]`);
    if (button) button.click();
  }

  function makeContentNavigation() {
    const nav = $('.admin-sidebar-subnav[aria-label="Conteúdo do convite"]');
    if (!nav || nav.dataset.v838Ready === 'true') return;
    const links = [
      ['geral', '◉', 'Geral / Capa'],
      ['historia', '♡', 'Nossa História'],
      ['galeria', '▧', 'Galeria de Fotos'],
      ['programa', '◷', 'Programa'],
      ['informacoes', '⌖', 'Informações'],
      ['bancos', '◇', 'Dados Bancários'],
      ['rsvp', '✓', 'RSVP / Confirmação'],
      ['rodape', '✦', 'Rodapé e extras']
    ];
    nav.innerHTML = links.map(([tab, icon, label]) => `<a href="#content-${tab}" data-v838-content-tab="${tab}"><span class="nav-icon" aria-hidden="true">${icon}</span><span>${label}</span></a>`).join('');
    nav.dataset.v838Ready = 'true';
  }

  function syncContentNavigation() {
    const isEditor = location.hash === '#site-editor';
    const activeTab = $('.v837-editor [data-v837-tab].is-active')?.dataset.v837Tab || 'geral';
    $$('[data-v838-content-tab]').forEach(link => {
      link.classList.toggle('v838-content-active', isEditor && link.dataset.v838ContentTab === activeTab);
    });
  }

  function bindContentNavigation() {
    document.addEventListener('click', event => {
      const link = event.target.closest('[data-v838-content-tab]');
      if (link) {
        event.preventDefault();
        event.stopImmediatePropagation();
        const tab = link.dataset.v838ContentTab;
        setHash('site-editor');
        window.setTimeout(() => {
          editorTab(tab);
          syncContentNavigation();
        }, 70);
        return;
      }
      if (event.target.closest('[data-v837-tab]')) window.setTimeout(syncContentNavigation, 0);
    }, true);
    window.addEventListener('hashchange', () => window.setTimeout(syncContentNavigation, 40));
  }

  function dashboardMarkup() {
    return `<div id="v838Dashboard" aria-live="polite"></div>`;
  }

  function dashboardStats() {
    const guests = Array.isArray(window.guests) ? window.guests : [];
    const gifts = Array.isArray(window.gifts) ? window.gifts : [];
    const confirmed = guests.filter(guest => guest.rsvp_status === 'confirmed');
    const pending = guests.filter(guest => guest.rsvp_status === 'pending');
    const unseated = confirmed.filter(guest => !guest.table_id);
    const arrived = confirmed.filter(guest => !!guest.checked_in);
    const reserved = gifts.filter(gift => !!gift.reserved);
    return { guests, gifts, confirmed, pending, unseated, arrived, reserved };
  }

  function displayTime(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  }

  function renderDashboard() {
    const root = $('#v838Dashboard');
    if (!root) return;
    if (document.body.classList.contains('admin-v839') && typeof window.renderV839Dashboard === 'function') {
      window.renderV839Dashboard(root);
      return;
    }
    const data = dashboardStats();
    const name = ($('#adminHeaderName')?.textContent || 'Agnaldo').trim().split(/\s+/)[0] || 'Agnaldo';
    const arrivals = data.arrived.slice().sort((a, b) => new Date(b.checked_in_at || 0) - new Date(a.checked_in_at || 0)).slice(0, 4);
    root.innerHTML = `
      <header class="v838-dash-top">
        <div><p>PAINEL DOS NOIVOS</p><h1>Bom dia, <em>${esc(name)}.</em></h1></div>
        <div class="v838-date-chip"><i aria-hidden="true">◷</i><span>PRÓXIMO GRANDE DIA<strong>29 de Maio de 2027</strong></span></div>
      </header>
      <div class="v838-dash-main">
        <section class="v838-priority-wrap" aria-label="Prioridades do painel">
          <header class="v838-card-head"><div><p>POR ACOMPANHAR</p><h2>O que pede atenção</h2></div><a href="#tarefas">Ver tarefas</a></header>
          <div class="v838-priority-list">
            <article class="v838-priority"><span class="v838-priority-mark">${data.pending.length}</span><div><strong>Confirmações pendentes</strong><span>${data.pending.length === 1 ? 'Um convite ainda aguarda resposta.' : `${data.pending.length} convites ainda aguardam resposta.`}</span></div><a href="#convidados">Abrir</a></article>
            <article class="v838-priority" data-tone="sage"><span class="v838-priority-mark">${data.unseated.length}</span><div><strong>Convidados sem mesa</strong><span>${data.unseated.length === 1 ? 'Uma confirmação precisa de lugar.' : `${data.unseated.length} confirmações precisam de lugar.`}</span></div><a href="#mesas">Organizar</a></article>
            <article class="v838-priority" data-tone="gold"><span class="v838-priority-mark">${data.reserved.length}</span><div><strong>Lista de presentes</strong><span>${data.gifts.length ? `${data.reserved.length} de ${data.gifts.length} presentes foram reservados.` : 'A lista de presentes está pronta para ser preenchida.'}</span></div><a href="#presentes">Ver lista</a></article>
          </div>
        </section>
        <aside class="v838-dash-side">
          <section class="v838-next-card"><h2>Próximo passo</h2><p>Escolha uma área para continuar a preparação.</p><nav class="v838-next-list" aria-label="Atalhos essenciais"><a href="#convidados">Gerir convidados <b>›</b></a><a href="#checkin">Preparar recepção <b>›</b></a><a href="#content-geral" data-v838-content-tab="geral">Editar convite <b>›</b></a></nav></section>
          <section class="v838-arrivals-card"><header class="v838-card-head"><div><h2>Últimas entradas</h2></div><a href="#checkin">Recepção</a></header><div class="v838-arrival-list">${arrivals.length ? arrivals.map(guest => `<div class="v838-arrival"><i>${esc(initials(guest.full_name))}</i><div><strong>${esc(guest.full_name)}</strong><span>${esc(guest.table_name || 'Sem mesa')}</span></div><time>${displayTime(guest.checked_in_at)}</time></div>`).join('') : '<div class="v838-empty">Ainda não existem entradas registadas.</div>'}</div></section>
        </aside>
      </div>`;
  }

  function insertDashboard() {
    const host = $('#visao-geral .admin-modern-dashboard');
    if (!host) return;
    if (!$('#v838Dashboard', host)) host.insertAdjacentHTML('afterbegin', dashboardMarkup());
    renderDashboard();
  }

  function actionLabel(action) {
    return (action.getAttribute('aria-label') || action.getAttribute('title') || action.textContent || 'Opção').replace(/\s+/g, ' ').trim();
  }

  function simplifyActionGroup(group) {
    if (!group || group.dataset.v838Menu === 'true') return;
    const actions = $$('button, a', group).filter(node => !node.closest('.v838-action-menu'));
    if (actions.length < 2) return;
    const isGuestGroup = group.matches('#convidados .guest-card-actions');
    const qrAction = isGuestGroup
      ? actions.find(action => /qr\s*code/i.test(actionLabel(action)))
      : null;
    const menuActions = qrAction ? actions.filter(action => action !== qrAction) : actions;
    const preserved = Array.from(group.children)
      .filter(child => !child.matches('button, a'))
      .map(child => child.cloneNode(true));
    if (qrAction) {
      const qrButton = qrAction.cloneNode(true);
      qrButton.classList.remove('icon-btn', 'ui-icon-btn');
      qrButton.classList.add('v844-guest-qr');
      qrButton.removeAttribute('data-tooltip');
      qrButton.removeAttribute('title');
      qrButton.setAttribute('aria-label', actionLabel(qrAction));
      qrButton.insertAdjacentHTML('beforeend', '<span>QR Code</span>');
      preserved.push(qrButton);
    }
    const details = document.createElement('details');
    details.className = 'v838-action-menu' + (isGuestGroup ? ' v844-guest-menu' : '');
    details.innerHTML = '<summary aria-label="Mais opções">•••</summary><div class="v838-action-menu-panel"></div>';
    const panel = $('.v838-action-menu-panel', details);
    menuActions.forEach(action => {
      const item = action.cloneNode(true);
      const label = actionLabel(action);
      item.classList.remove('icon-btn', 'ui-icon-btn');
      item.classList.add('v838-menu-action');
      if (action.classList.contains('danger')) item.classList.add('danger');
      item.removeAttribute('data-tooltip');
      item.removeAttribute('title');
      item.setAttribute('aria-label', label);
      item.textContent = label;
      panel.appendChild(item);
    });
    panel.addEventListener('click', () => window.setTimeout(() => { details.open = false; }, 0));
    group.replaceChildren(...preserved, details);
    group.dataset.v838Menu = 'true';
  }

  function simplifyActions() {
    [
      '#convidados .guest-card-actions',
      '#presentes .gift-actions',
      '#mesas .table-card-actions',
      '#protocolos .protocol-actions',
      '#programa-admin .program-admin-actions'
    ].forEach(selector => $$(selector).forEach(simplifyActionGroup));
  }

  function observeDynamicPanels() {
    const roots = ['#convidados', '#presentes', '#mesas', '#protocolos', '#programa-admin']
      .map(selector => $(selector))
      .filter(Boolean);
    let queued = false;
    const queue = () => {
      if (queued) return;
      queued = true;
      window.setTimeout(() => {
        queued = false;
        simplifyActions();
      }, 0);
    };
    roots.forEach(root => new MutationObserver(queue).observe(root, { childList: true, subtree: true }));
    document.addEventListener('click', event => {
      if (!event.target.closest('.v838-action-menu')) $$('.v838-action-menu[open]').forEach(menu => { menu.open = false; });
    });
    queue();
  }

  function start() {
    document.body.classList.add('admin-v838');
    makeContentNavigation();
    bindContentNavigation();
    insertDashboard();
    observeDynamicPanels();
    syncContentNavigation();
    window.setInterval(() => {
      renderDashboard();
      simplifyActions();
      syncContentNavigation();
    }, 1400);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => window.setTimeout(start, 0), { once: true });
  else window.setTimeout(start, 0);
})();
