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

/* Thứ tự hiển thị thực tế trên trang:
   - năm mới ở trên
   - cùng năm thì order nhỏ ở trên */
function compareForDisplay(a, b) {
  const ya = Number(a?.year) || -1;
  const yb = Number(b?.year) || -1;

  if (ya !== yb) return yb - ya;

  const oa = safeOrder(a);
  const ob = safeOrder(b);
  if (oa !== ob) return oa - ob;

  return String(a?.title || "").localeCompare(String(b?.title || ""));
}

function assignCodesForType(pubs, typeName, prefix) {
  const items = pubs
    .filter((p) => getPubType(p) === typeName)
    .slice()
    .sort(compareForDisplay);

  const total = items.length;

  items.forEach((p, i) => {
    const num = total - i;
    const paddedNum = String(num).padStart(2, "0");
    p._displayCode = `[${prefix}${paddedNum}]`;
  });
}

function assignDisplayCodes(pubs) {
  assignCodesForType(pubs, "journal", "J");
  assignCodesForType(pubs, "conference", "C");
  assignCodesForType(pubs, "preprint", "P");

  pubs.forEach((p) => {
    if (!p._displayCode) p._displayCode = "[…]";
  });

  return pubs;
}

function publicationCode(pub) {
  return String(pub?._displayCode || "[…]");
}

function getPrimaryHref(pub) {
  return String(pub?.url || "").trim();
}

function getAuthors(pub) {
  return String(pub?.Author || pub?.authors || "").trim();
}

function getDetails(pub) {
  return String(pub?.details || "").trim();
}

function formatAuthors(pub) {
  const raw = getAuthors(pub);
  if (!raw) return "";

  const myNames = [
    "Quang-Thinh Bui",
    "Quang Thinh Bui"
  ];

  let html = escapeHtml(raw);

  for (const name of myNames) {
    const escapedName = escapeHtml(name);

    html = html.replace(
      new RegExp(`${escapedName}(\\*)?`, "g"),
      (_match, star) => {
        if (star) {
          return `${escapedName}${star}`;
        }
        return `<span class="pub-item__author-me">${escapedName}</span>`;
      }
    );
  }

  html = html.trim();
  html = html.replace(/[,\s.]+$/g, "");
  html += ".";

  return html;
}

function formatVenue(pub) {
  return escapeHtml(String(pub?.venue || "").trim());
}

function formatDetails(pub) {
  return escapeHtml(getDetails(pub));
}

function publicationItem(pub) {
  const href = getPrimaryHref(pub);
  const code = publicationCode(pub);
  const authors = formatAuthors(pub);
  const venue = formatVenue(pub);
  const details = formatDetails(pub);

  const rawTitle = String(pub?.title || "").trim();
  const titleText = rawTitle ? `“${escapeHtml(rawTitle)}”` : "";

  const titleHtml = href
    ? `<a class="pub-item__title" href="${escapeHtml(href)}" target="_blank" rel="noreferrer">${titleText}</a>`
    : `<span class="pub-item__title">${titleText}</span>`;

  let venueDetailsHtml = "";
  if (venue && details) {
    venueDetailsHtml = `. <em class="pub-item__venue">${venue}</em>, <span class="pub-item__details">${details}</span>.`;
  } else if (venue) {
    venueDetailsHtml = `. <em class="pub-item__venue">${venue}</em>.`;
  } else if (details) {
    venueDetailsHtml = `. <span class="pub-item__details">${details}</span>.`;
  }

  return `
    <article class="pub-item">
      <div class="pub-item__line">
        <div class="pub-item__code">${escapeHtml(code)}</div>
        <div class="pub-item__content">
          ${authors ? `${authors} ` : ""}
          ${titleHtml}${venueDetailsHtml}
        </div>
      </div>
    </article>
  `;
}

function filterByYear(pubs, yearValue) {
  if (!yearValue || yearValue === "all") return pubs;
  if (yearValue === "unknown") return pubs.filter((p) => !p.year);

  const y = Number(yearValue);
  return pubs.filter((p) => Number(p.year) === y);
}

function sortPubs(pubs) {
  const arr = [...pubs];
  arr.sort(compareForDisplay);
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

  return {
    years: [...years].sort((a, b) => b - a),
    hasUnknown
  };
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
  const yearEl = document.getElementById(opt.yearId || "pubYear");

  if (!target) return;

  try {
    let pubsAll = await loadPublications(opt.jsonUrl || "/publications.json");
    pubsAll = assignDisplayCodes(pubsAll);

    populateYearSelect(yearEl, pubsAll);

    const redraw = () => {
      const yearValue = yearEl?.value || "all";
      const filtered = filterByYear(pubsAll, yearValue);
      const sorted = sortPubs(filtered);
      renderPublications(target, sorted);
    };

    yearEl?.addEventListener("change", redraw);

    redraw();
  } catch (e) {
    console.error(e);
    target.innerHTML = `<p>Cannot load publications.json</p>`;
  }
};