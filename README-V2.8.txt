VERSÃO 2.8 — GESTÃO COMPLETA DE PRESENTES
Agnaldo & Fáuzia

BASE: V2.7 — Check-in + Ecrã de recepção

NOVIDADES
- Corrigido o fluxo de fotografia dos presentes.
- Fotografias são automaticamente preparadas/comprimidas no navegador antes do envio.
- Se uma fotografia falhar durante a criação de um novo presente, o presente é revertido para não deixar registos incompletos.
- Editar o nome de um presente.
- Substituir a fotografia de um presente.
- Remover a fotografia de um presente.
- Ver na área administrativa quem reservou cada presente.
- Botão de remoção fica bloqueado para presentes já reservados.
- Mantidos todos os recursos da V2.7: convidados, RSVP, WhatsApp, QR Code, check-in e ecrã de recepção.

SUPABASE
1. Abrir o SQL Editor do projecto.
2. Executar TODO o ficheiro supabase-update.sql.
3. Não é necessário criar outro utilizador administrador.
4. O bucket gift-photos deve continuar público para leitura das imagens.

IMPORTANTE
- Nunca colocar Secret Key / Service Role Key no site.
- O upload das fotografias usa apenas a Publishable Key e a sessão do administrador.
- A fotografia original pode ter até 15 MB; o navegador reduz automaticamente a imagem para uma versão mais leve antes do upload.

TESTE RECOMENDADO
1. Entrar no painel.
2. Em Presentes, clicar em “Adicionar presente”.
3. Criar um presente com uma fotografia.
4. Confirmar que a fotografia aparece na tabela.
5. Abrir “Editar”, substituir a fotografia e guardar.
6. Abrir o convite público e confirmar que a fotografia aparece no cartão do presente.
7. Reservar o presente como convidado e voltar ao painel para confirmar o nome de quem reservou.
