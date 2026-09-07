V6.72 — CHECK-IN MOBILE UX/UI

Base: V6.71

OBJECTIVO
Optimizar o Check-in/Recepção para uso real em telemóveis, sem alterar o desktop.

MELHORIAS
- Cabeçalho mobile compacto com identidade do casal.
- Hero mais compacto para reduzir scroll inicial.
- KPIs em quatro cartões compactos.
- QR Code como acção principal.
- Pesquisa manual como alternativa clara.
- Resultado do convidado preparado para confirmação rápida.
- Últimos check-ins em lista legível.
- Navegação inferior com funções distintas: Painel, Check-in, Entradas, Tarefas e Mais.
- Navegação inferior com estado activo e scroll suave.
- Menu Mais em bottom sheet com opções distintas.
- Estado da recepção, comando da equipa, perfil e painel administrativo não ficam misturados.
- Scanner QR adaptado à largura do telemóvel.
- Sem alterações ao layout desktop.

VALIDAÇÃO
- node --check checkin.js: OK
- node --check admin.js: OK
- app.js preservado da versão base.
- Nenhum SQL executado.
- Nenhum dado Supabase alterado.
