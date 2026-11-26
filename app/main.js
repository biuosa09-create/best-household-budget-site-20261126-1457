// Dompet Keluarga — application entry point.
//
// Owns the state (transactions, goals, bills), the hash router, and every
// interaction: adding, editing and deleting transactions, filters, sorting,
// bill toggles, adding funds to goals, and resetting the example data.
// State is kept in localStorage so a reload keeps the user's changes; the
// first load seeds it from data.js.
import { BILLS, GOALS, TRANSACTIONS } from './data.js';
import { renderBills, renderBudgets, renderGoals, renderMethods, renderOverview, renderReports, renderTransactions } from './views.js';

const STORE_KEY = 'dompet-keluarga-v1';
const app = document.getElementById('app');

function seedState() {
  return {
    transactions: TRANSACTIONS.map((t) => ({ ...t })),
    goals: GOALS.map((g) => ({ ...g })),
    bills: BILLS.map((b) => ({ ...b })),
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.transactions) || !Array.isArray(parsed.goals) || !Array.isArray(parsed.bills)) return seedState();
    return parsed;
  } catch {
    return seedState();
  }
}

function saveState() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

const state = loadState();

// UI state for the Transactions page (filters, sort, which row is being edited).
const ui = { txMonth: '2026-11', txCat: 'all', txQuery: '', txSort: 'date-desc', editingId: null };

const NAV = [
  ['#/', 'Beranda'],
  ['#/transactions', 'Transaksi'],
  ['#/budgets', 'Anggaran'],
  ['#/bills', 'Tagihan'],
  ['#/goals', 'Tabungan'],
  ['#/reports', 'Laporan'],
  ['#/methods', 'Metode'],
];

function navHtml(route) {
  return `<nav class="topnav" aria-label="Navigasi utama"><a class="brand" href="#/">Dompet Keluarga</a><div class="nav-links">${NAV.map(([href, label]) => `<a href="${href}"${route === href ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</div></nav>`;
}

function currentRoute() {
  const hash = window.location.hash || '#/';
  const path = hash.slice(1) || '/';
  return NAV.some(([href]) => href === '#' + path) ? '#' + path : '#/';
}

function render() {
  const route = currentRoute();
  let body = '';
  if (route === '#/') body = renderOverview(state);
  else if (route === '#/transactions') body = renderTransactions(state, ui);
  else if (route === '#/budgets') body = renderBudgets(state);
  else if (route === '#/bills') body = renderBills(state);
  else if (route === '#/goals') body = renderGoals(state);
  else if (route === '#/reports') body = renderReports(state);
  else body = renderMethods();
  app.innerHTML = navHtml(route) + `<main>${body}</main>` + `<footer><p>Dompet Keluarga — contoh fiktif anggaran rumah tangga, November 2026. Semua angka dihitung dari transaksi di situs ini. <a href="#/methods">Metode &amp; sumber</a></p></footer>`;
  window.scrollTo(0, 0);
}

function nextId() {
  let n = state.transactions.length + 1;
  while (state.transactions.some((t) => t.id === 't' + n)) n++;
  return 't' + n;
}

function readTxForm(form) {
  const data = new FormData(form);
  const amount = Number(data.get('amount'));
  if (!data.get('date') || !String(data.get('desc')).trim() || !Number.isFinite(amount) || amount <= 0) return null;
  return {
    date: String(data.get('date')),
    desc: String(data.get('desc')).trim(),
    category: String(data.get('category')),
    type: data.get('type') === 'income' ? 'income' : 'expense',
    amount: Math.round(amount),
  };
}

document.addEventListener('submit', (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  event.preventDefault();
  if (form.id === 'add-form') {
    const tx = readTxForm(form);
    if (!tx) return;
    state.transactions.push({ id: nextId(), ...tx });
    saveState();
    render();
    return;
  }
  if (form.dataset.edit) {
    const tx = readTxForm(form);
    if (!tx) return;
    const old = state.transactions.find((t) => t.id === form.dataset.edit);
    if (old) Object.assign(old, tx);
    ui.editingId = null;
    saveState();
    render();
    return;
  }
  if (form.dataset.goal) {
    const amount = Math.round(Number(new FormData(form).get('amount')));
    if (!Number.isFinite(amount) || amount <= 0) return;
    const goal = state.goals.find((g) => g.id === form.dataset.goal);
    if (goal) goal.saved += amount;
    saveState();
    render();
  }
});

document.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const del = target.closest('[data-delete]');
  if (del) {
    state.transactions = state.transactions.filter((t) => t.id !== del.dataset.delete);
    saveState();
    render();
    return;
  }
  const edit = target.closest('[data-edit]');
  if (edit && !edit.closest('form')) {
    ui.editingId = edit.dataset.edit;
    render();
    return;
  }
  if (target.closest('[data-cancel-edit]')) {
    ui.editingId = null;
    render();
    return;
  }
  if (target.id === 'reset-data') {
    const fresh = seedState();
    state.transactions = fresh.transactions;
    state.goals = fresh.goals;
    state.bills = fresh.bills;
    saveState();
    render();
  }
});

document.addEventListener('change', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (target.id === 'f-month') { ui.txMonth = target.value; ui.editingId = null; render(); }
  if (target.id === 'f-cat') { ui.txCat = target.value; ui.editingId = null; render(); }
  if (target.id === 'f-sort') { ui.txSort = target.value; render(); }
  if (target.dataset && target.dataset.bill) {
    const bill = state.bills.find((b) => b.id === target.dataset.bill);
    if (bill) bill.paid = target.checked;
    saveState();
    render();
  }
});

document.addEventListener('input', (event) => {
  const target = event.target;
  if (target instanceof HTMLElement && target.id === 'f-query') {
    ui.txQuery = target.value;
    // Re-render the list without losing the caret: only the table body updates.
    const rows = document.querySelector('tbody');
    if (rows) {
      render();
      const again = document.getElementById('f-query');
      if (again) { again.focus(); again.setSelectionRange(again.value.length, again.value.length); }
    }
  }
});

window.addEventListener('hashchange', () => { ui.editingId = null; render(); });

render();
