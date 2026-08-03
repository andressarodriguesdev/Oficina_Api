/* ============================================================
   tracker.js — checklist persistente com barras de progresso
   ------------------------------------------------------------
   Uso:

   <div class="sprint" data-sprint="0" data-title="Limpar o terreno">
     <ul class="tasks">
       <li data-id="s0-dup">Apagar source/repos/</li>
     </ul>
   </div>

   E, opcionalmente, <div class="overall"></div> para o total.

   O estado guarda-se em localStorage, com chave derivada do
   nome do ficheiro — cada documento tem o seu progresso.
   ============================================================ */

(function () {
  "use strict";

  var KEY = "tracker:" + (location.pathname.split("/").pop() || "index");

  var CSS = `
  .sprint{border:1px solid var(--rule);border-radius:6px;margin:1.5rem 0;overflow:hidden;background:var(--bg)}
  .sprint-head{display:flex;align-items:center;gap:.85rem;padding:.9rem 1.1rem;
               background:var(--code-bg);border-bottom:1px solid var(--rule);flex-wrap:wrap}
  .sprint-num{font-family:ui-sans-serif,-apple-system,"Segoe UI",sans-serif;font-size:.68rem;
              letter-spacing:.1em;text-transform:uppercase;font-weight:700;color:var(--muted);
              border:1px solid var(--rule);border-radius:3px;padding:.2rem .45rem;white-space:nowrap}
  .sprint-name{font-weight:700;font-size:1.02rem;flex:1;min-width:10rem}
  .sprint-est{font-family:ui-sans-serif,-apple-system,sans-serif;font-size:.75rem;color:var(--muted);white-space:nowrap}
  .sprint-count{font-family:ui-sans-serif,-apple-system,sans-serif;font-size:.75rem;
                font-variant-numeric:tabular-nums;color:var(--muted);white-space:nowrap}
  .bar{height:4px;background:var(--rule);position:relative;overflow:hidden}
  .bar > i{display:block;height:100%;width:0;background:var(--accent);transition:width .25s ease}
  .sprint.is-done .bar > i{background:var(--ok)}
  .sprint.is-done .sprint-name{color:var(--muted);text-decoration:line-through;text-decoration-thickness:1px}
  ul.tasks{list-style:none;margin:0;padding:.6rem .4rem .7rem}
  ul.tasks li{margin:0;padding:0}
  ul.tasks label{display:flex;gap:.65rem;align-items:flex-start;padding:.42rem .7rem;
                 border-radius:4px;cursor:pointer;font-size:.93rem;line-height:1.45}
  ul.tasks label:hover{background:var(--code-bg)}
  ul.tasks input{margin:.34rem 0 0;flex-shrink:0;accent-color:var(--accent);width:.95rem;height:.95rem;cursor:pointer}
  ul.tasks input:checked + span{color:var(--muted);text-decoration:line-through;text-decoration-thickness:1px}
  ul.tasks code{white-space:normal}
  .overall{border:1px solid var(--rule);border-radius:6px;padding:1.1rem 1.25rem;margin:2rem 0;background:var(--code-bg)}
  .overall-top{display:flex;justify-content:space-between;align-items:baseline;gap:1rem;margin-bottom:.7rem;flex-wrap:wrap}
  .overall-label{font-family:ui-sans-serif,-apple-system,sans-serif;font-size:.68rem;
                 letter-spacing:.12em;text-transform:uppercase;font-weight:700;color:var(--muted)}
  .overall-pct{font-size:1.75rem;font-weight:700;font-variant-numeric:tabular-nums;letter-spacing:-.02em}
  .overall .bar{height:7px;border-radius:4px}
  .tracker-reset{margin-top:.85rem;font:inherit;font-family:ui-sans-serif,-apple-system,sans-serif;
                 font-size:.75rem;color:var(--muted);background:none;border:none;
                 cursor:pointer;padding:0;text-decoration:underline}
  .tracker-reset:hover{color:var(--accent)}
  @media print{ul.tasks input{-webkit-appearance:checkbox;appearance:checkbox}.tracker-reset{display:none}}
  `;

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "{}");
    } catch (e) {
      return {};
    }
  }

  function save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      /* modo privado — segue sem persistir */
    }
  }

  function init() {
    var style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);

    var state = load();
    var sprints = [].slice.call(document.querySelectorAll(".sprint"));
    if (!sprints.length) return;

    // Monta cabeçalho e barra de cada sprint
    sprints.forEach(function (s) {
      var head = document.createElement("div");
      head.className = "sprint-head";

      var num = document.createElement("span");
      num.className = "sprint-num";
      num.textContent = "Sprint " + s.dataset.sprint;
      head.appendChild(num);

      var name = document.createElement("span");
      name.className = "sprint-name";
      name.textContent = s.dataset.title || "";
      head.appendChild(name);

      if (s.dataset.est) {
        var est = document.createElement("span");
        est.className = "sprint-est";
        est.textContent = s.dataset.est;
        head.appendChild(est);
      }

      var count = document.createElement("span");
      count.className = "sprint-count";
      head.appendChild(count);

      var bar = document.createElement("div");
      bar.className = "bar";
      bar.appendChild(document.createElement("i"));

      s.insertBefore(bar, s.firstChild);
      s.insertBefore(head, s.firstChild);

      s._count = count;
      s._fill = bar.querySelector("i");
    });

    // Transforma cada <li data-id> em checkbox
    document.querySelectorAll("ul.tasks > li[data-id]").forEach(function (li) {
      var id = li.dataset.id;
      var html = li.innerHTML;

      var label = document.createElement("label");
      var box = document.createElement("input");
      box.type = "checkbox";
      box.checked = !!state[id];

      var span = document.createElement("span");
      span.innerHTML = html;

      label.appendChild(box);
      label.appendChild(span);
      li.innerHTML = "";
      li.appendChild(label);

      box.addEventListener("change", function () {
        state[id] = box.checked;
        save(state);
        refresh();
      });
    });

    var overall = document.querySelector(".overall");
    var oPct, oFill, oCount;

    if (overall) {
      var top = document.createElement("div");
      top.className = "overall-top";

      var lbl = document.createElement("span");
      lbl.className = "overall-label";
      lbl.textContent = overall.dataset.title || "Progresso total";
      top.appendChild(lbl);

      oCount = document.createElement("span");
      oCount.className = "sprint-count";
      top.appendChild(oCount);

      oPct = document.createElement("div");
      oPct.className = "overall-pct";

      var oBar = document.createElement("div");
      oBar.className = "bar";
      oFill = document.createElement("i");
      oBar.appendChild(oFill);

      overall.appendChild(top);
      overall.appendChild(oPct);
      overall.appendChild(oBar);

      var reset = document.createElement("button");
      reset.type = "button";
      reset.className = "tracker-reset";
      reset.textContent = "Limpar todo o progresso";
      reset.addEventListener("click", function () {
        if (!confirm("Desmarcar todas as tarefas?")) return;
        state = {};
        save(state);
        document.querySelectorAll("ul.tasks input").forEach(function (b) {
          b.checked = false;
        });
        refresh();
      });
      overall.appendChild(reset);
    }

    function refresh() {
      var total = 0;
      var done = 0;

      sprints.forEach(function (s) {
        var boxes = [].slice.call(s.querySelectorAll("ul.tasks input"));
        var d = boxes.filter(function (b) {
          return b.checked;
        }).length;

        total += boxes.length;
        done += d;

        var pct = boxes.length ? (d / boxes.length) * 100 : 0;
        s._fill.style.width = pct + "%";
        s._count.textContent = d + " / " + boxes.length;
        s.classList.toggle("is-done", boxes.length > 0 && d === boxes.length);
      });

      if (overall) {
        var p = total ? Math.round((done / total) * 100) : 0;
        oPct.textContent = p + "%";
        oFill.style.width = p + "%";
        oCount.textContent = done + " de " + total + " tarefas";
      }
    }

    refresh();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
