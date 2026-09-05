V6.10 — 3 botões discretos para editar imagens/conteúdo do convite

1) Executar supabase-update-v6.10-imagens-texto.sql no Supabase SQL Editor.
2) Substituir os ficheiros do site pela V6.10 no GitHub.
3) No cartão da capa do Admin existem 3 botões de caneta:
   - esquerda: altera a imagem da capa;
   - centro: altera a imagem e o texto de “A nossa história”;
   - direita: altera a imagem de “Alguns detalhes importantes”.
4) A imagem da capa mostrada no cartão do Admin acompanha sempre a capa actual.
5) A imagem da história e a imagem dos detalhes são independentes.
6) O texto da história é guardado em wedding_settings e é aplicado ao convite público.
7) Não é necessário alterar a Edge Function nem adicionar Secret Keys.
