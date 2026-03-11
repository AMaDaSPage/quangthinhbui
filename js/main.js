(function () {
  "use strict";
})();

/* =========================
   INCLUDE PARTIALS
   ========================= */
async function includePartials() {
  const nodes = document.querySelectorAll("[data-include]");
  await Promise.all(
    [...nodes].map(async (el) => {
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
    })
  );
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
  const baseParts = idx >= 0 ? parts.slice(0, idx) : [];
  return "/" + (baseParts.length ? baseParts.join("/") + "/" : "");
}

function rootUrl(rel) {
  return new URL(rel, location.origin + getRootPath()).href;
}

/* =========================
   HOME DETECT
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

function getInitialTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return "light";
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
  if (!themeToggle) return;

  themeToggle.addEventListener("click", () => {
    const current =
      document.documentElement.getAttribute("data-theme") || "light";
    const next = current === "dark" ? "light" : "dark";
    setTheme(next);
  });
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
  if (pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
  }

  const map = {
    "/": "/",
    "/index.html": "/",

    "/partials/profile.html": "/bio",
    "/partials/contact.html": "/contact",
    "/partials/publications.html": "/publications",
    "/partials/supervision.html": "/supervision",
    "/partials/project.html": "/projects",

    "/bio": "/bio",
    "/contact": "/contact",
    "/publications": "/publications",
    "/projects": "/projects",
  };

  return map[pathname] || pathname;
}

function setActiveTab(sectionId) {
  const links = Array.from(document.querySelectorAll(".nav-link"));

  links.forEach((link) => {
    const isActive = link.dataset.section === sectionId;
    link.classList.toggle("active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function detectSectionFromPath() {
  const curPath = canonicalPath(window.location.pathname);

  const pathToSection = {
    "/": "home",
    "/bio": "bio",
    "/publications": "publications",
    "/supervision": "supervision",
    "/projects": "projects",
    "/contact": "contact",
  };

  return pathToSection[curPath] || null;
}

function applyActiveTabFromLocation() {
  const sectionFromPath = detectSectionFromPath();

  // Trang riêng: ưu tiên pathname tuyệt đối
  if (sectionFromPath && sectionFromPath !== "home") {
    setActiveTab(sectionFromPath);
    return;
  }

  // Trang home mới dùng hash
  const hash = (window.location.hash || "").replace("#", "").trim();
  if (hash) {
    const link = document.querySelector(`.nav-link[data-section="${hash}"]`);
    if (link) {
      setActiveTab(hash);
      return;
    }
  }

  if (sectionFromPath) {
    setActiveTab(sectionFromPath);
  }
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

      const href = a.getAttribute("href");
      if (!href) return;

      const url = new URL(href, window.location.href);
      const linkPath = canonicalPath(url.pathname);
      const curPath = canonicalPath(window.location.pathname);

      if (nav?.classList.contains("open")) {
        nav.classList.remove("open");
        toggle?.setAttribute("aria-expanded", "false");
      }

      // Khác trang: để browser chuyển trang bình thường.
      // Không ép active ở đây, vì trang mới sẽ tự active đúng theo pathname.
      if (linkPath !== curPath) {
        return;
      }

      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
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
  const currentSection = detectSectionFromPath();

  // Chỉ smooth scroll bằng hash ở trang home
  if (currentSection && currentSection !== "home") {
    return;
  }

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
  applyActiveTabFromLocation();
  handleInitialHash();

  window.addEventListener("hashchange", () => {
    applyActiveTabFromLocation();
    handleInitialHash();
  });

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

  /* ===== Lightning Cursor ===== */
  // if (isHomePage()) {
  //   try {
  //     await loadScript(rootUrl("js/lightning-cursor.js"));
  //     if (typeof window.initLightningCursor === "function") {
  //       window.initLightningCursor({});
  //     }
  //   } catch (e) {
  //     console.error(e);
  //   }
  // }
})();