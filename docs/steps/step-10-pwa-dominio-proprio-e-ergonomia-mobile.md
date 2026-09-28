# Step 10: Domínio Próprio, PWA Instalável e Ergonomia Mobile

## 🎯 Objetivo
Configurar o ecossistema com domínio próprio de autoridade (`caioscatolino.com.br`), subdomínio oficial (`controle-gastos.caioscatolino.com.br`) na Vercel com SSL automático, autenticação completa de e-mails via DNS (DKIM/SPF/DMARC) no Resend e transformação da aplicação em um **Progressive Web App (PWA)** instalável em tela cheia com ergonomia mobile nativa.

---

## 🛠️ Arquitetura e Decisões Técnicas

### 1. Domínio Próprio & DNS na Vercel
- Registro oficial do domínio `caioscatolino.com.br` no Registro.br.
- Criação de apontamento `CNAME` exclusivo para a Vercel no subdomínio:
  `controle-gastos.caioscatolino.com.br` ➔ `38ecbf6845536ded.vercel-dns-017.com`.
- Emissão automática de certificado SSL (HTTPS) com Let's Encrypt na borda (Edge Network).

### 2. Autenticação DNS de E-mail (Resend & Registro.br)
- Configuração de chaves criptográficas no DNS para garantir 100% de entregabilidade e reputação:
  - **DKIM (`TXT resend._domainkey`)**: Assinatura criptográfica que atesta autenticidade.
  - **SPF (`CNAME rsend` e `CNAME send`)**: Autorização explícita para disparo pelos servidores do Resend.
  - **DMARC (`TXT _dmarc`)**: Política anti-phishing.
- Validação na região de **São Paulo (sa-east-1)** e ativação do remetente oficial:  
  `Gastos.AI <nao-responda@caioscatolino.com.br>`.

### 3. PWA (Progressive Web App) & Ícones de Alta Densidade
- **Geração de Ícones com Sharp:**
  - `icon-192x192.png` (Tela inicial Android).
  - `icon-512x512.png` (Splash screen e alta densidade).
  - `apple-touch-icon.png` (iOS Safari).
  - `icon.png` (Favicon e aba do navegador no Next.js App Router).
- **Manifesto PWA (`apps/web/src/app/manifest.ts`)**:
  - `display: "standalone"` para execução em tela cheia sem barras de navegador.
  - `theme_color` e `background_color` sincronizados com o Dark Theme (`#0B0E14`).
  - Suporte a ícones normais e `maskable`.

### 4. Ergonomia Mobile e Solução de Conflitos de Viewport
- **Safe Area Insets:** Classes utilitárias `pb-safe` e `pt-safe` para respeitar o notch e a barra de gestos do iPhone/Android.
- **Dynamic Viewport Height (`100dvh`):** Eliminação de saltos de layout ao abrir/fechar a barra de endereços do navegador móvel.
- **Teclado Numérico Inteligente:** Atributo `inputMode="decimal"` nos campos monetários para abrir diretamente o teclado de números.
- **Bottom Sheet Modal:** Modal de nova transação estilizado com barra de puxar (handle bar) e trava de rolagem de fundo (`overflow: hidden`) com restauração instantânea de scroll ao fechar.

---

## 🧪 Validação
- O site abre oficialmente e com segurança em `https://controle-gastos.caioscatolino.com.br`.
- O aplicativo pode ser instalado na tela de início de aparelhos Android e iOS, abrindo como app nativo.
- O e-mail de boas-vindas é entregue com sucesso para qualquer endereço (Gmail, Outlook, etc.) assinado por `nao-responda@caioscatolino.com.br`.
