  async function copyText(text){
    // Clipboard API (chạy tốt trên https/localhost)
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    // Fallback
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
    try{
      await copyText(email);
      btn.classList.add("is-copied");
      const oldTitle = btn.title;
      btn.title = "Copied!";
      setTimeout(() => {
        btn.classList.remove("is-copied");
        btn.title = oldTitle || "Copy";
      }, 900);
    }catch(err){
      btn.title = "Copy failed";
      setTimeout(() => btn.title = "Copy", 900);
    }
  });
