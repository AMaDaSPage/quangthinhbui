function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadProjects(jsonUrl) {
  const res = await fetch(jsonUrl || "/projects.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Cannot load projects.json");
  return await res.json();
}

function getYear(p) {
  const y = Number(p.year);
  if (Number.isFinite(y) && y > 0) return y;

  const period = String(p.period ?? "");
  const m = period.match(/(19|20)\d{2}/);
  if (m) return Number(m[0]);

  return null;
}

function getPrimaryHref(p) {
  const links = p.links || {};
  return links.repo || links.demo || p.url || "";
}

function joinNice(arr) {
  const a = Array.isArray(arr) ? arr.filter(Boolean) : [];
  return a.join(" and ");
}

function fullAgencyName(agency) {
  const agencyMap = {
    TGU: "Tien Giang University",
    NAFOSTED: "Vietnam National Foundation for Science and Technology Development (NAFOSTED)",
    VIASM: "Vietnam Institute for Advanced Study in Mathematics (VIASM)"
  };

  const raw = String(agency || "").trim();
  if (!raw) return "";
  return agencyMap[raw] || raw;
}

function fundingAgencyCode(funding, joiner = "_") {
  if (!funding) return "";

  const agency = String(funding.agency || "").trim();
  const code = String(funding.code || "").trim();

  if (!agency && !code) return "";
  if (agency && code) {
    const agencyUp = agency.toUpperCase();
    const codeUp = code.toUpperCase();

    if (codeUp.startsWith(agencyUp)) return code;
    return `${agency}${joiner}${code}`;
  }

  return agency || code || "";
}

function fundingDisplayText(funding) {
  if (!funding) return "";

  const fullName = fullAgencyName(funding.agency);
  const agencyCode = fundingAgencyCode(funding);

  if (fullName && agencyCode) return `${fullName} (${agencyCode})`;
  if (fullName) return fullName;
  if (agencyCode) return agencyCode;
  return "";
}

function normalizeRoleFromPi(piText) {
  const s = String(piText || "").toLowerCase();
  return s.includes("thinh") ? "PI" : "member";
}

function projectItem(p) {
  const codeMatch = String(p.id || "").match(/\d+/);
  const codeNum = codeMatch ? codeMatch[0] : "";
  const codeLabel = codeNum ? `[P${codeNum}]` : "";

  const title = `“${escapeHtml(p.name || "")}”`;
  const fundCode = escapeHtml(p.funding?.code || "");
  const agency = escapeHtml(fullAgencyName(p.funding?.agency || ""));
  const period = escapeHtml(p.period || "");

  const pi = joinNice(p.pi);
  const role = pi ? normalizeRoleFromPi(pi) : "";

  const contentParts = [
    `<span class="proj-title">${title}</span>`,
    fundCode,
    agency,
    period ? period : "",
    role ? `(${escapeHtml(role)})` : ""
  ].filter(Boolean);

  return `
    <div class="proj-item">
      <div class="proj-code">${escapeHtml(codeLabel)}</div>
      <div class="proj-content">
        ${contentParts.join(", ")}
      </div>
    </div>
  `;
}

function filterByYear(projects, yearValue) {
  if (!yearValue || yearValue === "all") return projects;
  if (yearValue === "unknown") return projects.filter((p) => !getYear(p));

  const y = Number(yearValue);
  return projects.filter((p) => getYear(p) === y);
}

function sortProjects(items) {
  const arr = [...items];

  arr.sort((a, b) => {
    const ya = getYear(a) ?? -1;
    const yb = getYear(b) ?? -1;
    if (ya !== yb) return yb - ya;

    const ida = Number(String(a.id || "").replace(/\D/g, "")) || 0;
    const idb = Number(String(b.id || "").replace(/\D/g, "")) || 0;
    return idb - ida;
  });

  return arr;
}

function getUniqueYears(items) {
  const years = new Set();
  let hasUnknown = false;

  for (const it of items) {
    const y = getYear(it);
    if (Number.isFinite(y) && y > 0) years.add(y);
    else hasUnknown = true;
  }

  return { years: [...years].sort((a, b) => b - a), hasUnknown };
}

function populateYearSelect(yearEl, itemsAll) {
  if (!yearEl) return;

  const { years, hasUnknown } = getUniqueYears(itemsAll);

  yearEl.innerHTML =
    `<option value="all">All</option>` +
    years.map((y) => `<option value="${y}">${y}</option>`).join("") +
    (hasUnknown ? `<option value="unknown">Unknown</option>` : "");
}

function groupByYear(items) {
  const map = new Map();

  for (const it of items) {
    const y = getYear(it);
    const key = Number.isFinite(y) && y > 0 ? String(y) : "unknown";

    if (!map.has(key)) map.set(key, []);
    map.get(key).push(it);
  }

  const keys = [...map.keys()].sort((a, b) => {
    if (a === "unknown") return 1;
    if (b === "unknown") return -1;
    return Number(b) - Number(a);
  });

  return keys.map((key) => ({
    yearKey: key,
    items: map.get(key) || []
  }));
}

function yearSection(yearKey, items) {
  const label = yearKey === "unknown" ? "Unknown" : yearKey;

  return `
    <section class="proj-year-group" aria-label="Year ${escapeHtml(label)}">
      <div class="proj-year-row">
        <div class="proj-year-label">${escapeHtml(label)}</div>
        <div class="proj-list">
          ${items.map(projectItem).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderProjects(targetEl, items) {
  if (!targetEl) return;

  const groups = groupByYear(items);
  targetEl.innerHTML = groups.map((g) => yearSection(g.yearKey, g.items)).join("");
}

window.initProjects = async function initProjects(options) {
  const opt = options || {};
  const target = document.getElementById(opt.targetId || "projList");
  const yearEl = document.getElementById(opt.yearId || "projYear");
  const jsonUrl = opt.jsonUrl || "/projects.json";

  if (!target) return;

  try {
    const all = await loadProjects(jsonUrl);

    populateYearSelect(yearEl, all);

    const redraw = () => {
      const yearValue = yearEl?.value || "all";
      const filtered = filterByYear(all, yearValue);
      const sorted = sortProjects(filtered);
      renderProjects(target, sorted);
    };

    yearEl?.addEventListener("change", redraw);
    redraw();
  } catch (e) {
    console.error(e);
    target.innerHTML = `<p>Cannot load projects.json</p>`;
  }
};