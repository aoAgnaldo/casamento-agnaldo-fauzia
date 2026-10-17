# Revisão visual e funcional de 17 de Outubro de 2026

## Observado directamente no Chrome com sessão iniciada

- Painel principal: contagem de pessoas sem mesa diferente da área Mesas.
  Corrigido o cálculo local para somar acompanhantes e considerar os mesmos
  estados elegíveis de Mesas. Retirada indicação fixa de programa já revisto.
- Mesas: navegação, 10 mesas, pesquisa, resumo de lugares e abertura de Editar
  mesa observados. Nenhuma atribuição nem alteração real foi submetida.
- Presentes: lista, 30 itens, filtros, modos e paginação observados. A lista
  tinha uma área interna curta que mostrava poucos itens; removida no desktop,
  mantendo a rolagem na página activa e acções em linha.
- Equipa: cartões e menu de três pontos abertos. As opções de desactivar e
  remover aparecem. Nenhuma dessas acções foi executada.
- Conteúdo: Geral/Capa e Galeria observados, incluindo os três botões de troca
  de imagens. Ajustada a largura para alinhar com os restantes painéis.
- Planeamento: vista geral observada; título sem contraste no modo escuro
  corrigido localmente. Estado real: sincronização indisponível.
- Convidados: cartão de teste, selectores de mesa, Editar e QR observados na
  inspecção anterior. Não se verificou a gravação nem a leitura do QR com câmara.
- Convite público: história, programa, presentes e RSVP observados na
  inspecção anterior. A história mostrava ** como texto; agora os pares de
  asteriscos formatam negrito com o conteúdo previamente escapado.

## Testes locais

Testes de contagem do painel, cálculos do planeamento e falhas/duplicação de
RSVP e check-in. Verificação de sintaxe dos ficheiros JavaScript.

## Limites reais da inspecção

Esta entrega não equivale a uma aprovação integral de produção. Faltam testes
de gravação com dados de teste, permissões de base de dados, uploads de imagens,
reserva concorrente e utilização num Android real. Login não foi repetido:
a sessão já estava iniciada. As oito abas do editor não foram todas testadas
interactivamente. A recepção separada não foi aberta nesta passagem.

A captura do Chrome falhou no fim com “window crop is outside captured
monitor”, mesmo após recuperar a janela. Não foram inventados resultados para
as áreas que não puderam ser testadas.

## Instalação

Inclui todas as revisões anteriores. Enviar os ficheiros para a pasta do site.
Não foi feita publicação nem alteração da base de dados nesta passagem.
O planeamento online requer a configuração SQL v8.47 incluída no pacote.
