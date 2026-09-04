V2.7 — Ecrã dedicado de recepção / check-in

Base: V2.6 (mantida sem alterações de lógica do painel).

NOVO:
- checkin.html: ecrã simples para a equipa da recepção.
- checkin.js: login, leitura QR, pesquisa por código, confirmação e contagem.
- confirmação automática regressa ao estado de “Próximo convidado” após 1,8 s.
- botão “Ecrã de recepção” adicionado ao painel.
- usa as mesmas funções de check-in já criadas no Supabase na V2.6.

IMPORTANTE:
- Não é necessário executar novo SQL se a V2.6 já estiver a funcionar.
- Abrir checkin.html no mesmo domínio do site.
