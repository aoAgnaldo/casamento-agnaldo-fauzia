/* V8.37 — rota estável e editor visual para todo o conteúdo do convite. */
(function () {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const own = (object, key) => Object.prototype.hasOwnProperty.call(object || {}, key);
  const escapeHtml = value => String(value == null ? '' : value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[char]);

  const panes = [
    {
      id: 'geral', icon: '◉', label: 'Geral / Capa', kicker: 'CONTEÚDO DO CONVITE',
      title: 'Capa e textos principais',
      description: 'Defina os nomes, a primeira impressão, a data e a mensagem que os convidados encontram ao abrir o convite.',
      fields: ['couple_one', 'couple_two', 'site_title', 'site_description', 'intro_note', 'intro_date', 'hero_label', 'hero_kicker', 'hero_title', 'hero_copy', 'hero_link_label', 'hero_day', 'hero_month_year', 'event_datetime', 'date_label', 'date_lead', 'event_date_display', 'date_location']
    },
    {
      id: 'historia', icon: '♡', label: 'Nossa História', kicker: 'A VOSSA HISTÓRIA',
      title: 'A história do casal',
      description: 'Escreva o capítulo que os vossos convidados irão ler no convite.',
      fields: ['story_label', 'story_title', 'story_text', 'story_signature', 'story_image_caption']
    },
    {
      id: 'galeria', icon: '▧', label: 'Galeria de Fotos', kicker: 'FOTOGRAFIAS',
      title: 'Capa, história e detalhes',
      description: 'As fotografias são tratadas na área própria para manter a qualidade e o recorte de cada imagem.',
      fields: []
    },
    {
      id: 'programa', icon: '◷', label: 'Programa', kicker: 'O GRANDE DIA',
      title: 'Programa do casamento',
      description: 'Ajuste os títulos e textos desta secção. Os horários e os momentos são organizados na área Programa.',
      fields: ['program_label', 'program_heading', 'program_intro', 'program_list_title', 'program_open_label']
    },
    {
      id: 'informacoes', icon: '⌖', label: 'Informações', kicker: 'PARA OS CONVIDADOS',
      title: 'Informações importantes',
      description: 'Local, traje e prazo de confirmação em linguagem simples para os convidados.',
      fields: ['details_label', 'details_heading', 'details_location_title', 'details_location_text', 'details_attire_title', 'details_attire_text', 'details_deadline_title', 'details_deadline_text', 'details_image_caption']
    },
    {
      id: 'bancos', icon: '◇', label: 'Dados Bancários', kicker: 'PRESENTES E CONTRIBUIÇÕES',
      title: 'Presentes e dados bancários',
      description: 'Edite a mensagem de presentes e as contas de contribuição que aparecem no convite.',
      fields: ['gifts_label', 'gifts_heading', 'gifts_intro', 'contribution_title', 'contribution_name', 'gift_list_label', 'gift_list_heading', 'gift_list_note'],
      accounts: true
    },
    {
      id: 'rsvp', icon: '✓', label: 'RSVP / Confirmação', kicker: 'CONFIRMAÇÃO',
      title: 'Resposta dos convidados',
      description: 'Explique como confirmar presença e indique o contacto de apoio.',
      fields: ['rsvp_label', 'rsvp_heading', 'rsvp_intro', 'rsvp_help_phone', 'rsvp_help_label', 'rsvp_signoff']
    },
    {
      id: 'rodape', icon: '✦', label: 'Rodapé e extras', kicker: 'ÚLTIMOS DETALHES',
      title: 'Menu, rodapé e música',
      description: 'Personalize os nomes do menu, a frase final e a música do convite.',
      fields: ['nav_story', 'nav_program', 'nav_gifts', 'nav_rsvp', 'footer_date', 'footer_verse', 'footer_mark', 'music_youtube_id']
    }
  ];

  let editor = null;
  let form = null;
  let savedContent = {};
  let routerBound = false;
  let hasLocalEdits = false;
  const dirtyKeys = new Set();
  let accountsDirty = false;

  function status(message, state) {
    const node = $('#v836EditorStatus');
    if (!node) return;
    node.textContent = message || '';
    node.dataset.state = state || '';
  }

  function paneMarkup(pane) {
    const gallery = pane.id === 'galeria'
      ? `<div class="v837-editor-gallery"><strong>Imagens do convite</strong><p>Escolha aqui as imagens que aparecem para os convidados: capa, história e detalhes.</p><div class="v844-image-actions"><button class="button secondary" type="button" data-v837-image-target="cover">Trocar capa</button><button class="button secondary" type="button" data-v837-image-target="story">Trocar imagem da história</button><button class="button secondary" type="button" data-v837-image-target="details">Trocar imagem dos detalhes</button></div></div>`
      : `<div class="v837-pane-fields" data-v837-pane-fields="${pane.id}"></div>${pane.id === 'programa' ? `<div class="v837-editor-note"><strong>Momentos do dia</strong><p>Adicione ou altere horários, descrições e localizações de cada momento na área específica.</p><button class="button secondary" type="button" data-v837-route="programa-admin">Gerir momentos do programa</button></div>` : ''}`;
    return `<section class="v837-form-pane" data-v837-pane="${pane.id}" aria-labelledby="v837-${pane.id}-title"><header class="v837-pane-heading"><div><p>${escapeHtml(pane.kicker)}</p><h3 id="v837-${pane.id}-title">${escapeHtml(pane.title)}</h3><small>${escapeHtml(pane.description)}</small></div></header>${gallery}</section>`;
  }

  function editorMarkup() {
    const tabs = panes.map((pane, index) => `<button type="button" data-v837-tab="${pane.id}"${index === 0 ? ' class="is-active"' : ''}><span class="v837-tab-icon" aria-hidden="true">${pane.icon}</span><span>${escapeHtml(pane.label)}</span></button>`).join('');
    return `<header class="v837-editor-header"><div><p class="v837-editor-kicker">CONTEÚDO DO SITE</p><h2>Editar todo o convite</h2><p>Faça as alterações do convite público numa única área organizada. Guarde quando terminar.</p></div><div class="v837-editor-header-actions"><button class="button secondary" type="button" data-v837-action="preview">Pré-visualizar</button></div></header><div class="v837-editor-layout"><nav class="v837-editor-tabs" aria-label="Secções do conteúdo">${tabs}</nav><div class="v837-editor-form-card"><div id="v837FormHost"></div></div><aside class="v837-editor-preview" aria-label="Pré-visualização da capa"><header><h3>Pré-visualização</h3><small>Convite público</small></header><div class="v837-phone-preview"><img id="v837PreviewCover" src="monogram.svg" alt="Pré-visualização da capa"><span class="v837-phone-notch" aria-hidden="true"></span><div class="v837-phone-copy"><span id="v837PreviewKicker">ESTAMOS A CELEBRAR</span><strong id="v837PreviewNames">Agnaldo &amp; Fáuzia</strong><p id="v837PreviewMessage">Um amor para toda a vida</p></div></div><button class="button secondary v837-preview-button" type="button" data-v837-action="preview">Abrir convite público</button></aside></div>`;
  }

  function extractEditorParts() {
    const fields = new Map();
    $$('.v836-editor-field', form).forEach(field => {
      const input = $('[data-content-key]', field);
      if (input) fields.set(input.dataset.contentKey, field);
    });
    const accounts = $('.v836-accounts', form);
    const footer = $('.v836-editor-footer', form);
    fields.forEach(field => field.remove());
    accounts?.remove();
    footer?.remove();
    return { fields, accounts, footer };
  }

  function collectChangedContent() {
    const values = {};
    dirtyKeys.forEach(key => {
      const input = $(`[data-content-key="${key}"]`, form);
      if (input) values[key] = String(input.value == null ? '' : input.value).trim();
    });
    if (!accountsDirty) return values;
    const previousAccounts = Array.isArray(savedContent.accounts) ? savedContent.accounts.map(account => ({ ...account })) : [];
    const accountIndexes = new Set();
    $$('[data-account-bank], [data-account-number]', form).forEach(input => {
      const index = Number(input.dataset.accountBank ?? input.dataset.accountNumber);
      if (Number.isInteger(index) && index >= 0) accountIndexes.add(index);
    });
    if (accountIndexes.size) {
      const count = Math.max(...accountIndexes) + 1;
      const accounts = previousAccounts.length ? previousAccounts : Array.from({ length: count }, () => ({}));
      for (let index = 0; index < count; index += 1) {
        const current = accounts[index] || {};
        const bank = $(`[data-account-bank="${index}"]`, form);
        const number = $(`[data-account-number="${index}"]`, form);
        accounts[index] = {
          ...current,
          bank: bank ? bank.value.trim() : String(current.bank || ''),
          number: number ? number.value.trim() : String(current.number || '')
        };
      }
      values.accounts = accounts;
    }
    return values;
  }

  function applyContent(content) {
    if (!content || typeof content !== 'object' || Array.isArray(content)) return;
    $$('[data-content-key]', form).forEach(input => {
      const key = input.dataset.contentKey;
      if (own(content, key)) input.value = content[key] == null ? '' : String(content[key]);
    });
    if (Array.isArray(content.accounts)) {
      content.accounts.forEach((account, index) => {
        const bank = $(`[data-account-bank="${index}"]`, form);
        const number = $(`[data-account-number="${index}"]`, form);
        if (bank) bank.value = account?.bank == null ? '' : String(account.bank);
        if (number) number.value = account?.number == null ? '' : String(account.number);
      });
    }
    updatePreview();
  }

  function updatePreview() {
    if (!editor || !form) return;
    const get = key => $(`[data-content-key="${key}"]`, form)?.value.trim() || '';
    const first = get('couple_one') || 'Agnaldo';
    const second = get('couple_two') || 'Fáuzia';
    const title = get('hero_title') || `${first} & ${second}`;
    const kicker = get('hero_kicker') || 'Estamos a celebrar';
    const copy = get('hero_copy') || 'Um amor para toda a vida';
    const cover = $('#siteCoverPreview');
    const image = $('#v837PreviewCover');
    if (image && cover?.src) image.src = cover.currentSrc || cover.src;
    const previewKicker = $('#v837PreviewKicker');
    const previewNames = $('#v837PreviewNames');
    const previewMessage = $('#v837PreviewMessage');
    if (previewKicker) previewKicker.textContent = kicker.toUpperCase();
    if (previewNames) previewNames.innerHTML = escapeHtml(`${first} & ${second}`);
    if (previewMessage) previewMessage.innerHTML = escapeHtml(title).replace(/\n/g, '<br>') || escapeHtml(copy);
  }

  function activateTab(id, shouldFocus) {
    const target = panes.some(pane => pane.id === id) ? id : 'geral';
    $$('[data-v837-tab]', editor).forEach(button => button.classList.toggle('is-active', button.dataset.v837Tab === target));
    $$('[data-v837-pane]', editor).forEach(pane => pane.classList.toggle('is-active', pane.dataset.v837Pane === target));
    if (shouldFocus) {
      const heading = $(`#v837-${target}-title`, editor);
      heading?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  async function loadSavedContent() {
    if (!window.supabaseClient) return;
    try {
      const { data, error } = await window.supabaseClient.from('wedding_settings').select('site_content').eq('id', 1).maybeSingle();
      if (error) throw error;
      let content = data?.site_content;
      if (typeof content === 'string') content = JSON.parse(content);
      if (content && typeof content === 'object' && !Array.isArray(content)) {
        savedContent = { ...content };
        if (!hasLocalEdits) applyContent(content);
      } else {
        status('O convite continua com os textos actuais. Só os campos que alterar serão guardados.', '');
      }
    } catch (_) {
      status('Para activar a gravação deste editor, execute primeiro o ficheiro SQL incluído no Supabase.', 'error');
    }
  }

  async function saveContent(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const button = $('#v836SaveContent');
    if (!window.supabaseClient) {
      status('A ligação ao painel ainda não está disponível. Tente novamente dentro de instantes.', 'error');
      return;
    }
    const changes = collectChangedContent();
    if (!Object.keys(changes).length) {
      status('Ainda não há alterações para guardar.');
      return;
    }
    const next = { ...savedContent, ...changes };
    const original = button?.textContent || 'Guardar alterações do convite';
    if (button) {
      button.disabled = true;
      button.textContent = 'A guardar…';
    }
    status('A guardar as alterações do convite…');
    try {
      const { error } = await window.supabaseClient.rpc('admin_update_site_content', { p_content: next });
      if (error) throw error;
      savedContent = { ...next };
      dirtyKeys.clear();
      accountsDirty = false;
      status('Alterações guardadas. A página dos convidados já está actualizada.', 'success');
      window.toast?.('Conteúdo do convite actualizado.');
    } catch (error) {
      status(`Não foi possível guardar. Confirme se executou o ficheiro SQL no Supabase. (${error?.message || error})`, 'error');
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = original;
      }
    }
  }

  function showEditor() {
    if (!editor) return;
    const dashboard = $('#visao-geral');
    dashboard?.classList.add('is-view-hidden');
    $$('.admin-view-section').forEach(section => section.classList.toggle('admin-view-active', section === editor));
    $$('.admin-dashboard-sidebar a[href^="#"]').forEach(link => link.classList.toggle('active', link.getAttribute('href') === '#site-editor'));
    editor.classList.add('admin-view-active');
  }

  function syncEditorRoute() {
    if (!editor) return;
    const routeTabs = {
      '#site-capa': 'galeria',
      '#site-historia': 'historia'
    };
    const requestedTab = routeTabs[location.hash] || (location.hash.startsWith('#content-') ? location.hash.slice('#content-'.length) : '');
    if (location.hash === '#site-editor' || requestedTab) {
      window.setTimeout(() => {
        showEditor();
        if (requestedTab) activateTab(requestedTab, false);
      }, 0);
    } else {
      editor.classList.remove('admin-view-active');
    }
  }

  function navigateToEditor(event) {
    const link = event.target.closest('a[href="#site-editor"]');
    if (!link) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (location.hash !== '#site-editor') location.hash = '#site-editor';
    showEditor();
  }

  function bindRouter() {
    if (routerBound) return;
    routerBound = true;
    document.addEventListener('click', navigateToEditor, true);
    window.addEventListener('hashchange', syncEditorRoute);
  }

  function buildEditor() {
    editor = $('#site-editor');
    form = $('#v836SiteContentForm', editor || document);
    if (!editor || !form) return false;
    if (editor.dataset.v837Built === 'true') return true;

    const { fields, accounts, footer } = extractEditorParts();
    form.remove();
    editor.classList.add('v837-editor');
    editor.dataset.v837Built = 'true';
    editor.innerHTML = editorMarkup();
    const host = $('#v837FormHost', editor);
    host.appendChild(form);
    form.classList.add('v837-editor-form');
    form.innerHTML = panes.map(paneMarkup).join('');
    panes.forEach(pane => {
      const fieldHost = $(`[data-v837-pane-fields="${pane.id}"]`, editor);
      pane.fields.forEach(key => {
        const field = fields.get(key);
        if (field && fieldHost) fieldHost.appendChild(field);
      });
      if (pane.accounts && accounts && fieldHost) fieldHost.appendChild(accounts);
    });
    const unplaced = Array.from(fields.entries()).filter(([key]) => !panes.some(pane => pane.fields.includes(key))).map(([, field]) => field);
    const firstFieldHost = $('[data-v837-pane-fields="geral"]', editor);
    unplaced.forEach(field => firstFieldHost?.appendChild(field));
    if (footer) {
      footer.classList.add('v837-editor-footer');
      const statusNode = $('#v836EditorStatus', footer);
      statusNode?.classList.add('v837-editor-status');
      form.appendChild(footer);
    }

    editor.addEventListener('click', event => {
      const tab = event.target.closest('[data-v837-tab]')?.dataset.v837Tab;
      if (tab) {
        activateTab(tab, true);
        return;
      }
      const imageTarget = event.target.closest('[data-v837-image-target]')?.dataset.v837ImageTarget;
      if (imageTarget) {
        event.preventDefault();
        if (typeof window.openImageSettings === 'function') window.openImageSettings(imageTarget);
        return;
      }
      const route = event.target.closest('[data-v837-route]')?.dataset.v837Route;
      if (route) {
        location.hash = `#${route}`;
        return;
      }
      if (event.target.closest('[data-v837-action="preview"]')) {
        window.open('index.html', '_blank', 'noopener');
      }
    });
    form.addEventListener('input', event => {
      hasLocalEdits = true;
      const input = event.target;
      if (input?.dataset?.contentKey) dirtyKeys.add(input.dataset.contentKey);
      if (input?.matches?.('[data-account-bank], [data-account-number]')) accountsDirty = true;
      updatePreview();
    });
    form.addEventListener('submit', saveContent, true);
    const cover = $('#siteCoverPreview');
    if (cover) new MutationObserver(updatePreview).observe(cover, { attributes: true, attributeFilter: ['src'] });
    activateTab('geral', false);
    updatePreview();
    loadSavedContent();
    return true;
  }

  function initialise(attempt) {
    if (buildEditor()) {
      bindRouter();
      syncEditorRoute();
      return;
    }
    if (attempt < 40) window.setTimeout(() => initialise(attempt + 1), 50);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.setTimeout(() => initialise(0), 0), { once: true });
  } else {
    window.setTimeout(() => initialise(0), 0);
  }
})();
