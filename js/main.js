// async function includePartials() {
//   const nodes = document.querySelectorAll("[data-include]");
//   await Promise.all([...nodes].map(async (el) => {
//     const url = el.getAttribute("data-include");
//     if (!url) return;

//     try {
//       const res = await fetch(url, { cache: "no-store" });
//       if (!res.ok) throw new Error(`Failed to load: ${url} (${res.status})`);
//       el.innerHTML = await res.text();
//     } catch (err) {
//       console.error(err);
//       el.innerHTML = `<!-- ${url} not loaded -->`;
//     }
//   }));
// }

// function prefersReducedMotion() {
//   return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
// }

// /* =========================
//    THEME (FULL)
//    ========================= */
// const THEME_KEY = "theme"; // "light" | "dark" | null

// function getSystemTheme() {
//   const prefersDark =
//     window.matchMedia &&
//     window.matchMedia("(prefers-color-scheme: dark)").matches;
//   return prefersDark ? "dark" : "light";
// }

// function getInitialTheme() {
//   const saved = localStorage.getItem(THEME_KEY);
//   if (saved === "light" || saved === "dark") return saved;
//   return getSystemTheme();
// }

// function applyTheme(theme) {
//   // theme: "light" | "dark"
//   document.documentElement.setAttribute("data-theme", theme);
// }

// function setTheme(theme) {
//   // set + persist (user forced)
//   applyTheme(theme);
//   localStorage.setItem(THEME_KEY, theme);
// }

// function clearThemePreference() {
//   // optional: back to auto
//   localStorage.removeItem(THEME_KEY);
//   applyTheme(getSystemTheme());
// }

// function setupTheme() {
//   // 1) init: saved > system
//   applyTheme(getInitialTheme());

//   // 2) toggle click
//   const themeToggle = document.getElementById("themeToggle");
//   themeToggle?.addEventListener("click", () => {
//     const current = document.documentElement.getAttribute("data-theme") || getSystemTheme();
//     const next = current === "dark" ? "light" : "dark";
//     setTheme(next);
//   });

//   // 3) follow OS changes ONLY if user hasn't saved preference
//   const mql = window.matchMedia("(prefers-color-scheme: dark)");
//   const onSystemChange = () => {
//     const saved = localStorage.getItem(THEME_KEY);
//     if (saved !== "light" && saved !== "dark") {
//       applyTheme(getSystemTheme());
//     }
//   };

//   if (mql?.addEventListener) mql.addEventListener("change", onSystemChange);
//   else if (mql?.addListener) mql.addListener(onSystemChange); // Safari cũ
// }

// /* =========================
//    SCROLL / NAV
//    ========================= */
// function getHeaderHeight() {
//   const header = document.querySelector(".site-header");
//   return header ? header.getBoundingClientRect().height : 0;
// }

// function smoothScrollToId(id) {
//   const target = document.getElementById(id);
//   if (!target) return;

//   const headerH = getHeaderHeight();
//   const y = window.scrollY + target.getBoundingClientRect().top - (headerH + 10);

//   window.scrollTo({
//     top: Math.max(0, y),
//     behavior: prefersReducedMotion() ? "auto" : "smooth",
//   });
// }

// function canonicalPath(pathname) {
//   if (pathname.length > 1 && pathname.endsWith("/")) pathname = pathname.slice(0, -1);

//   const map = {
//     "/": "/",
//     "/index.html": "/",

//     "/partials/contact.html": "/contact",
//     "/partials/publications.html": "/publications",
//     "/partials/project.html": "/projects",

//     "/contact": "/contact",
//     "/publications": "/publications",
//     "/projects": "/projects",
//   };

//   return map[pathname] || pathname;
// }

// function setActiveTab(sectionId) {
//   const links = Array.from(document.querySelectorAll(".nav-link"));
//   links.forEach((l) => l.classList.toggle("active", l.dataset.section === sectionId));
// }

// function setupScrollSpy() {
//   const links = Array.from(document.querySelectorAll(".nav-link"));
//   const sections = links
//     .map((a) => document.getElementById(a.dataset.section))
//     .filter(Boolean);

//   if (!sections.length) return;

//   const headerH = Math.round(getHeaderHeight());

//   const obs = new IntersectionObserver(
//     (entries) => {
//       const visible = entries
//         .filter((e) => e.isIntersecting)
//         .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

//       if (!visible) return;
//       setActiveTab(visible.target.id);
//     },
//     {
//       threshold: 0.25,
//       rootMargin: `-${headerH + 20}px 0px -55% 0px`,
//     }
//   );

//   sections.forEach((sec) => obs.observe(sec));
// }

// function setupTabClickScroll() {
//   const links = Array.from(document.querySelectorAll(".nav-link"));
//   const nav = document.getElementById("primaryNav");
//   const toggle = document.getElementById("navToggle");

//   links.forEach((a) => {
//     a.addEventListener("click", (e) => {
//       const id = a.dataset.section;
//       if (!id) return;

//       const url = new URL(a.getAttribute("href"), window.location.href);

//       const linkPath = canonicalPath(url.pathname);
//       const curPath = canonicalPath(window.location.pathname);

//       if (linkPath !== curPath) return;

//       const target = document.getElementById(id);
//       if (!target) return;

//       e.preventDefault();

//       if (nav?.classList.contains("open")) {
//         nav.classList.remove("open");
//         toggle?.setAttribute("aria-expanded", "false");
//       }

//       setActiveTab(id);
//       smoothScrollToId(id);

//       history.pushState(null, "", `#${id}`);
//     });
//   });
// }

// function setupMobileNav() {
//   const toggle = document.getElementById("navToggle");
//   const nav = document.getElementById("primaryNav");
//   if (!toggle || !nav) return;

//   toggle.addEventListener("click", () => {
//     const open = nav.classList.toggle("open");
//     toggle.setAttribute("aria-expanded", String(open));
//   });
// }

// function adjustHeaderActionsForPage() {
//   const searchBtn = document.getElementById("searchBtn");
//   const searchDlg = document.getElementById("searchDialog");
//   const pubList = document.getElementById("pubList");

//   if (!pubList || !searchDlg) {
//     if (searchBtn) searchBtn.style.display = "none";
//   }
// }

// /* =========================
//    Handle hash on load (cùng trang)
//    ========================= */
// function handleInitialHash() {
//   const id = (location.hash || "").replace("#", "");
//   if (!id) return;

//   const target = document.getElementById(id);
//   if (!target) return;

//   setTimeout(() => {
//     setActiveTab(id);
//     smoothScrollToId(id);
//   }, 0);
// }

// /* =========================
//    MAIN
//    ========================= */
// (async function init() {
//   await includePartials();

//   // Theme init + toggle + auto-follow OS (when not forced)
//   setupTheme();

//   // Year
//   const y = document.getElementById("yearNow");
//   if (y) y.textContent = new Date().getFullYear();

//   setupMobileNav();
//   setupTabClickScroll();
//   setupScrollSpy();

//   adjustHeaderActionsForPage();
//   handleInitialHash();

//   /* ===== Publications ===== */
//   const hasPubList = !!document.getElementById("pubList");
//   if (hasPubList && typeof loadPublications === "function") {
//     try {
//       const pubs = await loadPublications();

//       const pubList = document.getElementById("pubList");
//       const pubFilter = document.getElementById("pubFilter");
//       const pubSort = document.getElementById("pubSort");

//       const redraw = () => {
//         const q = pubFilter?.value || "";
//         const mode = pubSort?.value || "year_desc";
//         const filtered = filterPubs(pubs, q);
//         const sorted = sortPubs(filtered, mode);
//         renderPubs(pubList, sorted);
//       };

//       pubFilter?.addEventListener("input", redraw);
//       pubSort?.addEventListener("change", redraw);
//       redraw();

//       if (document.getElementById("searchDialog")) {
//         setupSearchDialog(pubs);
//       }
//     } catch (e) {
//       console.error(e);
//     }
//   }

//   /* ===== Projects ===== */
//   const hasProjList = !!document.getElementById("projList");
//   if (hasProjList && typeof loadProjects === "function") {
//     try {
//       const projs = await loadProjects();

//       const projList = document.getElementById("projList");
//       const projFilter = document.getElementById("projFilter");

//       const redraw = () => {
//         const q = projFilter?.value || "";
//         const filtered = filterProjects(projs, q);
//         renderProjects(projList, filtered);
//       };

//       projFilter?.addEventListener("input", redraw);
//       redraw();
//     } catch (e) {
//       console.error(e);
//     }
//   }
// })();


// main.js (NO ES MODULE) + GUARD (right click / devtools hotkeys / devtools detect)

/* =========================================================
   SECURITY GUARD (based on your js/app.js)
   - Add ?unlock=1 to bypass
   ========================================================= */
(function () {
  "use strict";

  const __URL__ = new URL(window.location.href);
  const __LOCK__ = __URL__.searchParams.get("unlock") !== "1";

  let __DEVTOOLS_OPEN__ = false;
  let __OVERLAY_VISIBLE__ = false;

  function domReady(cb) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", cb, { once: true });
    } else cb();
  }

  function ensureWarningOverlay() {
    if (!document.body) return;
    if (document.getElementById("amadasWarningOverlay")) return;

    const style = document.createElement("style");
    style.id = "amadasWarningOverlayStyle";
    style.textContent = `
      #amadasWarningOverlay{
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background: rgba(0,0,0,0.72);
        backdrop-filter: blur(6px);
      }
      #amadasWarningOverlay .amadas-card{
        width: min(560px, 100%);
        border-radius: 16px;
        padding: 18px 18px 14px;
        background: rgba(20,20,20,0.95);
        border: 1px solid rgba(255,255,255,0.12);
        box-shadow: 0 10px 30px rgba(0,0,0,0.45);
        color: #fff;
        font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      }
      #amadasWarningOverlay .amadas-title{
        font-size: 18px;
        font-weight: 700;
        margin: 0 0 8px;
      }
      #amadasWarningOverlay .amadas-desc{
        font-size: 14px;
        line-height: 1.45;
        opacity: 0.92;
        margin: 0 0 12px;
      }
      #amadasWarningOverlay .amadas-reason{
        font-size: 12px;
        opacity: 0.75;
        margin: 0 0 14px;
        word-break: break-word;
      }
      #amadasWarningOverlay .amadas-actions{
        display: flex;
        gap: 10px;
        justify-content: flex-end;
      }
      #amadasWarningOverlay .amadas-btn{
        border: 0;
        border-radius: 12px;
        padding: 10px 12px;
        cursor: pointer;
        font-size: 14px;
      }
      #amadasWarningOverlay .amadas-btn.primary{
        background: #ffffff;
        color: #111;
        font-weight: 700;
      }
      #amadasWarningOverlay .amadas-btn.ghost{
        background: transparent;
        color: #fff;
        border: 1px solid rgba(255,255,255,0.18);
      }
      #amadasWarningOverlay .amadas-note{
        margin-top: 8px;
        font-size: 12px;
        opacity: .75;
      }
    `;
    document.head.appendChild(style);

    const overlay = document.createElement("div");
    overlay.id = "amadasWarningOverlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.innerHTML = `
      <div class="amadas-card">
        <div class="amadas-title">Cảnh báo</div>
        <div class="amadas-desc">
          Hành động này đang bị hạn chế để bảo vệ nội dung. Vui lòng dừng thao tác bị chặn hoặc đóng DevTools.
        </div>
        <div class="amadas-reason" id="amadasWarningReason">Lý do: —</div>
        <div class="amadas-reason">Không sử dụng chuột phải hay phím tắt để mở DevTools</div>
        <div class="amadas-actions">
          <button class="amadas-btn ghost" id="amadasWarnClose">Đóng</button>
          <button class="amadas-btn primary" id="amadasWarnReload">Tải lại trang</button>
        </div>
        <div class="amadas-note" id="amadasWarnNote"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) hideWarningOverlay();
    });

    const btnClose = document.getElementById("amadasWarnClose");
    const btnReload = document.getElementById("amadasWarnReload");
    if (btnClose) btnClose.addEventListener("click", hideWarningOverlay);
    if (btnReload) btnReload.addEventListener("click", () => window.location.reload());
  }

  function showWarningOverlay(reason) {
    try {
      ensureWarningOverlay();
      const overlay = document.getElementById("amadasWarningOverlay");
      const reasonEl = document.getElementById("amadasWarningReason");
      const noteEl = document.getElementById("amadasWarnNote");

      if (reasonEl) reasonEl.textContent = "Lý do: " + (reason || "—");

      if (noteEl) {
        noteEl.textContent = __LOCK__ ? "" : "Đang ở chế độ debug (unlock=1).";
      }

      if (overlay) overlay.style.display = "flex";
      __OVERLAY_VISIBLE__ = true;
    } catch (e) {}
  }

  function hideWarningOverlay() {
    const overlay = document.getElementById("amadasWarningOverlay");
    if (overlay) overlay.style.display = "none";
    __OVERLAY_VISIBLE__ = false;
  }

  function isEditableTarget(target) {
    if (!target) return false;
    const el = target.closest
      ? target.closest("input, textarea, select, [contenteditable='true']")
      : null;
    return !!el;
  }

  function isDevtoolsHotkey(e) {
    const key = (e.key || "").toLowerCase();
    const code = (e.code || "").toLowerCase();
    const kc = e.keyCode;

    // F12
    if (key === "f12" || code === "f12" || kc === 123) return true;

    // Ctrl + Shift + I/J/C/K
    if (e.ctrlKey && e.shiftKey && ["i", "j", "c", "k"].includes(key)) return true;
    if (e.ctrlKey && e.shiftKey && [73, 74, 67, 75].includes(kc)) return true;

    // Cmd + Opt + I/J/C (macOS)
    if (e.metaKey && e.altKey && ["i", "j", "c"].includes(key)) return true;

    return false;
  }

  function installKeyGuards() {
    document.addEventListener(
      "keydown",
      function (e) {
        if (!__LOCK__) return;

        // nếu đang gõ trong input/textarea thì vẫn chặn devtools
        // (không return, vì devtools hotkey vẫn cần chặn)

        // Chặn DevTools hotkeys
        if (isDevtoolsHotkey(e)) {
          e.preventDefault();
          e.stopPropagation();
          if (e.stopImmediatePropagation) e.stopImmediatePropagation();
          showWarningOverlay("Phím tắt DevTools đã bị chặn.");
          return false;
        }

        // Context Menu key
        if (e.key === "ContextMenu") {
          e.preventDefault();
          e.stopPropagation();
          if (e.stopImmediatePropagation) e.stopImmediatePropagation();
          showWarningOverlay("Context Menu đã bị chặn.");
          return false;
        }

        // Shift + F10
        if (e.shiftKey && (e.key === "F10" || e.code === "F10")) {
          e.preventDefault();
          e.stopPropagation();
          if (e.stopImmediatePropagation) e.stopImmediatePropagation();
          showWarningOverlay("Shift+F10 đã bị chặn.");
          return false;
        }

        // (Tuỳ chọn) chặn Ctrl+U xem source, Ctrl+S save, Ctrl+P print
        // Nếu bạn không muốn chặn các phím này thì xoá block dưới
        if (!isEditableTarget(e.target)) {
          const key = (e.key || "").toLowerCase();
          if (e.ctrlKey && !e.shiftKey && !e.altKey && ["u", "s", "p"].includes(key)) {
            e.preventDefault();
            e.stopPropagation();
            if (e.stopImmediatePropagation) e.stopImmediatePropagation();
            showWarningOverlay("Phím tắt đã bị chặn.");
            return false;
          }
          if (e.metaKey && !e.shiftKey && !e.altKey && ["u", "s", "p"].includes(key)) {
            e.preventDefault();
            e.stopPropagation();
            if (e.stopImmediatePropagation) e.stopImmediatePropagation();
            showWarningOverlay("Phím tắt đã bị chặn.");
            return false;
          }
        }
      },
      { capture: true }
    );
  }

  function installRightClickGuard() {
    document.addEventListener(
      "contextmenu",
      function (e) {
        if (!__LOCK__) return;
        if (isEditableTarget(e.target)) return;
        e.preventDefault();
        e.stopPropagation();
        showWarningOverlay("Chuột phải đã bị vô hiệu hóa.");
      },
      { capture: true }
    );

    document.addEventListener(
      "auxclick",
      function (e) {
        if (!__LOCK__) return;
        if (e.button === 2 && !isEditableTarget(e.target)) {
          e.preventDefault();
          e.stopPropagation();
          showWarningOverlay("Chuột phải đã bị vô hiệu hóa.");
        }
      },
      { capture: true }
    );
  }

  function installDevtoolsDetect() {
    if (!__LOCK__) return;

    const TH = 160;
    const POLL_MS = 300;

    function isDevtoolsOpen() {
      return (
        Math.abs(window.outerWidth - window.innerWidth) > TH ||
        Math.abs(window.outerHeight - window.innerHeight) > TH
      );
    }

    function tick() {
      const open = isDevtoolsOpen();
      if (open && !__DEVTOOLS_OPEN__) {
        __DEVTOOLS_OPEN__ = true;
        showWarningOverlay("DevTools đang mở. Vui lòng đóng để tiếp tục.");
      } else if (!open && __DEVTOOLS_OPEN__) {
        __DEVTOOLS_OPEN__ = false;
        if (__OVERLAY_VISIBLE__) hideWarningOverlay();
      } else if (open && __DEVTOOLS_OPEN__) {
        if (!__OVERLAY_VISIBLE__) {
          showWarningOverlay("DevTools đang mở. Vui lòng đóng để tiếp tục.");
        }
      }
    }

    tick();
    const timer = setInterval(tick, POLL_MS);

    window.addEventListener("pagehide", () => clearInterval(timer), { once: true });
    window.addEventListener("focus", tick);
    window.addEventListener("resize", tick);
  }

  // Init guards as soon as DOM ready
  domReady(() => {
    ensureWarningOverlay();
    hideWarningOverlay();
    installKeyGuards();
    installRightClickGuard();
    installDevtoolsDetect();
  });
})();

/* =========================
   INCLUDE PARTIALS
   ========================= */
async function includePartials() {
  const nodes = document.querySelectorAll("[data-include]");
  await Promise.all([...nodes].map(async (el) => {
    const url = el.getAttribute("data-include");
    if (!url) return;

    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load: ${url} (${res.status})`);
      el.innerHTML = await res.text();
    } catch (err) {
      console.error(err);
      el.innerHTML = `<!-- ${url} not loaded -->`;
    }
  }));
}

function prefersReducedMotion() {
  return (
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/* =========================
   SAFE ROOT URL
   ========================= */
function getRootPath() {
  const parts = location.pathname.split("/").filter(Boolean);
  const idx = parts.indexOf("partials");
  const baseParts = idx >= 0 ? parts.slice(0, idx) : parts.slice(0, 0);
  return "/" + (baseParts.length ? baseParts.join("/") + "/" : "");
}

function rootUrl(rel) {
  return new URL(rel, location.origin + getRootPath()).href;
}

/* =========================
   HOME DETECT (for lightning only)
   ========================= */
function isHomePage() {
  const parts = location.pathname.split("/").filter(Boolean);
  if (parts.includes("partials")) return false;

  const last = (parts[parts.length - 1] || "").toLowerCase();
  const endsWithSlash = location.pathname.endsWith("/");

  if (last === "index.html") return true;
  if (endsWithSlash) return true;
  if (!last.endsWith(".html")) return true;

  return false;
}

/* =========================
   THEME
   ========================= */
const THEME_KEY = "theme";

function getSystemTheme() {
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

function getInitialTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return getSystemTheme();
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function setTheme(theme) {
  applyTheme(theme);
  localStorage.setItem(THEME_KEY, theme);
}

function setupTheme() {
  applyTheme(getInitialTheme());

  const themeToggle = document.getElementById("themeToggle");
  themeToggle?.addEventListener("click", () => {
    const current =
      document.documentElement.getAttribute("data-theme") || getSystemTheme();
    const next = current === "dark" ? "light" : "dark";
    setTheme(next);
  });

  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved !== "light" && saved !== "dark") {
      applyTheme(getSystemTheme());
    }
  };

  if (mql?.addEventListener) mql.addEventListener("change", onSystemChange);
  else if (mql?.addListener) mql.addListener(onSystemChange);
}

/* =========================
   SCROLL / NAV
   ========================= */
function getHeaderHeight() {
  const header = document.querySelector(".site-header");
  return header ? header.getBoundingClientRect().height : 0;
}

function smoothScrollToId(id) {
  const target = document.getElementById(id);
  if (!target) return;

  const headerH = getHeaderHeight();
  const y =
    window.scrollY +
    target.getBoundingClientRect().top -
    (headerH + 10);

  window.scrollTo({
    top: Math.max(0, y),
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
}

function canonicalPath(pathname) {
  if (pathname.length > 1 && pathname.endsWith("/"))
    pathname = pathname.slice(0, -1);

  const map = {
    "/": "/",
    "/index.html": "/",

    "/partials/contact.html": "/contact",
    "/partials/publications.html": "/publications",
    "/partials/project.html": "/projects",

    "/contact": "/contact",
    "/publications": "/publications",
    "/projects": "/projects",
  };

  return map[pathname] || pathname;
}

function setActiveTab(sectionId) {
  const links = Array.from(document.querySelectorAll(".nav-link"));
  links.forEach((l) =>
    l.classList.toggle("active", l.dataset.section === sectionId)
  );
}

function setupScrollSpy() {
  const links = Array.from(document.querySelectorAll(".nav-link"));
  const sections = links
    .map((a) => document.getElementById(a.dataset.section))
    .filter(Boolean);

  if (!sections.length) return;

  const headerH = Math.round(getHeaderHeight());

  const obs = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

      if (!visible) return;
      setActiveTab(visible.target.id);
    },
    {
      threshold: 0.25,
      rootMargin: `-${headerH + 20}px 0px -55% 0px`,
    }
  );

  sections.forEach((sec) => obs.observe(sec));
}

function setupTabClickScroll() {
  const links = Array.from(document.querySelectorAll(".nav-link"));
  const nav = document.getElementById("primaryNav");
  const toggle = document.getElementById("navToggle");

  links.forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.dataset.section;
      if (!id) return;

      const url = new URL(a.getAttribute("href"), window.location.href);

      const linkPath = canonicalPath(url.pathname);
      const curPath = canonicalPath(window.location.pathname);

      if (linkPath !== curPath) return;

      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();

      if (nav?.classList.contains("open")) {
        nav.classList.remove("open");
        toggle?.setAttribute("aria-expanded", "false");
      }

      setActiveTab(id);
      smoothScrollToId(id);

      history.pushState(null, "", `#${id}`);
    });
  });
}

function setupMobileNav() {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("primaryNav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}

function adjustHeaderActionsForPage() {
  const searchBtn = document.getElementById("searchBtn");
  const searchDlg = document.getElementById("searchDialog");
  const pubList = document.getElementById("pubList");

  if (!pubList || !searchDlg) {
    if (searchBtn) searchBtn.style.display = "none";
  }
}

function handleInitialHash() {
  const id = (location.hash || "").replace("#", "");
  if (!id) return;

  const target = document.getElementById(id);
  if (!target) return;

  setTimeout(() => {
    setActiveTab(id);
    smoothScrollToId(id);
  }, 0);
}

/* =========================
   SCRIPT LOADER
   ========================= */
const __loadedScripts = new Set();

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (!src) return resolve();
    if (__loadedScripts.has(src)) return resolve();

    const s = document.createElement("script");
    s.src = src;
    s.defer = true;
    s.onload = () => {
      __loadedScripts.add(src);
      resolve();
    };
    s.onerror = () => reject(new Error("Failed to load script: " + src));
    document.head.appendChild(s);
  });
}

/* =========================
   MAIN
   ========================= */
(async function init() {
  await includePartials();

  setupTheme();

  const y = document.getElementById("yearNow");
  if (y) y.textContent = String(new Date().getFullYear());

  setupMobileNav();
  setupTabClickScroll();
  setupScrollSpy();

  adjustHeaderActionsForPage();
  handleInitialHash();

  /* ===== Projects ===== */
  if (document.getElementById("projList")) {
    try {
      await loadScript(rootUrl("js/projects.js"));

      if (typeof window.initProjects === "function") {
        await window.initProjects({
          jsonUrl: rootUrl("projects.json"),
          targetId: "projList",
          filterId: "projFilter",
          yearId: "projYear",
        });
      } else {
        console.error("initProjects is not defined. Check projects.js global export.");
      }
    } catch (e) {
      console.error(e);
    }
  }

  /* ===== Publications ===== */
  if (document.getElementById("pubList")) {
    try {
      await loadScript(rootUrl("js/publications.js"));

      if (typeof window.initPublications === "function") {
        await window.initPublications({
          jsonUrl: rootUrl("publications.json"),
          targetId: "pubList",
          filterId: "pubFilter",
          sortId: "pubSort",
          yearId: "pubYear",
          typeId: "pubType",
          indexId: "pubIndex",
        });
      } else {
        console.error("initPublications is not defined. Check publications.js global export.");
      }
    } catch (e) {
      console.error(e);
    }
  }

  /* ===== Lightning Cursor: chỉ chạy ở index/home ===== */
  if (isHomePage()) {
    try {
      await loadScript(rootUrl("js/lightning-cursor.js"));
      if (typeof window.initLightningCursor === "function") {
        window.initLightningCursor({});
      }
    } catch (e) {
      console.error(e);
    }
  }
})();
