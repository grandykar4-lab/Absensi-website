const $ = id => document.getElementById(id);
let session = null, offset = 0, data = [];
fillClasses($("filter"));

const fmt = n => String(n).padStart(2, "0");
async function syncTime() { const { data: t } = await sb.rpc("server_now"); if (t) offset = new Date(t) - Date.now(); }

async function init() {
  const { data: { session: s } } = await sb.auth.getSession();
  s ? openDash() : ($("loginBox").classList.remove("hide"), $("dash").classList.add("hide"));
}
$("loginBtn").onclick = async () => {
  const { error } = await sb.auth.signInWithPassword({ email: $("email").value.trim(), password: $("pass").value });
  if (error) { const m = $("loginMsg"); m.className = "msg err"; m.textContent = "Gagal login: " + error.message; return; }
  openDash();
};
$("logout").onclick = async () => { await sb.auth.signOut(); location.reload(); };

async function openDash() {
  $("loginBox").classList.add("hide"); $("dash").classList.remove("hide");
  await syncTime();
  const { data: s } = await sb.from("sessions").select("*").eq("active", true).order("created_at", { ascending: false }).limit(1);
  session = s && s[0] || null;
  refresh(); setInterval(tick, 1000); setInterval(refresh, 4000);
}

$("newPin").onclick = async () => {
  const { data: r, error } = await sb.rpc("create_session");
  if (error) return alert("Gagal membuat PIN: " + error.message);
  offset = new Date(r.now) - Date.now();
  session = { id: r.id, pin: r.pin, expires_at: r.expires_at };
  data = []; render(); tick();
};

function tick() {
  if (!session) return;
  $("pinView").textContent = session.pin;
  const left = Math.floor((new Date(session.expires_at) - (Date.now() + offset)) / 1000);
  const t = $("timer");
  if (left > 0) { t.className = "timer"; t.textContent = `PIN berlaku ${fmt(Math.floor(left / 60))}:${fmt(left % 60)}`; }
  else { t.className = "timer exp"; t.textContent = "Kedaluwarsa"; }
}

async function refresh() {
  if (!session) return;
  const { data: d } = await sb.from("attendance").select("*").eq("session_id", session.id).order("created_at");
  data = d || []; render();
}

function filtered() {
  const q = $("search").value.toLowerCase(), c = $("filter").value;
  return data.filter(r => r.name.toLowerCase().includes(q) && (!c || r.class === c));
}
function render() {
  $("count").textContent = data.length;
  const tb = $("rows"); tb.innerHTML = "";
  filtered().forEach((r, i) => {
    const tr = tb.insertRow();
    [i + 1, r.name, r.class, new Date(r.created_at).toLocaleTimeString("id-ID"), r.status].forEach(v => { tr.insertCell().textContent = v; });
  });
}
$("search").oninput = render; $("filter").onchange = render;

$("csv").onclick = () => {
  const q = v => '"' + String(v).replace(/"/g, '""').replace(/^([=+\-@])/, "'$1") + '"';
  let out = "No,Nama,Kelas,Tanggal,Waktu,ID Sesi,Status\n";
  filtered().forEach((r, i) => {
    const d = new Date(r.created_at);
    out += [i + 1, r.name, r.class, d.toLocaleDateString("id-ID"), d.toLocaleTimeString("id-ID"), r.session_id, r.status].map(q).join(",") + "\n";
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["\ufeff" + out], { type: "text/csv" }));
  a.download = "absensi-" + new Date().toISOString().slice(0, 10) + ".csv"; a.click();
};

$("reset").onclick = async () => {
  if (!session || !confirm("Hapus semua data absensi sesi ini?")) return;
  const { error } = await sb.from("attendance").delete().eq("session_id", session.id);
  if (error) return alert("Gagal menghapus."); data = []; render();
};
init();
