/* V8.36 — Centro de controlo e editor completo do convite dos convidados. */
(function () {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[char]);
  const peopleFor = guest => 1 + Number(guest && guest.companion_count || 0);
  const guests = () => Array.isArray(window.guests) ? window.guests : [];

  const defaults = {
    couple_one: 'Agnaldo', couple_two: 'Fáuzia',
    site_title: 'Agnaldo & Fáuzia · O nosso casamento',
    site_description: 'Convite digital de casamento de Agnaldo e Fáuzia.',
    intro_note: 'Venham celebrar connosco este novo capítulo.', intro_date: '29 · 05 · 2027',
    hero_label: 'O nosso sim começa aqui', hero_kicker: 'Estamos a celebrar',
    hero_title: 'Um amor para\ntoda a vida', hero_copy: 'Há encontros que parecem acaso, mas chegam com a delicadeza de uma promessa.', hero_link_label: 'Conhecer a nossa história ↗',
    hero_day: '29', hero_month_year: 'MAIO\n2027',
    event_datetime: '2027-05-29T09:00', date_label: 'Um dia para recordar', date_lead: 'O nosso casamento acontece em',
    event_date_display: '29 de maio de 2027', date_location: 'sábado · cerimónia 09:00 · recepção 15:00 · Maputo',
    story_label: 'Capítulo um', story_title: 'A nossa\nhistória',
    story_text: 'Tudo começou num casamento, num daqueles encontros em que a vida parece preparar, silenciosamente, algo muito especial. Naquele dia, uma amiga comentou que já tinha sido a ponte para a união de vários casais. A Fáuzia, em tom de brincadeira, perguntou-lhe: “Você vive juntando as pessoas, mas quando chegará a minha vez?”\n\nPouco tempo depois, essa amiga falou-lhe sobre um amigo querido, descrevendo as suas qualidades e dizendo que talvez houvesse ali uma história bonita para começar. Sem avisar a Fáuzia, entrou em contacto com o Agnaldo e escreveu-lhe: “Agnaldo, tenho uma amiga enviada por Deus que está interessada em conhecer-te.”\n\nEntre fotografias, mensagens e boas conversas, os nossos caminhos começaram a aproximar-se. No dia 23 de Outubro de 2025, começámos a conversar e demos o primeiro passo para uma história que se tornaria cada vez mais bonita. Hoje, percebemos que aquele encontro não foi por acaso: Deus usou uma amiga como ponte para escrever a nossa história de amor.',
    story_signature: 'Com carinho, A & F', story_image_caption: 'Onde tudo faz sentido',
    program_label: 'O grande dia', program_heading: 'Um dia cheio de\npequenos momentos', program_intro: 'Do primeiro momento ao último, cada detalhe foi pensado para celebrar este dia connosco.', program_list_title: 'O programa:', program_open_label: 'Ver programa completo',
    details_label: 'Para ajudar', details_heading: 'Alguns detalhes\nimportantes',
    details_location_title: 'Kaya Kwanga', details_location_text: 'Avenida da Marginal · Maputo · Plus Code: 2JW6+WGC',
    details_attire_title: 'Traje', details_attire_text: 'Elegância descontraída. Cores alegres são bem-vindas.',
    details_deadline_title: 'Confirmação', details_deadline_text: 'Pedimos resposta até 30 de Abril de 2027.', details_image_caption: 'Para sempre começa agora',
    gifts_label: 'Com carinho', gifts_heading: 'Presentes\npara nós', gifts_intro: 'A vossa presença é o nosso maior presente. Se quiserem oferecer algo, podem escolher uma opção abaixo ou contribuir directamente.',
    contribution_title: 'Contribuição', contribution_name: 'Agnaldo & Fáuzia', gift_list_label: 'Lista de presentes', gift_list_heading: 'Escolha com carinho', gift_list_note: 'Reserve um presente para não haver repetidos.',
    rsvp_label: 'Uma resposta com Carinho', rsvp_heading: 'Podemos contar\nconsigo?', rsvp_intro: 'Procure o seu convite pelo nome ou código pessoal e confirme a sua presença directamente aqui no site.', rsvp_help_phone: '258875884353', rsvp_help_label: 'Falar connosco →', rsvp_signoff: 'PARA SEMPRE',
    nav_story: 'A nossa história', nav_program: 'O dia', nav_gifts: 'Presentes', nav_rsvp: 'RSVP',
    footer_date: '29 · 05 · 2027', footer_verse: '“O amor é paciente, o amor é bondoso.” — 1 Coríntios 13:4', footer_mark: '✧ Com amor', music_youtube_id: 'X9YHnImcww0',
    accounts: [
      { bank: 'BCI', number: '17039233510001' }, { bank: 'BIM', number: '1005281229' }, { bank: 'Moza', number: '04520806110001' }, { bank: 'M-Pesa', number: '845510992' }, { bank: 'E-Mola', number: '87 588 4353' }
    ]
  };

  const groups = [
    { icon: '♡', title: 'Identidade do casal', note: 'Nomes, primeira impressão e textos da capa.', fields: [
      ['couple_one', 'Primeiro nome', 'text'], ['couple_two', 'Segundo nome', 'text'], ['site_title', 'Título da página', 'text', 'wide'], ['site_description', 'Descrição para partilha', 'text', 'wide'],
      ['intro_note', 'Mensagem de abertura', 'text', 'wide'], ['intro_date', 'Data no ecrã de abertura', 'text'], ['hero_label', 'Etiqueta da capa', 'text'], ['hero_kicker', 'Frase pequena da capa', 'text'], ['hero_title', 'Título principal', 'textarea', 'wide', 'Use duas linhas: a segunda fica em itálico.'], ['hero_copy', 'Texto principal', 'textarea', 'wide'], ['hero_link_label', 'Ligação da capa', 'text'], ['hero_day', 'Dia em destaque', 'text'], ['hero_month_year', 'Mês e ano', 'textarea', '', 'Use duas linhas: mês e ano.']
    ]},
    { icon: '◷', title: 'Data e momento', note: 'Contagem, data exibida e resumo do grande dia.', fields: [
      ['event_datetime', 'Data e hora da cerimónia', 'datetime-local', 'wide', 'Actualiza a contagem regressiva.'], ['date_label', 'Etiqueta da secção', 'text'], ['date_lead', 'Texto antes da data', 'text'], ['event_date_display', 'Data apresentada aos convidados', 'text'], ['date_location', 'Resumo de horários e cidade', 'text', 'wide']
    ]},
    { icon: '✦', title: 'A vossa história', note: 'Texto, títulos, assinatura e legenda da fotografia.', fields: [
      ['story_label', 'Etiqueta da história', 'text'], ['story_title', 'Título da história', 'textarea', '', 'Use duas linhas para realçar a segunda.'], ['story_text', 'História do casal', 'textarea', 'wide', 'Separe parágrafos com uma linha em branco.'], ['story_signature', 'Assinatura', 'text'], ['story_image_caption', 'Legenda da fotografia', 'text']
    ]},
    { icon: '⌖', title: 'Programa e informações', note: 'Texto do programa, local, traje, prazo e os detalhes que os convidados precisam.', fields: [
      ['program_label', 'Etiqueta do programa', 'text'], ['program_heading', 'Título do programa', 'textarea', '', 'Use duas linhas para realçar a segunda.'], ['program_intro', 'Introdução ao programa', 'textarea', 'wide'], ['program_list_title', 'Título da lista do programa', 'text'], ['program_open_label', 'Botão do programa', 'text'],
      ['details_label', 'Etiqueta dos detalhes', 'text'], ['details_heading', 'Título dos detalhes', 'textarea', '', 'Use duas linhas para realçar a segunda.'], ['details_location_title', 'Título do local', 'text'], ['details_location_text', 'Morada / referência', 'text'], ['details_attire_title', 'Título do traje', 'text'], ['details_attire_text', 'Descrição do traje', 'text'], ['details_deadline_title', 'Título do prazo', 'text'], ['details_deadline_text', 'Descrição do prazo', 'text'], ['details_image_caption', 'Legenda da imagem de detalhes', 'text']
    ]},
    { icon: '◇', title: 'Presentes e contribuição', note: 'Mensagem, dados bancários e textos da lista de presentes.', fields: [
      ['gifts_label', 'Etiqueta dos presentes', 'text'], ['gifts_heading', 'Título dos presentes', 'textarea', '', 'Use duas linhas para realçar a segunda.'], ['gifts_intro', 'Mensagem aos convidados', 'textarea', 'wide'], ['contribution_title', 'Título da contribuição', 'text'], ['contribution_name', 'Nome do titular', 'text'], ['gift_list_label', 'Etiqueta da lista', 'text'], ['gift_list_heading', 'Título da lista', 'text'], ['gift_list_note', 'Nota da lista', 'text']
    ], accounts: true },
    { icon: '✓', title: 'RSVP, navegação e rodapé', note: 'Confirmação, contacto de ajuda, menu, música e assinatura final.', fields: [
      ['rsvp_label', 'Etiqueta RSVP', 'text'], ['rsvp_heading', 'Título RSVP', 'textarea', '', 'Use duas linhas para realçar a segunda.'], ['rsvp_intro', 'Texto RSVP', 'textarea', 'wide'], ['rsvp_help_phone', 'WhatsApp para ajuda', 'tel', '', 'Inclua o indicativo do país.'], ['rsvp_help_label', 'Texto do link de ajuda', 'text'], ['rsvp_signoff', 'Assinatura RSVP', 'text'],
      ['nav_story', 'Menu: história', 'text'], ['nav_program', 'Menu: programa', 'text'], ['nav_gifts', 'Menu: presentes', 'text'], ['nav_rsvp', 'Menu: RSVP', 'text'], ['footer_date', 'Data no rodapé', 'text'], ['footer_verse', 'Versículo / frase no rodapé', 'text', 'wide'], ['footer_mark', 'Mensagem final do rodapé', 'text'], ['music_youtube_id', 'ID do vídeo YouTube', 'text', '', 'Apenas o código depois de watch?v=.']
    ]}
  ];

  let content = { ...defaults, accounts: defaults.accounts.map(account => ({ ...account })) };
  let lastDashboardDigest = '';

  function fieldMarkup(field) {
    const [key, label, type, width, hint] = field;
    const id = `v836-${key}`;
    const wide = width === 'wide' ? ' v836-editor-field--wide' : '';
    const value = content[key] == null ? '' : String(content[key]);
    const control = type === 'textarea'
      ? `<textarea id="${id}" data-content-key="${key}" rows="${key === 'story_text' ? 10 : 4}">${esc(value)}</textarea>`
      : `<input id="${id}" data-content-key="${key}" type="${type === 'tel' ? 'tel' : type === 'datetime-local' ? 'datetime-local' : 'text'}" value="${esc(value)}">`;
    return `<div class="v836-editor-field${wide}"><label for="${id}">${esc(label)}</label>${control}${hint ? `<small>${esc(hint)}</small>` : ''}</div>`;
  }

  function accountsMarkup() {
    const accounts = Array.isArray(content.accounts) ? content.accounts : defaults.accounts;
    return `<div class="v836-accounts"><p>Dados para contribuição. Pode actualizar cada banco e número.</p>${accounts.map((account, index) => `<div class="v836-account-row"><input type="text" data-account-bank="${index}" value="${esc(account.bank || '')}" aria-label="Instituição da conta ${index + 1}"><input type="text" data-account-number="${index}" value="${esc(account.number || '')}" aria-label="Número da conta ${index + 1}"></div>`).join('')}</div>`;
  }

  function editorMarkup() {
    return `<section id="site-editor" class="wedy-section admin-view-section site-content-view" aria-labelledby="v836EditorTitle">
      <header class="v836-editor-header"><div><p class="v836-editor-kicker">CONVITE DOS CONVIDADOS</p><h2 id="v836EditorTitle">Editar toda a página pública</h2><p>Altere os textos, nomes, datas, horários, detalhes, contribuições, RSVP, menu e rodapé. As fotografias, a história e o programa continuam também disponíveis nas opções específicas.</p></div><div class="v836-editor-actions"><button type="button" class="button secondary" data-v836-editor-action="program">Editar programa</button><button type="button" class="button secondary" data-v836-editor-action="preview">Pré-visualizar</button></div></header>
      <div class="v836-editor-intro"><span aria-hidden="true">i</span><div>As alterações só ficam visíveis no convite depois de guardar. A primeira vez requer activar a configuração no Supabase com o ficheiro SQL incluído.</div></div>
      <form id="v836SiteContentForm"><div class="v836-editor-groups">${groups.map((group, index) => `<details class="v836-editor-group"${index === 0 ? ' open' : ''}><summary><span class="v836-editor-group-icon" aria-hidden="true">${group.icon}</span><span class="v836-editor-group-title"><strong>${esc(group.title)}</strong><small>${esc(group.note)}</small></span></summary><div class="v836-editor-fields">${group.fields.map(fieldMarkup).join('')}${group.accounts ? accountsMarkup() : ''}</div></details>`).join('')}</div>
      <footer class="v836-editor-footer"><p id="v836EditorStatus" class="v836-editor-status" role="status" aria-live="polite"></p><button type="submit" class="button primary-modal" id="v836SaveContent">Guardar alterações do convite</button></footer></form>
    </section>`;
  }

  function insertEditor() {
    if ($('#site-editor')) return $('#site-editor');
    const wrap = $('.admin-wrap');
    if (!wrap) return null;
    wrap.insertAdjacentHTML('beforeend', editorMarkup());
    const editor = $('#site-editor');
    editor.addEventListener('click', event => {
      const action = event.target.closest('[data-v836-editor-action]')?.dataset.v836EditorAction;
      if (action === 'program') location.hash = '#programa-admin';
      if (action === 'preview') window.open('index.html', '_blank', 'noopener');
    });
    $('#v836SiteContentForm', editor)?.addEventListener('submit', saveContent);
    return editor;
  }

  function updateEditorForm() {
    const editor = insertEditor();
    if (!editor) return;
    $$('[data-content-key]', editor).forEach(input => { input.value = content[input.dataset.contentKey] == null ? '' : content[input.dataset.contentKey]; });
    const accounts = Array.isArray(content.accounts) ? content.accounts : defaults.accounts;
    $$('[data-account-bank]', editor).forEach(input => { input.value = accounts[Number(input.dataset.accountBank)]?.bank || ''; });
    $$('[data-account-number]', editor).forEach(input => { input.value = accounts[Number(input.dataset.accountNumber)]?.number || ''; });
  }

  function readEditorForm() {
    const editor = $('#site-editor');
    const next = {};
    $$('[data-content-key]', editor).forEach(input => { next[input.dataset.contentKey] = input.value.trim(); });
    next.accounts = defaults.accounts.map((fallback, index) => ({
      bank: $(`[data-account-bank="${index}"]`, editor)?.value.trim() || '',
      number: $(`[data-account-number="${index}"]`, editor)?.value.trim() || ''
    }));
    return next;
  }

  function status(message, isError) {
    const node = $('#v836EditorStatus');
    if (!node) return;
    node.textContent = message || '';
    node.style.color = isError ? '#a35343' : '';
  }

  async function loadContent() {
    if (!window.supabaseClient) return;
    try {
      const { data, error } = await supabaseClient.from('wedding_settings').select('site_content').eq('id', 1).maybeSingle();
      if (error) {
        status('Para activar este editor, execute primeiro o ficheiro supabase-v8.36-editor-conteudo.sql no Supabase.', true);
        return;
      }
      if (data?.site_content && typeof data.site_content === 'object') {
        content = { ...defaults, ...data.site_content, accounts: Array.isArray(data.site_content.accounts) ? data.site_content.accounts : defaults.accounts };
        updateEditorForm();
      }
    } catch (_) {
      status('Não foi possível ler o conteúdo guardado. Pode preencher e tentar guardar depois de executar o ficheiro SQL.', true);
    }
  }

  async function saveContent(event) {
    event.preventDefault();
    const button = $('#v836SaveContent');
    const next = readEditorForm();
    button.disabled = true;
    button.textContent = 'A guardar…';
    status('');
    try {
      const { error } = await supabaseClient.rpc('admin_update_site_content', { p_content: next });
      if (error) throw error;
      content = next;
      status('Alterações guardadas. A página dos convidados já pode ser pré-visualizada.');
      window.toast?.('Conteúdo do convite actualizado. ❤️');
    } catch (error) {
      status(`Não foi possível guardar. Execute o ficheiro SQL incluído no Supabase e tente novamente. (${error.message || error})`, true);
    } finally {
      button.disabled = false;
      button.textContent = 'Guardar alterações do convite';
    }
  }

  function initials(name) {
    return String(name || '?').trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  }

  function createDashboard() {
    const host = $('#visao-geral .admin-dashboard-main') || $('#visao-geral');
    if (!host) return null;
    const existing = $('#v836Dashboard');
    if (existing) {
      if (existing.parentElement !== host) host.appendChild(existing);
      return existing;
    }
    const dashboard = document.createElement('div');
    dashboard.id = 'v836Dashboard';
    dashboard.className = 'v836-dashboard';
    dashboard.innerHTML = `<div class="v836-dashboard-top"><div><p class="v836-dashboard-eyebrow">CENTRO DE CONTROLO</p><h1>O casamento, <i>sob controlo.</i></h1></div><div class="v836-dashboard-date"><span class="v836-date-box" aria-hidden="true">▣</span><div><span>Próximo grande dia</span><strong>29 de Maio de 2027</strong></div></div></div>
      <section class="v836-command-card"><div class="v836-command-copy"><p class="v836-kicker">PAINEL DOS NOIVOS</p><h2 id="v836CommandTitle">Prepare cada detalhe<br><i>com tranquilidade.</i></h2><p class="v836-summary" id="v836CommandSummary">Acompanhe a resposta dos convidados e mantenha o convite actualizado num só lugar.</p><div class="v836-command-actions"><button type="button" class="v836-command-button v836-command-button--accent" data-v836-nav="site-editor">Editar página dos convidados</button><button type="button" class="v836-command-button" data-v836-nav="convidados">Gerir convidados</button><button type="button" class="v836-command-button" data-v836-nav="checkin">Abrir recepção</button></div></div><aside class="v836-readiness"><div><p class="v836-kicker">PREPARAÇÃO</p><strong id="v836ReadinessValue">0%</strong><p id="v836ReadinessText">A calcular o estado da preparação.</p></div><div><div class="v836-readiness-track" aria-hidden="true"><i id="v836ReadinessBar"></i></div><div class="v836-readiness-footer"><span id="v836ReadinessFooter">0 passos acompanhados</span><span id="v836ReadinessLabel">0%</span></div></div></aside></section>
      <section class="v836-stat-grid" aria-label="Resumo do casamento"><article class="v836-stat"><div class="v836-stat-head"><span class="v836-stat-icon">♙</span><small>CONVITES</small></div><strong id="v836Guests">0</strong><p id="v836GuestsCopy">Convidados registados</p></article><article class="v836-stat" data-tone="sage"><div class="v836-stat-head"><span class="v836-stat-icon">✓</span><small>CONFIRMADOS</small></div><strong id="v836Confirmed">0</strong><p id="v836ConfirmedCopy">Pessoas esperadas</p></article><article class="v836-stat" data-tone="gold"><div class="v836-stat-head"><span class="v836-stat-icon">♧</span><small>MESAS</small></div><strong id="v836Seated">0</strong><p id="v836SeatedCopy">Convites com mesa</p></article><article class="v836-stat" data-tone="sage"><div class="v836-stat-head"><span class="v836-stat-icon">➤</span><small>ENTRADAS</small></div><strong id="v836Arrived">0</strong><p id="v836ArrivedCopy">Pessoas já recebidas</p></article></section>
      <section class="v836-workspace"><article class="v836-panel"><header class="v836-panel-head"><div><h2>Atalhos para o grande dia</h2><p>Vá directamente à área de que precisa.</p></div></header><div class="v836-journey"><button type="button" class="v836-journey-button" data-v836-nav="site-editor"><span class="v836-journey-icon">✎</span><span class="v836-journey-copy"><strong>Convite público</strong><small>Textos, datas, RSVP e contas</small></span><span class="v836-journey-arrow">›</span></button><button type="button" class="v836-journey-button" data-v836-nav="convidados"><span class="v836-journey-icon">♙</span><span class="v836-journey-copy"><strong>Convidados</strong><small>Convites e confirmações</small></span><span class="v836-journey-arrow">›</span></button><button type="button" class="v836-journey-button" data-v836-nav="mesas"><span class="v836-journey-icon">♧</span><span class="v836-journey-copy"><strong>Mesas</strong><small>Lugares e distribuição</small></span><span class="v836-journey-arrow">›</span></button><button type="button" class="v836-journey-button" data-v836-nav="presentes"><span class="v836-journey-icon">◇</span><span class="v836-journey-copy"><strong>Presentes</strong><small>Lista e reservas</small></span><span class="v836-journey-arrow">›</span></button></div></article><article class="v836-panel"><header class="v836-panel-head"><div><h2>Últimas entradas</h2><p>Actualizado a partir da recepção.</p></div><button type="button" class="v836-panel-link" data-v836-nav="checkin">Abrir recepção</button></header><div id="v836Arrivals" class="v836-arrivals"></div></article></section>`;
    host.appendChild(dashboard);
    dashboard.addEventListener('click', event => {
      const nav = event.target.closest('[data-v836-nav]')?.dataset.v836Nav;
      if (nav) location.hash = `#${nav}`;
    });
    return dashboard;
  }

  function renderDashboard(force) {
    const dashboard = createDashboard();
    if (!dashboard) return;
    const all = guests();
    const digest = all.map(g => [g.id, g.rsvp_status, g.checked_in, g.table_id, g.companion_count, g.checked_in_at].join(':')).join('|');
    if (!force && digest === lastDashboardDigest) return;
    lastDashboardDigest = digest;
    const confirmed = all.filter(g => g.rsvp_status === 'confirmed');
    const pending = all.filter(g => g.rsvp_status === 'pending');
    const seated = all.filter(g => g.table_id && g.rsvp_status !== 'declined');
    const arrived = confirmed.filter(g => g.checked_in);
    const expectedPeople = confirmed.reduce((sum, guest) => sum + peopleFor(guest), 0);
    const arrivedPeople = arrived.reduce((sum, guest) => sum + peopleFor(guest), 0);
    const progressBits = [all.length > 0, pending.length === 0, all.filter(g => g.rsvp_status !== 'declined' && !g.table_id).length === 0];
    const readiness = Math.round(progressBits.filter(Boolean).length / progressBits.length * 100);
    $('#v836Guests').textContent = all.length;
    $('#v836GuestsCopy').textContent = `${pending.length} aguardam resposta`;
    $('#v836Confirmed').textContent = confirmed.length;
    $('#v836ConfirmedCopy').textContent = `${expectedPeople} pessoa(s) esperada(s)`;
    $('#v836Seated').textContent = seated.length;
    $('#v836SeatedCopy').textContent = `${Math.max(0, all.filter(g => g.rsvp_status !== 'declined').length - seated.length)} por organizar`;
    $('#v836Arrived').textContent = arrivedPeople;
    $('#v836ArrivedCopy').textContent = expectedPeople ? `${Math.round(arrivedPeople / expectedPeople * 100)}% das chegadas` : 'A recepção ainda não começou';
    $('#v836ReadinessValue').textContent = `${readiness}%`;
    $('#v836ReadinessText').textContent = pending.length ? `${pending.length} confirmação(ões) ainda precisam de atenção.` : 'As confirmações estão em dia. Continue a organizar as mesas e os detalhes.';
    $('#v836ReadinessBar').style.width = `${readiness}%`;
    $('#v836ReadinessFooter').textContent = `${progressBits.filter(Boolean).length} de ${progressBits.length} passos acompanhados`;
    $('#v836ReadinessLabel').textContent = `${readiness}%`;
    const arrivalList = $('#v836Arrivals');
    const latest = arrived.slice().sort((a, b) => new Date(b.checked_in_at || 0) - new Date(a.checked_in_at || 0)).slice(0, 5);
    arrivalList.innerHTML = latest.length ? latest.map(guest => `<div class="v836-arrival"><span class="v836-arrival-avatar">${esc(initials(guest.full_name))}</span><span><strong>${esc(guest.full_name)}</strong><small>${esc(guest.table_name || 'Sem mesa')}</small></span><time>${guest.checked_in_at ? new Date(guest.checked_in_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : '—'}</time></div>`).join('') : '<div class="v836-arrivals-empty">As entradas registadas na recepção aparecerão aqui.</div>';
  }

  function addEditorNavigation() {
    if ($('[data-v836-editor-link]')) return;
    const subnav = $('.admin-sidebar-subnav[aria-label="Conteúdo do convite"]');
    if (!subnav) return;
    const link = document.createElement('a');
    link.href = '#site-editor';
    link.dataset.v836EditorLink = 'true';
    link.innerHTML = '<span class="nav-icon">✎</span><span>Editar todo o convite</span>';
    subnav.insertBefore(link, subnav.firstChild);
  }

  function syncEditorRoute() {
    const editor = $('#site-editor');
    if (!editor) return;
    const isEditor = location.hash === '#site-editor';
    const isDashboard = !location.hash || location.hash === '#visao-geral';
    const dashboard = $('#visao-geral');
    if (isEditor) {
      $$('.admin-view-section').forEach(section => section.classList.remove('admin-view-active'));
      editor.classList.add('admin-view-active');
      if (dashboard) dashboard.style.removeProperty('display');
      $$('.admin-dashboard-sidebar a[href^="#"]').forEach(link => link.classList.toggle('active', link.getAttribute('href') === '#site-editor'));
      window.setTimeout(() => $('#v836EditorTitle')?.focus?.({ preventScroll: true }), 40);
    } else {
      if (dashboard) dashboard.style.removeProperty('display');
      editor.classList.remove('admin-view-active');
    }
  }

  function start() {
    if (!document.body.classList.contains('admin-body')) return;
    insertEditor();
    addEditorNavigation();
    createDashboard();
    renderDashboard(true);
    loadContent();
    syncEditorRoute();
    window.addEventListener('hashchange', syncEditorRoute);
    window.setInterval(() => renderDashboard(false), 1200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
