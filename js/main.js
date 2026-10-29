/* Chapa 2 – Avança Enfermagem · scripts do site (sem dependências) */
(function () {
  "use strict";
  var CFG = window.SITE_CONFIG || {};
  var STORE_KEY = "chapa2_consent_v1";
  var VOTE_OPEN = Date.parse("2026-11-08T08:00:00-03:00");
  var VOTE_CLOSE = Date.parse("2026-11-09T08:00:00-03:00");
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  /* ---------- armazenamento seguro ---------- */
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function sstore(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------- Consent Mode v2: tudo negado por padrão ---------- */
  gtag("consent", "default", {
    ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied",
    analytics_storage: "denied", functionality_storage: "granted", security_storage: "granted",
    wait_for_update: 500
  });

  /* ---------- UTMs: guardadas na sessão e enviadas com os eventos ---------- */
  var utm = {};
  try {
    var qs = new URLSearchParams(location.search);
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"].forEach(function (k) {
      if (qs.get(k)) utm[k] = qs.get(k).slice(0, 120);
    });
    if (Object.keys(utm).length) sstore("chapa2_utm", JSON.stringify(utm));
    else utm = JSON.parse(sstore("chapa2_utm") || "{}");
  } catch (e) { utm = {}; }

  /* ---------- carregamento das tags (somente após consentimento) ---------- */
  var loaded = {};
  function addScript(src) { var s = document.createElement("script"); s.async = true; s.src = src; document.head.appendChild(s); }
  function loadTags(c) {
    if (CFG.GTM_ID && !loaded.gtm && (c.analytics || c.marketing)) {
      loaded.gtm = true;
      window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
      addScript("https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(CFG.GTM_ID));
    }
    var gId = (c.analytics && CFG.GA4_ID) || (c.marketing && CFG.GOOGLE_ADS_ID);
    if (gId && !loaded.gtag) {
      loaded.gtag = true;
      addScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(gId));
      gtag("js", new Date());
    }
    if (c.analytics && CFG.GA4_ID && !loaded.ga4) { loaded.ga4 = true; gtag("config", CFG.GA4_ID, Object.assign({ anonymize_ip: true }, utm)); }
    if (c.marketing && CFG.GOOGLE_ADS_ID && !loaded.ads) { loaded.ads = true; gtag("config", CFG.GOOGLE_ADS_ID); }
    if (c.marketing && CFG.META_PIXEL_ID && !loaded.fb) {
      loaded.fb = true;
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      window.fbq("consent", "grant");
      window.fbq("init", CFG.META_PIXEL_ID);
      window.fbq("track", "PageView");
    }
  }
  function applyConsent(c) {
    gtag("consent", "update", {
      analytics_storage: c.analytics ? "granted" : "denied",
      ad_storage: c.marketing ? "granted" : "denied",
      ad_user_data: c.marketing ? "granted" : "denied",
      ad_personalization: c.marketing ? "granted" : "denied"
    });
    loadTags(c);
  }

  /* ---------- eventos de conversão ---------- */
  function track(name, params) {
    var p = Object.assign({}, utm, params || {});
    window.dataLayer.push(Object.assign({ event: name }, p));
    if (loaded.ga4) gtag("event", name, p);
    if (loaded.ads && name === "click_votar" && CFG.GOOGLE_ADS_LABEL) gtag("event", "conversion", { send_to: CFG.GOOGLE_ADS_ID + "/" + CFG.GOOGLE_ADS_LABEL });
    if (loaded.fb && window.fbq) {
      var map = { click_votar: "Lead", add_to_calendar: "Schedule", share_whatsapp: "Contact" };
      if (map[name]) window.fbq("track", map[name], p); else window.fbq("trackCustom", name, p);
    }
  }
  window.chapa2Track = track;

  /* ---------- banner de cookies ---------- */
  var banner = document.getElementById("consent");
  function readConsent() { try { return JSON.parse(store(STORE_KEY) || "null"); } catch (e) { return null; } }
  function saveConsent(c) { c.ts = new Date().toISOString(); store(STORE_KEY, JSON.stringify(c)); applyConsent(c); if (banner) banner.hidden = true; toast("Preferências de cookies salvas"); }
  function openBanner() {
    if (!banner) return;
    var c = readConsent() || {};
    banner.querySelector("#ck-analytics").checked = !!c.analytics;
    banner.querySelector("#ck-marketing").checked = !!c.marketing;
    banner.hidden = false;
    banner.querySelector("button").focus();
  }
  if (banner) {
    banner.querySelector("[data-consent=all]").addEventListener("click", function () { saveConsent({ analytics: true, marketing: true }); });
    banner.querySelector("[data-consent=none]").addEventListener("click", function () { saveConsent({ analytics: false, marketing: false }); });
    banner.querySelector("[data-consent=save]").addEventListener("click", function () {
      saveConsent({ analytics: banner.querySelector("#ck-analytics").checked, marketing: banner.querySelector("#ck-marketing").checked });
    });
    var current = readConsent();
    if (current) applyConsent(current); else banner.hidden = false;
  }
  document.querySelectorAll("[data-open-consent]").forEach(function (b) { b.addEventListener("click", openBanner); });

  /* ---------- aviso rápido ---------- */
  var toastTimer;
  function toast(msg) {
    var t = document.getElementById("toast"); if (!t) return;
    t.textContent = msg; t.hidden = false; clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 3200);
  }

  /* ---------- contagem regressiva ---------- */
  var elD = document.getElementById("cd-d");
  if (elD) {
    var elH = document.getElementById("cd-h"), elM = document.getElementById("cd-m"), elS = document.getElementById("cd-s"), st = document.getElementById("cd-status");
    var pad = function (n) { return String(n).padStart(2, "0"); };
    var lastState = "";
    var tick = function () {
      var now = Date.now(), target = VOTE_OPEN, state = "before";
      if (now >= VOTE_CLOSE) state = "after"; else if (now >= VOTE_OPEN) { state = "open"; target = VOTE_CLOSE; }
      if (state !== lastState) {
        lastState = state;
        st.innerHTML = state === "before" ? "Contagem para a <b>abertura da votação</b> (horário de Natal/RN)."
          : state === "open" ? "<b>A votação está aberta!</b> Tempo restante para votar:"
          : "<b>Votação encerrada.</b> Obrigado a cada profissional que participou!";
      }
      var t = state === "after" ? 0 : Math.max(0, Math.floor((target - now) / 1000));
      elD.textContent = pad(Math.floor(t / 86400)); t %= 86400;
      elH.textContent = pad(Math.floor(t / 3600)); t %= 3600;
      elM.textContent = pad(Math.floor(t / 60)); elS.textContent = pad(t % 60);
    };
    tick(); setInterval(tick, 1000);
  }

  /* ---------- lembrete na agenda (.ics) ---------- */
  var ICS = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Chapa 2 Avanca Enfermagem//Eleicoes Coren-RN//PT", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "BEGIN:VEVENT", "UID:eleicoes-corenrn-2026-chapa2@votechapa2", "DTSTAMP:20261028T120000Z",
    "DTSTART:20261108T110000Z", "DTEND:20261109T110000Z",
    "SUMMARY:Votar Chapa 2 – Eleições Coren-RN",
    "DESCRIPTION:Votação 100% on-line das 8h de 08/11 às 8h de 09/11 (horário de Natal). Acesse www.votaenfermagem.org.br\\, selecione Coren-RN\\, informe seu CPF e escolha a Chapa 2 – Avança Enfermagem.",
    "URL:https://www.votaenfermagem.org.br",
    "BEGIN:VALARM", "TRIGGER:-PT1H", "ACTION:DISPLAY", "DESCRIPTION:A votação do Coren-RN começa em 1 hora", "END:VALARM",
    "BEGIN:VALARM", "TRIGGER:PT2H", "ACTION:DISPLAY", "DESCRIPTION:Já votou? Vote Chapa 2", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR"
  ].join("\r\n");
  document.querySelectorAll("[data-ics]").forEach(function (b) {
    b.addEventListener("click", function () {
      try {
        var url = URL.createObjectURL(new Blob([ICS], { type: "text/calendar;charset=utf-8" }));
        var a = document.createElement("a"); a.href = url; a.download = "votar-chapa2-coren-rn.ics";
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
        toast("Lembrete baixado: abra o arquivo para salvar na agenda");
      } catch (e) { toast("Não foi possível gerar o arquivo. Use o Google Agenda."); }
      track("add_to_calendar", { method: "ics" });
    });
  });

  /* ---------- rastreio de cliques ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-track]"); if (!a) return;
    track(a.getAttribute("data-track"), { location: a.getAttribute("data-loc") || "" });
  });

  /* ---------- compartilhar ---------- */
  var shareBtn = document.querySelector("[data-share]");
  if (shareBtn && navigator.share) {
    shareBtn.hidden = false;
    shareBtn.addEventListener("click", function () {
      navigator.share({ title: "Vote Chapa 2 – Avança Enfermagem", text: "Eleições Coren-RN: votação on-line das 8h de 08/11 às 8h de 09/11. Vote Chapa 2!", url: location.href.split("?")[0] })
        .then(function () { track("share_native"); }).catch(function () {});
    });
  }

  /* ---------- fotos de candidatos: mostra iniciais se a foto não existir ---------- */
  document.querySelectorAll(".ph img").forEach(function (img) {
    var hide = function () { img.remove(); };
    if (img.complete && img.naturalWidth === 0) hide(); else img.addEventListener("error", hide);
  });

  /* ---------- música da campanha ----------
     Navegadores bloqueiam som automático: a música começa no primeiro toque/clique
     do visitante na página (ou no botão), e pode ser pausada a qualquer momento. */
  var audio = document.getElementById("trilha"), player = document.getElementById("player"), plBtn = document.getElementById("pl-toggle");
  if (audio && player && plBtn) {
    var userPaused = store("chapa2_music_off") === "1";
    var setUi = function (on) {
      player.setAttribute("data-state", on ? "playing" : "paused");
      plBtn.setAttribute("aria-pressed", on ? "true" : "false");
      plBtn.setAttribute("aria-label", on ? "Pausar a música da campanha" : "Tocar a música da campanha");
    };
    var play = function () { audio.volume = 0.6; var pr = audio.play(); if (pr && pr.catch) pr.catch(function () { setUi(false); }); };
    audio.addEventListener("play", function () { setUi(true); });
    audio.addEventListener("pause", function () { setUi(false); });
    plBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (audio.paused) { userPaused = false; store("chapa2_music_off", "0"); play(); track("music_play"); }
      else { userPaused = true; store("chapa2_music_off", "1"); audio.pause(); track("music_pause"); }
    });
    var first = function (e) {
      document.removeEventListener("pointerdown", first, true);
      document.removeEventListener("keydown", first, true);
      if (userPaused || !audio.paused) return;
      if (e && e.target && e.target.closest && e.target.closest("#consent, #pl-toggle")) { document.addEventListener("pointerdown", first, true); return; }
      play();
    };
    document.addEventListener("pointerdown", first, true);
    document.addEventListener("keydown", first, true);
  }

  /* ---------- visualização da seção de propostas ---------- */
  var props = document.getElementById("propostas");
  if (props && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { track("view_propostas"); io.disconnect(); } }, { threshold: .25 });
    io.observe(props);
  }
})();
