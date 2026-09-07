V7.2 — AUDITORIA UX/UI + SCROLL

Correcções desta versão:
- Scroll público separado do scroll interno de listas e modais.
- Bloqueio do documento só durante modais/áreas reservadas.
- Abertura do convite liberta imediatamente html/body do bloqueio de scroll.
- Modais de programa e reserva têm scroll próprio e comportamento touch adequado.
- Menu mobile recebeu aria-expanded/aria-label dinâmicos.
- Alvos de toque principais ajustados para pelo menos 44px em mobile.
- Mantida a lógica Supabase e as funcionalidades existentes.

Validação:
- app.js passou em node --check.
- CSS/HTML foram inspeccionados quanto a regras globais de overflow.
