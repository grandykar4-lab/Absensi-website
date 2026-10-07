document.getElementById("brand").textContent = EKSKUL_NAME;
const $ = id => document.getElementById(id);
fillClasses($("cls"));
$("pin").addEventListener("input", e => { e.target.value = e.target.value.replace(/\D/g, ""); });

function show(type, html) { const m = $("msg"); m.className = "msg " + type; m.innerHTML = html; }
function esc(s) { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; }

$("btn").addEventListener("click", async () => {
  const name = $("name").value.trim().replace(/\s+/g, " ");
  const cls = $("cls").value, pin = $("pin").value;
  if (name.length < 3 || !cls || !/^\d{6}$/.test(pin)) return show("err", "Semua kolom harus diisi (PIN 6 angka).");
  $("btn").disabled = true;
  const { data, error } = await sb.rpc("submit_attendance", { p_name: name, p_class: cls, p_pin: pin });
  $("btn").disabled = false;
  if (error) return show("err", "Terjadi kesalahan. Coba lagi.");
  if (data.ok) {
    const t = new Date(data.time).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "medium" });
    show("ok", `<b>Absensi berhasil!</b><br>Nama: ${esc(data.name)}<br>Kelas: ${esc(data.class)}<br>Waktu: ${t}`);
    $("pin").value = "";
  } else {
    show("err", {
      EMPTY: "Semua kolom harus diisi.",
      INVALID_PIN: "PIN tidak valid.",
      EXPIRED: "PIN sudah kedaluwarsa. Silakan gunakan PIN terbaru.",
      DUPLICATE: "Kamu sudah melakukan absensi pada sesi ini."
    }[data.code] || "Terjadi kesalahan.");
  }
});
