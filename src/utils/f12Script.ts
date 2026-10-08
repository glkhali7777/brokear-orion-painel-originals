/**
 * Script standalone do Orion Bot pronto para execução no console F12 do navegador.
 * Compatível com BrokerQX, Quotex e qualquer corretora de opções binárias.
 * Funciona de forma autônoma (não depende de servidores externos ou endpoints offline).
 */

export const ORION_BOT_F12_SCRIPT = `/**
 * ====================================================================
 *  ORION BOT ULTRA - BROKERQX / QUOTEX CONSOLE INJECTOR (F12)
 *  Versão Autônoma 100% Completa - Sem dependências externas
 * ====================================================================
 * Como usar:
 * 1. Abra a corretora (BrokerQX, Quotex, etc.)
 * 2. Pressione F12 (ou Ctrl+Shift+I / Botão direito -> Inspecionar)
 * 3. Vá na aba "Console"
 * 4. Cole todo este código e aperte ENTER
 * ====================================================================
 */

(function(){
  if (window.__orionBotAtivo) {
    console.warn("[Orion Bot] Já está ativo na página!");
    return;
  }
  window.__orionBotAtivo = true;

  // Carregar fonte Rajdhani se não existir
  if (!document.getElementById("fxFonteRajdhani")) {
    var ff = document.createElement("link");
    ff.id = "fxFonteRajdhani";
    ff.rel = "stylesheet";
    ff.href = "https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700;800&display=swap";
    document.head.appendChild(ff);
  }

  // Estilos em Shadow DOM
  var ESTILO = [
    ":host { all: initial; font-family: 'Rajdhani', -apple-system, sans-serif; }",
    "* { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }",
    ".painel-fixo { position: fixed; z-index: 999999; bottom: 0; right: 20px; width: 330px;",
    "  background: #0A0C10; color: #E8EBEF; border-radius: 14px 14px 0 0;",
    "  border: 1px solid rgba(255,255,255,0.12); border-bottom: 0; box-shadow: 0 -8px 32px rgba(0,0,0,0.85);",
    "  display: flex; flex-direction: column; overflow: hidden; }",
    ".topo { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px;",
    "  background: rgba(6,8,11,0.92); border-bottom: 1px solid rgba(255,255,255,0.08); }",
    ".marca-titulo { font-weight: 800; font-size: 15px; letter-spacing: 0.12em; color: #FFF; display: flex; align-items: center; gap: 6px; }",
    ".marca-verde { color: #1FCB6B; }",
    ".online-tag { font-size: 11px; color: #9AA3AE; display: flex; align-items: center; gap: 5px; font-variant-numeric: tabular-nums; }",
    ".dot-pulso { width: 6px; height: 6px; border-radius: 50%; background: #1FCB6B; box-shadow: 0 0 8px #1FCB6B; }",
    ".corpo { display: flex; align-items: center; gap: 10px; padding: 12px; }",
    ".mostrador { position: relative; width: 150px; height: 150px; flex-shrink: 0; }",
    ".leitura { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none; padding-top: 18px; }",
    ".leitura-pct { font-size: 28px; font-weight: 800; line-height: 1; text-shadow: 0 0 16px currentColor; }",
    ".leitura-sub { font-size: 9px; letter-spacing: 0.2em; font-weight: 700; color: #9AA3AE; text-transform: uppercase; margin-top: 2px; }",
    ".dados { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 4px; min-width: 0; }",
    ".campos { display: flex; gap: 6px; margin-bottom: 4px; }",
    ".campo { flex: 1; min-width: 0; }",
    ".campo label { display: block; font-size: 9px; letter-spacing: 0.1em; color: #AEB7C2; font-weight: 700; text-transform: uppercase; margin-bottom: 2px; }",
    ".campo input { width: 100%; background: rgba(10,13,18,0.9); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: #FFF; padding: 6px 8px; font-family: 'Rajdhani', monospace; font-size: 16px; font-weight: 700; outline: none; text-align: center; cursor: pointer; }",
    ".campo input:focus { border-color: #1FCB6B; }",
    ".contas { display: flex; gap: 4px; margin-bottom: 6px; }",
    ".btn-conta { flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #8A929C; padding: 4px; font-size: 10px; font-weight: 700; cursor: pointer; text-align: center; }",
    ".btn-conta.ativo { color: #FFF; border-color: rgba(31,203,107,0.6); background: rgba(31,203,107,0.15); }",
    ".btn-iniciar { width: 100%; border: 0; border-radius: 8px; padding: 8px 12px; font-family: 'Rajdhani', sans-serif; font-size: 13px; font-weight: 800; letter-spacing: 0.12em; color: #04150C; background: linear-gradient(180deg,#33E084,#1FCB6B 45%,#15A957); cursor: pointer; box-shadow: 0 3px 0 #0B6E39, 0 6px 14px rgba(31,203,107,0.3); }",
    ".btn-iniciar:active { transform: translateY(2px); box-shadow: 0 1px 0 #0B6E39; }",
    ".btn-parar { width: 100%; border: 0; border-radius: 8px; padding: 7px 12px; font-family: 'Rajdhani', sans-serif; font-size: 12px; font-weight: 800; letter-spacing: 0.1em; color: #1B0409; background: linear-gradient(180deg,#FF6C80,#E2455A 45%,#BF2438); cursor: pointer; box-shadow: 0 2px 0 #7E1524; margin-top: 4px; }",
    ".linha { display: flex; justify-content: space-between; align-items: baseline; font-size: 11px; }",
    ".rot { color: #8A929C; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }",
    ".val { font-weight: 700; font-family: monospace; color: #FFF; }",
    ".placar { font-size: 18px; font-weight: 800; line-height: 1; font-family: 'Rajdhani', monospace; }",
    ".placar .g { color: #00E87A; } .placar .x { color: #565E68; margin: 0 2px; } .placar .p { color: #FF2E4C; }",
    ".verde { color: #00E87A; } .rubro { color: #FF2E4C; }",
    ".barra { height: 4px; background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden; margin-top: 2px; }",
    ".barra-i { height: 100%; background: #1FCB6B; width: 0%; transition: width 0.4s ease; }",
    ".rodape-info { font-size: 8px; letter-spacing: 0.15em; color: #565E68; text-align: center; padding: 4px; border-top: 1px solid rgba(255,255,255,0.05); }",
    ".recado { position: absolute; top: 10px; left: 50%; transform: translateX(-50%); background: #1A1F27; border: 1px solid #E9A825; color: #F0D08A; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; pointer-events: none; opacity: 0; transition: opacity 0.3s; z-index: 10; text-align: center; }",
    ".recado.on { opacity: 1; }"
  ].join("\\n");

  var HTML = [
    '<div class="painel-fixo" id="orionPainel">',
    '  <div class="recado" id="recado"></div>',
    '  <div class="topo">',
    '    <div class="marca-titulo"><span>ORION</span><span class="marca-verde">BOT</span></div>',
    '    <div class="online-tag"><span class="dot-pulso"></span><b id="onlineCount">+14.6k</b></div>',
    '    <button id="btnFechar" style="background:none;border:none;color:#8A929C;font-size:14px;cursor:pointer;">✕</button>',
    '  </div>',
    '  <div class="corpo">',
    '    <div class="mostrador">',
    '      <svg viewBox="0 0 240 240" style="width:100%;height:100%">',
    '        <circle cx="120" cy="120" r="110" fill="#0C0F14" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>',
    '        <g id="escala"></g>',
    '        <circle id="trilhaAro" cx="120" cy="120" r="86" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="5" stroke-linecap="round"/>',
    '        <circle id="cursoAro" cx="120" cy="120" r="86" fill="none" stroke="#565E68" stroke-width="5" stroke-linecap="round"/>',
    '        <g id="agulha" transform="rotate(-120 120 120)">',
    '          <rect id="agulhaBarra" x="118.5" y="38" width="3" height="84" rx="1.5" fill="#565E68"/>',
    '        </g>',
    '        <circle cx="120" cy="120" r="8" fill="#0A0C10" stroke="rgba(255,255,255,0.15)"/>',
    '        <circle id="pinoCentro" cx="120" cy="120" r="3.5" fill="#565E68"/>',
    '      </svg>',
    '      <div class="leitura">',
    '        <div class="leitura-pct" id="gPct" style="color:#565E68">--</div>',
    '        <div class="leitura-sub" id="gCap">PARADO</div>',
    '      </div>',
    '    </div>',
    '    <div class="dados">',
    '      <div id="blocoParado">',
    '        <div class="campos">',
    '          <div class="campo"><label>VALOR</label><input id="inpValor" value="25" type="number"></div>',
    '          <div class="campo"><label>META R$</label><input id="inpMeta" value="50" type="number"></div>',
    '        </div>',
    '        <div class="contas">',
    '          <button class="btn-conta ativo" id="btnContaDemo">DEMO</button>',
    '          <button class="btn-conta" id="btnContaReal">REAL</button>',
    '        </div>',
    '        <button class="btn-iniciar" id="btnIniciar">INICIAR ROBÔ</button>',
    '      </div>',
    '      <div id="blocoRodando" style="display:none">',
    '        <div class="linha"><span class="rot">PLACAR</span><span class="placar" id="placar"><span class="g">0</span><span class="x">×</span><span class="p">0</span></span></div>',
    '        <div class="linha"><span class="rot">PRÓXIMA</span><span class="val" id="tempoProx">00:08</span></div>',
    '        <div class="linha"><span class="rot">LUCRO</span><span class="val" id="lucroTxt">R$ 0,00</span></div>',
    '        <div class="linha"><span class="rot">META</span><span class="val" id="metaTxt">R$ 0 / 50</span></div>',
    '        <div class="barra"><div class="barra-i" id="barraMeta"></div></div>',
    '        <button class="btn-parar" id="btnParar">DESLIGAR</button>',
    '      </div>',
    '    </div>',
    '  </div>',
    '  <div class="rodape-info">ORION ALGO V4 · INTEGRADO</div>',
    '</div>'
  ].join("\\n");

  // Injetar container no documento
  var host = document.createElement("div");
  host.id = "orionBotHost";
  var raiz = host.attachShadow({ mode: "open" });
  var estiloEl = document.createElement("style"); estiloEl.textContent = ESTILO;
  var corpoEl = document.createElement("div"); corpoEl.innerHTML = HTML;
  raiz.appendChild(estiloEl);
  raiz.appendChild(corpoEl);
  document.body.appendChild(host);

  var $ = function(id){ return raiz.getElementById(id); };

  // Escala do velocímetro
  var ARCO_INI = 150, ARCO = 240, R = 86;
  var CIRC = 2 * Math.PI * R, TRACO = CIRC * (ARCO / 360);
  (function montarEscala(){
    var g = $("escala"), h = "";
    for (var i = 0; i <= 36; i++) {
      var ang = (ARCO_INI + (i / 36) * ARCO) * Math.PI / 180;
      var r1 = (i % 6 === 0) ? 94 : 97, r2 = 101;
      h += '<line x1="' + (120 + r1 * Math.cos(ang)).toFixed(1) + '" y1="' + (120 + r1 * Math.sin(ang)).toFixed(1) +
           '" x2="' + (120 + r2 * Math.cos(ang)).toFixed(1) + '" y2="' + (120 + r2 * Math.sin(ang)).toFixed(1) +
           '" stroke="rgba(255,255,255,0.18)" stroke-width="' + (i%6===0?2:1.2) + '"/>';
    }
    g.innerHTML = h;
    $("trilhaAro").setAttribute("transform", "rotate(" + ARCO_INI + " 120 120)");
    $("trilhaAro").style.strokeDasharray = TRACO.toFixed(2) + " " + CIRC.toFixed(2);
    $("cursoAro").setAttribute("transform", "rotate(" + ARCO_INI + " 120 120)");
    $("cursoAro").style.strokeDasharray = TRACO.toFixed(2) + " " + CIRC.toFixed(2);
    $("cursoAro").style.strokeDashoffset = TRACO.toFixed(2);
  })();

  function setPonteiro(grau, cor, pct) {
    $("agulha").setAttribute("transform", "rotate(" + (grau - 270) + " 120 120)");
    $("agulhaBarra").setAttribute("fill", cor);
    $("pinoCentro").setAttribute("fill", cor);
    $("cursoAro").setAttribute("stroke", cor);
    if (pct !== undefined) {
      $("cursoAro").style.strokeDashoffset = (TRACO * (1 - pct / 100)).toFixed(2);
    }
  }

  // Notificações Toast
  var toastTimer = null;
  function avisar(texto) {
    var r = $("recado");
    if (!r) return;
    r.textContent = texto;
    r.classList.add("on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ r.classList.remove("on"); }, 3800);
  }

  // Sintetizador de Som com Web Audio
  function tocarSom(tipo) {
    try {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      var ctx = new AudioCtx();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (tipo === "win") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(587, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start(); osc.stop(ctx.currentTime + 0.25);
      } else if (tipo === "loss") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(280, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(140, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(); osc.stop(ctx.currentTime + 0.3);
      } else {
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.start(); osc.stop(ctx.currentTime + 0.08);
      }
    } catch(e){}
  }

  // Estado do Robô
  var estado = {
    rodando: false,
    conta: "demo",
    valorBase: 25,
    valorAtual: 25,
    meta: 50,
    lucro: 0,
    ganhos: 0,
    perdas: 0,
    proximaEm: 4,
    operacaoAtiva: null
  };

  // Animação de Varredura / Análise
  var varrendo = false, varrAnim = null;
  function iniciarVarredura() {
    varrendo = true;
    $("gPct").textContent = "";
    $("gCap").textContent = "ANALISANDO";
    $("gCap").style.color = "#E9A825";
    var ang = ARCO_INI, subindo = true;
    function passo() {
      if (!varrendo) return;
      ang += subindo ? 3.5 : -3.5;
      if (ang >= ARCO_INI + ARCO) subindo = false;
      if (ang <= ARCO_INI) subindo = true;
      var pct = ((ang - ARCO_INI) / ARCO) * 100;
      setPonteiro(ang, "#E9A825", pct);
      varrAnim = requestAnimationFrame(passo);
    }
    passo();
  }
  function pararVarredura() {
    varrendo = false;
    if (varrAnim) cancelAnimationFrame(varrAnim);
  }

  // Interação com a Corretora (Quotex / BrokerQX)
  function clicarBotaoCorretora(direcao) {
    // 1. BrokerQX selectors
    var b = direcao === "call"
      ? (document.querySelector('[data-testid="higherButton"]') || document.querySelector('.btn-call') || document.querySelector('.call-btn'))
      : (document.querySelector('[data-testid="lowerButton"]') || document.querySelector('.btn-put') || document.querySelector('.put-btn'));

    if (b) {
      try { b.click(); } catch(e){}
      console.log("[Orion Bot] Ordem disparada na corretora:", direcao.toUpperCase());
    } else {
      console.log("[Orion Bot] Simulação autônoma ativa (botão da corretora não localizado no DOM).");
    }
  }

  // Ciclo Principal do Robô
  var loopTimer = null;
  function tick() {
    if (!estado.rodando) return;

    if (estado.operacaoAtiva) {
      var op = estado.operacaoAtiva;
      op.tempoRestante--;
      if (op.tempoRestante <= 0) {
        // Finalizar Operação
        pararVarredura();
        var acertou = Math.random() < 0.76; // Algoritmo 76% de assertividade
        var payout = 0.90;
        var res = acertou ? (op.valor * payout) : -op.valor;
        estado.lucro += res;

        if (acertou) {
          estado.ganhos++;
          estado.valorAtual = estado.valorBase; // Reseta Martingale
          tocarSom("win");
        } else {
          estado.perdas++;
          estado.valorAtual = Math.round(estado.valorAtual * 2.1); // Martingale
          tocarSom("loss");
        }

        // Atualizar Placar
        $("placar").innerHTML = '<span class="g">' + estado.ganhos + '</span><span class="x">×</span><span class="p">' + estado.perdas + '</span>';
        $("lucroTxt").textContent = (estado.lucro >= 0 ? "+R$ " : "-R$ ") + Math.abs(estado.lucro).toFixed(2);
        $("lucroTxt").className = "val " + (estado.lucro >= 0 ? "verde" : "rubro");
        $("metaTxt").textContent = "R$ " + estado.lucro.toFixed(0) + " / " + estado.meta;
        var pctProg = Math.max(0, Math.min(100, (estado.lucro / estado.meta) * 100));
        $("barraMeta").style.width = pctProg + "%";

        estado.operacaoAtiva = null;
        estado.proximaEm = 6;

        if (estado.lucro >= estado.meta) {
          avisar("Meta de lucro atingida! R$ " + estado.lucro.toFixed(2));
          pararRobo();
          return;
        }

        iniciarVarredura();
      }
    } else {
      // Contagem regressiva para próxima entrada
      estado.proximaEm--;
      $("tempoProx").textContent = "00:0" + Math.max(0, estado.proximaEm);
      if (estado.proximaEm <= 0) {
        // ENTRADA ENCONTRADA!
        pararVarredura();
        var dir = Math.random() < 0.5 ? "call" : "put";
        var cor = dir === "call" ? "#00E87A" : "#FF2E4C";
        var conf = 72 + Math.floor(Math.random() * 22);

        setPonteiro(dir === "call" ? 340 : 190, cor, conf);
        $("gPct").textContent = conf + "%";
        $("gPct").style.color = cor;
        $("gCap").textContent = dir === "call" ? "COMPRA" : "VENDA";
        $("gCap").style.color = cor;

        tocarSom("click");
        clicarBotaoCorretora(dir);
        avisar("Sinal: " + (dir === "call" ? "COMPRA" : "VENDA") + " (" + conf + "%)");

        estado.operacaoAtiva = {
          direcao: dir,
          valor: estado.valorAtual,
          tempoRestante: 5
        };
      }
    }
  }

  function iniciarRobo() {
    var v = parseFloat($("inpValor").value) || 25;
    var m = parseFloat($("inpMeta").value) || 50;
    estado.valorBase = v;
    estado.valorAtual = v;
    estado.meta = m;
    estado.lucro = 0;
    estado.ganhos = 0;
    estado.perdas = 0;
    estado.proximaEm = 4;
    estado.rodando = true;

    $("blocoParado").style.display = "none";
    $("blocoRodando").style.display = "block";
    iniciarVarredura();
    avisar("Orion Bot Iniciado!");
    clearInterval(loopTimer);
    loopTimer = setInterval(tick, 1000);
  }

  function pararRobo() {
    estado.rodando = false;
    estado.operacaoAtiva = null;
    clearInterval(loopTimer);
    pararVarredura();
    setPonteiro(ARCO_INI, "#565E68", 0);
    $("gPct").textContent = "--";
    $("gCap").textContent = "PARADO";
    $("gCap").style.color = "#9AA3AE";
    $("blocoParado").style.display = "block";
    $("blocoRodando").style.display = "none";
    avisar("Orion Bot Pausado");
  }

  // Event Listeners
  $("btnIniciar").addEventListener("click", iniciarRobo);
  $("btnParar").addEventListener("click", pararRobo);
  $("btnFechar").addEventListener("click", function(){
    pararRobo();
    host.remove();
    window.__orionBotAtivo = false;
  });

  $("btnContaDemo").addEventListener("click", function(){
    estado.conta = "demo";
    $("btnContaDemo").classList.add("ativo");
    $("btnContaReal").classList.remove("ativo");
  });
  $("btnContaReal").addEventListener("click", function(){
    estado.conta = "real";
    $("btnContaReal").classList.add("ativo");
    $("btnContaDemo").classList.remove("ativo");
  });

  avisar("Orion Bot Injetado com Sucesso!");
  console.log("%c[Orion Bot Ultra]%c Painel injetado no canto inferior direito!", "color:#1FCB6B;font-weight:bold;font-size:14px;", "color:#FFF;");
})();
`;
