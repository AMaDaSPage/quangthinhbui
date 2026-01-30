(function(){
    const copyBtn = document.getElementById("copyEmailBtn");
    const note = document.getElementById("copyEmailNote");
    const email = copyBtn?.dataset.email || "buiquangthinh@tgu.edu.vn";

    copyBtn?.addEventListener("click", async () => {
    try{
        await navigator.clipboard.writeText(email);
        if (note) note.textContent = "Copied to clipboard.";
    }catch(e){
        if (note) note.textContent = "Copy failed. Please copy manually.";
    }
    setTimeout(() => { if (note) note.textContent = ""; }, 1800);
    });

    const form = document.getElementById("mailtoForm");
    form?.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("mName")?.value?.trim() || "";
    const from = document.getElementById("mEmail")?.value?.trim() || "";
    const subject = document.getElementById("mSubject")?.value?.trim() || "Inquiry from homepage";
    const body = document.getElementById("mBody")?.value?.trim() || "";

    const lines = [
        body,
        "",
        "----",
        name ? `Name: ${name}` : "",
        from ? `Email: ${from}` : "",
    ].filter(Boolean).join("\n");

    const mailto = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines)}`;
    window.location.href = mailto;
    });
})();