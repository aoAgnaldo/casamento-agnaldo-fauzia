# Inspecção do site e correcções v8.49

## Alcance e evidência

Em 16 de Outubro de 2026, as páginas index.html, admin.html e checkin.html
publicadas responderam HTTP 200. A página Admin publicada contém planner.js
e admin-v8.48.js. Isto confirma disponibilidade e versão referenciada, mas
não comprova funcionamento visual ou operações autenticadas.

Foram verificadas as referências locais das três páginas: nenhuma em falta.
Os 14 ficheiros JavaScript passaram pela verificação de sintaxe.

## Correcções desta entrega

- RSVP: limpar resposta, acompanhantes, mensagem e botão ao trocar de convite.
- Pesquisa de convite: desbloquear o botão quando a ligação falha.
- RSVP: impedir submissões simultâneas e mostrar recuperação após erro.
- Acompanhantes: identificar os campos, usar teclado telefónico e conservar
  os dados opcionais na nota já suportada pela confirmação.
- Presentes: impedir reservas simultâneas e restaurar o botão após erro.
- Recepção: libertar a operação de entrada se ocorrer falha de rede.
- Recepção: conservar a confirmação já aceite quando a actualização da lista
  falhar; o operador avança pelo botão Próximo convidado, sem temporizador.
- Ficheiros alterados referenciados com versão para reduzir cache antiga.

## Áreas abrangidas pelas revisões incluídas

Admin geral, convidados, QR, mesas e lugares, equipa, presentes, editor do
convite e planeamento. Mantêm-se as melhorias anteriores v8.45 a v8.48.

## Testes executados

`node tests/flows.test.cjs`: pesquisa offline, reset do RSVP, bloqueio de
envio repetido, recuperação após falha, confirmação de entrada com falha
e sucesso. Estes testes usam serviços simulados e não alteram dados reais.

`node tests/planner.test.cjs`: cálculos, custo final zero, pagamentos,
progresso e validação de cópias de segurança.

## Pendências que não se devem confundir com validação concluída

- Testar visualmente em Android e computador com sessão iniciada.
- Confirmar gravação do conteúdo, envio de imagens, QR e atribuição de mesas
  no projecto real. A conectividade HTTP não valida as permissões da base.
- Confirmar limites de lotação e reservas concorrentes no servidor.
- O Planeamento ainda usa Sincronizar e um plano por conta; duas contas
  distintas não partilham automaticamente o plano. A gravação online depende
  de supabase-planner-v8.47.sql.
- Os testes de autorização da base de dados não foram executados nesta revisão.

## Instalação

O pacote é uma cópia completa para substituir os ficheiros do site. Esta
revisão não foi publicada automaticamente nem altera a base de dados.
As correcções novas estão em app.js, checkin.js, index.html e checkin.html.
