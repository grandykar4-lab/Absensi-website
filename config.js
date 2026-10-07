// Isi dari Supabase > Project Settings > API. Hanya pakai anon/public key (aman karena ada RLS).
// JANGAN pernah menaruh service_role key di sini.
const SUPABASE_URL = "https://XXXX.supabase.co";
const SUPABASE_ANON_KEY = "ISI_ANON_PUBLIC_KEY";
const EKSKUL_NAME = "Nama Ekstrakurikuler";
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const CLASSES = [];
[7, 8, 9].forEach(g => { for (let i = 1; i <= 11; i++) CLASSES.push(g + "-" + i); });
function fillClasses(sel) {
  CLASSES.forEach(c => { const o = document.createElement("option"); o.value = o.textContent = c; sel.appendChild(o); });
}
