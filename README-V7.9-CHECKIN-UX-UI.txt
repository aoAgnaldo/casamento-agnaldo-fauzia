V7.9 — CHECK-IN: REVISÃO METICULOSA UX/UI E FUNCIONAL

Objectivo
Reorganizar a recepção para uso operacional rápido durante o casamento, mantendo as tabelas, RPCs e integração Supabase existentes.

UX/UI
- Scanner/entrada passa a ser a tarefa primária, sobretudo no mobile.
- Resumo com quatro KPIs mais legíveis.
- Resultado do convidado com hierarquia clara, mesa em destaque e CTA de entrada com número de pessoas.
- Lista de resultados de pesquisa mais legível e com estado vazio accionável.
- Menu 'Mais' no mobile funciona com Perfil, Admin e Sair.
- Tarefas deixam de aparecer para contas de administrador sem token de protocolo.
- Melhor tratamento de focus, áreas de toque e scroll.
- Área do Protocolo Chefe agrupada para reduzir ruído.
- 'Últimos check-ins' agora tem Ver todos/Ver menos funcional.

Funcionalidade corrigida/melhorada
- Pesquisa normaliza acentos (ex.: Jose encontra José).
- QR aceita parâmetros convite e code quando o QR contém URL.
- Bloqueio contra callbacks QR duplicados durante a leitura.
- Correcção crítica do loadChiefTools: Promise.all separa team, tasks, team status e tables; as mesas deixam de receber os dados errados da terceira resposta.
- Menu mobile 'Mais' abre folha de opções.
- Perfil do operador mantém o fluxo existente.
- Modal de detalhe de mesa actualiza aria-hidden e limpa o lock ao fechar.
- Limpeza do scanner no pagehide.

Compatibilidade
- Não altera a base de dados.
- Não altera RPCs.
- Mantém index.html, admin.html e a área de acesso reservado.
