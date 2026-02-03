// function escapeHtml(str) {
//   return String(str ?? "")
//     .replaceAll("&", "&amp;")
//     .replaceAll("<", "&lt;")
//     .replaceAll(">", "&gt;")
//     .replaceAll('"', "&quot;")
//     .replaceAll("'", "&#039;");
// }

// async function loadPublications() {
//   const res = await fetch("/publications.json", { cache: "no-store" });
//   if (!res.ok) throw new Error("Cannot load publications.json");
//   return await res.json();
// }

// function enableCardClicks(container) {
//   if (!container) return;
//   container.addEventListener("click", (e) => {
//     if (e.target.closest("a")) return;
//     const card = e.target.closest(".card[data-href]");
//     if (!card) return;
//     const href = card.getAttribute("data-href");
//     if (href) window.open(href, "_blank", "noreferrer");
//   });
// }

// function enableYearBarCollapse(container, collapsedYears) {
//   if (!container) return;

//   const setExpanded = (barEl, expanded) => {
//     barEl.setAttribute("aria-expanded", expanded ? "true" : "false");
//   };

//   container.addEventListener("click", (e) => {
//     const bar = e.target.closest(".year-bar");
//     if (!bar || !container.contains(bar)) return;

//     const group = bar.closest(".year-group");
//     if (!group) return;

//     const yearKey = group.getAttribute("data-year") || "";
//     if (!yearKey) return;

//     const willCollapse = !group.classList.contains("is-collapsed");
//     if (willCollapse) collapsedYears.add(yearKey);
//     else collapsedYears.delete(yearKey);

//     group.classList.toggle("is-collapsed", willCollapse);
//     setExpanded(bar, !willCollapse);
//   });

//   container.addEventListener("keydown", (e) => {
//     const bar = e.target.closest(".year-bar");
//     if (!bar || !container.contains(bar)) return;

//     if (e.key !== "Enter" && e.key !== " ") return;
//     e.preventDefault();
//     bar.click();
//   });
// }

// function normalizeTags(pub) {
//   const a = Array.isArray(pub?.tag) ? pub.tag : [];
//   const b = Array.isArray(pub?.tags) ? pub.tags : [];
//   const out = [];

//   for (const t of [...a, ...b]) {
//     const v = String(t ?? "").trim();
//     if (!v) continue;
//     const exists = out.some((x) => x.toLowerCase() === v.toLowerCase());
//     if (!exists) out.push(v);
//   }
//   return out;
// }

// function getPubType(pub) {
//   const tags = normalizeTags(pub).map((t) => t.toLowerCase());
//   const type = String(pub?.type ?? "").trim().toLowerCase();
//   const venue = String(pub?.venue ?? "").toLowerCase();

//   if (tags.includes("preprint") || type === "preprint" || venue.includes("arxiv")) return "preprint";
//   if (tags.includes("conference") || type === "conference") return "conference";
//   if (tags.includes("journal") || type === "journal") return "journal";
//   return "other";
// }

// function getPubKind(pub) {
//   const t = getPubType(pub);
//   if (t === "preprint") return { letter: "P", cls: "kind--preprint" };
//   if (t === "conference") return { letter: "C", cls: "kind--conf" };
//   if (t === "journal") return { letter: "J", cls: "kind--journal" };
//   return { letter: "•", cls: "kind--other" };
// }

// function cleanDetailsForMeta(details) {
//   return String(details ?? "").replace(/\s*\(\s*\d{4}\s*\)\s*$/, "").trim();
// }

// function normalizeQuartile(q) {
//   const s = String(q ?? "").trim().toUpperCase();
//   return /^Q[1-4]$/.test(s) ? s : "";
// }

// function isScopusIndexed(idx) {
//   const s = idx?.scopus;
//   if (s === true) return true;
//   if (typeof s === "string" && s.trim() !== "") return true;
//   return false;
// }

// function getScopusQuartile(idx) {
//   const s = idx?.scopus;
//   if (typeof s === "string") {
//     const q = normalizeQuartile(s);
//     if (q) return q;
//   }
//   return normalizeQuartile(idx?.scopus_q);
// }

// function isWosIndexed(idx) {
//   if (idx?.jcr_q) return true;
//   const w = idx?.wos;
//   if (w === true) return true;
//   if (typeof w === "string" && w.trim() !== "") return true;
//   return false;
// }

// /** ✅ chỉ coi là contrib badge nếu là 1st/corr */
// function isContribStatus(status) {
//   const s = String(status || "").trim().toLowerCase();
//   if (!s) return false;
//   return s === "1st" || s === "corr" || s.includes("1st") || s.includes("corr");
// }

// function pubCard(pub) {
//   const links = pub.links || {};
//   const primaryHref = pub.url || links.paper || "";

//   const kind = getPubKind(pub);

//   const idx = pub.indexing || {};
//   const wosLabel = idx.wos ? String(idx.wos) : "WoS";

//   const scopusOn = isScopusIndexed(idx);
//   const scopusQ = getScopusQuartile(idx);

//   const statusRaw = String(pub.status || "").trim();
//   const statusBadgeHtml = statusRaw
//     ? `<span class="badge badge--status">${escapeHtml(statusRaw)}</span>`
//     : "";

//   const contribBadgeHtml = statusRaw && isContribStatus(statusRaw) ? statusBadgeHtml : "";
//   const otherStatusBadgeHtml = statusRaw && !isContribStatus(statusRaw) ? statusBadgeHtml : "";

//   const idxBadges = [
//     idx.jcr_q ? `<span class="badge badge--isi">${escapeHtml(wosLabel)}/${escapeHtml(idx.jcr_q)}</span>` : "",
//     !idx.jcr_q && idx.wos ? `<span class="badge badge--wos">WoS/${escapeHtml(idx.wos)}</span>` : "",
//     scopusOn
//       ? `<span class="badge badge--scopus">${scopusQ ? `Scopus/${escapeHtml(scopusQ)}` : "Scopus"}</span>`
//       : "",
//   ].filter(Boolean).join("");

//   const tags = normalizeTags(pub);
//   const extraTags = tags.filter((t) => !["journal", "conference"].includes(String(t).toLowerCase()));
//   const tagBadges = extraTags.map((t) => `<span class="badge badge--tag">${escapeHtml(t)}</span>`).join("");

//   const rightBadgesInner = [otherStatusBadgeHtml, idxBadges, tagBadges].filter(Boolean).join("");
//   const rightBadgesHtml = rightBadgesInner ? `<div class="badges">${rightBadgesInner}</div>` : "";

//   const actions = [
//     links.paper
//       ? `<a class="link" href="${escapeHtml(links.paper)}" target="_blank" rel="noreferrer">Paper</a>`
//       : "",
//     links.code
//       ? `<a class="link" href="${escapeHtml(links.code)}" target="_blank" rel="noreferrer">Code</a>`
//       : "",
//     links.slides
//       ? `<a class="link" href="${escapeHtml(links.slides)}" target="_blank" rel="noreferrer">Slides</a>`
//       : "",
//   ].filter(Boolean).join("");

//   const titleHtml = primaryHref
//     ? `<a class="card-title-link" href="${escapeHtml(primaryHref)}" target="_blank" rel="noreferrer">${escapeHtml(pub.title || "")}</a>`
//     : `${escapeHtml(pub.title || "")}`;

//   const metaLeftText = [
//     pub.venue ? escapeHtml(pub.venue) : "",
//     pub.details ? escapeHtml(cleanDetailsForMeta(pub.details)) : "",
//   ].filter(Boolean).join(", ");

//   const contribHtml = contribBadgeHtml
//     ? `<div class="badges badges--inline">${contribBadgeHtml}</div>`
//     : "";

//   return `
//     <article class="card pub-card" ${primaryHref ? `data-href="${escapeHtml(primaryHref)}"` : ""}>
//       <div class="pub-card__row">
//         <div class="pub-kind ${escapeHtml(kind.cls)}" aria-hidden="true">${escapeHtml(kind.letter)}</div>

//         <div class="pub-card__body">
//           <h3 class="pub-card__title">${titleHtml}</h3>

//           <div class="pub-card__meta">
//             <div class="pub-card__meta-left">
//               <div class="pub-card__meta-text">${metaLeftText}</div>
//               ${contribHtml}
//             </div>
//             <div class="pub-card__meta-right">${rightBadgesHtml}</div>
//           </div>

//           ${pub.authors ? `<div class="pub-card__authors">${escapeHtml(pub.authors)}</div>` : ""}

//           ${actions ? `<div class="card-actions pub-card__actions">${actions}</div>` : ""}
//         </div>
//       </div>
//     </article>
//   `;
// }

// function filterByText(pubs, q) {
//   const s = (q || "").trim().toLowerCase();
//   if (!s) return pubs;

//   return pubs.filter((p) => {
//     const tags = normalizeTags(p);

//     const idx = p.indexing || {};
//     const wosKey = (idx.wos || "wos").toLowerCase();
//     const scopusOn = isScopusIndexed(idx);
//     const scopusQ = getScopusQuartile(idx);

//     const blob = [
//       p.title, p.authors, p.venue, p.year, p.type, p.status,
//       p.details,

//       isWosIndexed(idx) ? "wos isi" : "",
//       idx.wos ? `wos ${idx.wos}` : "",
//       idx.jcr_q ? `${wosKey} ${idx.jcr_q}` : "",

//       scopusOn ? `scopus${scopusQ ? " " + scopusQ : ""}` : "",
//       scopusQ ? `scopus_q ${scopusQ}` : "",

//       ...tags,
//     ].join(" ").toLowerCase();

//     return blob.includes(s);
//   });
// }

// function filterByYear(pubs, yearValue) {
//   if (!yearValue || yearValue === "all") return pubs;
//   if (yearValue === "unknown") return pubs.filter((p) => !p.year);

//   const y = Number(yearValue);
//   return pubs.filter((p) => Number(p.year) === y);
// }

// function filterByType(pubs, typeValue) {
//   if (!typeValue || typeValue === "all") return pubs;
//   const t = String(typeValue).toLowerCase();
//   return pubs.filter((p) => getPubType(p) === t);
// }

// function filterByIndex(pubs, indexValue) {
//   if (!indexValue || indexValue === "all") return pubs;

//   const v = String(indexValue).toLowerCase();
//   if (v === "wos") {
//     return pubs.filter((p) => isWosIndexed(p.indexing || {}));
//   }
//   if (v === "scopus") {
//     return pubs.filter((p) => isScopusIndexed(p.indexing || {}));
//   }
//   return pubs;
// }

// function safeOrder(pub) {
//   const v = Number(pub?.order);
//   return Number.isFinite(v) ? v : Number.POSITIVE_INFINITY;
// }

// function compareWithinSameYear(a, b) {
//   const oa = safeOrder(a);
//   const ob = safeOrder(b);
//   if (oa !== ob) return oa - ob;
//   return String(a.title || "").localeCompare(String(b.title || ""));
// }

// function sortPubs(pubs, mode) {
//   const arr = [...pubs];

//   if (mode === "year_asc") {
//     arr.sort((a, b) => {
//       const ya = Number(a.year) || -1;
//       const yb = Number(b.year) || -1;
//       if (ya !== yb) return ya - yb;
//       return compareWithinSameYear(a, b);
//     });
//     return arr;
//   }

//   arr.sort((a, b) => {
//     const ya = Number(a.year) || -1;
//     const yb = Number(b.year) || -1;
//     if (ya !== yb) return yb - ya;
//     return compareWithinSameYear(a, b);
//   });

//   return arr;
// }

// function getUniqueYears(pubs) {
//   const years = new Set();
//   let hasUnknown = false;

//   for (const p of pubs) {
//     const y = Number(p.year);
//     if (Number.isFinite(y) && y > 0) years.add(y);
//     else hasUnknown = true;
//   }

//   return { years: [...years].sort((a, b) => b - a), hasUnknown };
// }

// function populateYearSelect(yearEl, pubsAll) {
//   if (!yearEl) return;

//   const { years, hasUnknown } = getUniqueYears(pubsAll);

//   yearEl.innerHTML =
//     `<option value="all">All</option>` +
//     years.map((y) => `<option value="${y}">${y}</option>`).join("") +
//     (hasUnknown ? `<option value="unknown">Unknown</option>` : "");
// }

// function groupByYear(pubs, mode) {
//   const map = new Map();
//   for (const p of pubs) {
//     const y = Number(p.year);
//     const key = Number.isFinite(y) && y > 0 ? String(y) : "unknown";
//     if (!map.has(key)) map.set(key, []);
//     map.get(key).push(p);
//   }

//   const years = [...map.keys()].filter((k) => k !== "unknown").map(Number);
//   if (mode === "year_asc") years.sort((a, b) => a - b);
//   else years.sort((a, b) => b - a);

//   const ordered = years.map(String);
//   if (map.has("unknown")) ordered.push("unknown");

//   return ordered.map((k) => {
//     const items = map.get(k) || [];
//     items.sort(compareWithinSameYear);
//     return { yearKey: k, items };
//   });
// }

// function yearSection(yearKey, items, collapsedYears) {
//   const label = yearKey === "unknown" ? "Unknown" : yearKey;
//   const count = items.length;

//   const isCollapsed = collapsedYears?.has(yearKey);
//   const gridId = `pubgrid-${yearKey}`;

//   return `
//     <section class="year-group ${isCollapsed ? "is-collapsed" : ""}" data-year="${escapeHtml(yearKey)}" aria-label="Year ${escapeHtml(label)}">
//       <div class="year-bar" role="button" tabindex="0"
//            aria-expanded="${isCollapsed ? "false" : "true"}"
//            aria-controls="${escapeHtml(gridId)}">
//         <div class="year-bar__left">${escapeHtml(label)}</div>
//         <div class="year-bar__right">
//           ${count} item(s)
//           <span class="year-bar__chev" aria-hidden="true">▾</span>
//         </div>
//       </div>

//       <div id="${escapeHtml(gridId)}" class="pub-grid">
//         ${items.map(pubCard).join("")}
//       </div>
//     </section>
//   `;
// }

// function renderPubsByYear(targetEl, pubs, mode, collapsedYears) {
//   if (!targetEl) return;
//   const groups = groupByYear(pubs, mode);
//   targetEl.innerHTML = groups.map((g) => yearSection(g.yearKey, g.items, collapsedYears)).join("");
// }

// (async function autoInitPublicationsIfStandalone() {
//   const target = document.getElementById("pubList");
//   const filterEl = document.getElementById("pubFilter");
//   const sortEl = document.getElementById("pubSort");
//   const yearEl = document.getElementById("pubYear");
//   const typeEl = document.getElementById("pubType");  
//   const indexEl = document.getElementById("pubIndex");

//   if (!target) return;

//   const collapsedYears = new Set();

//   try {
//     const pubsAll = await loadPublications();
//     populateYearSelect(yearEl, pubsAll);

//     enableCardClicks(target);
//     enableYearBarCollapse(target, collapsedYears);

//     const redraw = () => {
//       const q = filterEl?.value || "";
//       const mode = sortEl?.value || "year_desc";
//       const yearValue = yearEl?.value || "all";
//       const typeValue = typeEl?.value || "all";
//       const indexValue = indexEl?.value || "all";

//       const step1 = filterByText(pubsAll, q);
//       const step1b = filterByType(step1, typeValue);
//       const step1c = filterByIndex(step1b, indexValue);
//       const step2 = filterByYear(step1c, yearValue);
//       const sorted = sortPubs(step2, mode);

//       renderPubsByYear(target, sorted, mode, collapsedYears);
//     };

//     filterEl?.addEventListener("input", redraw);
//     sortEl?.addEventListener("change", redraw);
//     yearEl?.addEventListener("change", redraw);
//     typeEl?.addEventListener("change", redraw);
//     indexEl?.addEventListener("change", redraw); 

//     redraw();
//   } catch (e) {
//     console.error(e);
//     target.innerHTML =
//       `<div class="card"><h3 class="card-title">Publications</h3><p class="card-text">Cannot load publications.json</p></div>`;
//   }
// })();


// publications.js (NO ES MODULE)
// Expose: window.initPublications(options)

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadPublications(jsonUrl) {
  const url = jsonUrl || "publications.json";
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Cannot load publications.json");
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

function normalizeTags(pub) {
  const a = Array.isArray(pub?.tag) ? pub.tag : [];
  const b = Array.isArray(pub?.tags) ? pub.tags : [];
  const out = [];

  for (const t of [...a, ...b]) {
    const v = String(t ?? "").trim();
    if (!v) continue;
    const exists = out.some((x) => x.toLowerCase() === v.toLowerCase());
    if (!exists) out.push(v);
  }
  return out;
}

function getPubType(pub) {
  const tags = normalizeTags(pub).map((t) => t.toLowerCase());
  const type = String(pub?.type ?? "").trim().toLowerCase();
  const venue = String(pub?.venue ?? "").toLowerCase();

  if (tags.includes("preprint") || type === "preprint" || venue.includes("arxiv")) return "preprint";
  if (tags.includes("conference") || type === "conference") return "conference";
  if (tags.includes("journal") || type === "journal") return "journal";
  return "other";
}

function getPubKind(pub) {
  const t = getPubType(pub);
  if (t === "preprint") return { letter: "P", cls: "kind--preprint" };
  if (t === "conference") return { letter: "C", cls: "kind--conf" };
  if (t === "journal") return { letter: "J", cls: "kind--journal" };
  return { letter: "•", cls: "kind--other" };
}

function cleanDetailsForMeta(details) {
  return String(details ?? "").replace(/\s*\(\s*\d{4}\s*\)\s*$/, "").trim();
}

function normalizeQuartile(q) {
  const s = String(q ?? "").trim().toUpperCase();
  return /^Q[1-4]$/.test(s) ? s : "";
}

function isScopusIndexed(idx) {
  const s = idx?.scopus;
  if (s === true) return true;
  if (typeof s === "string" && s.trim() !== "") return true;
  return false;
}

function getScopusQuartile(idx) {
  const s = idx?.scopus;
  if (typeof s === "string") {
    const q = normalizeQuartile(s);
    if (q) return q;
  }
  return normalizeQuartile(idx?.scopus_q);
}

function isWosIndexed(idx) {
  if (idx?.jcr_q) return true;
  const w = idx?.wos;
  if (w === true) return true;
  if (typeof w === "string" && w.trim() !== "") return true;
  return false;
}

/** ✅ only treat as contrib badge if 1st/corr */
function isContribStatus(status) {
  const s = String(status || "").trim().toLowerCase();
  if (!s) return false;
  return s === "1st" || s === "corr" || s.includes("1st") || s.includes("corr");
}

function pubCard(pub) {
  const links = pub.links || {};
  const primaryHref = pub.url || links.paper || "";

  const kind = getPubKind(pub);

  const idx = pub.indexing || {};
  const wosLabel = idx.wos ? String(idx.wos) : "WoS";

  const scopusOn = isScopusIndexed(idx);
  const scopusQ = getScopusQuartile(idx);

  const statusRaw = String(pub.status || "").trim();
  const statusBadgeHtml = statusRaw
    ? `<span class="badge badge--status">${escapeHtml(statusRaw)}</span>`
    : "";

  const contribBadgeHtml = statusRaw && isContribStatus(statusRaw) ? statusBadgeHtml : "";
  const otherStatusBadgeHtml = statusRaw && !isContribStatus(statusRaw) ? statusBadgeHtml : "";

  const idxBadges = [
    idx.jcr_q ? `<span class="badge badge--isi">${escapeHtml(wosLabel)}/${escapeHtml(idx.jcr_q)}</span>` : "",
    !idx.jcr_q && idx.wos ? `<span class="badge badge--wos">WoS/${escapeHtml(idx.wos)}</span>` : "",
    scopusOn
      ? `<span class="badge badge--scopus">${scopusQ ? `Scopus/${escapeHtml(scopusQ)}` : "Scopus"}</span>`
      : "",
  ].filter(Boolean).join("");

  const tags = normalizeTags(pub);
  const extraTags = tags.filter((t) => !["journal", "conference"].includes(String(t).toLowerCase()));
  const tagBadges = extraTags.map((t) => `<span class="badge badge--tag">${escapeHtml(t)}</span>`).join("");

  const rightBadgesInner = [otherStatusBadgeHtml, idxBadges, tagBadges].filter(Boolean).join("");
  const rightBadgesHtml = rightBadgesInner ? `<div class="badges">${rightBadgesInner}</div>` : "";

  const actions = [
    links.paper
      ? `<a class="link" href="${escapeHtml(links.paper)}" target="_blank" rel="noreferrer">Paper</a>`
      : "",
    links.code
      ? `<a class="link" href="${escapeHtml(links.code)}" target="_blank" rel="noreferrer">Code</a>`
      : "",
    links.slides
      ? `<a class="link" href="${escapeHtml(links.slides)}" target="_blank" rel="noreferrer">Slides</a>`
      : "",
  ].filter(Boolean).join("");

  const titleHtml = primaryHref
    ? `<a class="card-title-link" href="${escapeHtml(primaryHref)}" target="_blank" rel="noreferrer">${escapeHtml(pub.title || "")}</a>`
    : `${escapeHtml(pub.title || "")}`;

  const metaLeftText = [
    pub.venue ? escapeHtml(pub.venue) : "",
    pub.details ? escapeHtml(cleanDetailsForMeta(pub.details)) : "",
  ].filter(Boolean).join(", ");

  const contribHtml = contribBadgeHtml
    ? `<div class="badges badges--inline">${contribBadgeHtml}</div>`
    : "";

  return `
    <article class="card pub-card" ${primaryHref ? `data-href="${escapeHtml(primaryHref)}"` : ""}>
      <div class="pub-card__row">
        <div class="pub-kind ${escapeHtml(kind.cls)}" aria-hidden="true">${escapeHtml(kind.letter)}</div>

        <div class="pub-card__body">
          <h3 class="pub-card__title">${titleHtml}</h3>

          <div class="pub-card__meta">
            <div class="pub-card__meta-left">
              <div class="pub-card__meta-text">${metaLeftText}</div>
              ${contribHtml}
            </div>
            <div class="pub-card__meta-right">${rightBadgesHtml}</div>
          </div>

          ${pub.authors ? `<div class="pub-card__authors">${escapeHtml(pub.authors)}</div>` : ""}

          ${actions ? `<div class="card-actions pub-card__actions">${actions}</div>` : ""}
        </div>
      </div>
    </article>
  `;
}

function filterByText(pubs, q) {
  const s = (q || "").trim().toLowerCase();
  if (!s) return pubs;

  return pubs.filter((p) => {
    const tags = normalizeTags(p);

    const idx = p.indexing || {};
    const wosKey = (idx.wos || "wos").toLowerCase();
    const scopusOn = isScopusIndexed(idx);
    const scopusQ = getScopusQuartile(idx);

    const blob = [
      p.title, p.authors, p.venue, p.year, p.type, p.status,
      p.details,

      isWosIndexed(idx) ? "wos isi" : "",
      idx.wos ? `wos ${idx.wos}` : "",
      idx.jcr_q ? `${wosKey} ${idx.jcr_q}` : "",

      scopusOn ? `scopus${scopusQ ? " " + scopusQ : ""}` : "",
      scopusQ ? `scopus_q ${scopusQ}` : "",

      ...tags,
    ].join(" ").toLowerCase();

    return blob.includes(s);
  });
}

function filterByYear(pubs, yearValue) {
  if (!yearValue || yearValue === "all") return pubs;
  if (yearValue === "unknown") return pubs.filter((p) => !p.year);

  const y = Number(yearValue);
  return pubs.filter((p) => Number(p.year) === y);
}

function filterByType(pubs, typeValue) {
  if (!typeValue || typeValue === "all") return pubs;
  const t = String(typeValue).toLowerCase();
  return pubs.filter((p) => getPubType(p) === t);
}

function filterByIndex(pubs, indexValue) {
  if (!indexValue || indexValue === "all") return pubs;

  const v = String(indexValue).toLowerCase();
  if (v === "wos") return pubs.filter((p) => isWosIndexed(p.indexing || {}));
  if (v === "scopus") return pubs.filter((p) => isScopusIndexed(p.indexing || {}));
  return pubs;
}

function safeOrder(pub) {
  const v = Number(pub?.order);
  return Number.isFinite(v) ? v : Number.POSITIVE_INFINITY;
}

function compareWithinSameYear(a, b) {
  const oa = safeOrder(a);
  const ob = safeOrder(b);
  if (oa !== ob) return oa - ob;
  return String(a.title || "").localeCompare(String(b.title || ""));
}

function sortPubs(pubs, mode) {
  const arr = [...pubs];

  if (mode === "year_asc") {
    arr.sort((a, b) => {
      const ya = Number(a.year) || -1;
      const yb = Number(b.year) || -1;
      if (ya !== yb) return ya - yb;
      return compareWithinSameYear(a, b);
    });
    return arr;
  }

  arr.sort((a, b) => {
    const ya = Number(a.year) || -1;
    const yb = Number(b.year) || -1;
    if (ya !== yb) return yb - ya;
    return compareWithinSameYear(a, b);
  });

  return arr;
}

function getUniqueYears(pubs) {
  const years = new Set();
  let hasUnknown = false;

  for (const p of pubs) {
    const y = Number(p.year);
    if (Number.isFinite(y) && y > 0) years.add(y);
    else hasUnknown = true;
  }

  return { years: [...years].sort((a, b) => b - a), hasUnknown };
}

function populateYearSelect(yearEl, pubsAll) {
  if (!yearEl) return;

  const { years, hasUnknown } = getUniqueYears(pubsAll);

  yearEl.innerHTML =
    `<option value="all">All</option>` +
    years.map((y) => `<option value="${y}">${y}</option>`).join("") +
    (hasUnknown ? `<option value="unknown">Unknown</option>` : "");
}

function groupByYear(pubs, mode) {
  const map = new Map();
  for (const p of pubs) {
    const y = Number(p.year);
    const key = Number.isFinite(y) && y > 0 ? String(y) : "unknown";
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(p);
  }

  const years = [...map.keys()].filter((k) => k !== "unknown").map(Number);
  if (mode === "year_asc") years.sort((a, b) => a - b);
  else years.sort((a, b) => b - a);

  const ordered = years.map(String);
  if (map.has("unknown")) ordered.push("unknown");

  return ordered.map((k) => {
    const items = map.get(k) || [];
    items.sort(compareWithinSameYear);
    return { yearKey: k, items };
  });
}

function yearSection(yearKey, items, collapsedYears) {
  const label = yearKey === "unknown" ? "Unknown" : yearKey;
  const count = items.length;

  const isCollapsed = collapsedYears?.has(yearKey);
  const gridId = `pubgrid-${yearKey}`;

  return `
    <section class="year-group ${isCollapsed ? "is-collapsed" : ""}" data-year="${escapeHtml(yearKey)}" aria-label="Year ${escapeHtml(label)}">
      <div class="year-bar" role="button" tabindex="0"
           aria-expanded="${isCollapsed ? "false" : "true"}"
           aria-controls="${escapeHtml(gridId)}">
        <div class="year-bar__left">${escapeHtml(label)}</div>
        <div class="year-bar__right">
          ${count} item(s)
          <span class="year-bar__chev" aria-hidden="true">▾</span>
        </div>
      </div>

      <div id="${escapeHtml(gridId)}" class="pub-grid">
        ${items.map(pubCard).join("")}
      </div>
    </section>
  `;
}

function renderPubsByYear(targetEl, pubs, mode, collapsedYears) {
  if (!targetEl) return;
  const groups = groupByYear(pubs, mode);
  targetEl.innerHTML = groups.map((g) => yearSection(g.yearKey, g.items, collapsedYears)).join("");
}

/* =========================
   ✅ PUBLIC ENTRYPOINT
   ========================= */
window.initPublications = async function initPublications(options) {
  const opt = options || {};

  const target = document.getElementById(opt.targetId || "pubList");
  const filterEl = document.getElementById(opt.filterId || "pubFilter");
  const sortEl = document.getElementById(opt.sortId || "pubSort");
  const yearEl = document.getElementById(opt.yearId || "pubYear");
  const typeEl = document.getElementById(opt.typeId || "pubType");
  const indexEl = document.getElementById(opt.indexId || "pubIndex");

  if (!target) return;

  const collapsedYears = new Set();

  try {
    const pubsAll = await loadPublications(opt.jsonUrl);

    populateYearSelect(yearEl, pubsAll);
    enableCardClicks(target);
    enableYearBarCollapse(target, collapsedYears);

    const redraw = () => {
      const q = filterEl?.value || "";
      const mode = sortEl?.value || "year_desc";
      const yearValue = yearEl?.value || "all";
      const typeValue = typeEl?.value || "all";
      const indexValue = indexEl?.value || "all";

      const step1 = filterByText(pubsAll, q);
      const step1b = filterByType(step1, typeValue);
      const step1c = filterByIndex(step1b, indexValue);
      const step2 = filterByYear(step1c, yearValue);
      const sorted = sortPubs(step2, mode);

      renderPubsByYear(target, sorted, mode, collapsedYears);
    };

    filterEl?.addEventListener("input", redraw);
    sortEl?.addEventListener("change", redraw);
    yearEl?.addEventListener("change", redraw);
    typeEl?.addEventListener("change", redraw);
    indexEl?.addEventListener("change", redraw);

    redraw();
  } catch (e) {
    console.error(e);
    target.innerHTML =
      `<div class="card"><h3 class="card-title">Publications</h3><p class="card-text">Cannot load publications.json</p></div>`;
  }
};
