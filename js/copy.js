async function copyText(text){
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}

document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".copy-email");
  if (!btn) return;

  const email = btn.getAttribute("data-email");
  const note = document.getElementById("copyEmailNote");

  try{
    await copyText(email);
    if (note) note.textContent = "Copied: " + email;
    btn.style.opacity = "1";
    setTimeout(() => { if (note) note.textContent = ""; }, 1200);
  }catch(err){
    if (note) note.textContent = "Copy failed";
    setTimeout(() => { if (note) note.textContent = ""; }, 1200);
  }
});