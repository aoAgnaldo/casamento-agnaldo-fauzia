V6.47 — Revisão completa de UX/UI

Base: V6.46

Melhorias principais:
- Menu do administrador simplificado: apenas Minha conta, Administradores/Coordenadores e Sair.
- Alinhamento do botão ☰ revisto no cabeçalho.
- Ícones consistentes apenas para acções compactas/por linha, mantendo texto nos CTAs principais.
- Tooltips de acções com aria-label/title/data-tooltip e foco compatível com touch.
- Organizador de mesas redesenhado como folha central no desktop e bottom-sheet no mobile.
- Organizador de mesas com X no canto superior direito, pesquisa, duas zonas no desktop e sem scroll horizontal.
- Mantidas as funções de convidados, presentes, mesas, protocolos, recepção, check-in e conteúdo do site.

Validações realizadas:
- node --check admin.js
- node --check checkin.js
- validação estrutural básica do admin.html
- confirmação do botão de fechar do organizador de mesas
- confirmação da presença do menu ☰ e painel de administração

Nota: não inclui foto-capa.png.
