/*!
 * Agenda Dinâmica UNISA
 * ---------------------------------------------------------------------------
 * Cada agenda (.html) inclui este arquivo com UMA linha antes de </body>:
 *     <script src="../agenda-dinamica.js" data-agenda-unisa></script>
 *
 * Ao abrir, a agenda procura o próprio conteúdo (datas, textos, botões) no
 * arquivo agendas.json publicado pelo painel "Central de Agendas UNISA".
 * - Se encontrar: redesenha a agenda com o MESMO layout (mesmas classes CSS).
 * - Se não encontrar ou der erro: mantém o conteúdo gravado no próprio HTML.
 * Os botões continuam funcionando como antes: o link vem da URL (?avc=, ?avg=,
 * ?avi=, ?pi=...) e só aparece entre a data de início e a data de fim.
 *
 * Este arquivo e o agendas.json devem ficar na mesma pasta (raiz do repositório).
 */
(function () {
  'use strict';

  var LOGO = 'https://cdn.jsdelivr.net/gh/Klebolt/logounisa@main/logounisaagenda.png';
  var TAGS_PERMITIDAS = { B: 1, STRONG: 1, I: 1, EM: 1, U: 1, BR: 1 };

  // CSS padrão das agendas (usado ao gerar arquivos novos e na pré-visualização do painel)
  var CSS = [
    ':root{--cor-azul-forte:#1C3B70;--cor-verde-lima:#99BD2E;--cor-laranja:#D97828;--fundo-pagina:#f4f6f9;--fundo-card:#ffffff;--texto-escuro:#333333;--texto-claro:#ffffff;}',
    '*{box-sizing:border-box;}',
    "body{font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:var(--fundo-pagina);margin:0;padding:20px;color:var(--texto-escuro);display:flex;justify-content:center;}",
    '.container{width:100%;max-width:1000px;background:var(--fundo-card);border-radius:15px;box-shadow:0 10px 25px rgba(0,0,0,0.05);overflow:hidden;border:1px solid #e1e1e1;}',
    '.span2{font-size:13px;}',
    '.container2{width:100%;max-width:1000px;background:var(--fundo-card);border-radius:15px;box-shadow:0 10px 25px rgba(0,0,0,0.05);overflow:hidden;border:1px solid #e1e1e1;}',
    'header{background-color:var(--cor-azul-forte);color:var(--texto-claro);padding:30px 20px;text-align:center;border-bottom:6px solid var(--cor-verde-lima);}',
    '.header2{background-color:var(--cor-azul-forte);color:var(--texto-claro);padding:10px 10px;text-align:center;border-bottom:9px solid var(--cor-verde-lima);}',
    '.logo-area,.logo-area2{display:block;text-align:center;margin-bottom:15px;}',
    '.logo-area2 h2{display:block;text-align:center;margin-bottom:3px;}',
    '.logo-area2 .frase-impacto{margin-top:0;margin-bottom:8px;}',
    '.logo-area img{height:auto;width:250px;max-width:100%;display:inline-block;filter:brightness(0) invert(1);}',
    'header h1{margin:0;font-size:1.6rem;text-transform:uppercase;letter-spacing:1px;}',
    'header h2{margin:5px 0 0;font-size:1.1rem;opacity:0.9;font-weight:400;}',
    '.agenda-grid{display:block;column-count:1;column-gap:15px;padding:25px;}',
    '.agenda-grid2{display:block;column-count:2;column-gap:15px;padding:25px;}',
    '.card{background:var(--fundo-card);border:1px solid #e0e0e0;border-left:5px solid var(--cor-azul-forte);border-radius:8px;padding:15px;display:flex;align-items:center;gap:15px;transition:transform 0.2s,box-shadow 0.2s;break-inside:avoid;page-break-inside:avoid;margin-bottom:15px;width:100%;}',
    '.card:hover{transform:translateY(-3px);box-shadow:0 5px 15px rgba(0,0,0,0.08);}',
    '.data-badge,.data-badge2{color:var(--texto-claro);padding:8px 10px;border-radius:6px;font-weight:bold;font-size:0.90rem;text-align:center;min-width:95px;display:flex;align-items:center;justify-content:center;line-height:1.2;}',
    '.data-badge{background-color:var(--cor-azul-forte);}',
    '.data-badge2{background-color:var(--cor-verde-lima);color:var(--texto-escuro);}',
    '.info-texto{font-size:0.99rem;line-height:1.0;font-weight:500;color:var(--texto-escuro);width:100%;}',
    '.frase-impacto{font-size:15px;padding:0px 0px;}',
    '.card.avaliacao{border:1px solid var(--cor-laranja);border-left:6px solid var(--cor-laranja);background-color:#fffbf7;}',
    '.card.avaliacao2{border:1px solid var(--cor-verde-lima);border-left:6px solid var(--cor-verde-lima);background-color:#fff;}',
    '.card.avaliacao .data-badge{background-color:var(--cor-laranja);color:white;}',
    '.card.avaliacao .info-texto{color:var(--texto-escuro);font-weight:700;}',
    'footer{background-color:#f9f9f9;padding:20px;text-align:center;font-size:0.90rem;color:#666;border-top:1px solid #eee;}',
    '.legenda{display:inline-flex;align-items:center;gap:10px;margin-bottom:10px;font-weight:bold;color:var(--cor-laranja);}',
    '.btn-card-acao{display:inline-block;margin-top:8px;background-color:var(--cor-laranja);color:#fff;text-decoration:none;padding:8px 16px;border-radius:6px;font-size:0.85rem;font-weight:bold;text-transform:uppercase;box-shadow:0 2px 4px rgba(0,0,0,0.2);transition:background 0.3s,transform 0.2s;border:1px solid transparent;line-height:1.2;}',
    '.btn-card-acao:hover{background-color:#fff;color:var(--cor-laranja);border-color:var(--cor-laranja);transform:scale(1.05);}',
    '.oculto{display:none !important;}',
    '@media (max-width:600px){.agenda-grid{column-count:1;}.card{flex-direction:column;align-items:flex-start;text-align:left;}.data-badge{width:100%;margin-bottom:8px;flex-direction:row;}}'
  ].join('\n');

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Mantém só negrito/itálico/sublinhado/quebra de linha; remove qualquer outra tag e atributos.
  function limparHtml(html) {
    var t = document.createElement('template');
    t.innerHTML = String(html == null ? '' : html);
    (function percorrer(no) {
      Array.prototype.slice.call(no.childNodes).forEach(function (c) {
        if (c.nodeType === 1) {
          percorrer(c);
          if (!TAGS_PERMITIDAS[c.tagName]) {
            while (c.firstChild) no.insertBefore(c.firstChild, c);
            no.removeChild(c);
          } else {
            while (c.attributes.length) c.removeAttribute(c.attributes[0].name);
          }
        } else if (c.nodeType !== 3) {
          no.removeChild(c);
        }
      });
    })(t.content);
    var d = document.createElement('div');
    d.appendChild(t.content.cloneNode(true));
    return d.innerHTML.replace(/\s+/g, ' ').trim();
  }

  function visiveis(lista) { return (lista || []).filter(function (x) { return x && !x.oculto; }); }

  function cardHtml(it, dica) {
    var texto = limparHtml(it.texto);
    if (it.negrito) texto = '<strong>' + texto + '</strong>';
    var b = it.botao;
    if (b && !b.oculto && b.id) {
      texto += '<br><a id="' + esc(b.id) + '" href="#" class="btn-card-acao oculto" target="_blank" rel="noopener"' +
        ' data-param="' + esc(b.param || '') + '" data-inicio="' + esc(b.inicio || '') + '" data-fim="' + esc(b.fim || '') + '">' +
        esc(b.texto || 'CLIQUE AQUI') + '</a>';
    }
    if (dica) return '<div class="card avaliacao2"><div class="data-badge2">' + esc(it.data) + '</div><div class="info-texto">' + texto + '</div></div>';
    return '<div class="card' + (it.destaque ? ' avaliacao' : '') + '"><div class="data-badge">' + esc(it.data) + '</div><div class="info-texto">' + texto + '</div></div>';
  }

  function rodapeHtml(rodape) {
    return '<footer>' + visiveis(rodape).map(function (x) {
      if (x.tipo === 'quebra') return '<br>';
      if (x.tipo === 'paragrafo') return '<p>' + limparHtml(x.texto) + '</p>';
      return '<div class="legenda"' + (x.cor === 'azul' ? ' style="color: var(--cor-azul-forte);"' : '') + '><span>' + limparHtml(x.texto) + '</span></div>';
    }).join('') + '</footer>';
  }

  // HTML de dentro do <div class="container"> (mesma estrutura das agendas originais)
  function containerHtml(c, logo) {
    c = c || {};
    var h = '<header><div class="logo-area"><img src="' + esc(logo || LOGO) + '" alt="Logo Unisa"></div>' +
      '<h1>' + esc(c.titulo || 'Agenda Geral da Disciplina') + '</h1><h2 id="tituloAno">' + esc(c.subtitulo || '') + '</h2></header>';
    h += '<div class="agenda-grid">' + visiveis(c.itens).map(function (i) { return cardHtml(i, false); }).join('') + '</div>';
    var rod = rodapeHtml(c.rodape);
    var d = c.dicas;
    if (d && !d.oculto) {
      h += '<div class="container2"><div class="header2"><div class="logo-area2"><h2>' + esc(d.titulo || 'Dicas de Estudo') + '</h2>' +
        (d.frase ? '<p class="frase-impacto">' + limparHtml(d.frase) + '</p>' : '') +
        (d.aviso ? '<span class="span2">' + limparHtml(d.aviso) + '</span>' : '') +
        '</div></div><div class="agenda-grid2">' + visiveis(d.itens).map(function (i) { return cardHtml(i, true); }).join('') + '</div>' + rod + '</div>';
    } else {
      h += rod;
    }
    return h;
  }

  // Página completa (usada pelo painel para gerar arquivos novos e para a pré-visualização)
  function paginaCompleta(c, opcoes) {
    opcoes = opcoes || {};
    var motor = '';
    if (opcoes.caminhoMotor) {
      motor = '\n<script src="' + esc(opcoes.caminhoMotor) + '" data-agenda-unisa></script>' +
        // reserva: se o agenda-dinamica.js não carregar, os botões continuam funcionando
        '\n<script>window.addEventListener("load",function(){if(window.AgendaUnisa)return;var m=(document.getElementById("tituloAno")||{}).textContent||"",a=(m.match(/\\d{4}/)||[new Date().getFullYear()])[0]*1,q=new URLSearchParams(location.search),h=new Date();h.setHours(0,0,0,0);' +
        'function d(s){var p=String(s||"").split("/");return p[1]?new Date(a,p[1]-1,p[0]):null}' +
        'document.querySelectorAll("a.btn-card-acao[data-param]").forEach(function(b){var l=q.get(b.getAttribute("data-param")),i=d(b.getAttribute("data-inicio")),f=d(b.getAttribute("data-fim"));if(!l||!/^https?:\\/\\//i.test(l)||!i||!f)return;if(f<i)f.setFullYear(f.getFullYear()+1);f.setHours(23,59,59,999);if(h>=i&&h<=f){b.href=l;b.classList.remove("oculto")}})});</script>';
    }
    return '<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
      '<title>Agenda da Disciplina - UNISA</title>\n<style>\n' + CSS + (opcoes.cssExtra ? '\n' + opcoes.cssExtra : '') + '\n</style>\n</head>\n<body>\n\n' +
      '<div class="container">' + containerHtml(c) + '</div>\n' + motor + '\n</body>\n</html>\n';
  }

  function anoDe(c) {
    var m = String((c && c.subtitulo) || '').match(/\d{4}/);
    return m ? parseInt(m[0], 10) : new Date().getFullYear();
  }
  function criarData(diaMes, ano) {
    var p = String(diaMes || '').split('/');
    var d = parseInt(p[0], 10), m = parseInt(p[1], 10);
    if (!d || !m) return null;
    return new Date(ano, m - 1, d);
  }

  // Mostra os botões cujo link veio na URL e que estão dentro da janela de datas
  function aplicarBotoes(raiz, ano) {
    var params = new URLSearchParams(window.location.search);
    var hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    Array.prototype.forEach.call((raiz || document).querySelectorAll('a.btn-card-acao[data-param]'), function (b) {
      var link = params.get(b.getAttribute('data-param'));
      if (!link || !/^https?:\/\//i.test(link)) return;
      var ini = criarData(b.getAttribute('data-inicio'), ano);
      var fim = criarData(b.getAttribute('data-fim'), ano);
      if (!ini || !fim) return;
      if (fim < ini) fim.setFullYear(fim.getFullYear() + 1); // janela que atravessa o ano
      fim.setHours(23, 59, 59, 999);
      if (hoje >= ini && hoje <= fim) { b.href = link; b.classList.remove('oculto'); }
    });
  }

  function norm(s) {
    return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[?#].*$/, '');
  }

  var api = { CSS: CSS, LOGO: LOGO, limparHtml: limparHtml, containerHtml: containerHtml, paginaCompleta: paginaCompleta, aplicarBotoes: aplicarBotoes, anoDe: anoDe };
  if (typeof window !== 'undefined') window.AgendaUnisa = api;

  // ------------------------------------------------------------------ execução dentro de uma agenda
  var script = document.currentScript;
  if (!script || !script.hasAttribute('data-agenda-unisa')) return;
  var container = document.querySelector('.container');
  if (!container) return;

  var raizHtml = document.documentElement;
  raizHtml.style.visibility = 'hidden'; // evita "piscar" as datas antigas
  var mostrar = function () { raizHtml.style.visibility = ''; };
  var limite = setTimeout(mostrar, 2500);

  var base = new URL('./', script.src);
  var caminho = decodeURIComponent(location.pathname);
  var basePath = decodeURIComponent(base.pathname);
  var relativo = caminho.indexOf(basePath) === 0 ? caminho.slice(basePath.length) : caminho.replace(/^\/+/, '');
  var alvo = '/' + norm(relativo);

  fetch(new URL('agendas.json', base).href + '?v=' + Math.floor(Date.now() / 60000), { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (db) {
      var lista = ((db && db.agendas) || []).filter(function (a) {
        return a && a.conteudo && a.conteudo.ativo !== false && norm(decodeURI(a.url || '')).slice(-alvo.length) === alvo;
      }).sort(function (x, y) { return String(y.periodo).localeCompare(String(x.periodo)); });
      if (lista.length) {
        var img = container.querySelector('header img');
        container.innerHTML = containerHtml(lista[0].conteudo, img && img.getAttribute('src'));
        aplicarBotoes(container, anoDe(lista[0].conteudo));
      } else {
        aplicarBotoes(container, anoDe({ subtitulo: (document.getElementById('tituloAno') || {}).textContent }));
      }
    })
    .catch(function () {
      aplicarBotoes(container, anoDe({ subtitulo: (document.getElementById('tituloAno') || {}).textContent }));
    })
    .then(function () { clearTimeout(limite); mostrar(); });
})();
