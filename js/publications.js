function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadPublications(jsonUrl) {
  const url = jsonUrl || "/publications.json";
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Cannot load publications.json");
  return await res.json();
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

function normalizeQuartile(q) {
  const s = String(q ?? "").trim().toUpperCase();
  return /^Q[1-4]$/.test(s) ? s : "";
}

function normalizeScopusRank(r) {
  const s = String(r ?? "").trim().toUpperCase();
  if (!s) return "";
  if (/^[ABCD]$/.test(s)) return s;
  const m = s.match(/\b(A|B|C|D)\b/);
  return m ? m[1] : "";
}

function getScopusQuartile(idx) {
  const q1 = normalizeQuartile(idx?.scopus_q);
  if (q1) return q1;

  const s = idx?.scopus;
  if (typeof s === "string") {
    const q2 = normalizeQuartile(s);
    if (q2) return q2;
  }
  return "";
}

function getScopusRank(idx) {
  const r1 = normalizeScopusRank(idx?.scopus_q);
  if (r1) return r1;

  const s = idx?.scopus;
  if (typeof s === "string") {
    const r2 = normalizeScopusRank(s);
    if (r2) return r2;
  }
  return "";
}

function isScopusIndexed(idx) {
  const s = idx?.scopus;
  if (s === true) return true;
  if (typeof s === "string" && s.trim() !== "") return true;
  if (getScopusQuartile(idx)) return true;
  if (getScopusRank(idx)) return true;
  return false;
}

function isWosIndexed(idx) {
  if (idx?.jcr_q) return true;
  const w = idx?.wos;
  if (w === true) return true;
  if (typeof w === "string" && w.trim() !== "") return true;
  return false;
}

function hasAuthorMarker(pub) {
  const tags = normalizeTags(pub);

  const fields = [
    pub?.title,
    pub?.authors,
    pub?.status,
    pub?.details,
    pub?.note,
    pub?.notes,
    pub?.remark,
    pub?.remarks,
    ...tags
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const patterns = [
    /\b1st\b/,
    /\b1\/st\b/,
    /\bfirst\s*author\b/,
    /\bcorr\b/,
    /\bcrr\b/,
    /\bcorresponding\b/,
    /\bcorresponding\s*author\b/
  ];

  return patterns.some((re) => re.test(fields));
}

function cleanRoleMarkers(value) {
  let s = String(value ?? "");
  if (!s) return "";

  s = s.replace(/\(\s*(?:1st|1\/st|first\s*author|corr|crr|corresponding|corresponding\s*author)(?:\s*\/\s*(?:1st|1\/st|first\s*author|corr|crr|corresponding|corresponding\s*author))*\s*\)/gi, "");
  s = s.replace(/\[\s*(?:1st|1\/st|first\s*author|corr|crr|corresponding|corresponding\s*author)(?:\s*\/\s*(?:1st|1\/st|first\s*author|corr|crr|corresponding|corresponding\s*author))*\s*\]/gi, "");
  s = s.replace(/\{\s*(?:1st|1\/st|first\s*author|corr|crr|corresponding|corresponding\s*author)(?:\s*\/\s*(?:1st|1\/st|first\s*author|corr|crr|corresponding|corresponding\s*author))*\s*\}/gi, "");
  s = s.replace(/\b(?:1st|1\/st|first\s*author|corr|crr|corresponding|corresponding\s*author)\b/gi, "");

  s = s.replace(/\s+,/g, ",");
  s = s.replace(/,\s*,/g, ", ");
  s = s.replace(/\s{2,}/g, " ");
  s = s.replace(/\(\s*\)/g, "");
  s = s.replace(/\[\s*\]/g, "");
  s = s.replace(/\{\s*\}/g, "");
  s = s.replace(/^[,\s\-–;:\/]+/, "");
  s = s.replace(/[,\s\-–;:\/]+$/, "");

  return s.trim();
}

function statusText(pub) {
  const s = cleanRoleMarkers(pub?.status || "");
  if (!s) return "";
  return `(${s})`;
}

function venueLine(pub) {
  const venue = cleanRoleMarkers(pub?.venue || "");
  const details = cleanRoleMarkers(pub?.details || "");

  if (!venue && !details) return "";

  if (details) {
    return `${venue ? `<strong>${escapeHtml(venue)}</strong>` : ""}${venue ? ", " : ""}${escapeHtml(details)}`;
  }

  return escapeHtml(venue);
}

function authorsLine(pub) {
  const a = cleanRoleMarkers(pub?.authors || "");
  if (!a) return "";
  return escapeHtml(a);
}

function getPrimaryHref(pub) {
  return String(pub?.url || pub?.links?.paper || "").trim();
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

/* 
  ===== Thứ tự để đánh mã từ dưới lên trên =====
  Năm cũ -> năm mới
  Trong cùng năm: order nhỏ trước
*/
function compareForDisplayCode(a, b) {
  const ya = Number(a?.year) || 0;
  const yb = Number(b?.year) || 0;
  if (ya !== yb) return ya - yb;

  const oa = safeOrder(a);
  const ob = safeOrder(b);
  if (oa !== ob) return oa - ob;

  return String(a?.title || "").localeCompare(String(b?.title || ""));
}

function assignDisplayCodes(pubs) {
  const journals = pubs
    .filter((p) => getPubType(p) === "journal")
    .slice()
    .sort(compareForDisplayCode);

  const conferences = pubs
    .filter((p) => getPubType(p) === "conference")
    .slice()
    .sort(compareForDisplayCode);

  const preprints = pubs
    .filter((p) => getPubType(p) === "preprint")
    .slice()
    .sort(compareForDisplayCode);

  journals.forEach((p, i) => {
    p._displayCode = `[J${i + 1}]`;
  });

  conferences.forEach((p, i) => {
    p._displayCode = `[C${i + 1}]`;
  });

  preprints.forEach((p, i) => {
    p._displayCode = `[P${i + 1}]`;
  });

  pubs.forEach((p) => {
    if (!p._displayCode) p._displayCode = "[…]";
  });

  return pubs;
}

function publicationCode(pub) {
  return String(pub?._displayCode || "[…]");
}

function publicationItem(pub) {
  const href = getPrimaryHref(pub);
  const code = publicationCode(pub);
  const status = statusText(pub);
  const venue = venueLine(pub);
  const authors = authorsLine(pub);
  const marker = hasAuthorMarker(pub) ? `<span class="pub-item__marker">*</span>` : "";

  const cleanTitle = cleanRoleMarkers(pub.title || "");
  const titleText = escapeHtml(cleanTitle);

  const titleInner = href
    ? `<a href="${escapeHtml(href)}" target="_blank" rel="noreferrer">${titleText}</a>${marker}`
    : `${titleText}${marker}`;

  return `
    <article class="pub-item">
      <div class="pub-item__head">
        <h3 class="pub-item__title">
          <span class="pub-item__code">${escapeHtml(code)}</span>${titleInner}
        </h3>
        ${status ? `<div class="pub-item__status">${escapeHtml(status)}</div>` : ""}
      </div>

      <div class="pub-item__body">
        ${venue ? `<p class="pub-item__venue">${venue}</p>` : ""}
        ${authors ? `<p class="pub-item__authors">${authors}</p>` : ""}
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
    const blob = [
      p.title,
      p.authors,
      p.venue,
      p.details,
      p.year,
      p.type,
      p.status,
      idx.wos,
      idx.jcr_q,
      idx.scopus,
      idx.scopus_q,
      ...tags
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

function sortPubs(pubs) {
  const arr = [...pubs];
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

function groupByYear(pubs) {
  const map = new Map();

  for (const p of pubs) {
    const y = Number(p.year);
    const key = Number.isFinite(y) && y > 0 ? String(y) : "unknown";
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(p);
  }

  const keys = [...map.keys()].sort((a, b) => {
    if (a === "unknown") return 1;
    if (b === "unknown") return -1;
    return Number(b) - Number(a);
  });

  return keys.map((key) => {
    const items = map.get(key) || [];
    items.sort(compareWithinSameYear);
    return { yearKey: key, items };
  });
}

function yearSection(yearKey, items) {
  const label = yearKey === "unknown" ? "Unknown" : yearKey;

  return `
    <section class="pub-year-group" aria-label="Year ${escapeHtml(label)}">
      <div class="pub-year-row">
        <div class="pub-year-label">${escapeHtml(label)}</div>
        <div class="pub-list">
          ${items.map(publicationItem).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderPublications(targetEl, items) {
  if (!targetEl) return;
  const groups = groupByYear(items);
  targetEl.innerHTML = groups.map((g) => yearSection(g.yearKey, g.items)).join("");
}

window.initPublications = async function initPublications(options) {
  const opt = options || {};

  const target = document.getElementById(opt.targetId || "pubList");
  const filterEl = document.getElementById(opt.filterId || "pubFilter");
  const yearEl = document.getElementById(opt.yearId || "pubYear");
  const typeEl = document.getElementById(opt.typeId || "pubType");
  const indexEl = document.getElementById(opt.indexId || "pubIndex");

  if (!target) return;

  try {
    let pubsAll = await loadPublications(opt.jsonUrl || "/publications.json");
    pubsAll = assignDisplayCodes(pubsAll);

    populateYearSelect(yearEl, pubsAll);

    const redraw = () => {
      const q = filterEl?.value || "";
      const yearValue = yearEl?.value || "all";
      const typeValue = typeEl?.value || "all";
      const indexValue = indexEl?.value || "all";

      const step1 = filterByText(pubsAll, q);
      const step2 = filterByType(step1, typeValue);
      const step3 = filterByIndex(step2, indexValue);
      const step4 = filterByYear(step3, yearValue);
      const sorted = sortPubs(step4);

      renderPublications(target, sorted);
    };

    filterEl?.addEventListener("input", redraw);
    yearEl?.addEventListener("change", redraw);
    typeEl?.addEventListener("change", redraw);
    indexEl?.addEventListener("change", redraw);

    redraw();
  } catch (e) {
    console.error(e);
    target.innerHTML = `<p>Cannot load publications.json</p>`;
  }
};