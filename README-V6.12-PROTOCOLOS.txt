V6.12 — Protocolos: PIN corrigido + edição

Alterações:
- Corrige/normaliza a validação do código e PIN do protocolo.
- No Admin > Protocolos, cada protocolo passa a ter botão Editar.
- Pode alterar nome, WhatsApp e código de acesso.
- Pode trocar o PIN; ao deixar o PIN vazio, mantém o PIN actual.
- Ao trocar o PIN, a sessão anterior do protocolo é invalidada por segurança.

SUPABASE:
1. Abra SQL Editor.
2. Execute: supabase-update-v6.12-protocolos.sql
3. Não é necessário criar Secret Key nem alterar a Edge Function.
4. Faça upload da V6.12 para o GitHub.

TESTE:
- No Admin, edite o protocolo com problema e defina um PIN novo (4+ dígitos).
- Saia do Admin/check-in e tente entrar na Recepção com o código e PIN novos.
