V8.6 — CORRECÇÃO DEFINITIVA DOS CONTROLOS MOBILE

Correcção do conflito de cascata que mantinha o cadeado administrativo oculto no mobile.

Após abrir o convite, os controlos aparecem nesta ordem:
1. Menu — único com moldura quadrada
2. Música — apenas ícone
3. Acesso administrativo — apenas cadeado

Na Welcome inicial, os três continuam ocultos.

A correcção foi feita num stylesheet carregado depois do v8.2-mobile.css para vencer a regra antiga que escondia o acesso administrativo.
