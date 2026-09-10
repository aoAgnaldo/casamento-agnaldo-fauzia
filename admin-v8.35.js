/* V8.35 — Ferramentas operacionais adicionais para o painel.
   Não altera os RPCs nem as regras do Supabase já existentes. */
(function () {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[char]);
  const normalise = value => String(value == null ? '' : value)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const peopleFor = guest => 1 + Number(guest && guest.companion_count || 0);
  const dateTime = () => new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });

  let palette;
  let paletteResults = [];
  let activeResult = 0;
  let lastDigest = '';
  let ready = false;

  function guests() {
    return Array.isArray(window.guests) ? window.guests : [];
  }

  function createHub() {
    if ($('#adminOperationsHub')) return;
    const target = $('.admin-modern-grid-two') || $('.admin-modern-kpis');
    if (!target) return;
    const hub = document.createElement('section');
    hub.id = 'adminOperationsHub';
    hub.className = 'admin-operations-hub';
    hub.setAttribute('aria-label', 'Resumo operacional');
    hub.innerHTML = `
      <article class="admin-operations-card">
        <div class="admin-operations-heading">
          <div><h2>Radar do dia</h2><p>Veja o que merece atenção antes da cerimónia.</p></div>
          <span class="admin-update-state" id="adminUpdateState">A preparar dados</span>
        </div>
        <div class="admin-alert-list" id="adminAlertList" aria-live="polite"></div>
        <div class="admin-quick-actions" aria-label="Acções rápidas">
          <button type="button" class="admin-quick-action" data-v835-action="add-guest"><span aria-hidden="true">＋</span><span><strong>Novo convite</strong><small>Adicionar convidado</small></span></button>
          <button type="button" class="admin-quick-action" data-v835-action="checkin"><span aria-hidden="true">✓</span><span><strong>Recepção</strong><small>Pesquisar ou validar</small></span></button>
          <button type="button" class="admin-quick-action" data-v835-action="tables"><span aria-hidden="true">♧</span><span><strong>Mesas</strong><small>Organizar lugares</small></span></button>
          <button type="button" class="admin-quick-action" data-v835-action="export"><span aria-hidden="true">⇩</span><span><strong>Exportar lista</strong><small>Guardar ficheiro CSV</small></span></button>
        </div>
      </article>
      <article class="admin-operations-card admin-operations-status">
        <div>
          <p class="admin-status-kicker">PRESENÇAS NO EVENTO</p>
          <p class="admin-status-number" id="adminArrivalNumber">0</p>
          <p class="admin-status-title" id="adminArrivalTitle">Aguardamos as confirmações</p>
          <p class="admin-status-description" id="adminArrivalDescription">O painel ficará pronto assim que os convites forem carregados.</p>
        </div>
        <div>
          <div class="admin-status-track" aria-hidden="true"><i id="adminArrivalBar"></i></div>
          <div class="admin-status-footer"><span id="adminArrivalFooter">0 confirmados</span><span id="adminArrivalPercent">0%</span></div>
        </div>
      </article>`;
    target.parentNode.insertBefore(hub, target);
    hub.addEventListener('click', event => {
      const action = event.target.closest('[data-v835-action]')?.dataset.v835Action;
      if (action) runAction(action);
    });
  }

  function setGuestFilter(filter) {
    location.hash = '#convidados';
    window.setTimeout(() => {
      const button = $(`.guest-filter[data-guest-filter="${filter}"]`);
      if (button) button.click();
    }, 100);
  }

  function runAction(action) {
    const actions = {
      'add-guest': () => $('#addBtn2')?.click(),
      checkin: () => { location.hash = '#checkin'; window.setTimeout(() => $('#checkinCode')?.focus(), 150); },
      tables: () => { location.hash = '#mesas'; },
      export: () => $('#exportBtn')?.click(),
      pending: () => setGuestFilter('pending'),
      seating: () => { location.hash = '#mesas'; },
      confirmed: () => setGuestFilter('confirmed')
    };
    if (actions[action]) actions[action]();
  }

  function alertMarkup(icon, tone, title, description, action, actionLabel) {
    return `<div class="admin-alert-item" data-tone="${tone}">
      <span class="admin-alert-icon" aria-hidden="true">${icon}</span>
      <span class="admin-alert-main"><strong>${esc(title)}</strong><span>${esc(description)}</span></span>
      ${action ? `<button type="button" class="admin-alert-action" data-v835-action="${esc(action)}">${esc(actionLabel || 'Ver')}</button>` : ''}
    </div>`;
  }

  function updateHub(force) {
    createHub();
    const all = guests();
    const digest = all.map(g => [g.id, g.rsvp_status, g.checked_in, g.table_id, g.companion_count].join(':')).join('|');
    if (!force && digest === lastDigest) return;
    lastDigest = digest;

    const pending = all.filter(g => g.rsvp_status === 'pending');
    const confirmed = all.filter(g => g.rsvp_status === 'confirmed');
    const arrived = confirmed.filter(g => g.checked_in);
    const withoutTable = all.filter(g => g.rsvp_status !== 'declined' && !g.table_id);
    const withoutTablePeople = withoutTable.reduce((sum, g) => sum + peopleFor(g), 0);
    const list = $('#adminAlertList');
    const updateState = $('#adminUpdateState');
    if (updateState) updateState.textContent = `Actualizado às ${dateTime()}`;
    if (list) {
      const alerts = [];
      if (pending.length) alerts.push(alertMarkup('!', 'pending', `${pending.length} confirmação(ões) pendente(s)`, 'Reveja a lista e envie um lembrete individual quando for oportuno.', 'pending', 'Ver pendentes'));
      if (withoutTable.length) alerts.push(alertMarkup('♧', 'seating', `${withoutTablePeople} pessoa(s) sem mesa`, `${withoutTable.length} convite(s) ainda precisam de lugar na recepção.`, 'seating', 'Organizar'));
      if (!alerts.length) alerts.push(alertMarkup('✓', 'ready', 'Preparação em dia', 'Não há confirmações pendentes nem convidados sem mesa.', 'confirmed', 'Ver convidados'));
      list.innerHTML = alerts.join('');
    }

    const totalConfirmedPeople = confirmed.reduce((sum, g) => sum + peopleFor(g), 0);
    const arrivedPeople = arrived.reduce((sum, g) => sum + peopleFor(g), 0);
    const percent = totalConfirmedPeople ? Math.round(arrivedPeople / totalConfirmedPeople * 100) : 0;
    const noun = arrivedPeople === 1 ? 'pessoa chegou' : 'pessoas chegaram';
    if ($('#adminArrivalNumber')) $('#adminArrivalNumber').textContent = String(arrivedPeople);
    if ($('#adminArrivalTitle')) $('#adminArrivalTitle').textContent = arrivedPeople ? `${arrivedPeople} ${noun}` : 'Aguardamos as chegadas';
    if ($('#adminArrivalDescription')) $('#adminArrivalDescription').textContent = totalConfirmedPeople
      ? `${Math.max(0, totalConfirmedPeople - arrivedPeople)} pessoa(s) confirmada(s) ainda não deram entrada.`
      : 'Este indicador acompanha as entradas depois de as presenças serem confirmadas.';
    if ($('#adminArrivalBar')) $('#adminArrivalBar').style.width = `${Math.max(0, Math.min(100, percent))}%`;
    if ($('#adminArrivalFooter')) $('#adminArrivalFooter').textContent = `${totalConfirmedPeople} pessoa(s) confirmada(s)`;
    if ($('#adminArrivalPercent')) $('#adminArrivalPercent').textContent = `${percent}%`;
  }

  function createPalette() {
    if (palette) return;
    palette = document.createElement('div');
    palette.id = 'adminCommandPalette';
    palette.className = 'admin-command-palette hidden';
    palette.setAttribute('role', 'dialog');
    palette.setAttribute('aria-label', 'Resultados da pesquisa global');
    palette.innerHTML = '<div class="admin-command-meta"><span>Pesquisa rápida</span><span>↑ ↓ para navegar · Enter para abrir</span></div><div class="admin-command-list" role="listbox"></div>';
    document.body.appendChild(palette);
    palette.addEventListener('mousedown', event => event.preventDefault());
    palette.addEventListener('click', event => {
      const button = event.target.closest('[data-v835-result]');
      if (button) chooseResult(Number(button.dataset.v835Result));
    });
  }

  function searchResults(query) {
    const q = normalise(query);
    const actions = [
      { kind: 'action', action: 'add-guest', icon: '＋', title: 'Adicionar novo convite', detail: 'Convidados' },
      { kind: 'action', action: 'checkin', icon: '✓', title: 'Abrir recepção / check-in', detail: 'Validar entradas' },
      { kind: 'action', action: 'tables', icon: '♧', title: 'Organizar mesas', detail: 'Mesas e lugares' },
      { kind: 'action', action: 'export', icon: '⇩', title: 'Exportar lista de convidados', detail: 'Ficheiro CSV' }
    ];
    const sections = [
      { kind: 'section', hash: '#convidados', icon: '♙', title: 'Convidados', detail: 'Lista, confirmações e convites' },
      { kind: 'section', hash: '#mesas', icon: '♧', title: 'Mesas e lugares', detail: 'Organização da recepção' },
      { kind: 'section', hash: '#presentes', icon: '◇', title: 'Lista de presentes', detail: 'Presentes e reservas' },
      { kind: 'section', hash: '#protocolos', icon: '♙', title: 'Equipa de protocolo', detail: 'Acessos de recepção' }
    ];
    const guestMatches = guests().filter(guest => {
      const words = normalise(`${guest.full_name || ''} ${guest.code || ''} ${guest.whatsapp || ''}`);
      return !q || words.includes(q);
    }).slice(0, 7).map(guest => ({ kind: 'guest', guest, icon: '♙', title: guest.full_name || 'Sem nome', detail: `${guest.code || 'Sem código'} · ${guest.rsvp_status === 'confirmed' ? 'Confirmado' : guest.rsvp_status === 'declined' ? 'Recusado' : 'Pendente'}` }));
    const fixed = actions.concat(sections).filter(item => !q || normalise(`${item.title} ${item.detail}`).includes(q));
    return guestMatches.concat(fixed).slice(0, 10);
  }

  function showPalette(input) {
    createPalette();
    const rect = input.getBoundingClientRect();
    const left = Math.max(12, Math.min(rect.left, window.innerWidth - 532));
    const top = Math.min(window.innerHeight - 80, rect.bottom + 8);
    palette.style.left = `${left}px`;
    palette.style.top = `${top}px`;
    palette.classList.remove('hidden');
  }

  function renderPalette(input) {
    if (!input) return;
    showPalette(input);
    paletteResults = searchResults(input.value);
    activeResult = Math.min(activeResult, Math.max(0, paletteResults.length - 1));
    const list = $('.admin-command-list', palette);
    if (!paletteResults.length) {
      list.innerHTML = '<div class="admin-command-empty">Nenhum convidado ou área encontrado.</div>';
      return;
    }
    list.innerHTML = paletteResults.map((result, index) => `<button type="button" role="option" aria-selected="${index === activeResult}" class="admin-command-item${index === activeResult ? ' is-active' : ''}" data-v835-result="${index}">
      <span class="admin-command-icon" aria-hidden="true">${result.icon}</span>
      <span class="admin-command-copy"><strong>${esc(result.title)}</strong><span>${esc(result.detail)}</span></span>
      <span class="admin-command-kind">${result.kind === 'guest' ? 'Convidado' : result.kind === 'section' ? 'Área' : 'Acção'}</span>
    </button>`).join('');
  }

  function hidePalette() {
    if (palette) palette.classList.add('hidden');
  }

  function openGuest(guest) {
    location.hash = '#convidados';
    window.setTimeout(() => {
      const input = $('#guestSearch');
      if (!input) return;
      input.value = guest.code || guest.full_name || '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      const card = $$('.guest-card').find(item => normalise(item.textContent).includes(normalise(guest.code || guest.full_name)));
      if (card) {
        card.classList.remove('admin-search-hit');
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.setTimeout(() => card.classList.add('admin-search-hit'), 220);
      }
    }, 130);
  }

  function chooseResult(index) {
    const result = paletteResults[index];
    if (!result) return;
    hidePalette();
    if (result.kind === 'guest') openGuest(result.guest);
    if (result.kind === 'section') location.hash = result.hash;
    if (result.kind === 'action') runAction(result.action);
  }

  function bindGlobalSearch() {
    const inputs = [$('#adminHeaderSearch'), $('#adminGlobalSearch')].filter(Boolean);
    inputs.forEach(input => {
      input.setAttribute('autocomplete', 'off');
      input.addEventListener('focus', () => { activeResult = 0; renderPalette(input); });
      input.addEventListener('input', () => { activeResult = 0; renderPalette(input); });
      input.addEventListener('keydown', event => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          if (!palette || palette.classList.contains('hidden')) renderPalette(input);
          const last = Math.max(0, paletteResults.length - 1);
          activeResult = event.key === 'ArrowDown' ? Math.min(last, activeResult + 1) : Math.max(0, activeResult - 1);
          renderPalette(input);
        } else if (event.key === 'Enter' && palette && !palette.classList.contains('hidden')) {
          event.preventDefault();
          chooseResult(activeResult);
        } else if (event.key === 'Escape') {
          hidePalette();
          input.blur();
        }
      });
    });
    document.addEventListener('keydown', event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        const input = $('#adminHeaderSearch') || $('#adminGlobalSearch');
        if (input) { input.focus(); input.select(); renderPalette(input); }
      }
      if (event.key === 'Escape') hidePalette();
    });
    document.addEventListener('click', event => {
      if (!palette || palette.classList.contains('hidden')) return;
      const inSearch = event.target.closest('#adminHeaderSearch, #adminGlobalSearch');
      if (!palette.contains(event.target) && !inSearch) hidePalette();
    });
    window.addEventListener('resize', hidePalette);
    window.addEventListener('scroll', hidePalette, true);
  }

  function makeToastsAccessible() {
    const mark = node => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      if (node.classList.contains('toast')) { node.setAttribute('role', 'status'); node.setAttribute('aria-live', 'polite'); }
      $$('.toast', node).forEach(toast => { toast.setAttribute('role', 'status'); toast.setAttribute('aria-live', 'polite'); });
    };
    new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(mark)))
      .observe(document.body, { childList: true, subtree: true });
    $$('.toast').forEach(mark);
  }

  function start() {
    if (ready || !document.body.classList.contains('admin-body')) return;
    ready = true;
    bindGlobalSearch();
    makeToastsAccessible();
    updateHub(true);
    window.setInterval(() => updateHub(false), 1200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
