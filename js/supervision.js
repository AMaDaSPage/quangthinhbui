(function () {
  "use strict";

  function $(id) {
    return document.getElementById(id);
  }

  function normalizeType(type) {
    const t = String(type || "").toLowerCase().trim();
    if (t === "doctoral" || t === "phd" || t === "doctor") return "doctoral";
    if (t === "master" || t === "masters" || t === "master's") return "master";
    if (t === "intern" || t === "research intern") return "intern";
    return "all";
  }

  function getDisplayCategory(type) {
    if (type === "doctoral") return "Doctoral Students";
    if (type === "master") return "Master’s Students";
    if (type === "intern") return "Research Interns";
    return "";
  }

  function extractSortYear(item) {
    if (typeof item.year === "number") return item.year;

    const text = String(item.period || "");
    const m = text.match(/\b(20\d{2})\b/g);
    if (!m || !m.length) return 0;

    return Math.max(...m.map(Number));
  }

  function extractCodeNumber(code) {
    const text = String(code || "");
    const m = text.match(/\d+/);
    return m ? parseInt(m[0], 10) : -1;
  }

  function compareByCodeDesc(a, b) {
    const na = extractCodeNumber(a.code);
    const nb = extractCodeNumber(b.code);

    if (nb !== na) return nb - na;

    return String(b.code || "").localeCompare(String(a.code || ""), undefined, {
      numeric: true,
      sensitivity: "base"
    });
  }

  function formatItem(item) {
    const supervisorText = item.supervisor ? ` (${item.supervisor})` : "";

    return `
      <div class="sup-item">
        <div class="sup-item__line">
          <div class="sup-item__code">${item.code || ""}</div>
          <div class="sup-item__content">
            <span class="sup-item__student">${item.student || ""}</span>, 
            <span class="sup-item__title">“${item.title || ""}”</span>, 
            <span class="sup-item__school">${item.institution || ""}</span>, 
            <span class="sup-item__meta">${item.period || ""}</span><span class="sup-item__supervisor">${supervisorText}</span>
          </div>
        </div>
      </div>
    `;
  }

  function renderListByCategory(items, mountEl, currentType) {
    if (!items.length) {
      mountEl.innerHTML = `<p class="sup-empty">No supervision records found.</p>`;
      return;
    }

    const typeOrder = ["doctoral", "master", "intern"];

    const visibleTypes =
      currentType === "all" ? typeOrder : typeOrder.filter((t) => t === currentType);

    const html = visibleTypes
      .map((type) => {
        const groupItems = items
          .filter((item) => item.type === type)
          .sort(compareByCodeDesc);

        if (!groupItems.length) return "";

        return `
          <div class="sup-category">
            <h4 class="sup-category__title">${getDisplayCategory(type)}</h4>
            <div class="sup-list">
              ${groupItems.map(formatItem).join("")}
            </div>
          </div>
        `;
      })
      .join("");

    mountEl.innerHTML = html || `<p class="sup-empty">No supervision records found.</p>`;
  }

 
  async function loadJson(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Failed to load ${url} (${res.status})`);
    }
    return res.json();
  }

  window.initSupervision = async function initSupervision(opts = {}) {
    const targetEl = $(opts.targetId || "supList");
    const yearEl = $(opts.yearId || "supYear");
    const tabsEl = $(opts.typeTabsId || "supTypeTabs");
    const jsonUrl = opts.jsonUrl || "/supervision.json";

    if (!targetEl || !yearEl || !tabsEl) return;

    let data = [];
    try {
      data = await loadJson(jsonUrl);
    } catch (err) {
      console.error(err);
      targetEl.innerHTML = `<p class="sup-empty">Failed to load supervision data.</p>`;
      return;
    }

    const cleanData = Array.isArray(data)
      ? data.map((item) => ({
          ...item,
          type: normalizeType(item.type)
        }))
      : [];

    const years = [...new Set(cleanData.map(extractSortYear).filter(Boolean))].sort((a, b) => b - a);

    yearEl.innerHTML = `
      <option value="all">All</option>
      ${years.map((y) => `<option value="${y}">${y}</option>`).join("")}
    `;

    let currentType = "all";
    let currentYear = "all";

    function applyFilters() {
      let filtered = [...cleanData];

      if (currentType !== "all") {
        filtered = filtered.filter((item) => item.type === currentType);
      }

      if (currentYear !== "all") {
        filtered = filtered.filter((item) => String(extractSortYear(item)) === String(currentYear));
      }

      renderListByCategory(filtered, targetEl, currentType);
    
    }

    yearEl.addEventListener("change", () => {
      currentYear = yearEl.value;
      applyFilters();
    });

    applyFilters();
  };
})();