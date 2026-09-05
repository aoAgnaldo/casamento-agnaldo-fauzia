V6.9 — IMAGENS EDITÁVEIS DO CONVITE

O Admin agora usa os dois botões da imagem da capa para alterar as imagens do convite:
1) botão da esquerda = imagem da capa;
2) botão da direita = imagem de “A nossa história” e “Alguns detalhes importantes”.

CONFIGURAÇÃO SUPABASE
1. Executar no SQL Editor o ficheiro: supabase-update-v6.9-imagens.sql
2. Não é necessário criar novas Secret Keys.
3. O bucket público “wedding-images” é criado pelo SQL.

COMPORTAMENTO
- A capa do Admin mostra sempre a imagem actualmente publicada na capa do convite.
- A imagem da história é a mesma em “A nossa história” e “Alguns detalhes importantes”.
- As imagens são comprimidas para WebP no navegador antes do upload.
- O site público lê as URLs guardadas em wedding_settings.
- A imagem antiga é removida do Storage depois da nova imagem ser guardada.
- A imagem original de fallback continua a ser foto-capa.png se não houver configuração.
