(function (w, d) {
  w.JediDesk = function () {
    w.JediDesk.q = arguments;
  };
  w.JediDesk.q = [];
  let link = document.createElement("link");
  link.href =
    `https://widget.jedidesk.com/static/css/index_bundle.css?v=` +
    new Date().getTime();
  link.rel = "stylesheet";
  document.head.appendChild(link);
  let div = document.createElement("div");
  div.id = "jedidesk";
  document.body.appendChild(div);
  let script = document.createElement("script");
  script.src =
    "https://widget.jedidesk.com/static/js/main.js?v=" + new Date().getTime();
  document.body.appendChild(script);
})(window, document);
