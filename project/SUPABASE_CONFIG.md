# Configuração do Supabase para zoeplanner.com.br

## 1. Acesse o Supabase Dashboard
- Vá para: https://supabase.com/dashboard
- Selecione seu projeto ZoePlanner

## 2. Configure URLs de Autenticação
Navegue para: **Authentication → Settings → URL Configuration**

### Site URL:
```
https://zoeplanner.com.br
```

### Redirect URLs (adicione todas):
```
https://zoeplanner.com.br/reset-password
https://zoeplanner.com.br/dashboard
https://zoeplanner.com.br/login
https://zoeplanner.com.br/**
```

## 3. Configurações de Email
Navegue para: **Authentication → Settings → Email Templates**

### Password Reset Template:
- **Subject:** ZoePlanner - Redefinir sua senha
- **Body:** Personalize com a marca ZoePlanner
- **Redirect URL:** `{{ .SiteURL }}/reset-password`

## 4. Configurações de Segurança
Navegue para: **Authentication → Settings → Security**

### Rate Limiting:
- **Password Reset:** 5 tentativas por hora
- **Email Confirmation:** 3 tentativas por hora

### Session Settings:
- **JWT Expiry:** 3600 segundos (1 hora)
- **Refresh Token Rotation:** Habilitado

## 5. Teste a Configuração
1. Acesse: https://zoeplanner.com.br/login
2. Clique em "Recuperar Senha"
3. Digite um email válido
4. Verifique se o email chega com o link correto
5. Teste o link de reset

## 6. Variáveis de Ambiente (.env)
Certifique-se de que estão corretas:
```
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

## 7. Domínios Permitidos
No painel do Supabase, adicione também:
- `zoeplanner.com.br`
- `www.zoeplanner.com.br`
- `localhost:5173` (para desenvolvimento)

## Troubleshooting

### Se o link não funcionar:
1. Verifique se as URLs estão corretas no Supabase
2. Confirme que o domínio está na lista de permitidos
3. Teste em modo incógnito
4. Verifique os logs do Supabase

### Se o email não chegar:
1. Verifique a pasta de spam
2. Confirme as configurações de SMTP
3. Teste com diferentes provedores de email
4. Verifique os logs de email no Supabase