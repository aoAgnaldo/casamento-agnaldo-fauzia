# Inspecção no navegador integrado — 17/10/2026

## Confirmado no site publicado, com sessão iniciada

- Viewport de 390 × 844: editor com largura de 390 px, sem excesso horizontal;
  rolagem real da secção de conteúdo até scrollTop 727.
- Galeria: Trocar capa abre formulário com imagem actual e campo de ficheiro.
  Não foi enviado ficheiro nem guardada alteração real.
- As oito abas do editor abrem conteúdo. Selector Web muda aria-pressed e
  data-v843-preview-mode para web. Isto não comprova um preview integral do site.
- QR do convite de teste: um só código quadrado, sem duplicação visual.
- Menu dos convidados: opções visíveis após deslizar; não foi removido ninguém.
- Presentes: filtro Reservados reduz 30 itens a 1; tema escuro aplicado aos
  filtros. Detectada tabela desktop visível simultaneamente com lista mobile.
- Planeamento: Nova tarefa abre formulário, custos expandem; fecho sem gravar.
  A interface informa sincronização indisponível. Sem alteração na base de dados.
- Recepção separada: carrega totais e pesquisa AF-TESTE01. Mostra entrada já
  registada e apenas Próximo convidado; nenhuma nova entrada registada.

## Alteração local desta versão

admin-v8.51.css esconde explicitamente a tabela desktop até 760 px e mantém
a lista mobile. Remove altura/rolagem interna dos presentes nesta largura,
deixando a secção principal fazer a rolagem. Inclui cache actualizado para os
scripts corrigidos anteriormente. Versões anteriores preservadas.

## Verificação e limites

A asserção de apresentação única falhou no site publicado antes da alteração:
desktopHidden=false, mobileVisible=true. tests/mobile-gifts.html carrega a
cascata real de estilos e verifica apenas uma apresentação em cada largura.
Ainda não foi possível executar este teste no navegador integrado: localhost
expirou e o acesso file: foi recusado pela política do navegador. A correcção
CSS é candidata, não foi validada visualmente nem publicada.

Continuam pendentes gravação com dados descartáveis, upload completo,
permissões/sincronização do planeamento, câmara e Android físico. Esta versão
não é uma declaração de validação integral do sistema. O relatório v8.50
incluído documenta também as verificações das passagens anteriores.

## Implementação

Publicar o conteúdo da pasta na hospedagem existente, preservando a configuração
do projecto. Não publicar tests/ se não quiser expor as páginas de teste.
Nenhuma publicação foi feita automaticamente.
