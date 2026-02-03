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


// main.js
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
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* =========================
   SAFE ROOT URL (fix /partials/... relative path issue)
   - Works for:
     + localhost root (/)
     + pages in /partials/...
     + GitHub Pages subfolder deployment (e.g. /THINHBUiHOMEPAGE/)
   ========================= */
function getRootPath() {
  // Example:
  //  /partials/project.html      -> "/"
  //  /THINHBUiHOMEPAGE/partials/... -> "/THINHBUiHOMEPAGE/"
  const parts = location.pathname.split("/").filter(Boolean);
  const idx = parts.indexOf("partials");
  const baseParts = idx >= 0 ? parts.slice(0, idx) : parts.slice(0, 0);
  return "/" + (baseParts.length ? baseParts.join("/") + "/" : "");
}

function rootUrl(rel) {
  // rel: "js/projects.js" or "projects.json"
  return new URL(rel, location.origin + getRootPath()).href;
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
  const y = window.scrollY + target.getBoundingClientRect().top - (headerH + 10);

  window.scrollTo({
    top: Math.max(0, y),
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
}

function canonicalPath(pathname) {
  if (pathname.length > 1 && pathname.endsWith("/")) pathname = pathname.slice(0, -1);

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
  links.forEach((l) => l.classList.toggle("active", l.dataset.section === sectionId));
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
   SCRIPT LOADER (NO MODULE)
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

  /* ===== Projects: main.js quản lí hết ===== */
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

  /* ===== Publications: main.js quản lí hết ===== */
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

  /* ===== Lightning Cursor ===== */
  try {
    await loadScript(rootUrl("js/lightning-cursor.js"));
    if (typeof window.initLightningCursor === "function") {
      window.initLightningCursor({});
    }
  } catch (e) {
    console.error(e);
  }


})();
