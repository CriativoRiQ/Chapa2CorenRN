# Site Chapa 2 – Avança Enfermagem (Eleições Coren-RN 2026)

Site estático, sem dependências: basta enviar o conteúdo desta pasta para a raiz da hospedagem.

## Identidade visual
Baseada nas artes "Chegou a hora de avançar" e "A Enfermagem do RN": azul elétrico e ciano com brilho, Montserrat pesada, Cormorant Garamond itálica, Kaushan Script no "Vote", seta curva de avanço, caixas escuras arredondadas. Logo e fotos recortados das artes da campanha (`img/marca`, `img/candidatos`).

## O que já está pronto e foi testado
- Página única com propostas (6 eixos), 18 candidatos, passo a passo de votação, dúvidas, apoiadores e CTAs; política de privacidade; página 404.
- Contagem regressiva (abre 08/11 8h, encerra 09/11 8h, horário de Natal) que muda sozinha de estado.
- Música da campanha (`audio/musica-chapa2.mp3`, 128 kbps): toca no primeiro toque/clique do visitante (navegadores bloqueiam som automático), com botão flutuante de tocar/pausar; a pausa fica lembrada.
- Lembrete na agenda: link do Google Agenda e arquivo .ics com alertas.
- Compartilhamento no WhatsApp (e botão nativo de compartilhar no celular).
- Banner de cookies LGPD com Consent Mode v2 (tudo negado por padrão; nenhuma tag carrega sem consentimento), botão para rever preferências no rodapé.
- Eventos de conversão no dataLayer: `click_votar`, `add_to_calendar`, `share_whatsapp`, `click_instagram`, `click_propostas`, `click_como_votar`, `view_propostas`; UTMs (e gclid/fbclid) guardadas na sessão e anexadas aos eventos.
- SEO: title, meta description, canonical, Open Graph/Twitter com imagem 1200×630, dados estruturados (Organization, Event, FAQPage), sitemap.xml, robots.txt, 1 H1, headings em ordem, alt nas imagens.
- Favicon (SVG + PNG), apple-touch-icon, manifest.
- `.htaccess` (Apache/cPanel): HTTPS forçado, www, URLs sem .html, 404, cache, compressão, HSTS e cabeçalhos de segurança/CSP. `_headers` equivalente para Netlify/Cloudflare Pages.
- Testado localmente em 390px e 1366px: sem rolagem lateral, sem erros de JavaScript, banner de cookies grava e oculta corretamente.

## Pendências que dependem de você / de acessos externos
1. **Domínio**: trocar `www.SEUDOMINIO.com.br` pelo domínio real em `index.html`, `politica-de-privacidade.html`, `robots.txt`, `sitemap.xml` e `.htaccess` (localizar e substituir).
2. **Hospedagem + HTTPS**: publicar a pasta e ativar o certificado SSL (Let's Encrypt grátis na maioria das hospedagens).
3. **IDs de rastreamento**: preencher `js/config.js` (GTM, GA4, Google Ads + rótulo da conversão, Meta Pixel). Vazio = não carrega. Se usar GTM, configure as demais tags dentro dele.
4. **Fotos**: as 18 fotos de candidatos e a foto da equipe já estão no site.
5. **Política de privacidade**: completar os campos marcados [PENDENTE] (controlador, e-mail de contato, prazo de retenção).
6. **Google Search Console**: verificar o domínio e enviar o sitemap.
7. Após publicar: rodar PageSpeed Insights e o modo de visualização do GTM/Meta para confirmar os disparos com os IDs reais.
