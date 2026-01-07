// /* =========================
//    Partials include
//    ========================= */
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

// /* =========================
//    Helpers
//    ========================= */
// function prefersReducedMotion() {
//   return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
// }

// function setTheme(theme) {
//   document.documentElement.setAttribute("data-theme", theme);
//   localStorage.setItem("theme", theme);
// }

// function getInitialTheme() {
//   const saved = localStorage.getItem("theme");
//   if (saved === "light" || saved === "dark") return saved;
//   const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
//   return prefersDark ? "dark" : "light";
// }

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

// /* =========================
//    Active tab
//    ========================= */
// function setActiveTab(sectionId) {
//   const links = Array.from(document.querySelectorAll(".nav-link"));
//   links.forEach((l) => l.classList.toggle("active", l.dataset.section === sectionId));
// }

// /* =========================
//    ScrollSpy
//    ========================= */
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

//       if (url.pathname !== window.location.pathname) return;

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

// (async function init() {
//   await includePartials(); 
//   setTheme(getInitialTheme());
//   const themeToggle = document.getElementById("themeToggle");
//   themeToggle?.addEventListener("click", () => {
//     const current = document.documentElement.getAttribute("data-theme");
//     setTheme(current === "dark" ? "light" : "dark");
//   });

//   const y = document.getElementById("yearNow");
//   if (y) y.textContent = new Date().getFullYear();

//   setupMobileNav();
//   setupTabClickScroll();
//   setupScrollSpy();

//   adjustHeaderActionsForPage();
//   handleInitialHash();

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
/* =========================
   Partials include
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

/* =========================
   Helpers
   ========================= */
function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

function getInitialTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return saved;
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

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

/* =========================
   Canonical path mapping (local + vercel clean URLs)
   ========================= */
function canonicalPath(pathname) {
  // bỏ trailing slash (trừ root)
  if (pathname.length > 1 && pathname.endsWith("/")) pathname = pathname.slice(0, -1);

  const map = {
    "/": "/",
    "/index.html": "/",

    // legacy -> clean
    "/partials/contact.html": "/contact",
    "/partials/publications.html": "/publications",
    "/partials/project.html": "/projects",

    // clean -> clean
    "/contact": "/contact",
    "/publications": "/publications",
    "/projects": "/projects",
  };

  return map[pathname] || pathname;
}

/* =========================
   Active tab
   ========================= */
function setActiveTab(sectionId) {
  const links = Array.from(document.querySelectorAll(".nav-link"));
  links.forEach((l) => l.classList.toggle("active", l.dataset.section === sectionId));
}

/* =========================
   ScrollSpy
   ========================= */
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

/* =========================
   Tabs click:
   - smooth-scroll nếu "cùng trang" theo canonicalPath và section tồn tại
   - nếu khác trang thì để browser tự điều hướng
   ========================= */
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

      // Nếu link trỏ sang trang khác => cho chuyển trang
      if (linkPath !== curPath) return;

      // Nếu section không tồn tại trên trang này => cho default
      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();

      // đóng menu mobile nếu đang mở
      if (nav?.classList.contains("open")) {
        nav.classList.remove("open");
        toggle?.setAttribute("aria-expanded", "false");
      }

      setActiveTab(id);
      smoothScrollToId(id);

      // chỉ update hash (giữ URL gọn trên Vercel)
      history.pushState(null, "", `#${id}`);
    });
  });
}

/* =========================
   Mobile nav
   ========================= */
function setupMobileNav() {
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("primaryNav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}

/* =========================
   Optional: ẩn nút search nếu trang không có publications/dialog
   ========================= */
function adjustHeaderActionsForPage() {
  const searchBtn = document.getElementById("searchBtn");
  const searchDlg = document.getElementById("searchDialog");
  const pubList = document.getElementById("pubList");

  if (!pubList || !searchDlg) {
    if (searchBtn) searchBtn.style.display = "none";
  }
}

/* =========================
   Handle hash on load (cùng trang)
   ========================= */
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
   MAIN
   ========================= */
(async function init() {
  await includePartials();

  // Theme init + toggle
  setTheme(getInitialTheme());
  const themeToggle = document.getElementById("themeToggle");
  themeToggle?.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "dark" ? "light" : "dark");
  });

  // Year
  const y = document.getElementById("yearNow");
  if (y) y.textContent = new Date().getFullYear();

  setupMobileNav();
  setupTabClickScroll();
  setupScrollSpy();

  adjustHeaderActionsForPage();
  handleInitialHash();

  /* ===== Publications ===== */
  const hasPubList = !!document.getElementById("pubList");
  if (hasPubList && typeof loadPublications === "function") {
    try {
      const pubs = await loadPublications();

      const pubList = document.getElementById("pubList");
      const pubFilter = document.getElementById("pubFilter");
      const pubSort = document.getElementById("pubSort");

      const redraw = () => {
        const q = pubFilter?.value || "";
        const mode = pubSort?.value || "year_desc";
        const filtered = filterPubs(pubs, q);
        const sorted = sortPubs(filtered, mode);
        renderPubs(pubList, sorted);
      };

      pubFilter?.addEventListener("input", redraw);
      pubSort?.addEventListener("change", redraw);
      redraw();

      if (document.getElementById("searchDialog")) {
        setupSearchDialog(pubs);
      }
    } catch (e) {
      console.error(e);
    }
  }

  /* ===== Projects ===== */
  const hasProjList = !!document.getElementById("projList");
  if (hasProjList && typeof loadProjects === "function") {
    try {
      const projs = await loadProjects();

      const projList = document.getElementById("projList");
      const projFilter = document.getElementById("projFilter");

      const redraw = () => {
        const q = projFilter?.value || "";
        const filtered = filterProjects(projs, q);
        renderProjects(projList, filtered);
      };

      projFilter?.addEventListener("input", redraw);
      redraw();
    } catch (e) {
      console.error(e);
    }
  }
})();
