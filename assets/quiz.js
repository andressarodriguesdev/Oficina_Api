/* ============================================================
   quiz.js — componente de prática de recuperação reutilizável
   ------------------------------------------------------------
   Uso numa lição:

   <div class="quiz" data-title="Recuperação">
     <script type="application/json">
     [
       { "q": "Pergunta?",
         "a": ["Alternativa uma", "Alternativa duas"],
         "correct": 0,
         "why": "Explicação mostrada após responder." }
     ]
     </script>
   </div>

   Regra de autoria: todas as alternativas de uma mesma pergunta
   devem ter o mesmo número de palavras e comprimento parecido,
   para que o formato não entregue a resposta.
   ============================================================ */

(function () {
  "use strict";

  var CSS = `
  .quiz{border:1px solid var(--rule);border-radius:6px;padding:1.25rem 1.35rem;margin:2.5rem 0;
        background:var(--bg);font-family:ui-sans-serif,-apple-system,"Segoe UI",sans-serif}
  .quiz-head{display:flex;justify-content:space-between;align-items:baseline;gap:1rem;margin-bottom:1rem}
  .quiz-title{font-size:.68rem;letter-spacing:.12em;text-transform:uppercase;font-weight:700;color:var(--muted)}
  .quiz-progress{font-size:.72rem;color:var(--muted);font-variant-numeric:tabular-nums}
  .quiz-q{font-family:inherit;font-size:1.02rem;line-height:1.45;font-weight:600;margin:0 0 1rem}
  .quiz-opts{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.5rem}
  .quiz-opt{width:100%;text-align:left;font:inherit;font-size:.92rem;line-height:1.4;cursor:pointer;
            padding:.7rem .85rem;border:1px solid var(--rule);border-radius:4px;background:transparent;
            color:var(--fg);transition:background .12s,border-color .12s}
  .quiz-opt:hover:not(:disabled){background:var(--code-bg);border-color:var(--muted)}
  .quiz-opt:disabled{cursor:default}
  .quiz-opt.is-correct{border-color:var(--ok);background:var(--ok-soft);color:var(--ok);font-weight:600}
  .quiz-opt.is-wrong{border-color:var(--accent);background:var(--accent-soft);color:var(--accent);font-weight:600}
  .quiz-opt.is-dim{opacity:.45}
  .quiz-why{margin:1rem 0 0;padding:.8rem .9rem;border-left:3px solid var(--rule);background:var(--code-bg);
            border-radius:0 4px 4px 0;font-size:.88rem;line-height:1.55}
  .quiz-why code{white-space:normal}
  .quiz-next{margin-top:1rem;font:inherit;font-size:.85rem;font-weight:600;cursor:pointer;
             padding:.55rem 1.1rem;border-radius:4px;border:1px solid var(--accent);
             background:var(--accent);color:var(--bg)}
  .quiz-next:hover{opacity:.88}
  .quiz-done{text-align:center;padding:.5rem 0}
  .quiz-score{font-size:2.1rem;font-weight:700;font-variant-numeric:tabular-nums;letter-spacing:-.02em}
  .quiz-verdict{font-size:.95rem;color:var(--muted);margin:.4rem 0 1.1rem;line-height:1.5}
  @media print{.quiz{display:none}}
  `;

  function injectCSS() {
    if (document.getElementById("quiz-css")) return;
    var s = document.createElement("style");
    s.id = "quiz-css";
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function build(root) {
    var holder = root.querySelector('script[type="application/json"]');
    if (!holder) return;

    var items;
    try {
      items = JSON.parse(holder.textContent);
    } catch (e) {
      root.innerHTML = "<p>Quiz malformado: " + e.message + "</p>";
      return;
    }
    if (!items.length) return;

    var title = root.dataset.title || "Recuperação";
    var idx = 0;
    var score = 0;

    function render() {
      if (idx >= items.length) return finish();

      var item = items[idx];
      root.innerHTML = "";

      var head = el("div", "quiz-head");
      head.appendChild(el("span", "quiz-title", title));
      head.appendChild(el("span", "quiz-progress", idx + 1 + " / " + items.length));
      root.appendChild(head);

      root.appendChild(el("p", "quiz-q", item.q));

      var list = el("ul", "quiz-opts");
      var buttons = [];

      item.a.forEach(function (text, i) {
        var li = document.createElement("li");
        var btn = el("button", "quiz-opt", text);
        btn.type = "button";
        btn.addEventListener("click", function () {
          answer(item, i, buttons);
        });
        buttons.push(btn);
        li.appendChild(btn);
        list.appendChild(li);
      });

      root.appendChild(list);
    }

    function answer(item, chosen, buttons) {
      var right = chosen === item.correct;
      if (right) score++;

      buttons.forEach(function (b, i) {
        b.disabled = true;
        if (i === item.correct) b.classList.add("is-correct");
        else if (i === chosen) b.classList.add("is-wrong");
        else b.classList.add("is-dim");
      });

      var why = el("div", "quiz-why");
      why.innerHTML =
        "<strong>" + (right ? "Correto. " : "Não é essa. ") + "</strong>" + item.why;
      root.appendChild(why);

      var next = el(
        "button",
        "quiz-next",
        idx === items.length - 1 ? "Ver resultado" : "Próxima"
      );
      next.type = "button";
      next.addEventListener("click", function () {
        idx++;
        render();
      });
      root.appendChild(next);
      next.focus();
    }

    function finish() {
      root.innerHTML = "";

      var head = el("div", "quiz-head");
      head.appendChild(el("span", "quiz-title", title));
      root.appendChild(head);

      var done = el("div", "quiz-done");
      done.appendChild(el("div", "quiz-score", score + " / " + items.length));

      var verdict;
      if (score === items.length) {
        verdict =
          "Fechou. Volte a este quiz daqui a alguns dias — recuperar de novo depois de esquecer um pouco é o que fixa de verdade.";
      } else if (score >= items.length - 1) {
        verdict = "Quase tudo. Releia o ponto que escapou e refaça agora.";
      } else {
        verdict =
          "Vale reler a lição e refazer. Errar aqui é barato; errar na arquitetura depois não é.";
      }
      done.appendChild(el("p", "quiz-verdict", verdict));

      var again = el("button", "quiz-next", "Refazer");
      again.type = "button";
      again.addEventListener("click", function () {
        idx = 0;
        score = 0;
        render();
      });
      done.appendChild(again);

      root.appendChild(done);
    }

    render();
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function init() {
    injectCSS();
    document.querySelectorAll(".quiz").forEach(build);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
