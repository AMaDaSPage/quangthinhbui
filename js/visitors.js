function getVisitorId() {
  const key = "visitor_id";
  let id = localStorage.getItem(key);

  if (!id) {
    id =
      (crypto?.randomUUID?.() ||
        "v_" + Math.random().toString(16).slice(2) + Date.now().toString(16));
    localStorage.setItem(key, id);
  }
  return id;
}

function setText(id, v) {
  const el = document.getElementById(id);
  if (el) el.textContent = String(v);
}

async function ping({ hit }) {
  const id = getVisitorId();
  const url = `/api/visit?id=${encodeURIComponent(id)}&hit=${hit ? "1" : "0"}`;

  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) return null;
  return await r.json();
}

function waitForEl(selector, timeout = 7000, interval = 50) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    (function tick() {
      const el = document.querySelector(selector);
      if (el) return resolve(el);
      if (Date.now() - t0 > timeout) return resolve(null);
      setTimeout(tick, interval);
    })();
  });
}

(async function initVisitors() {
  // vì bạn load partials async, phải đợi widget xuất hiện
  const card = await waitForEl("#visitorsCard");
  if (!card) return;

  const countedKey = "pv_counted";
  const firstHit = !sessionStorage.getItem(countedKey);
  if (firstHit) sessionStorage.setItem(countedKey, "1");

  // ping lần đầu
  const d0 = await ping({ hit: firstHit });
  if (d0) {
    setText("totalVisits", d0.total);
    setText("onlineNow", d0.online);
  }

  const HEARTBEAT_MS = 3_000;
  setInterval(async () => {
    const d = await ping({ hit: false });
    if (d) {
      setText("totalVisits", d.total);
      setText("onlineNow", d.online);
    }
  }, HEARTBEAT_MS);

  document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState === "visible") {
      const d = await ping({ hit: false });
      if (d) {
        setText("totalVisits", d.total);
        setText("onlineNow", d.online);
      }
    }
  });
})();
