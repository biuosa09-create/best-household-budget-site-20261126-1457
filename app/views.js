// Dompet Keluarga — page renderers. Each function takes the current state
// (transactions, goals, bills) and returns the page's HTML. All figures are
// computed here from the transactions, so every page agrees with the others.
import { BUDGETS, CATEGORIES, HOUSEHOLD, SAVINGS_TARGET, TIPS, categoryColor, categoryLabel } from './data.js';
import { barList, donutChart, monthBars, rupiah, rupiahShort, spendLine } from './charts.js';

export function monthTx(state, month) {
  return state.transactions.filter((t) => t.date.startsWith(month));
}

export function sumTx(list, type) {
  return list.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0);
}

export function byCategory(list) {
  const out = new Map();
  for (const t of list.filter((t) => t.type === 'expense')) out.set(t.category, (out.get(t.category) || 0) + t.amount);
  return out;
}

function fmtDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function statCard(label, value, sub, tone) {
  return `<div class="stat ${tone || ''}"><span class="stat-label">${label}</span><strong class="stat-value">${value}</strong><span class="stat-sub">${sub}</span></div>`;
}

export function renderOverview(state) {
  const nov = monthTx(state, HOUSEHOLD.month);
  const income = sumTx(nov, 'income');
  const spending = sumTx(nov, 'expense');
  const remaining = income - spending;
  const saved = Math.min(SAVINGS_TARGET, Math.max(0, remaining));
  const cats = byCategory(nov);
  const donutParts = CATEGORIES.map((c) => ({ label: c.label, value: cats.get(c.id) || 0, color: c.color })).filter((p) => p.value > 0);
  const budgetRows = BUDGETS.map((b) => {
    const spent = cats.get(b.category) || 0;
    const over = spent > b.amount;
    return { label: categoryLabel(b.category), value: spent, max: b.amount, color: categoryColor(b.category), note: over ? `Lewat anggaran ${rupiah(spent - b.amount)}` : `Sisa ${rupiah(b.amount - spent)} dari anggaran` };
  }).sort((a, b) => b.value - a.value).slice(0, 5);
  const upcoming = state.bills.filter((b) => !b.paid).sort((a, b) => a.due.localeCompare(b.due));
  const goalRows = state.goals.map((g) => {
    const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
    return `<li><div class="bar-head"><span>${g.name}</span><b>${pct}% · ${rupiahShort(g.saved)} / ${rupiahShort(g.target)}</b></div><div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:#1d7a4f"></div></div></li>`;
  }).join('');
  const tips = TIPS.map((t) => `<article class="tip"><h3>${t.title}</h3><p>${t.body}</p></article>`).join('');
  return `
  <section class="hero"><p class="eyebrow">Anggaran keluarga · ${HOUSEHOLD.monthLabel}</p>
    <h1>Dompet Keluarga</h1>
    <p class="lede">Anggaran bulanan ${HOUSEHOLD.name} — pemasukan, belanja, tagihan, dan tabungan dalam satu tempat. ${HOUSEHOLD.note}</p>
  </section>
  <section class="stats" aria-label="Ringkasan bulan ini">
    ${statCard('Pemasukan', rupiah(income), 'Gaji Ayah + gaji Ibu', 'good')}
    ${statCard('Pengeluaran', rupiah(spending), `${nov.filter((t) => t.type === 'expense').length} transaksi · ${HOUSEHOLD.monthLabel}`, 'spent')}
    ${statCard('Sisa anggaran', rupiah(remaining), 'Pemasukan dikurangi pengeluaran', remaining >= 0 ? 'good' : 'bad')}
    ${statCard('Ditabung bulan ini', rupiah(saved), `Target tabungan ${rupiah(SAVINGS_TARGET)}`, 'good')}
  </section>
  <div class="grid-2">
    <section class="card"><h2>Pengeluaran per kategori</h2><p class="muted">Total ${rupiah(spending)} pada ${HOUSEHOLD.monthLabel}.</p>${donutChart(donutParts, spending, 'pengeluaran')}</section>
    <section class="card"><h2>Anggaran vs. realisasi</h2><p class="muted">Lima kategori terbesar bulan ini. <a href="#/budgets">Lihat semua anggaran →</a></p>${barList(budgetRows)}</section>
  </div>
  <div class="grid-2">
    <section class="card"><h2>Tagihan yang masih menunggu</h2>${upcoming.length ? `<ul class="bill-list">${upcoming.map((b) => `<li><span>${b.name} · jatuh tempo ${fmtDate(b.due)}</span><b>${rupiah(b.amount)}</b></li>`).join('')}</ul><p class="muted">Total menunggu: <b>${rupiah(upcoming.reduce((s, b) => s + b.amount, 0))}</b>. <a href="#/bills">Kelola tagihan →</a></p>` : '<p>Semua tagihan bulan ini sudah dibayar.</p>'}</section>
    <section class="card"><h2>Tabungan &amp; tujuan</h2><ul class="bars">${goalRows}</ul><p class="muted"><a href="#/goals">Tambah dana ke tujuan →</a></p></section>
  </div>
  <section><h2>Cara keluarga ini menjaga anggaran</h2><div class="tips">${tips}</div></section>`;
}

function txRow(t, editingId) {
  if (editingId === t.id) {
    return `<tr class="editing"><td colspan="6"><form class="edit-form" data-edit="${t.id}">
      <label>Tanggal <input type="date" name="date" value="${t.date}" required></label>
      <label>Keterangan <input type="text" name="desc" value="${t.desc.replace(/"/g, '&quot;')}" required></label>
      <label>Kategori <select name="category">${CATEGORIES.map((c) => `<option value="${c.id}"${c.id === t.category ? ' selected' : ''}>${c.label}</option>`).join('')}</select></label>
      <label>Jenis <select name="type"><option value="expense"${t.type === 'expense' ? ' selected' : ''}>Pengeluaran</option><option value="income"${t.type === 'income' ? ' selected' : ''}>Pemasukan</option></select></label>
      <label>Jumlah (Rp) <input type="number" name="amount" min="1" step="1" value="${t.amount}" required></label>
      <span class="row-actions"><button type="submit" class="btn small">Simpan</button><button type="button" class="btn small ghost" data-cancel-edit> Batal</button></span>
    </form></td></tr>`;
  }
  return `<tr><td>${fmtDate(t.date)}</td><td>${t.desc}</td><td><span class="chip" style="--chip:${categoryColor(t.category)}">${categoryLabel(t.category)}</span></td><td class="${t.type === 'income' ? 'in' : 'out'}">${t.type === 'income' ? '+' : '−'} ${rupiah(t.amount)}</td><td><button class="btn small" data-edit="${t.id}">Ubah</button> <button class="btn small danger" data-delete="${t.id}">Hapus</button></td></tr>`;
}

export function renderTransactions(state, ui) {
  let list = [...state.transactions];
  if (ui.txMonth !== 'all') list = list.filter((t) => t.date.startsWith(ui.txMonth));
  if (ui.txCat !== 'all') list = list.filter((t) => t.category === ui.txCat);
  if (ui.txQuery.trim()) {
    const q = ui.txQuery.trim().toLowerCase();
    list = list.filter((t) => t.desc.toLowerCase().includes(q));
  }
  const sorts = {
    'date-desc': (a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id),
    'date-asc': (a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id),
    'amount-desc': (a, b) => b.amount - a.amount,
    'amount-asc': (a, b) => a.amount - b.amount,
  };
  list.sort(sorts[ui.txSort] || sorts['date-desc']);
  const inc = sumTx(list, 'income');
  const exp = sumTx(list, 'expense');
  const rows = list.map((t) => txRow(t, ui.editingId)).join('') || '<tr><td colspan="6">Tidak ada transaksi yang cocok dengan filter ini.</td></tr>';
  return `
  <h1>Transaksi</h1>
  <p class="lede">Semua pemasukan dan pengeluaran keluarga. Menambah, mengubah, atau menghapus transaksi langsung mengubah total di halaman ini, di Beranda, dan di Anggaran.</p>
  <section class="card"><h2>Tambah transaksi</h2>
    <form id="add-form" class="add-form">
      <label>Tanggal <input type="date" name="date" value="2026-11-26" required></label>
      <label>Keterangan <input type="text" name="desc" placeholder="cth. Belanja di pasar" required></label>
      <label>Kategori <select name="category">${CATEGORIES.map((c) => `<option value="${c.id}">${c.label}</option>`).join('')}</select></label>
      <label>Jenis <select name="type"><option value="expense">Pengeluaran</option><option value="income">Pemasukan</option></select></label>
      <label>Jumlah (Rp) <input type="number" name="amount" min="1" step="1" placeholder="100000" required></label>
      <button type="submit" class="btn">Tambah</button>
    </form>
  </section>
  <section class="card"><h2>Daftar transaksi</h2>
    <div class="filters">
      <label>Bulan <select id="f-month"><option value="2026-11"${ui.txMonth === '2026-11' ? ' selected' : ''}>November 2026</option><option value="2026-10"${ui.txMonth === '2026-10' ? ' selected' : ''}>Oktober 2026</option><option value="all"${ui.txMonth === 'all' ? ' selected' : ''}>Semua bulan</option></select></label>
      <label>Kategori <select id="f-cat"><option value="all">Semua kategori</option>${CATEGORIES.map((c) => `<option value="${c.id}"${ui.txCat === c.id ? ' selected' : ''}>${c.label}</option>`).join('')}</select></label>
      <label>Cari <input type="search" id="f-query" placeholder="cth. pasar" value="${ui.txQuery.replace(/"/g, '&quot;')}"></label>
      <label>Urutkan <select id="f-sort"><option value="date-desc"${ui.txSort === 'date-desc' ? ' selected' : ''}>Tanggal terbaru</option><option value="date-asc"${ui.txSort === 'date-asc' ? ' selected' : ''}>Tanggal terlama</option><option value="amount-desc"${ui.txSort === 'amount-desc' ? ' selected' : ''}>Jumlah terbesar</option><option value="amount-asc"${ui.txSort === 'amount-asc' ? ' selected' : ''}>Jumlah terkecil</option></select></label>
    </div>
    <p class="totals-line"><span>${list.length} transaksi</span><span>Pemasukan <b class="in">${rupiah(inc)}</b></span><span>Pengeluaran <b class="out">${rupiah(exp)}</b></span><span>Selisih <b>${rupiah(inc - exp)}</b></span></p>
    <div class="table-wrap"><table><thead><tr><th>Tanggal</th><th>Keterangan</th><th>Kategori</th><th>Jumlah</th><th>Aksi</th></tr></thead><tbody>${rows}</tbody></table></div>
  </section>`;
}

export function renderBudgets(state) {
  const nov = monthTx(state, HOUSEHOLD.month);
  const cats = byCategory(nov);
  const totalBudget = BUDGETS.reduce((s, b) => s + b.amount, 0);
  const totalSpent = [...cats.values()].reduce((s, v) => s + v, 0);
  const rows = BUDGETS.map((b) => {
    const spent = cats.get(b.category) || 0;
    const over = spent > b.amount;
    const pct = Math.min(100, Math.round((spent / b.amount) * 100));
    const status = over ? `Lewat ${rupiah(spent - b.amount)}` : spent >= b.amount * 0.9 ? `Hampir habis — sisa ${rupiah(b.amount - spent)}` : `Sisa ${rupiah(b.amount - spent)}`;
    return `<article class="budget-card"><div class="bar-head"><span>${categoryLabel(b.category)}</span><b>${pct}%</b></div><div class="bar-track"><div class="bar-fill${over ? ' over' : ''}" style="width:${pct}%;background:${categoryColor(b.category)}"></div></div><p>${rupiah(spent)} dari ${rupiah(b.amount)} · <span class="${over ? 'over-text' : ''}">${status}</span></p></article>`;
  }).join('');
  return `
  <h1>Anggaran Bulanan</h1>
  <p class="lede">Anggaran ${HOUSEHOLD.monthLabel} untuk ${HOUSEHOLD.name}. Total anggaran ${rupiah(totalBudget)} dari pemasukan ${rupiah(sumTx(nov, 'income'))}; realisasi sejauh ini ${rupiah(totalSpent)} (${Math.round((totalSpent / totalBudget) * 100)}% dari anggaran).</p>
  <section class="stats"><div class="stat"><span class="stat-label">Total anggaran</span><strong class="stat-value">${rupiah(totalBudget)}</strong><span class="stat-sub">10 kategori</span></div>
  <div class="stat"><span class="stat-label">Sudah terpakai</span><strong class="stat-value">${rupiah(totalSpent)}</strong><span class="stat-sub">${Math.round((totalSpent / totalBudget) * 100)}% dari anggaran</span></div>
  <div class="stat good"><span class="stat-label">Sisa anggaran</span><strong class="stat-value">${rupiah(totalBudget - totalSpent)}</strong><span class="stat-sub">Untuk sisa bulan November</span></div></section>
  <section class="budget-grid">${rows}</section>
  <section class="card"><h2>Catatan anggaran</h2><p>Sewa rumah adalah pos terbesar dan sudah dibayar lunas tanggal 1. Makan di luar adalah satu-satunya kategori yang lewat anggaran bulan ini (Rp 935.000 dari Rp 900.000) — keluarga memutuskan memasak di rumah untuk sisa minggu ini. Anggaran disusun dari pengeluaran rata-rata tiga bulan terakhir, lalu dibulatkan ke bawah supaya ada ruang menabung.</p></section>`;
}

export function renderBills(state) {
  const unpaid = state.bills.filter((b) => !b.paid);
  const paid = state.bills.filter((b) => b.paid);
  const unpaidTotal = unpaid.reduce((s, b) => s + b.amount, 0);
  const paidTotal = paid.reduce((s, b) => s + b.amount, 0);
  const billRow = (b) => `<li class="bill-row"><label class="bill-check"><input type="checkbox" data-bill="${b.id}"${b.paid ? ' checked' : ''}><span class="bill-name">${b.name}</span></label><span class="bill-note">${b.note}</span><span class="bill-due">Jatuh tempo ${fmtDate(b.due)}</span><b>${rupiah(b.amount)}</b><span class="bill-status ${b.paid ? 'paid' : 'due'}">${b.paid ? 'Lunas' : 'Belum dibayar'}</span></li>`;
  return `
  <h1>Tagihan &amp; Rutin</h1>
  <p class="lede">Tagihan tetap keluarga bulan ini. Centang kotak untuk menandai tagihan sudah dibayar — statusnya tersimpan dan total di bawah ikut berubah.</p>
  <section class="stats"><div class="stat"><span class="stat-label">Menunggu dibayar</span><strong class="stat-value">${rupiah(unpaidTotal)}</strong><span class="stat-sub">${unpaid.length} tagihan</span></div>
  <div class="stat good"><span class="stat-label">Sudah dibayar</span><strong class="stat-value">${rupiah(paidTotal)}</strong><span class="stat-sub">${paid.length} tagihan</span></div>
  <div class="stat"><span class="stat-label">Total tagihan bulan ini</span><strong class="stat-value">${rupiah(unpaidTotal + paidTotal)}</strong><span class="stat-sub">${state.bills.length} tagihan</span></div></section>
  <section class="card"><h2>Semua tagihan November 2026</h2><ul class="bill-list full">${state.bills.map(billRow).join('')}</ul></section>
  <section class="card"><h2>Yang jatuh tempo minggu ini</h2><p>Langganan streaming (Rp 79.000, 27 November), iuran RT (Rp 50.000, 28 November), dan cicilan motor (Rp 850.000, 30 November) — total Rp 979.000 masih menunggu. Sisa anggaran bulan ini masih cukup untuk ketiganya.</p></section>`;
}

export function renderGoals(state) {
  const totalSaved = state.goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = state.goals.reduce((s, g) => s + g.target, 0);
  const cards = state.goals.map((g) => {
    const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
    const left = Math.max(0, g.target - g.saved);
    return `<article class="card goal-card"><h2>${g.name}</h2><p class="muted">${g.note}</p><div class="bar-track big"><div class="bar-fill" style="width:${pct}%;background:#1d7a4f"></div></div><p class="goal-nums"><b>${pct}%</b> · ${rupiah(g.saved)} dari ${rupiah(g.target)} · kurang ${rupiah(left)}</p>
    <form class="add-funds" data-goal="${g.id}"><label>Tambah dana (Rp) <input type="number" name="amount" min="1000" step="1000" placeholder="100000" required></label><button type="submit" class="btn small">Tambah dana</button></form></article>`;
  }).join('');
  return `
  <h1>Tabungan &amp; Tujuan</h1>
  <p class="lede">Empat tujuan tabungan keluarga. Menambah dana langsung memperbarui progres — dana berasal dari sisa anggaran bulan ini.</p>
  <section class="stats"><div class="stat good"><span class="stat-label">Total terkumpul</span><strong class="stat-value">${rupiah(totalSaved)}</strong><span class="stat-sub">${Math.round((totalSaved / totalTarget) * 100)}% dari semua target</span></div>
  <div class="stat"><span class="stat-label">Total target</span><strong class="stat-value">${rupiah(totalTarget)}</strong><span class="stat-sub">4 tujuan</span></div>
  <div class="stat"><span class="stat-label">Masih kurang</span><strong class="stat-value">${rupiah(totalTarget - totalSaved)}</strong><span class="stat-sub">Untuk semua tujuan tercapai</span></div></section>
  <div class="goal-grid">${cards}</div>`;
}

export function renderReports(state) {
  const months = [HOUSEHOLD.prevMonth, HOUSEHOLD.month].map((m) => {
    const list = monthTx(state, m);
    return { label: m === HOUSEHOLD.month ? 'November' : 'Oktober', income: sumTx(list, 'income'), spending: sumTx(list, 'expense') };
  });
  const nov = monthTx(state, HOUSEHOLD.month);
  const spending = sumTx(nov, 'expense');
  const cats = byCategory(nov);
  const donutParts = CATEGORIES.map((c) => ({ label: c.label, value: cats.get(c.id) || 0, color: c.color })).filter((p) => p.value > 0);
  // Cumulative daily spending in November.
  const days = [];
  let run = 0;
  const byDay = new Map();
  for (const t of nov.filter((t) => t.type === 'expense')) byDay.set(t.date, (byDay.get(t.date) || 0) + t.amount);
  for (let d = 1; d <= 26; d++) {
    const key = `2026-11-${String(d).padStart(2, '0')}`;
    run += byDay.get(key) || 0;
    days.push({ day: d, total: run });
  }
  const catRows = [...cats.entries()].sort((a, b) => b[1] - a[1]).map(([id, v]) => {
    const oct = sumTx(monthTx(state, HOUSEHOLD.prevMonth).filter((t) => t.type === 'expense' && t.category === id), 'expense');
    const diff = oct ? Math.round(((v - oct) / oct) * 100) : null;
    return `<tr><td><span class="dot" style="background:${categoryColor(id)}"></span>${categoryLabel(id)}</td><td>${rupiah(v)}</td><td>${rupiah(oct)}</td><td>${diff === null ? '—' : (diff > 0 ? '+' : '') + diff + '%'}</td><td>${Math.round((v / spending) * 100)}%</td></tr>`;
  }).join('');
  const change = months[1].spending - months[0].spending;
  return `
  <h1>Laporan</h1>
  <p class="lede">Perbandingan Oktober dan November 2026. Pengeluaran November ${rupiah(Math.abs(change))} ${change <= 0 ? 'lebih rendah' : 'lebih tinggi'} daripada Oktober — sewa rumah sama, yang berubah adalah belanja harian dan hiburan.</p>
  <div class="grid-2">
    <section class="card"><h2>Pemasukan vs. pengeluaran</h2>${monthBars(months)}<p class="muted">Oktober: pemasukan ${rupiah(months[0].income)}, pengeluaran ${rupiah(months[0].spending)}. November: pemasukan ${rupiah(months[1].income)}, pengeluaran ${rupiah(months[1].spending)}.</p></section>
    <section class="card"><h2>Pengeluaran kumulatif November</h2>${spendLine(days)}<p class="muted">Garis naik tajam tanggal 1 karena sewa rumah dibayar, lalu naik pelan lewat belanja mingguan.</p></section>
  </div>
  <section class="card"><h2>Per kategori — November vs. Oktober</h2><div class="table-wrap"><table><thead><tr><th>Kategori</th><th>November</th><th>Oktober</th><th>Perubahan</th><th>Bagian</th></tr></thead><tbody>${catRows}</tbody></table></div></section>
  <section class="card"><h2>Pembagian pengeluaran November</h2>${donutChart(donutParts, spending, 'pengeluaran')}</section>`;
}

export function renderMethods() {
  return `
  <h1>Metode &amp; Sumber</h1>
  <p class="lede">Bagaimana angka-angka di situs ini dihitung, dan dari mana asalnya.</p>
  <section class="card"><h2>Cara menghitung</h2>
  <ul class="method-list">
    <li><b>Pemasukan</b> adalah jumlah gaji Ayah (Rp 12.000.000) dan gaji Ibu (Rp 6.500.000) yang masuk tanggal 1 setiap bulan.</li>
    <li><b>Pengeluaran</b> adalah jumlah semua transaksi bertipe pengeluaran pada bulan itu. Setiap transaksi punya satu kategori, jadi jumlah per kategori selalu sama dengan total pengeluaran.</li>
    <li><b>Sisa anggaran</b> adalah pemasukan dikurangi pengeluaran. <b>Tabungan bulan ini</b> adalah bagian dari sisa itu, sampai target Rp 3.000.000.</li>
    <li><b>Anggaran per kategori</b> disusun dari rata-rata pengeluaran tiga bulan terakhir, dibulatkan ke bawah. Status "lewat anggaran" muncul bila realisasi melebihi anggaran.</li>
    <li><b>Tagihan</b> dicentang lunas secara manual; total menunggu dibayar adalah jumlah tagihan yang belum dicentang.</li>
    <li><b>Tujuan tabungan</b> menunjukkan dana terkumpul dibagi target. Menambah dana menambah jumlah terkumpul.</li>
  </ul></section>
  <section class="card"><h2>Sumber data</h2>
  <p>Semua angka adalah <b>contoh fiktif</b> sebuah keluarga yang dibuat untuk situs ini — bukan data keuangan asli, bukan dari bank, dan bukan dari survei. Transaksi Oktober dan November 2026 ditulis tangan sebagai contoh yang masuk akal untuk keluarga empat orang di Jakarta: sewa rumah, belanja pasar dan supermarket, listrik, internet, SPP, dan cicilan motor. Tidak ada data yang diambil dari situs lain.</p>
  <p>Perubahan yang Anda buat — menambah transaksi, mencentang tagihan, menambah dana tabungan — hanya tersimpan di peramban Anda sendiri (localStorage) dan tidak dikirim ke mana pun. Tombol "Kembalikan data contoh" di bawah mengembalikan semua angka ke contoh awal.</p>
  <p><button class="btn danger" id="reset-data">Kembalikan data contoh</button></p></section>
  <section class="card"><h2>Tentang situs ini</h2>
  <p>Dompet Keluarga adalah situs statis: berkas HTML, CSS, dan JavaScript-nya sendiri, tanpa pustaka dari internet dan tanpa permintaan jaringan. Grafik digambar dengan kode SVG situs ini. Situs ini dibuat untuk lomba situs anggaran rumah tangga di make.fun, November 2026.</p></section>`;
}
