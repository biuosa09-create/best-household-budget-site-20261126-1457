// Dompet Keluarga — small SVG chart builders, no library, no network.
// Every chart is drawn from numbers the caller passes in, so a chart and the
// table next to it can never disagree.

export function rupiah(n) {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}

export function rupiahShort(n) {
  if (Math.abs(n) >= 1000000) return 'Rp ' + (n / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' jt';
  if (Math.abs(n) >= 1000) return 'Rp ' + Math.round(n / 1000) + ' rb';
  return rupiah(n);
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Donut chart: parts = [{label, value, color}]. Centre shows the total.
export function donutChart(parts, total, centreLabel) {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const r = 82;
  const thick = 34;
  const circ = 2 * Math.PI * r;
  let offset = 0.25 * circ; // start at the top
  const slices = parts.filter((p) => p.value > 0).map((p) => {
    const frac = total > 0 ? p.value / total : 0;
    const len = frac * circ;
    const s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${p.color}" stroke-width="${thick}" stroke-dasharray="${len.toFixed(1)} ${(circ - len).toFixed(1)}" stroke-dashoffset="${(-offset).toFixed(1)}"/>`;
    offset += len;
    return s;
  }).join('');
  const legend = parts.filter((p) => p.value > 0).map((p) =>
    `<li><span class="dot" style="background:${p.color}"></span>${esc(p.label)}<b>${rupiahShort(p.value)}</b></li>`).join('');
  return `<div class="donut-wrap"><svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Pembagian pengeluaran per kategori" class="donut">${slices}<text x="${cx}" y="${cy - 6}" text-anchor="middle" class="donut-total">${rupiahShort(total)}</text><text x="${cx}" y="${cy + 18}" text-anchor="middle" class="donut-label">${esc(centreLabel)}</text></svg><ul class="legend">${legend}</ul></div>`;
}

// Horizontal bars: rows = [{label, value, max, color, note}]
export function barList(rows) {
  return `<ul class="bars">${rows.map((row) => {
    const pct = row.max > 0 ? Math.min(100, (row.value / row.max) * 100) : 0;
    const over = row.value > row.max;
    return `<li><div class="bar-head"><span>${esc(row.label)}</span><b>${rupiah(row.value)}${row.max ? ' / ' + rupiahShort(row.max) : ''}</b></div><div class="bar-track"><div class="bar-fill${over ? ' over' : ''}" style="width:${pct.toFixed(1)}%;background:${row.color}"></div></div><small class="${over ? 'over-text' : ''}">${esc(row.note || '')}</small></li>`;
  }).join('')}</ul>`;
}

// Grouped vertical bars: two months, income vs spending.
export function monthBars(months) {
  // months: [{label, income, spending}]
  const w = 560;
  const h = 260;
  const padL = 64;
  const padB = 34;
  const padT = 16;
  const maxV = Math.max(1, ...months.flatMap((m) => [m.income, m.spending]));
  const innerW = w - padL - 16;
  const innerH = h - padT - padB;
  const groupW = innerW / months.length;
  const barW = Math.min(52, groupW / 3);
  const y = (v) => padT + innerH - (v / maxV) * innerH;
  const grid = [0.25, 0.5, 0.75, 1].map((f) => {
    const gy = padT + innerH * (1 - f);
    return `<line x1="${padL}" y1="${gy}" x2="${w - 16}" y2="${gy}" class="grid"/><text x="${padL - 8}" y="${gy + 4}" text-anchor="end" class="axis">${rupiahShort(maxV * f)}</text>`;
  }).join('');
  const bars = months.map((m, i) => {
    const gx = padL + i * groupW + groupW / 2;
    return `<rect x="${(gx - barW - 4).toFixed(1)}" y="${y(m.income).toFixed(1)}" width="${barW}" height="${(padT + innerH - y(m.income)).toFixed(1)}" fill="#1d7a4f" rx="3"><title>${esc(m.label)} pemasukan ${rupiah(m.income)}</title></rect><rect x="${(gx + 4).toFixed(1)}" y="${y(m.spending).toFixed(1)}" width="${barW}" height="${(padT + innerH - y(m.spending)).toFixed(1)}" fill="#c25e3a" rx="3"><title>${esc(m.label)} pengeluaran ${rupiah(m.spending)}</title></rect><text x="${gx}" y="${h - 12}" text-anchor="middle" class="axis">${esc(m.label)}</text>`;
  }).join('');
  return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Pemasukan dan pengeluaran Oktober dan November 2026" class="chart-svg">${grid}${bars}<text x="${padL}" y="${padT - 2}" class="axis legend-note">Hijau: pemasukan · Oranye: pengeluaran</text></svg>`;
}

// Simple line chart of daily cumulative spending in November.
export function spendLine(days) {
  // days: [{day, total}] cumulative spending up to that day.
  const w = 560;
  const h = 240;
  const padL = 64;
  const padB = 30;
  const padT = 18;
  const maxV = Math.max(1, ...days.map((d) => d.total));
  const x = (i) => padL + (i / Math.max(1, days.length - 1)) * (w - padL - 20);
  const y = (v) => padT + (h - padT - padB) * (1 - v / maxV);
  const pts = days.map((d, i) => `${x(i).toFixed(1)},${y(d.total).toFixed(1)}`).join(' ');
  const area = `${padL},${y(0)} ${pts} ${x(days.length - 1).toFixed(1)},${y(0)}`;
  const grid = [0.5, 1].map((f) => {
    const gy = padT + (h - padT - padB) * (1 - f);
    return `<line x1="${padL}" y1="${gy}" x2="${w - 20}" y2="${gy}" class="grid"/><text x="${padL - 8}" y="${gy + 4}" text-anchor="end" class="axis">${rupiahShort(maxV * f)}</text>`;
  }).join('');
  const labels = [0, Math.floor(days.length / 2), days.length - 1].map((i) =>
    `<text x="${x(i).toFixed(1)}" y="${h - 10}" text-anchor="middle" class="axis">${days[i].day} Nov</text>`).join('');
  return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Pengeluaran kumulatif November 2026" class="chart-svg">${grid}<polygon points="${area}" fill="#1d7a4f" opacity="0.12"/><polyline points="${pts}" fill="none" stroke="#1d7a4f" stroke-width="3" stroke-linejoin="round"/>${labels}<circle cx="${x(days.length - 1).toFixed(1)}" cy="${y(days[days.length - 1].total).toFixed(1)}" r="5" fill="#1d7a4f"/><text x="${x(days.length - 1).toFixed(1) - 8}" y="${(y(days[days.length - 1].total) - 10).toFixed(1)}" text-anchor="end" class="axis strong">${rupiahShort(days[days.length - 1].total)}</text></svg>`;
}
