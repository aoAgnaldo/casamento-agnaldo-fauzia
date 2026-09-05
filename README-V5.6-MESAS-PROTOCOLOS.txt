V5.6 — Mesas, lugares e Protocolos

1. No Supabase, execute o ficheiro supabase-update-v5.6.sql no SQL Editor.
2. Depois substitua os ficheiros do site pelo conteúdo desta pasta.
3. No Admin surgem as áreas Mesas e Protocolos.
4. Mesas: crie o nome e capacidade; atribua convidados confirmados a partir de “Convidados sem mesa”. O sistema impede exceder a capacidade considerando acompanhantes.
5. Protocolos: crie nome, WhatsApp, código e PIN. O protocolo entra em checkin.html com código + PIN. O acesso pode ser activado/desactivado ou removido pelo Admin.
6. No Check-in, depois da leitura/pesquisa do convite, a mesa atribuída aparece imediatamente no resultado.

Nota: o acesso dos protocolos é independente do login administrativo do Supabase. O PIN é armazenado como hash no PostgreSQL e a sessão do protocolo expira após 12 horas.
