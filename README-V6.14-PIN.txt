V6.14 — PIN DOS PROTOCOLOS

OBJECTIVO
Corrigir o login dos Protocolos quando o código/PIN são recusados apesar de estarem correctos.

O QUE FOI CORRIGIDO
- verify_protocol normaliza código e PIN.
- Mantém validação bcrypt/pgcrypto.
- Inclui compatibilidade para protocolos antigos que eventualmente tenham sido gravados com PIN em texto simples; após um login correcto, o PIN é convertido imediatamente para bcrypt.
- Adiciona admin_reset_protocol_pin para redefinição segura do PIN pelo Admin.
- Ao redefinir PIN, a sessão anterior é invalidada.
- O Check-in deixa de esconder erros técnicos da RPC; problemas reais de comunicação mostram uma mensagem diferente de "PIN incorrecto".

SUPABASE
1. Abra SQL Editor.
2. Execute supabase-update-v6.14-pin.sql DEPOIS da V6.13.
3. O último comando faz: notify pgrst, 'reload schema';
4. Não crie Secret Keys.
5. Não altere a Edge Function create-admin.

GITHUB
Depois de executar o SQL, substitua os ficheiros do site pela V6.14.

TESTE RECOMENDADO
1. Admin > Protocolos.
2. Edite o protocolo que está com problema.
3. Defina um PIN novo com pelo menos 4 dígitos e guarde.
4. Saia do Admin/Check-in.
5. Entre na Recepção com o código de acesso e o PIN novo.

IMPORTANTE
Se o login continuar a dizer "Código ou PIN incorrecto" depois de redefinir o PIN, o problema já não é o hash antigo; nesse caso envie a mensagem/captura de ecrã e verificamos o RPC e o código de acesso.
