AGNALDO & FÁUZIA — V7.0

OBJECTIVO
Limpeza estrutural e refinamento visual da V6.72 sem alterar a base de dados nem o modelo de dados do Supabase.

ALTERAÇÕES
1. O CSS administrativo que estava espalhado por 24 blocos <style> foi consolidado em admin-v7.css, mantendo a ordem original das regras.
2. O CSS suplementar do check-in foi retirado do HTML e colocado em checkin-v7.css.
3. Removida a declaração duplicada de highlightChiefTable() em checkin.js.
4. Adicionada uma camada V7 de componentes para hierarquia de botões, focus-visible, estados disabled, cartões e alvos de toque.
5. Removido um style inline do resultado de pesquisa administrativa e convertido para classe semântica.
6. Não foram alteradas tabelas, RPCs, chaves ou ficheiros SQL.

PRINCÍPIO
A V7 é uma refactorização conservadora: preservar comportamento e dados primeiro, depois facilitar novas melhorias sem continuar a acumular patches.
