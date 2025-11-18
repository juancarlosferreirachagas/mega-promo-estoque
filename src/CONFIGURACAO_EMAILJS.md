# 📧 Configuração do Sistema de Recuperação de Senha por Email

## 📋 Visão Geral

O sistema de recuperação de senha envia automaticamente um email para **dp1@megapromomarketing.com.br** com as credenciais do administrador quando alguém solicita recuperação de acesso.

---

## 🔧 Configuração do EmailJS

### **Passo 1: Criar Conta no EmailJS**

1. Acesse: https://www.emailjs.com/
2. Clique em **"Sign Up"** para criar uma conta gratuita
3. Confirme seu email

---

### **Passo 2: Adicionar Serviço de Email**

1. No dashboard do EmailJS, vá em **"Email Services"**
2. Clique em **"Add New Service"**
3. Escolha o provedor de email:
   - **Gmail** (recomendado para teste)
   - **Outlook**
   - **Yahoo**
   - Outro provedor SMTP
4. Conecte sua conta de email (ex: sistemas@megapromomarketing.com.br)
5. Copie o **Service ID** gerado (ex: `service_megapromo`)

---

### **Passo 3: Criar Template de Email**

1. Vá em **"Email Templates"**
2. Clique em **"Create New Template"**
3. Use este modelo:

#### **Template Name:** `Recuperação de Acesso Admin`
#### **Template ID:** `template_recovery`

#### **Subject (Assunto):**
```
🔐 Solicitação de Recuperação de Acesso - Sistema de Estoque
```

#### **Content (Corpo do Email):**
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(to right, #ea580c, #f59e0b); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #3b82f6; border-radius: 4px; }
        .warning { background: #fef2f2; padding: 15px; margin: 15px 0; border-left: 4px solid #dc2626; border-radius: 4px; }
        .action-box { background: #fff7ed; padding: 15px; margin: 15px 0; border-left: 4px solid #f59e0b; border-radius: 4px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        strong { color: #1f2937; }
        .timestamp { color: #6b7280; font-size: 14px; font-style: italic; }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1 style="margin: 0; font-size: 24px;">🔐 Solicitação de Recuperação de Acesso</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Sistema de Controle de Estoque</p>
        </div>
        
        <!-- Content -->
        <div class="content">
            <h2 style="color: #ea580c; margin-top: 0;">Nova Solicitação Recebida</h2>
            
            <!-- Informações do Solicitante -->
            <div class="info-box">
                <h3 style="margin-top: 0; color: #3b82f6;">👤 Dados do Solicitante</h3>
                <p><strong>Nome:</strong> {{from_name}}</p>
                <p><strong>Motivo:</strong> {{message}}</p>
                <p class="timestamp"><strong>Data/Hora:</strong> {{timestamp}}</p>
            </div>
            
            <!-- Ação Necessária -->
            <div class="action-box">
                <h3 style="margin-top: 0; color: #f59e0b;">⚠️ Ação Necessária</h3>
                <p style="margin: 0; font-size: 14px;">
                    Esta pessoa está solicitando recuperação de acesso ao sistema.
                    Por favor, <strong>verifique a identidade do solicitante</strong> antes de fornecer as credenciais.
                </p>
            </div>
            
            <!-- Instruções de Segurança -->
            <div class="warning">
                <h3 style="margin-top: 0; color: #dc2626;">🔒 Instruções de Segurança</h3>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
                    <li>Confirme a identidade do solicitante por <strong>telefone ou pessoalmente</strong></li>
                    <li>Verifique se a pessoa realmente faz parte da equipe</li>
                    <li>Considere alterar a senha após fornecer as credenciais</li>
                    <li>Mantenha registro de quem recebeu acesso ao sistema</li>
                </ul>
            </div>
            
            <!-- Acesso às Credenciais -->
            <div style="margin-top: 20px; padding: 15px; background: #f0fdf4; border-left: 4px solid #16a34a; border-radius: 4px;">
                <h3 style="margin-top: 0; color: #16a34a;">✅ Como Fornecer Acesso</h3>
                <p style="margin: 0; font-size: 14px;">
                    Após validar a identidade do solicitante:<br>
                    1. Acesse o sistema com suas credenciais master<br>
                    2. Vá em <strong>"Gerenciar Usuários"</strong><br>
                    3. Forneça as credenciais atuais ou altere-as antes<br>
                    4. Considere criar um usuário específico para esta pessoa
                </p>
            </div>
            
            <!-- Informações do Sistema -->
            <div style="margin-top: 20px; padding: 15px; background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px;">
                    <strong>Sistema:</strong> {{system_name}}<br>
                    <strong>Local:</strong> Mega Promo Merchandising - São Paulo, SP
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p style="margin: 5px 0;">© 2025 Mega Promo Merchandising</p>
            <p style="margin: 5px 0; color: #9ca3af;">
                Este é um email automático do sistema de controle de estoque.<br>
                Por favor, não responda a este email.
            </p>
        </div>
    </div>
</body>
</html>
```

#### **Variables (Variáveis):**
- `{{to_email}}` - Email de destino
- `{{from_name}}` - Nome do solicitante
- `{{message}}` - Motivo da solicitação
- `{{timestamp}}` - Data e hora da solicitação
- `{{system_name}}` - Nome do sistema

**⚠️ IMPORTANTE:** As credenciais NÃO são mais enviadas por email por segurança!

4. Clique em **"Save"**

---

### **Passo 4: Obter Public Key**

1. Vá em **"Account"** → **"General"**
2. Copie o **Public Key** (ex: `t8Xg9kJ2mP4nR7sL`)

---

### **Passo 5: Configurar no Código**

Edite o arquivo `/components/Login.tsx` e substitua as seguintes linhas:

```typescript
// ANTES (linhas 101-103):
service_id: 'service_megapromo', // Você precisará configurar no EmailJS
template_id: 'template_recovery', // Você precisará configurar no EmailJS
user_id: 'YOUR_EMAILJS_PUBLIC_KEY', // Você precisará obter no EmailJS

// DEPOIS (com suas credenciais reais):
service_id: 'service_xxxxx',    // Service ID do Passo 2
template_id: 'template_xxxxx',  // Template ID do Passo 3
user_id: 'sua_public_key_aqui', // Public Key do Passo 4
```

---

## 🎯 Exemplo de Email Recebido

Quando alguém solicitar recuperação, você receberá um email assim:

```
De: noreply@emailjs.com
Para: dp1@megapromomarketing.com.br
Assunto: 🔐 Solicitação de Recuperação de Acesso - Sistema de Estoque

═══════════════════════════════════════════
🔐 Recuperação de Acesso
Sistema de Controle de Estoque
═══════════════════════════════════════════

Nova Solicitação Recebida

👤 Dados do Solicitante
Nome: João Silva
Motivo: Esqueci a senha do admin e preciso acessar o sistema urgentemente
Data/Hora: 15/11/2025, 14:30:45

⚠️ Ação Necessária
Esta pessoa está solicitando recuperação de acesso ao sistema.
Por favor, verifique a identidade do solicitante antes de fornecer as credenciais.

🔒 Instruções de Segurança
• Confirme a identidade do solicitante por telefone ou pessoalmente
• Verifique se a pessoa realmente faz parte da equipe
• Considere alterar a senha após fornecer as credenciais
• Mantenha registro de quem recebeu acesso ao sistema

✅ Como Fornecer Acesso
Após validar a identidade do solicitante:
1. Acesse o sistema com suas credenciais master
2. Vá em "Gerenciar Usuários"
3. Forneça as credenciais atuais ou altere-as antes
4. Considere criar um usuário específico para esta pessoa

Sistema: Sistema de Controle de Estoque - Mega Promo
Local: Mega Promo Merchandising - São Paulo, SP

═══════════════════════════════════════════
© 2025 Mega Promo Merchandising
Este é um email automático do sistema.
Por favor, não responda a este email.
═══════════════════════════════════════════
```

---

## 🔒 Fluxo de Segurança

```
1. Usuário esquece a senha
   ↓
2. Clica em "Esqueci os dados do Admin"
   ↓
3. Preenche nome e motivo
   ↓
4. Sistema busca credenciais do localStorage
   ↓
5. Email é enviado para dp1@megapromomarketing.com.br
   ↓
6. Administrador verifica identidade do solicitante
   ↓
7. Administrador fornece credenciais se aprovar
   ↓
8. (Opcional) Administrador altera senha após fornecer
```

---

## 📊 Limites do Plano Gratuito EmailJS

- ✅ **200 emails/mês** - Suficiente para uso interno
- ✅ **2 serviços de email** - Gmail, Outlook, etc.
- ✅ **3 templates de email** - Você precisa de apenas 1
- ✅ **Sem limite de destinatários** - Sempre envia para dp1@
- ✅ **Suporte básico** - Documentação e comunidade

---

## 🚀 Testar o Sistema

1. Configure tudo conforme os passos acima
2. Acesse o sistema de estoque
3. Clique em "Esqueci os dados do Admin"
4. Preencha os dados de teste:
   - **Nome:** Teste Sistema
   - **Motivo:** Testando sistema de recuperação
5. Clique em "Enviar Solicitação"
6. Verifique se o email chegou em dp1@megapromomarketing.com.br

---

## ❗ Solução de Problemas

### **Email não está chegando?**

1. Verifique a pasta de **SPAM/Lixo Eletrônico**
2. Adicione `noreply@emailjs.com` aos contatos confiáveis
3. Verifique se o Service ID, Template ID e Public Key estão corretos
4. Teste no EmailJS Dashboard primeiro (botão "Test It")

### **Erro de CORS?**

- EmailJS não tem problemas de CORS, funciona do frontend
- Se houver erro, verifique se os IDs estão corretos

### **Credenciais não aparecem no email?**

- Verifique se as variáveis `{{admin_user}}` e `{{admin_pass}}` estão no template
- Verifique se o localStorage contém os dados (`masterUser`)

---

## 📝 Notas Importantes

- ⚠️ **Segurança:** Este sistema envia credenciais por email. É mais seguro que reset direto, mas ainda requer confiança.
- 🔐 **Recomendação:** Depois de fornecer as credenciais, peça ao usuário para alterá-las imediatamente.
- 📧 **Email Corporativo:** Considere usar um email corporativo (ex: sistemas@megapromomarketing.com.br) como remetente.
- 💾 **Backup:** Sempre mantenha um backup das credenciais atuais em local seguro.

---

## 🎓 Links Úteis

- **EmailJS Dashboard:** https://dashboard.emailjs.com/
- **Documentação:** https://www.emailjs.com/docs/
- **Suporte:** https://www.emailjs.com/docs/faq/

---

**✅ Após configurar, o sistema estará pronto para uso!**

Se tiver dúvidas, consulte a documentação oficial do EmailJS ou entre em contato com o desenvolvedor do sistema.