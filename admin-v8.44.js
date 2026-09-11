/* V8.44 — controlos que ficam visíveis e escolhas explícitas no convite. */
(function () {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const videoIdPattern = /^[A-Za-z0-9_-]{6,20}$/;

  function extractYouTubeId(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (videoIdPattern.test(raw)) return raw;

    let candidate = '';
    try {
      const url = new URL(raw);
      const host = url.hostname.replace(/^www\./, '').toLowerCase();
      if (host === 'youtu.be') {
        candidate = url.pathname.split('/').filter(Boolean)[0] || '';
      } else if (host.includes('youtube.com')) {
        candidate = url.searchParams.get('v') || '';
        if (!candidate) {
          const segments = url.pathname.split('/').filter(Boolean);
          const marker = segments.findIndex(segment => ['embed', 'shorts', 'live'].includes(segment));
          candidate = marker >= 0 ? (segments[marker + 1] || '') : '';
        }
      }
    } catch (_) {
      const match = raw.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([A-Za-z0-9_-]{6,20})/i);
      candidate = match ? match[1] : '';
    }
    return videoIdPattern.test(candidate) ? candidate : '';
  }

  function getMusicInput() {
    return $('#site-editor [data-content-key="music_youtube_id"]');
  }

  function getDialog() {
    let dialog = $('#v844MusicDialog');
    if (dialog) return dialog;

    dialog = document.createElement('div');
    dialog.id = 'v844MusicDialog';
    dialog.className = 'v844-music-dialog hidden';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'v844MusicDialogTitle');
    dialog.innerHTML = '<div class="v844-music-dialog-card"><h2 id="v844MusicDialogTitle">Escolher música do convite</h2><p>Cole o link de um vídeo do YouTube ou apenas o respetivo ID. Esta música tocará quando o convidado abrir o convite.</p><label for="v844MusicUrl">Link ou ID do YouTube<input id="v844MusicUrl" type="url" inputmode="url" placeholder="https://www.youtube.com/watch?v=…"></label><p class="v844-music-error" id="v844MusicError" aria-live="polite"></p><div class="v844-music-dialog-actions"><button type="button" class="button secondary" data-v844-music-action="cancel">Cancelar</button><button type="button" class="button" data-v844-music-action="save">Usar esta música</button></div></div>';
    dialog.addEventListener('mousedown', event => {
      if (event.target === dialog) closeDialog();
    });
    document.body.appendChild(dialog);
    return dialog;
  }

  function updatePickerStatus(input) {
    const field = input?.closest('.v836-editor-field');
    const status = $('.v844-music-status', field || document);
    if (!status) return;
    const id = extractYouTubeId(input.value);
    status.textContent = id
      ? 'Música selecionada: ' + id + '. Guarde as alterações do convite para publicar.'
      : 'Nenhuma música selecionada ainda.';
  }

  function mountMusicPicker() {
    const input = getMusicInput();
    const field = input?.closest('.v836-editor-field');
    if (!input || !field) return false;

    if (field.dataset.v844MusicMounted !== 'true') {
      field.dataset.v844MusicMounted = 'true';
      const picker = document.createElement('div');
      picker.className = 'v844-music-picker';
      picker.innerHTML = '<strong>Som de abertura do convite</strong><small class="v844-music-status" aria-live="polite"></small><div class="v844-music-actions"><button type="button" class="button secondary" data-v844-music-action="choose">Escolher música</button><button type="button" class="button secondary" data-v844-music-action="preview">Ouvir / verificar</button></div>';
      field.appendChild(picker);
    }
    updatePickerStatus(input);
    return true;
  }

  function openDialog(message) {
    const input = getMusicInput();
    if (!input) return;
    const dialog = getDialog();
    const musicUrl = $('#v844MusicUrl', dialog);
    const error = $('#v844MusicError', dialog);
    musicUrl.value = input.value || '';
    error.textContent = message || '';
    dialog.classList.remove('hidden');
    window.setTimeout(() => musicUrl.focus(), 0);
  }

  function closeDialog() {
    const dialog = $('#v844MusicDialog');
    if (dialog) dialog.classList.add('hidden');
  }

  function saveMusic() {
    const input = getMusicInput();
    const dialog = getDialog();
    const entry = $('#v844MusicUrl', dialog);
    const error = $('#v844MusicError', dialog);
    const id = extractYouTubeId(entry.value);
    if (!id) {
      error.textContent = 'Cole um link ou ID válido do YouTube.';
      entry.focus();
      return;
    }
    if (!input) return;
    input.value = id;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    updatePickerStatus(input);
    closeDialog();
  }

  function previewMusic() {
    const input = getMusicInput();
    const id = extractYouTubeId(input?.value);
    if (!id) {
      openDialog('Escolha primeiro a música que pretende usar.');
      return;
    }
    window.open('https://www.youtube.com/watch?v=' + encodeURIComponent(id), '_blank', 'noopener,noreferrer');
  }

  function handleAction(event) {
    const button = event.target.closest('[data-v844-music-action]');
    if (!button) return;
    event.preventDefault();
    const action = button.dataset.v844MusicAction;
    if (action === 'choose') openDialog();
    if (action === 'cancel') closeDialog();
    if (action === 'save') saveMusic();
    if (action === 'preview') previewMusic();
  }

  function scheduleMount() {
    if (scheduleMount.queued) return;
    scheduleMount.queued = true;
    window.requestAnimationFrame(() => {
      scheduleMount.queued = false;
      mountMusicPicker();
    });
  }

  document.addEventListener('click', handleAction);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeDialog();
  });
  document.addEventListener('input', event => {
    if (event.target === getMusicInput()) updatePickerStatus(event.target);
  });

  function initialise() {
    mountMusicPicker();
    new MutationObserver(scheduleMount).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise, { once: true });
  } else {
    initialise();
  }
})();
