import '/src/css/base.css'
import { storage } from './storage.js'
import { initAuth } from './auth.js'

// Ensure Chart.js is available globally via CDN script in index.html

document.addEventListener('DOMContentLoaded', async () => {
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('date');
  if (dateInput) dateInput.value = today;
  let entries = await storage.getAll();
  let chart, weeklyChart, monthlyChart;

  const motivationalQuotes = [
    "Believe you can and you're halfway there. - Theodore Roosevelt",
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Your time is limited, don't waste it living someone else's life. - Steve Jobs",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "You miss 100% of the shots you don't take. - Wayne Gretzky",
    "The best way to predict the future is to create it. - Peter Drucker",
    "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
    "The only limit to our realization of tomorrow will be our doubts of today. - Franklin D. Roosevelt",
    "Success is not final, failure is not fatal: It is the courage to continue that counts. - Winston Churchill",
    "The way to get started is to quit talking and begin doing. - Walt Disney",
    "Believe in yourself and all that you are. Know that there is something inside you that is greater than any obstacle. - Christian D. Larson",
    "Every expert was once a beginner. - Helen Hayes",
    "The journey of a thousand miles begins with one step. - Lao Tzu",
    "You are never too old to set another goal or to dream a new dream. - C.S. Lewis",
    "The only person you are destined to become is the person you decide to be. - Ralph Waldo Emerson",
    "Hardships often prepare ordinary people for an extraordinary destiny. - C.S. Lewis",
    "What lies behind us and what lies before us are tiny matters compared to what lies within us. - Ralph Waldo Emerson",
    "The mind is everything. What you think you become. - Buddha",
    "You have within you right now, everything you need to deal with whatever the world can throw at you. - Brian Tracy",
    "Fall seven times, stand up eight. - Japanese Proverb"
  ];

  function getDailyQuote() {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return motivationalQuotes[dayOfYear % motivationalQuotes.length];
  }

  function updateCountdown() {
    const examDate = new Date('2027-01-21');
    const now = new Date();
    const timeDiff = examDate - now;
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    const el = document.getElementById('countdownTimer');
    if (el) el.textContent = `⏳ ${daysLeft} days until JEE exam. Stay focused!`;
  }

  const quoteEl = document.getElementById('dailyQuote');
  if (quoteEl) quoteEl.textContent = getDailyQuote();
  updateCountdown();
  setInterval(updateCountdown, 60000);

  window.showTab = function(tabName) {
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));
    const el = document.getElementById(tabName);
    if (el) el.classList.add('active');
    const btn = Array.from(document.querySelectorAll('.tab-button')).find(b => b.getAttribute('data-target') === tabName);
    if (btn) btn.classList.add('active');
    if (tabName === 'weekly') renderWeekly();
    if (tabName === 'monthly') renderMonthly();
  }

  function renderTable() {
    const table = document.getElementById('entriesTable');
    if (!table) return;
    while (table.rows.length > 1) table.deleteRow(1);
    entries.forEach((entry, index) => {
      const row = table.insertRow();
      row.insertCell().textContent = entry.date;
      const physicsTime = entry.subjects.physics.time || 0;
      row.insertCell().textContent = `${entry.subjects.physics.attempted}/${entry.subjects.physics.correct}/${physicsTime}`;
      const chemistryTime = entry.subjects.chemistry.time || 0;
      row.insertCell().textContent = `${entry.subjects.chemistry.attempted}/${entry.subjects.chemistry.correct}/${chemistryTime}`;
      const mathTime = entry.subjects.math.time || 0;
      row.insertCell().textContent = `${entry.subjects.math.attempted}/${entry.subjects.math.correct}/${mathTime}`;
      const totalTime = physicsTime + chemistryTime + mathTime;
      row.insertCell().textContent = totalTime.toFixed(1);
      row.insertCell().textContent = entry.topics;
      const actionsCell = row.insertCell();
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.onclick = () => deleteEntry(index);
      actionsCell.appendChild(deleteBtn);
    });
  }

  function renderStats() {
    const totalEntries = entries.length;
    const totalEntriesEl = document.getElementById('totalEntries');
    if (totalEntriesEl) totalEntriesEl.textContent = `Total Entries: ${totalEntries}`;

    let totalPhysicsAtt = 0, totalPhysicsCorr = 0, totalPhysicsTime = 0;
    let totalChemistryAtt = 0, totalChemistryCorr = 0, totalChemistryTime = 0;
    let totalMathAtt = 0, totalMathCorr = 0, totalMathTime = 0;
    let totalTime = 0;

    entries.forEach(entry => {
      totalPhysicsAtt += entry.subjects.physics.attempted;
      totalPhysicsCorr += entry.subjects.physics.correct;
      totalPhysicsTime += entry.subjects.physics.time || 0;
      totalChemistryAtt += entry.subjects.chemistry.attempted;
      totalChemistryCorr += entry.subjects.chemistry.correct;
      totalChemistryTime += entry.subjects.chemistry.time || 0;
      totalMathAtt += entry.subjects.math.attempted;
      totalMathCorr += entry.subjects.math.correct;
      totalMathTime += entry.subjects.math.time || 0;
      totalTime += (entry.subjects.physics.time || 0) + (entry.subjects.chemistry.time || 0) + (entry.subjects.math.time || 0);
    });

    const physicsAcc = totalPhysicsAtt > 0 ? ((totalPhysicsCorr / totalPhysicsAtt) * 100).toFixed(1) : 0;
    const chemistryAcc = totalChemistryAtt > 0 ? ((totalChemistryCorr / totalChemistryAtt) * 100).toFixed(1) : 0;
    const mathAcc = totalMathAtt > 0 ? ((totalMathCorr / totalMathAtt) * 100).toFixed(1) : 0;

    const physicsStatsEl = document.getElementById('physicsStats');
    if (physicsStatsEl) physicsStatsEl.textContent = `Physics: ${totalPhysicsAtt} att, ${totalPhysicsCorr} corr (${physicsAcc}%), ${totalPhysicsTime.toFixed(1)} hrs`;
    const chemistryStatsEl = document.getElementById('chemistryStats');
    if (chemistryStatsEl) chemistryStatsEl.textContent = `Chemistry: ${totalChemistryAtt} att, ${totalChemistryCorr} corr (${chemistryAcc}%), ${totalChemistryTime.toFixed(1)} hrs`;
    const mathStatsEl = document.getElementById('mathStats');
    if (mathStatsEl) mathStatsEl.textContent = `Math: ${totalMathAtt} att, ${totalMathCorr} corr (${mathAcc}%), ${totalMathTime.toFixed(1)} hrs`;
    const totalTimeEl = document.getElementById('totalTime');
    if (totalTimeEl) totalTimeEl.textContent = `Total Time: ${totalTime.toFixed(1)} hrs`;

    const questionsCanvas = document.getElementById('questionsChart');
    if (questionsCanvas && typeof Chart !== 'undefined') {
      const ctx = questionsCanvas.getContext('2d');
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Physics', 'Chemistry', 'Math'],
          datasets: [{ data: [totalPhysicsAtt, totalChemistryAtt, totalMathAtt], backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'] }]
        },
        options: { responsive: true }
      });
    }
  }

  function renderWeekly() {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const weekEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startOfWeek && entryDate <= endOfWeek;
    });

    const daysInWeek = weekEntries.length;
    const weekEntriesEl = document.getElementById('weekEntries');
    if (weekEntriesEl) weekEntriesEl.textContent = `Days with entries: ${daysInWeek}`;

    let totalPhysicsAtt = 0, totalChemistryAtt = 0, totalMathAtt = 0, totalTime = 0;
    weekEntries.forEach(entry => {
      totalPhysicsAtt += entry.subjects.physics.attempted;
      totalChemistryAtt += entry.subjects.chemistry.attempted;
      totalMathAtt += entry.subjects.math.attempted;
      totalTime += (entry.subjects.physics.time || 0) + (entry.subjects.chemistry.time || 0) + (entry.subjects.math.time || 0);
    });

    const avgPhysics = daysInWeek > 0 ? (totalPhysicsAtt / daysInWeek).toFixed(1) : 0;
    const avgChemistry = daysInWeek > 0 ? (totalChemistryAtt / daysInWeek).toFixed(1) : 0;
    const avgMath = daysInWeek > 0 ? (totalMathAtt / daysInWeek).toFixed(1) : 0;
    const avgQuestions = daysInWeek > 0 ? ((totalPhysicsAtt + totalChemistryAtt + totalMathAtt) / daysInWeek).toFixed(1) : 0;

    const weekPhysicsEl = document.getElementById('weekPhysics'); if (weekPhysicsEl) weekPhysicsEl.textContent = `Physics: ${totalPhysicsAtt} att, avg ${avgPhysics}/day`;
    const weekChemistryEl = document.getElementById('weekChemistry'); if (weekChemistryEl) weekChemistryEl.textContent = `Chemistry: ${totalChemistryAtt} att, avg ${avgChemistry}/day`;
    const weekMathEl = document.getElementById('weekMath'); if (weekMathEl) weekMathEl.textContent = `Math: ${totalMathAtt} att, avg ${avgMath}/day`;
    const weekTotalTimeEl = document.getElementById('weekTotalTime'); if (weekTotalTimeEl) weekTotalTimeEl.textContent = `Total Time: ${totalTime.toFixed(1)} hrs`;
    const weekAvgQuestionsEl = document.getElementById('weekAvgQuestions'); if (weekAvgQuestionsEl) weekAvgQuestionsEl.textContent = `Avg Questions/Day: ${avgQuestions}`;

    const weeklyCanvas = document.getElementById('weeklyChart');
    if (weeklyCanvas && typeof Chart !== 'undefined') {
      const ctx = weeklyCanvas.getContext('2d');
      if (weeklyChart) weeklyChart.destroy();
      weeklyChart = new Chart(ctx, {
        type: 'bar',
        data: { labels: ['Physics', 'Chemistry', 'Math'], datasets: [{ label: 'Questions Attempted', data: [totalPhysicsAtt, totalChemistryAtt, totalMathAtt], backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'] }] },
        options: { responsive: true }
      });
    }
  }

  function renderMonthly() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    const monthEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startOfMonth && entryDate <= endOfMonth;
    });

    const daysInMonth = monthEntries.length;
    const monthEntriesEl = document.getElementById('monthEntries'); if (monthEntriesEl) monthEntriesEl.textContent = `Days with entries: ${daysInMonth}`;

    let totalPhysicsAtt = 0, totalChemistryAtt = 0, totalMathAtt = 0, totalTime = 0;
    monthEntries.forEach(entry => {
      totalPhysicsAtt += entry.subjects.physics.attempted;
      totalChemistryAtt += entry.subjects.chemistry.attempted;
      totalMathAtt += entry.subjects.math.attempted;
      totalTime += (entry.subjects.physics.time || 0) + (entry.subjects.chemistry.time || 0) + (entry.subjects.math.time || 0);
    });

    const avgPhysics = daysInMonth > 0 ? (totalPhysicsAtt / daysInMonth).toFixed(1) : 0;
    const avgChemistry = daysInMonth > 0 ? (totalChemistryAtt / daysInMonth).toFixed(1) : 0;
    const avgMath = daysInMonth > 0 ? (totalMathAtt / daysInMonth).toFixed(1) : 0;
    const avgQuestions = daysInMonth > 0 ? ((totalPhysicsAtt + totalChemistryAtt + totalMathAtt) / daysInMonth).toFixed(1) : 0;

    const monthPhysicsEl = document.getElementById('monthPhysics'); if (monthPhysicsEl) monthPhysicsEl.textContent = `Physics: ${totalPhysicsAtt} att, avg ${avgPhysics}/day`;
    const monthChemistryEl = document.getElementById('monthChemistry'); if (monthChemistryEl) monthChemistryEl.textContent = `Chemistry: ${totalChemistryAtt} att, avg ${avgChemistry}/day`;
    const monthMathEl = document.getElementById('monthMath'); if (monthMathEl) monthMathEl.textContent = `Math: ${totalMathAtt} att, avg ${avgMath}/day`;
    const monthTotalTimeEl = document.getElementById('monthTotalTime'); if (monthTotalTimeEl) monthTotalTimeEl.textContent = `Total Time: ${totalTime.toFixed(1)} hrs`;
    const monthAvgQuestionsEl = document.getElementById('monthAvgQuestions'); if (monthAvgQuestionsEl) monthAvgQuestionsEl.textContent = `Avg Questions/Day: ${avgQuestions}`;

    const monthlyCanvas = document.getElementById('monthlyChart');
    if (monthlyCanvas && typeof Chart !== 'undefined') {
      const ctx = monthlyCanvas.getContext('2d');
      if (monthlyChart) monthlyChart.destroy();
      monthlyChart = new Chart(ctx, {
        type: 'bar',
        data: { labels: ['Physics', 'Chemistry', 'Math'], datasets: [{ label: 'Questions Attempted', data: [totalPhysicsAtt, totalChemistryAtt, totalMathAtt], backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'] }] },
        options: { responsive: true }
      });
    }
  }

  async function saveEntry(event) {
    event.preventDefault();
    const date = document.getElementById('date').value;
    const entry = {
      date,
      subjects: {
        physics: { attempted: parseInt(document.getElementById('physicsAttempted').value) || 0, correct: parseInt(document.getElementById('physicsCorrect').value) || 0, time: parseFloat(document.getElementById('physicsTime').value) || 0 },
        chemistry: { attempted: parseInt(document.getElementById('chemistryAttempted').value) || 0, correct: parseInt(document.getElementById('chemistryCorrect').value) || 0, time: parseFloat(document.getElementById('chemistryTime').value) || 0 },
        math: { attempted: parseInt(document.getElementById('mathAttempted').value) || 0, correct: parseInt(document.getElementById('mathCorrect').value) || 0, time: parseFloat(document.getElementById('mathTime').value) || 0 }
      },
      topics: document.getElementById('topics').value
    };
    const existingIndex = entries.findIndex(e => e.date === date);
    if (existingIndex >= 0) entries[existingIndex] = entry; else entries.push(entry);
    await storage.saveAll(entries);
    renderTable(); renderStats(); clearForm();
  }

  async function deleteEntry(index) { const entry = entries[index]; if (!entry) return; entries.splice(index, 1); await storage.deleteByDate(entry.date); renderTable(); renderStats(); }
  function clearForm() { const form = document.getElementById('entryForm'); if (form) form.reset(); const d = document.getElementById('date'); if (d) d.value = today; }

  // Dark mode
  const darkModeToggle = document.getElementById('darkModeToggle');
  const body = document.body;
  function applyDarkMode(isDark) {
    if (isDark) { body.classList.add('dark-mode'); darkModeToggle.textContent = 'Light Mode'; } else { body.classList.remove('dark-mode'); darkModeToggle.textContent = 'Dark Mode'; }
    localStorage.setItem('darkMode', isDark);
  }
  const savedDarkMode = localStorage.getItem('darkMode') === 'true';
  applyDarkMode(savedDarkMode);
  if (darkModeToggle) darkModeToggle.addEventListener('click', () => { const isDark = !body.classList.contains('dark-mode'); applyDarkMode(isDark); });

  const form = document.getElementById('entryForm'); if (form) form.addEventListener('submit', saveEntry);
  // Init auth UI and storage sync
  initAuth(storage, async (mode) => {
    // mode changed (local/remote) — reload entries from storage
    entries = await storage.getAll();
    renderTable(); renderStats();
  });
  renderTable(); renderStats();
});
