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

function enableCardClicks(container) {
  if (!container) return;
  container.addEventListener("click", (e) => {
    if (e.target.closest("a")) return;
    const card = e.target.closest(".card[data-href]");
    if (!card) return;
    const href = card.getAttribute("data-href");
    if (href) window.open(href, "_blank", "noreferrer");
  });
}

function enableYearBarCollapse(container, collapsedYears) {
  if (!container) return;

  const setExpanded = (barEl, expanded) => {
    barEl.setAttribute("aria-expanded", expanded ? "true" : "false");
  };

  container.addEventListener("click", (e) => {
    const bar = e.target.closest(".year-bar");
    if (!bar || !container.contains(bar)) return;

    const group = bar.closest(".year-group");
    if (!group) return;

    const yearKey = group.getAttribute("data-year") || "";
    if (!yearKey) return;

    const willCollapse = !group.classList.contains("is-collapsed");

    if (willCollapse) collapsedYears.add(yearKey);
    else collapsedYears.delete(yearKey);

    group.classList.toggle("is-collapsed", willCollapse);
    setExpanded(bar, !willCollapse);
  });

  container.addEventListener("keydown", (e) => {
    const bar = e.target.closest(".year-bar");
    if (!bar || !container.contains(bar)) return;

    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    bar.click();
  });
}

function joinNice(arr) {
  const a = Array.isArray(arr) ? arr.filter(Boolean) : [];
  return a.join(", ");
}

function getPrimaryHref(p) {
  const links = p.links || {};
  return links.repo || links.demo || p.url || "";
}

function getYear(p) {
  const y = Number(p.year);
  if (Number.isFinite(y) && y > 0) return y;

  const period = String(p.period ?? "");
  const m = period.match(/(19|20)\d{2}/);
  if (m) return Number(m[0]);

  return null;
}

function statusBadge(status) {
  const s = String(status || "").trim();
  if (!s) return "";

  const low = s.toLowerCase();
  const cls =
    low.includes("in progress") ? "badge--inprogress" :
    low.includes("finished") ? "badge--finished" :
    low.includes("approaching completion") ? "badge--apletion" :
    "badge--status";

  return `<span class="badge ${cls}">${escapeHtml(s)}</span>`;
}

function tagBadge(text) {
  const t = String(text || "").trim();
  if (!t) return "";
  return `<span class="badge badge--tag">${escapeHtml(t)}</span>`;
}

function shortAgencyName(agency) {
  const s = String(agency || "").trim();
  if (!s) return "";
  return s.includes("(") ? s.split("(")[0].trim() : s;
}

function fundingAgencyCode(funding, joiner = "_") {
  const agencyRaw = funding?.agency ? String(funding.agency).trim() : "";
  const agency = shortAgencyName(agencyRaw);
  const code = funding?.code ? String(funding.code).trim() : "";

  if (!agency && !code) return "";
  if (agency && code) {
    const aUp = agency.toUpperCase();
    const cUp = code.toUpperCase();
    if (cUp.startsWith(aUp)) return code;
    return `${agency}${joiner}${code}`;
  }
  return agency || code;
}

function projCard(p) {
  const primaryHref = getPrimaryHref(p);
  const y = getYear(p);

  const funding = p.funding || {};
  const agencyCode = fundingAgencyCode(funding);

  const periodText =
    (p.period ? String(p.period).trim() : "") ||
    (y ? String(y) : "");

  const piLine = joinNice(p.pi);

  const titleHtml = primaryHref
    ? `<a class="card-title-link" href="${escapeHtml(primaryHref)}" target="_blank" rel="noreferrer">${escapeHtml(p.name || "")}</a>`
    : `${escapeHtml(p.name || "")}`;

  const titleBadgesHtml =
    (periodText || agencyCode)
      ? `<div class="badges proj-card__title-badges">
           ${periodText ? tagBadge(periodText) : ""}
           ${agencyCode ? tagBadge(agencyCode) : ""}
         </div>`
      : "";

  const statusHtml = statusBadge(p.status);

  const actions = [];
  if (p.links?.repo) {
    actions.push(
      `<a class="link" href="${escapeHtml(p.links.repo)}" target="_blank" rel="noreferrer">Repo</a>`
    );
  }
  if (p.links?.demo) {
    actions.push(
      `<a class="link" href="${escapeHtml(p.links.demo)}" target="_blank" rel="noreferrer">Demo</a>`
    );
  }

  return `
    <article class="card proj-card" ${primaryHref ? `data-href="${escapeHtml(primaryHref)}"` : ""}>
      <div class="proj-card__row">
        <div class="proj-card__body">

          <div class="proj-card__title-row">
            <h3 class="proj-card__title">${titleHtml}</h3>
            ${titleBadgesHtml}
          </div>

          ${(piLine || statusHtml) ? `
            <div class="proj-card__pi-row">
              ${piLine ? `<div class="proj-card__pi">PI: ${escapeHtml(piLine)}</div>` : `<div></div>`}
              ${statusHtml ? `<div class="proj-card__pi-status">${statusHtml}</div>` : ""}
            </div>
          ` : ""}

          ${actions.length ? `<div class="card-actions proj-card__actions">${actions.join("")}</div>` : ""}
        </div>
      </div>
    </article>
  `;
}

function filterByText(projects, q) {
  const s = (q || "").trim().toLowerCase();
  if (!s) return projects;

  return projects.filter((p) => {
    const funding = p.funding || {};
    const agencyCode = fundingAgencyCode(funding);

    const blob = [
      p.id, p.name, p.status, p.period, p.year,
      funding.agency, funding.code, agencyCode,
      ...(p.pi || []),
    ].join(" ").toLowerCase();

    return blob.includes(s);
  });
}

function filterByYear(projects, yearValue) {
  if (!yearValue || yearValue === "all") return projects;
  if (yearValue === "unknown") return projects.filter((p) => !getYear(p));

  const y = Number(yearValue);
  return projects.filter((p) => getYear(p) === y);
}

function sortItems(items, mode) {
  const arr = [...items];

  if (mode !== "year_asc") {
    arr.sort((a, b) => {
      const ya = getYear(a) ?? -1;
      const yb = getYear(b) ?? -1;
      if (ya !== yb) return yb - ya;
      return String(a.name || "").localeCompare(String(b.name || ""));
    });
    return arr;
  }

  arr.sort((a, b) => {
    const ya = getYear(a) ?? -1;
    const yb = getYear(b) ?? -1;
    if (ya !== yb) return ya - yb;
    return String(a.name || "").localeCompare(String(b.name || ""));
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

function groupByYear(items, mode) {
  const map = new Map();
  for (const it of items) {
    const y = getYear(it);
    const key = Number.isFinite(y) && y > 0 ? String(y) : "unknown";
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(it);
  }

  const years = [...map.keys()].filter((k) => k !== "unknown").map(Number);
  if (mode === "year_asc") years.sort((a, b) => a - b);
  else years.sort((a, b) => b - a);

  const ordered = years.map(String);
  if (map.has("unknown")) ordered.push("unknown");

  return ordered.map((k) => ({ yearKey: k, items: map.get(k) || [] }));
}

function yearSection(yearKey, items, collapsedYears) {
  const label = yearKey === "unknown" ? "Unknown" : yearKey;
  const count = items.length;

  const isCollapsed = collapsedYears?.has(yearKey);
  const gridId = `projgrid-${yearKey}`;

  return `
    <section class="year-group ${isCollapsed ? "is-collapsed" : ""}"
             data-year="${escapeHtml(yearKey)}"
             aria-label="Year ${escapeHtml(label)}">

      <div class="year-bar" role="button" tabindex="0"
           aria-expanded="${isCollapsed ? "false" : "true"}"
           aria-controls="${escapeHtml(gridId)}">
        <div class="year-bar__left">${escapeHtml(label)}</div>
        <div class="year-bar__right">
          ${count} item(s)
          <span class="year-bar__chev" aria-hidden="true">▾</span>
        </div>
      </div>

      <div id="${escapeHtml(gridId)}" class="proj-grid">
        ${items.map(projCard).join("")}
      </div>
    </section>
  `;
}

function renderByYear(targetEl, items, mode, collapsedYears) {
  if (!targetEl) return;
  const groups = groupByYear(items, mode);
  targetEl.innerHTML = groups
    .map((g) => yearSection(g.yearKey, g.items, collapsedYears))
    .join("");
}

/* =========================
   PUBLIC ENTRYPOINT
   ========================= */
window.initProjects = async function initProjects(options) {
  const opt = options || {};
  const target = document.getElementById(opt.targetId || "projList");
  const filterEl = document.getElementById(opt.filterId || "projFilter");
  const yearEl = document.getElementById(opt.yearId || "projYear");
  const jsonUrl = opt.jsonUrl || "/projects.json";

  if (!target) return;

  const collapsedYears = new Set();

  try {
    const all = await loadProjects(jsonUrl);

    populateYearSelect(yearEl, all);
    enableCardClicks(target);
    enableYearBarCollapse(target, collapsedYears);

    const redraw = () => {
      const q = filterEl?.value || "";
      const yearValue = yearEl?.value || "all";
      const mode = "year_desc";

      const step1 = filterByText(all, q);
      const step2 = filterByYear(step1, yearValue);
      const sorted = sortItems(step2, mode);

      renderByYear(target, sorted, mode, collapsedYears);
    };

    filterEl?.addEventListener("input", redraw);
    yearEl?.addEventListener("change", redraw);

    redraw();
  } catch (e) {
    console.error(e);
    target.innerHTML =
      `<div class="card"><h3 class="card-title">Projects</h3><p class="card-text">Cannot load projects.json</p></div>`;
  }
};
