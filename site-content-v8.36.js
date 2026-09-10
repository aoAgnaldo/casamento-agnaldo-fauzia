/* V8.36 — Aplica, no convite público, o conteúdo gerido pelo painel Admin. */
(function () {
  'use strict';

  const $ = selector => document.querySelector(selector);
  const $$ = selector => Array.from(document.querySelectorAll(selector));
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[char]);
  const has = (content, key) => Object.prototype.hasOwnProperty.call(content, key);

  function setText(selector, content, key) {
    if (!has(content, key)) return;
    const node = $(selector);
    if (node) node.textContent = String(content[key] == null ? '' : content[key]);
  }

  function setHeading(selector, content, key) {
    if (!has(content, key)) return;
    const node = $(selector);
    if (!node) return;
    const parts = String(content[key] == null ? '' : content[key]).split(/\n/, 2);
    node.innerHTML = `${esc(parts[0])}${parts.length > 1 ? `<br><i>${esc(parts[1])}</i>` : ''}`;
  }

  function setPairHeading(selector, content, key) {
    if (!has(content, key)) return;
    const node = $(selector);
    if (!node) return;
    const parts = String(content[key] == null ? '' : content[key]).split(/\n/, 2);
    node.innerHTML = `<span>${esc(parts[0])}</span>${parts.length > 1 ? `<span><i>${esc(parts[1])}</i></span>` : ''}`;
  }

  function setStory(content) {
    if (!has(content, 'story_text')) return;
    const node = $('#storyTextContent');
    if (!node) return;
    const paragraphs = String(content.story_text || '').split(/\n\s*\n/).map(part => part.trim()).filter(Boolean);
    node.innerHTML = paragraphs.map(part => `<p>${esc(part).replace(/\n/g, '<br>')}</p>`).join('');
  }

  function setNames(content) {
    if (!has(content, 'couple_one') && !has(content, 'couple_two')) return;
    const first = String(content.couple_one || '');
    const second = String(content.couple_two || '');
    const full = `${first} & ${second}`.trim();
    const intro = $('.intro-screen h1');
    if (intro) intro.innerHTML = `${esc(first)} <em>&amp;</em><br class="mobile-only-break"> ${esc(second)}`;
    const footer = $('.footer-names');
    if (footer) footer.innerHTML = `${esc(first)} <i>&amp;</i> ${esc(second)}`;
    const signoff = $('.rsvp-signoff strong');
    if (signoff) signoff.innerHTML = `${esc(first)} <i>&amp;</i> ${esc(second)}`;
    const title = document.title.includes('·') ? document.title.split('·').slice(1).join('·').trim() : 'O nosso casamento';
    if (!has(content, 'site_title')) document.title = `${full} · ${title}`;
    const heroImage = $('.hero-image img');
    if (heroImage) heroImage.alt = `${full} juntos`;
    const storyImage = $('#storyImage');
    if (storyImage) storyImage.alt = full;
  }

  function bindAccountCopies() {
    $$('.copy-account').forEach(button => {
      button.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(button.dataset.account || '');
          const original = button.textContent;
          button.textContent = 'Copiado';
          window.setTimeout(() => { button.textContent = original; }, 1600);
        } catch (_) { /* O botão continua apenas como indicação visual. */ }
      });
    });
  }

  function setAccounts(content) {
    if (!Array.isArray(content.accounts)) return;
    $$('.account-row').forEach((row, index) => {
      const account = content.accounts[index];
      if (!account || (!account.bank && !account.number)) return;
      const bank = String(account.bank || 'Conta');
      const number = String(account.number || '');
      row.innerHTML = `<span><b>${esc(bank)}</b> ${esc(number)}</span><button class="copy-account" type="button" data-account="${esc(number)}">Copiar</button>`;
    });
    bindAccountCopies();
  }

  function setRsvpHelp(content) {
    if (!has(content, 'rsvp_help_phone') && !has(content, 'rsvp_help_label')) return;
    const link = $('.rsvp-help a');
    if (!link) return;
    if (has(content, 'rsvp_help_label')) link.textContent = content.rsvp_help_label || '';
    if (has(content, 'rsvp_help_phone')) {
      const phone = String(content.rsvp_help_phone || '').replace(/\D/g, '');
      if (phone) link.href = `https://wa.me/${phone}?text=${encodeURIComponent('Olá, gostaria de tirar uma dúvida sobre o convite.')}`;
    }
  }

  function applyContent(content) {
    if (!content || typeof content !== 'object' || Array.isArray(content)) return;
    document.documentElement.dataset.siteContent = 'customised';
    setNames(content);
    if (has(content, 'site_title')) document.title = String(content.site_title || document.title);
    if (has(content, 'site_description')) {
      const meta = $('meta[name="description"]');
      if (meta) meta.content = String(content.site_description || '');
    }

    setText('.intro-note', content, 'intro_note');
    setText('.intro-date', content, 'intro_date');
    setText('.hero .section-label', content, 'hero_label');
    setText('.hero-kicker', content, 'hero_kicker');
    setHeading('.hero-content h2', content, 'hero_title');
    setText('.hero-copy', content, 'hero_copy');
    setText('.hero .text-link', content, 'hero_link_label');
    setText('.hero-date span', content, 'hero_day');
    if (has(content, 'hero_month_year')) {
      const node = $('.hero-date small');
      if (node) node.innerHTML = esc(content.hero_month_year).replace(/\n/g, '<br>');
    }

    setText('.date-main .section-label', content, 'date_label');
    setText('.date-lead', content, 'date_lead');
    setText('.date-main h2', content, 'event_date_display');
    setText('.date-location', content, 'date_location');

    setText('.story-text .section-label', content, 'story_label');
    setHeading('.story-text h2', content, 'story_title');
    setStory(content);
    setText('.signature', content, 'story_signature');
    setText('#storyImageCaption', content, 'story_image_caption');

    setText('.program-heading .section-label', content, 'program_label');
    setHeading('.program-heading h2', content, 'program_heading');
    setText('.program-intro', content, 'program_intro');
    setText('.program-list-title', content, 'program_list_title');
    if (has(content, 'program_open_label')) {
      const button = $('#programOpen');
      if (button) button.innerHTML = `${esc(content.program_open_label)} <span>⌄</span>`;
    }

    setText('.details-copy .section-label', content, 'details_label');
    setHeading('.details-copy h2', content, 'details_heading');
    ['location', 'attire', 'deadline'].forEach((name, index) => {
      setText(`.detail-row:nth-of-type(${index + 1}) strong`, content, `details_${name}_title`);
      setText(`.detail-row:nth-of-type(${index + 1}) p`, content, `details_${name}_text`);
    });
    setText('.details-image span', content, 'details_image_caption');

    setText('.gifts-heading .section-label', content, 'gifts_label');
    setHeading('.gifts-heading h2', content, 'gifts_heading');
    setText('.gifts-heading > p:not(.section-label):not(.contribution-title)', content, 'gifts_intro');
    setText('.contribution-title', content, 'contribution_title');
    if (has(content, 'contribution_name')) {
      const node = $('.contribution-box > p:not(.contribution-title)');
      if (node) node.innerHTML = `Em nome de <strong>${esc(content.contribution_name)}</strong>`;
    }
    setAccounts(content);
    setText('.gift-list-head .program-time', content, 'gift_list_label');
    setText('.gift-list-head h3', content, 'gift_list_heading');
    setText('.gift-list-note', content, 'gift_list_note');

    setText('.rsvp-section .section-label', content, 'rsvp_label');
    setPairHeading('.rsvp-heading-fixed', content, 'rsvp_heading');
    setText('.rsvp-copy', content, 'rsvp_intro');
    setRsvpHelp(content);
    setText('.rsvp-signoff small', content, 'rsvp_signoff');

    setText('.nav-links a[href="#historia"]', content, 'nav_story');
    setText('.nav-links a[href="#programa"]', content, 'nav_program');
    setText('.nav-links a[href="#presentes"]', content, 'nav_gifts');
    setText('.nav-links a[href="#rsvp"]', content, 'nav_rsvp');
    setText('.footer > div:first-child > p:last-child', content, 'footer_date');
    setText('.footer-verse', content, 'footer_verse');
    setText('.footer-mark', content, 'footer_mark');

    if (has(content, 'music_youtube_id')) {
      const id = String(content.music_youtube_id || '').trim();
      const frame = $('#musicFrame');
      if (frame && /^[A-Za-z0-9_-]{6,20}$/.test(id)) frame.src = `https://www.youtube.com/embed/${id}?enablejsapi=1&rel=0&playsinline=1`;
    }
    if (has(content, 'event_datetime')) {
      const date = String(content.event_datetime || '').trim();
      if (date) {
        window.__weddingEventTimes = { ceremony: date.includes('+') || date.endsWith('Z') ? date : `${date}:00+02:00` };
        window.__refreshWeddingCountdown?.();
      }
    }
  }

  async function loadContent() {
    if (!window.supabaseClient) return;
    try {
      const { data, error } = await supabaseClient.from('wedding_settings').select('site_content').eq('id', 1).maybeSingle();
      if (error || !data || !data.site_content) return;
      const content = typeof data.site_content === 'string' ? JSON.parse(data.site_content) : data.site_content;
      applyContent(content);
    } catch (_) { /* A versão anterior do convite continua a funcionar sem esta coluna. */ }
  }

  loadContent();
})();
