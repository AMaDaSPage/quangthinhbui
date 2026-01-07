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

// /* =========================
//    Tabs click:
//    - chỉ smooth-scroll khi cùng trang và section tồn tại
//    - nếu khác trang (contact.html...) thì để browser tự điều hướng
//    ========================= */
// function setupTabClickScroll() {
//   const links = Array.from(document.querySelectorAll(".nav-link"));
//   const nav = document.getElementById("primaryNav");
//   const toggle = document.getElementById("navToggle");

//   links.forEach((a) => {
//     a.addEventListener("click", (e) => {
//       const id = a.dataset.section;
//       if (!id) return; // link không có section => để default

//       // URL đầy đủ của link
//       const url = new URL(a.getAttribute("href"), window.location.href);

//       // Nếu link trỏ sang trang khác => cho chuyển trang
//       if (url.pathname !== window.location.pathname) return;

//       // Nếu section không tồn tại trên trang này => cho default (đỡ chặn)
//       const target = document.getElementById(id);
//       if (!target) return;

//       // Cùng trang + có target => smooth scroll
//       e.preventDefault();

//       // đóng menu mobile nếu đang mở
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

// /* =========================
//    Mobile nav
//    ========================= */
// function setupMobileNav() {
//   const toggle = document.getElementById("navToggle");
//   const nav = document.getElementById("primaryNav");
//   if (!toggle || !nav) return;

//   toggle.addEventListener("click", () => {
//     const open = nav.classList.toggle("open");
//     toggle.setAttribute("aria-expanded", String(open));
//   });
// }

// /* =========================
//    Optional: ẩn nút search nếu trang không có publications/dialog
//    ========================= */
// function adjustHeaderActionsForPage() {
//   const searchBtn = document.getElementById("searchBtn");
//   const searchDlg = document.getElementById("searchDialog");
//   const pubList = document.getElementById("pubList");

//   // Nếu không có publications (contact page) hoặc không có dialog => ẩn nút search
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

//   // chỉ scroll nếu section tồn tại trên trang hiện tại
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
//   await includePartials(); // load header/footer/sections trước

//   // Theme init + toggle
//   setTheme(getInitialTheme());
//   const themeToggle = document.getElementById("themeToggle");
//   themeToggle?.addEventListener("click", () => {
//     const current = document.documentElement.getAttribute("data-theme");
//     setTheme(current === "dark" ? "light" : "dark");
//   });

//   // Year (nếu footer có yearNow)
//   const y = document.getElementById("yearNow");
//   if (y) y.textContent = new Date().getFullYear();

//   setupMobileNav();
//   setupTabClickScroll();
//   setupScrollSpy();

//   adjustHeaderActionsForPage();
//   handleInitialHash();

//   /* ===== Publications: chỉ chạy nếu trang có pubList và có hàm loadPublications ===== */
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

//       // dialog search chỉ khi tồn tại
//       if (document.getElementById("searchDialog")) {
//         setupSearchDialog(pubs);
//       }
//     } catch (e) {
//       console.error(e);
//     }
//   }

//   /* ===== Projects: chỉ chạy nếu trang có projList và có hàm loadProjects ===== */
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
   Env detection
   ========================= */
function isLocalEnv() {
  return (
    location.protocol === "file:" ||
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1" ||
    location.hostname === "[::1]"
  );
}

/* =========================
   Partials include
   - normalize URL để fetch luôn đúng từ root
   ========================= */
async function includePartials() {
  const nodes = document.querySelectorAll("[data-include]");
  await Promise.all(
    [...nodes].map(async (el) => {
      let url = el.getAttribute("data-include");
      if (!url) return;

      // Chuẩn hoá đường dẫn include: luôn tính từ root (tránh lỗi khi đang ở /projects, /publications...)
      url = url.trim();
      if (!url.startsWith("/")) url = "/" + url.replace(/^\.?\//, "");

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

/* =========================
   Rewrite nav links on PROD
   - Local: giữ link .html (khỏi cần rewrite)
   - Vercel/Prod: đổi sang /publications, /projects, /contact
   ========================= */
function rewriteNavLinksForProd() {
  if (isLocalEnv()) return;

  const brand = document.querySelector("a.brand");
  if (brand) brand.setAttribute("href", "/");

  const map = {
    home: "/",
    publications: "/publications",
    projects: "/projects",
    contact: "/contact",
  };

  document.querySelectorAll(".nav-link[data-section]").forEach((a) => {
    const sec = a.dataset.section;
    if (!sec || !map[sec]) return;
    a.setAttribute("href", map[sec]);
  });
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
   - cùng trang + có section => smooth scroll
   - khác trang => để browser điều hướng
   - PROD: không đẩy # lên URL (giữ URL sạch)
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

      // Nếu đi sang trang khác => cho điều hướng bình thường
      if (url.pathname !== window.location.pathname) return;

      // Nếu section không tồn tại => cho default
      const target = document.getElementById(id);
      if (!target) return;

      // Cùng trang + có target => smooth scroll
      e.preventDefault();

      // đóng menu mobile nếu đang mở
      if (nav?.classList.contains("open")) {
        nav.classList.remove("open");
        toggle?.setAttribute("aria-expanded", "false");
      }

      setActiveTab(id);
      smoothScrollToId(id);

      // Local: có thể giữ hash để test
      if (isLocalEnv()) {
        history.pushState(null, "", `#${id}`);
      } else {
        // PROD: giữ URL sạch (không #)
        history.replaceState(null, "", url.pathname + url.search);
      }
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
   Handle hash on load
   - PROD: nếu có hash thì scroll xong bỏ hash để URL sạch
   ========================= */
function handleInitialHash() {
  const id = (location.hash || "").replace("#", "");
  if (!id) return;

  const target = document.getElementById(id);
  if (!target) return;

  setTimeout(() => {
    setActiveTab(id);
    smoothScrollToId(id);

    if (!isLocalEnv()) {
      history.replaceState(null, "", location.pathname + location.search);
    }
  }, 0);
}

/* =========================
   MAIN
   ========================= */
(async function init() {
  await includePartials();          // load header/footer/sections trước
  rewriteNavLinksForProd();         // quan trọng: chạy SAU includePartials

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
