# Painel Admin · Atelier v8.52

Adaptação visual ao desenho Stitch fornecido por Agnaldo. Entrega local de
19/10/2026. O site publicado e os dados do casamento não foram alterados.

## Incluído

- Creme, branco, terracota e verde suave; Playfair Display e Plus Jakarta Sans.
- Navegação com ícones e apenas uma área activa, margens comuns e cartões novos.
- Resumos dos convidados calculados a partir dos convites reais.
- Mesas com largura mobile completa; presentes em cartões com imagem.
- Estilo comum no editor, planeamento, equipa, formulários e login.
- Modo escuro, foco visível e preferência por movimento reduzido.
- Correcções anteriores v8.51 preservadas e versões de cache actualizadas.

Não inclui novos módulos de fornecedores, contratos ou auditoria. As imagens,
números e contactos fictícios do Stitch não substituem os dados reais.

## Instalar

1. Guarde uma cópia dos ficheiros actualmente publicados.
2. Envie o conteúdo deste pacote para a mesma pasta da hospedagem, substituindo
   os ficheiros correspondentes. Não elimine fotografias ou outros assets que
   já existam na hospedagem. Preserve a configuração se a tiver personalizado.
3. Abra admin.html e recarregue sem cache. Os ficheiros admin-atelier.css e
   admin-atelier.js devem acompanhar admin.html.
4. Confirme login, listas e uma gravação com um registo de teste antes de usar
   em operação. Esta entrega não modifica tabelas nem permissões da base de dados.

## Verificação feita

Testes Node de navegação/contagens Atelier, painel, RSVP/check-in e cálculos do
planeamento passaram; sintaxe dos scripts verificada. Revisão independente
detectou versões de cache antigas, entretanto corrigidas.

No navegador: composição desktop do painel e editor; login real local sem
submeter credenciais; fixtures de convidados, mesas e presentes a 390 px;
cartões dos presentes em ambos os temas e sem apresentação duplicada. Editor
com apenas uma área activa e sem excesso horizontal; preview corrigido de
48 px para 234 px dentro de um painel de 280 px.

## Limites

As pré-visualizações foram isoladas da base de dados. Não foi repetida nesta
revisão a gravação autenticada, upload, leitura de câmara nem Android físico.
A sincronização do planeamento continua dependente da configuração anterior;
esta alteração visual não resolve essa limitação nem valida todo o sistema.
As fontes usam Google Fonts, com alternativas locais em caso de falta de rede.

Os testes e as pré-visualizações de desenvolvimento ficam na pasta de trabalho,
fora do ZIP de hospedagem. O convite público mantém o desenho anterior.
