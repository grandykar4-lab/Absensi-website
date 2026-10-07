// Isi dari Supabase > Project Settings > API. Hanya pakai anon/public key (aman karena ada RLS).
// JANGAN pernah menaruh service_role key di sini.
const SUPABASE_URL = "https://uoucrjrhurkdbqpnnzta.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvdWNyanJodXJrZGJxcG5uenRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzNjQ4NjcsImV4cCI6MjEwNjk0MDg2N30.FexKuyflNpww_Ck-lebww59tHjvMWEfWZ3_tWR4TNuI";
const EKSKUL_NAME = "Karya Ilmiah Remaja";
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const CLASSES = [];
[7, 8, 9].forEach(g => { const max = g === 9 ? 13 : 11; for (let i = 1; i <= max; i++) CLASSES.push(g + "-" + i); });
function fillClasses(sel) {
  CLASSES.forEach(c => { const o = document.createElement("option"); o.value = o.textContent = c; sel.appendChild(o); });
}
