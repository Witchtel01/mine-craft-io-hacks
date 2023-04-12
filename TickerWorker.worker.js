(() => {
  const t = self;
  let a;
  t.onmessage = e => {
    function s() {
      a && (clearInterval(a), a = null);
    }
    "start" === e.data && (s(), a = setInterval(() => t.postMessage("tick"), 16)), "stop" === e.data && s();
  };
})();
