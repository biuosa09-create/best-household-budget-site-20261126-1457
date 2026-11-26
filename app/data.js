// Dompet Keluarga — seed data for a fictional example household.
//
// The household is invented: Keluarga Hartono, a family of four in Jakarta.
// Every figure on the site is computed from the transactions below, so the
// totals on every page always agree with each other. Amounts are in rupiah.
// November 2026 is the month in focus; October 2026 is kept for the trend.

export const HOUSEHOLD = {
  name: 'Keluarga Hartono',
  members: 'Ayah, Ibu, dan dua anak (Jakarta)',
  month: '2026-11',
  monthLabel: 'November 2026',
  prevMonth: '2026-10',
  prevMonthLabel: 'Oktober 2026',
  note: 'Semua angka di situs ini adalah contoh fiktif sebuah keluarga — bukan data keuangan asli siapa pun.',
};

export const CATEGORIES = [
  { id: 'sewa', label: 'Sewa Rumah', color: '#7a5c2e' },
  { id: 'belanja', label: 'Belanja Harian', color: '#1d7a4f' },
  { id: 'transport', label: 'Transportasi', color: '#2f6fb2' },
  { id: 'tagihan', label: 'Tagihan & Utilitas', color: '#8a6d1b' },
  { id: 'pendidikan', label: 'Pendidikan', color: '#6a4fa3' },
  { id: 'makan', label: 'Makan di Luar', color: '#c25e3a' },
  { id: 'kesehatan', label: 'Kesehatan', color: '#2e8f86' },
  { id: 'hiburan', label: 'Hiburan', color: '#b03a6e' },
  { id: 'pakaian', label: 'Pakaian', color: '#5b7a8c' },
  { id: 'lainnya', label: 'Lainnya', color: '#7c7c7c' },
];

export const categoryLabel = (id) => (CATEGORIES.find((c) => c.id === id) || { label: id }).label;
export const categoryColor = (id) => (CATEGORIES.find((c) => c.id === id) || { color: '#7c7c7c' }).color;

// Monthly budget per category, November 2026. Total: Rp 13.700.000.
export const BUDGETS = [
  { category: 'sewa', amount: 4000000 },
  { category: 'belanja', amount: 3200000 },
  { category: 'transport', amount: 1200000 },
  { category: 'tagihan', amount: 1100000 },
  { category: 'pendidikan', amount: 1500000 },
  { category: 'makan', amount: 900000 },
  { category: 'kesehatan', amount: 600000 },
  { category: 'hiburan', amount: 500000 },
  { category: 'pakaian', amount: 400000 },
  { category: 'lainnya', amount: 300000 },
];

export const SAVINGS_TARGET = 3000000;

export const GOALS = [
  { id: 'darurat', name: 'Dana Darurat', target: 30000000, saved: 18750000, note: 'Enam bulan biaya hidup, disimpan di rekening terpisah.' },
  { id: 'liburan', name: 'Liburan Keluarga', target: 8000000, saved: 5200000, note: 'Liburan akhir tahun ke Yogyakarta, berangkat Desember.' },
  { id: 'motor', name: 'Motor Baru', target: 12000000, saved: 4800000, note: 'Mengganti motor lama yang sudah sering mogok.' },
  { id: 'sekolah', name: 'Dana Pendidikan Anak', target: 20000000, saved: 9400000, note: 'Tabungan masuk sekolah menengah tahun depan.' },
];

export const BILLS = [
  { id: 'b-sewa', name: 'Sewa rumah', amount: 4000000, due: '2026-11-01', paid: true, note: 'Dibayar tiap tanggal 1.' },
  { id: 'b-listrik', name: 'Listrik PLN', amount: 385000, due: '2026-11-05', paid: true, note: 'Tagihan bulan Oktober, dibayar awal November.' },
  { id: 'b-spp', name: 'SPP anak', amount: 750000, due: '2026-11-05', paid: true, note: 'SPP November, dua anak.' },
  { id: 'b-internet', name: 'Internet rumah', amount: 325000, due: '2026-11-10', paid: true, note: 'Paket 100 Mbps.' },
  { id: 'b-air', name: 'Air PDAM', amount: 145000, due: '2026-11-15', paid: true, note: 'Pemakaian Oktober.' },
  { id: 'b-asuransi', name: 'Asuransi kesehatan', amount: 520000, due: '2026-11-20', paid: true, note: 'Premi keluarga, dibayar tanggal 20.' },
  { id: 'b-streaming', name: 'Langganan streaming', amount: 79000, due: '2026-11-27', paid: false, note: 'Paket keluarga, jatuh tempo 27 November.' },
  { id: 'b-rt', name: 'Iuran RT', amount: 50000, due: '2026-11-28', paid: false, note: 'Iuran keamanan dan kebersihan.' },
  { id: 'b-motor', name: 'Cicilan motor', amount: 850000, due: '2026-11-30', paid: false, note: 'Cicilan ke-8 dari 24.' },
];

// type: 'income' | 'expense'. November income: Rp 18.500.000 (gaji Ayah 12 jt + gaji Ibu 6,5 jt).
export const TRANSACTIONS = [
  { id: 't01', date: '2026-11-01', type: 'income', category: 'lainnya', desc: 'Gaji Ayah — November', amount: 12000000 },
  { id: 't02', date: '2026-11-01', type: 'income', category: 'lainnya', desc: 'Gaji Ibu — November', amount: 6500000 },
  { id: 't03', date: '2026-11-01', type: 'expense', category: 'sewa', desc: 'Sewa rumah November', amount: 4000000 },
  { id: 't04', date: '2026-11-01', type: 'expense', category: 'tagihan', desc: 'Listrik PLN', amount: 385000 },
  { id: 't05', date: '2026-11-02', type: 'expense', category: 'belanja', desc: 'Pasar Minggu — sayur, ayam, telur', amount: 412500 },
  { id: 't06', date: '2026-11-03', type: 'expense', category: 'transport', desc: 'Bensin motor', amount: 150000 },
  { id: 't07', date: '2026-11-04', type: 'expense', category: 'makan', desc: 'Makan malam di warteg langganan', amount: 185000 },
  { id: 't08', date: '2026-11-05', type: 'expense', category: 'pendidikan', desc: 'SPP anak — November', amount: 750000 },
  { id: 't09', date: '2026-11-06', type: 'expense', category: 'belanja', desc: 'Supermarket — beras, minyak, sabun', amount: 368000 },
  { id: 't10', date: '2026-11-07', type: 'expense', category: 'kesehatan', desc: 'Apotek — vitamin dan obat flu', amount: 125000 },
  { id: 't11', date: '2026-11-08', type: 'expense', category: 'transport', desc: 'Tol dan parkir akhir pekan', amount: 220000 },
  { id: 't12', date: '2026-11-09', type: 'expense', category: 'belanja', desc: 'Pasar Minggu — buah dan ikan', amount: 445000 },
  { id: 't13', date: '2026-11-10', type: 'expense', category: 'tagihan', desc: 'Internet rumah 100 Mbps', amount: 325000 },
  { id: 't14', date: '2026-11-11', type: 'expense', category: 'makan', desc: 'Makan siang keluarga di mal', amount: 240000 },
  { id: 't15', date: '2026-11-12', type: 'expense', category: 'pakaian', desc: 'Seragam sekolah anak', amount: 275000 },
  { id: 't16', date: '2026-11-13', type: 'expense', category: 'belanja', desc: 'Supermarket — mingguan', amount: 390000 },
  { id: 't17', date: '2026-11-14', type: 'expense', category: 'hiburan', desc: 'Bioskop keluarga', amount: 180000 },
  { id: 't18', date: '2026-11-15', type: 'expense', category: 'tagihan', desc: 'Air PDAM', amount: 145000 },
  { id: 't19', date: '2026-11-16', type: 'expense', category: 'transport', desc: 'Bensin motor', amount: 150000 },
  { id: 't20', date: '2026-11-17', type: 'expense', category: 'belanja', desc: 'Pasar Minggu — sayur dan daging', amount: 428000 },
  { id: 't21', date: '2026-11-18', type: 'expense', category: 'pendidikan', desc: 'Les matematika anak', amount: 450000 },
  { id: 't22', date: '2026-11-19', type: 'expense', category: 'makan', desc: 'Makan malam — ulang tahun Ibu', amount: 295000 },
  { id: 't23', date: '2026-11-20', type: 'expense', category: 'kesehatan', desc: 'Dokter gigi anak', amount: 210000 },
  { id: 't24', date: '2026-11-21', type: 'expense', category: 'belanja', desc: 'Supermarket — mingguan', amount: 402000 },
  { id: 't25', date: '2026-11-22', type: 'expense', category: 'hiburan', desc: 'Taman bermain anak', amount: 150000 },
  { id: 't26', date: '2026-11-23', type: 'expense', category: 'transport', desc: 'Bensin dan parkir', amount: 175000 },
  { id: 't27', date: '2026-11-24', type: 'expense', category: 'belanja', desc: 'Pasar Minggu — mingguan', amount: 375000 },
  { id: 't28', date: '2026-11-25', type: 'expense', category: 'makan', desc: 'Makan siang — rapat kerja Ibu', amount: 215000 },
  { id: 't29', date: '2026-11-26', type: 'expense', category: 'lainnya', desc: 'Pulsa dan paket data', amount: 120000 },
  // October 2026 — kept so the Reports page can show a two-month trend.
  { id: 't30', date: '2026-10-01', type: 'income', category: 'lainnya', desc: 'Gaji Ayah — Oktober', amount: 12000000 },
  { id: 't31', date: '2026-10-01', type: 'income', category: 'lainnya', desc: 'Gaji Ibu — Oktober', amount: 6500000 },
  { id: 't32', date: '2026-10-01', type: 'expense', category: 'sewa', desc: 'Sewa rumah Oktober', amount: 4000000 },
  { id: 't33', date: '2026-10-03', type: 'expense', category: 'belanja', desc: 'Pasar Minggu — mingguan', amount: 398000 },
  { id: 't34', date: '2026-10-05', type: 'expense', category: 'pendidikan', desc: 'SPP anak — Oktober', amount: 750000 },
  { id: 't35', date: '2026-10-07', type: 'expense', category: 'tagihan', desc: 'Listrik PLN', amount: 372000 },
  { id: 't36', date: '2026-10-10', type: 'expense', category: 'belanja', desc: 'Supermarket — mingguan', amount: 415000 },
  { id: 't37', date: '2026-10-12', type: 'expense', category: 'makan', desc: 'Makan malam keluarga', amount: 265000 },
  { id: 't38', date: '2026-10-15', type: 'expense', category: 'transport', desc: 'Bensin dan tol', amount: 310000 },
  { id: 't39', date: '2026-10-18', type: 'expense', category: 'belanja', desc: 'Pasar Minggu — mingguan', amount: 442000 },
  { id: 't40', date: '2026-10-20', type: 'expense', category: 'pendidikan', desc: 'Les bahasa Inggris anak', amount: 400000 },
  { id: 't41', date: '2026-10-22', type: 'expense', category: 'tagihan', desc: 'Internet dan air PDAM', amount: 458000 },
  { id: 't42', date: '2026-10-25', type: 'expense', category: 'hiburan', desc: 'Bioskop dan taman bermain', amount: 410000 },
  { id: 't43', date: '2026-10-27', type: 'expense', category: 'kesehatan', desc: 'Periksa ke dokter umum', amount: 290000 },
  { id: 't44', date: '2026-10-29', type: 'expense', category: 'makan', desc: 'Makan siang akhir pekan', amount: 198000 },
  { id: 't45', date: '2026-10-30', type: 'expense', category: 'lainnya', desc: 'Pulsa dan kebutuhan rumah', amount: 132000 },
];

// Tips shown on the Overview page — plain budgeting advice, written for this site.
export const TIPS = [
  { title: 'Bayar kebutuhan dulu', body: 'Sewa, listrik, dan SPP dibayar di awal bulan supaya sisanya jelas untuk belanja dan tabungan.' },
  { title: 'Satu kategori, satu amplop', body: 'Belanja harian keluarga ini dijaga di bawah Rp 3,2 juta sebulan — belanja mingguan di pasar membantu menahannya.' },
  { title: 'Tabungan dipisah di awal', body: 'Rp 3 juta dipindah ke tabungan begitu gaji masuk, bukan dari sisa akhir bulan.' },
  { title: 'Cek makan di luar', body: 'Makan di luar sudah Rp 935 ribu bulan ini, sedikit di atas anggaran Rp 900 ribu — masak di rumah dua kali lagi minggu ini.' },
];
