const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
const STORAGE_KEY = 'bucks-to-bar.monthly-budget.v1';
const currencyFormat = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
});
const compactCurrencyFormat = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1
});

function loadBudget() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (!Array.isArray(saved) || saved.length !== MONTHS.length) {
            return MONTHS.map(() => ({ income: 0, expenses: 0 }));
        }

        return saved.map((month) => ({
            income: normalizeAmount(month?.income),
            expenses: normalizeAmount(month?.expenses)
        }));
    } catch {
        return MONTHS.map(() => ({ income: 0, expenses: 0 }));
    }
}

function normalizeAmount(value) {
    const amount = Number(value);
    return Number.isFinite(amount) && amount >= 0 ? amount : 0;
}

function createInput(monthIndex, kind, value) {
    const label = `${MONTHS[monthIndex]} ${kind}`;
    const wrapper = document.createElement('div');
    wrapper.className = 'input-group input-group-sm money-input';

    const currencySymbol = document.createElement('span');
    currencySymbol.className = 'input-group-text';
    currencySymbol.setAttribute('aria-hidden', 'true');
    currencySymbol.textContent = '$';

    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'form-control';
    input.min = '0';
    input.step = '0.01';
    input.inputMode = 'decimal';
    input.autocomplete = 'off';
    input.value = value === 0 ? '' : String(value);
    input.dataset.month = String(monthIndex);
    input.dataset.kind = kind;
    input.setAttribute('aria-label', label);

    wrapper.append(currencySymbol, input);
    return wrapper;
}

function renderInputs(budget) {
    const rows = document.querySelector('#month-rows');
    const fragment = document.createDocumentFragment();

    MONTHS.forEach((month, index) => {
        const row = document.createElement('tr');
        const monthCell = document.createElement('th');
        monthCell.scope = 'row';
        monthCell.textContent = month;

        const incomeCell = document.createElement('td');
        incomeCell.append(createInput(index, 'income', budget[index].income));

        const expensesCell = document.createElement('td');
        expensesCell.append(createInput(index, 'expenses', budget[index].expenses));

        row.append(monthCell, incomeCell, expensesCell);
        fragment.append(row);
    });

    rows.replaceChildren(fragment);
}

function getTotals(budget) {
    return budget.reduce((totals, month) => ({
        income: totals.income + month.income,
        expenses: totals.expenses + month.expenses
    }), { income: 0, expenses: 0 });
}

function updateSummary(budget) {
    const totals = getTotals(budget);
    document.querySelector('#total-income').textContent = currencyFormat.format(totals.income);
    document.querySelector('#total-expenses').textContent = currencyFormat.format(totals.expenses);
    document.querySelector('#net-balance').textContent = currencyFormat.format(totals.income - totals.expenses);
}

function setChartMessage(message) {
    const messageElement = document.querySelector('#chart-message');
    messageElement.textContent = message;
    messageElement.hidden = !message;
}

function createChart(budget) {
    if (typeof Chart === 'undefined') {
        setChartMessage('The chart library could not be loaded. Check your internet connection and reload the page.');
        return null;
    }

    setChartMessage('');
    const canvas = document.querySelector('#budget-chart');
    const context = canvas.getContext('2d');

    return new Chart(context, {
        type: 'bar',
        data: {
            labels: MONTHS.map((month) => month.slice(0, 3)),
            datasets: [
                {
                    label: 'Income',
                    data: budget.map((month) => month.income),
                    backgroundColor: '#236b4a',
                    borderRadius: 3,
                    maxBarThickness: 27
                },
                {
                    label: 'Expenses',
                    data: budget.map((month) => month.expenses),
                    backgroundColor: '#c15348',
                    borderRadius: 3,
                    maxBarThickness: 27
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.dataset.label}: ${currencyFormat.format(context.parsed.y)}`
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#69746d', maxRotation: 0 }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: '#e3e8e3' },
                    ticks: {
                        color: '#69746d',
                        callback: (value) => compactCurrencyFormat.format(value)
                    }
                }
            }
        }
    });
}

function updateChart(chart, budget) {
    if (!chart) return;
    chart.data.datasets[0].data = budget.map((month) => month.income);
    chart.data.datasets[1].data = budget.map((month) => month.expenses);
    chart.update();
}

function downloadChartAsPng() {
    const canvas = document.querySelector('#budget-chart');
    if (!window.budgetChart || !canvas) return;

    canvas.toBlob((blob) => {
        if (!blob) {
            setChartMessage('The chart image could not be created.');
            return;
        }

        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = 'monthly-budget.png';
        link.click();
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    }, 'image/png');
}

function initializeBudget() {
    const budget = loadBudget();
    window.monthlyBudget = budget;
    renderInputs(budget);
    updateSummary(budget);
    const usernameForm = document.querySelector('#username-form');
    const usernameInput = document.querySelector('#username-input');
    const usernameStatus = document.querySelector('#username-status');
    usernameForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!usernameForm.checkValidity()) {
            usernameForm.reportValidity();
            return;
        }

        usernameStatus.textContent = 'Username submitted successfully.';
    });
    document.querySelector('#username-input').addEventListener('input', () => {
        usernameStatus.textContent = '';
    });
    document.querySelector('#download-chart').addEventListener('click', downloadChartAsPng);
    document.querySelector('#chart-tab').addEventListener('shown.bs.tab', () => {
        if (!window.budgetChart) window.budgetChart = createChart(budget);
        window.budgetChart?.resize();
    });

    document.querySelector('#month-rows').addEventListener('input', (event) => {
        const input = event.target;
        if (!(input instanceof HTMLInputElement)) return;

        const monthIndex = Number(input.dataset.month);
        const kind = input.dataset.kind;
        const amount = input.value === '' ? 0 : normalizeAmount(input.value);
        if (input.value !== '' && Number(input.value) < 0) input.value = '0';
        budget[monthIndex][kind] = amount;
        updateSummary(budget);
        updateChart(window.budgetChart, budget);

        const saveStatus = document.querySelector('#save-status');
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(budget));
            saveStatus.textContent = 'Saved in this browser';
        } catch {
            saveStatus.textContent = 'Could not save in this browser';
        }
    });
}

document.addEventListener('DOMContentLoaded', initializeBudget);