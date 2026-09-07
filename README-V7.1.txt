V7.1 — CORRECÇÃO DE SCROLL + UX/UI

Correcções desta revisão:
- Corrigido o bloqueio do scroll após “ABRIR CONVITE”.
- O bloqueio de scroll agora só existe enquanto a abertura está activa.
- A classe de lock é aplicada/removida em HTML e BODY para maior compatibilidade mobile.
- O shell público deixou de usar overflow:hidden desnecessariamente.
- Reforçado overflow-y:auto no convite público para recuperar scroll vertical normal.
- A abertura escondida deixa de interceptar eventos e fica invisível para tecnologias de assistência.
- Mantida a estrutura do Supabase e toda a lógica funcional.

Inspecção UX/UI:
1. Abertura: manter foco no CTA e libertar scroll imediatamente após abertura.
2. Hero: continuar a usar o indicador “Deslize para descobrir”; evitar elementos fixos que cubram o conteúdo.
3. Navegação mobile: menu em painel sobreposto, com áreas de toque amplas.
4. Programa: scroll interno apenas na lista compacta; página continua a ter scroll normal.
5. Modais: scroll interno independente para conteúdo longo, sem bloquear a página depois do fecho.
6. Presentes/RSVP: manter campos e filtros acessíveis por toque, sem depender de hover.
7. Acesso reservado: manter ícone discreto, separado visualmente do conteúdo principal.
