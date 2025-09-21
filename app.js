const d = document;
const outputEl = d.getElementById('calc-output');
const exprEl = d.getElementById('calc-expression');
const buttons = Array.from(d.querySelectorAll('.calc-btn'));
let current = '';
let tokens = [];
const toJsOp = s => ({ '×': '', '÷': '/', '−': '-', '+': '+' }[s] || s);
const toDisplayOp = s => ({ '': '×', '/': '÷', '-': '−', '+' '+' }[s] || s);
function updateDisplay() {
    exprEl.textContent = tokens.map(t => typeof t === 'object' ? t.display : t).join(' ');
    outputEl.textContent = current === '' ? '0' : current;
}
function pushCurrent() {
    if (current === '') return;
    tokens.push({ type: 'number', value: parseFloat(current), display: current });
    current = '';
}
function handleDigit(v) {
    if (current === '0' && v === '0') return;
    if (current === '0' && v !== '.') current = v;
    else current += v;
}
function handleDecimal() {
    if (current.includes('.')) return;
    if (current === '') current = '0.';
    else current += '.';
}
function handleOperator(sym) {
    const op = toJsOp(sym);
    if (current !== '') pushCurrent();
    if (tokens.length === 0) {
        if (op === '-') tokens.push({ type: 'number', value: 0, display: '0' });
        else return;
    }
    const last = tokens[tokens.length - 1];
    if (last && last.type === 'operator') tokens[tokens.length - 1] = { type: 'operator', value: op, display: sym };
    else tokens.push({ type: 'operator', value: op, display: sym });
}
function handleBackspace() {
    if (current !== '') {
        current = current.slice(0, -1);
        if (current === '') current = '';
        return;
    }
    const last = tokens.pop();
    if (last && last.type === 'number') {
        current = String(last.display);
    }
}
function handleClear() {
    current = '';
    tokens = [];
}
function handleNegate() {
    if (current !== '') {
        if (current.startsWith('-')) current = current.slice(1);
        else current = '-' + current;
    } else {
        const last = tokens[tokens.length - 1];
        if (last && last.type === 'number') {
            last.value = -last.value;
            last.display = String(last.value);
        }
    }
}
function toRPN(ts) {
    const out = [];
    const ops = [];
    const prec = { '+': 1, '-': 1, '': 2, '/': 2 };
    ts.forEach(t => {
        if (t.type === 'number') out.push(t);
        else if (t.type === 'operator') {
            while (ops.length && prec[ops[ops.length - 1].value] >= prec[t.value]) {
                out.push(ops.pop());
            }
            ops.push(t);
        }
    });
    while (ops.length) out.push(ops.pop());
    return out;
}
function evalRPN(rpn) {
    const st = [];
    for (const t of rpn) {
        if (t.type === 'number') st.push(t.value);
        else {
            const b = st.pop();
            const a = st.pop();
            if (t.value === '/' && b === 0) throw new Error('DIV0');
            let r;
            if (t.value === '+') r = a + b;
            else if (t.value === '-') r = a - b;
            else if (t.value === '') r = a * b;
            else if (t.value === '/') r = a / b;
            st.push(r);
        }
    }
    return st.pop();
}
function handleEquals() {
    if (current !== '') pushCurrent();
    if (tokens.length === 0) return;
    try {
        const rpn = toRPN(tokens);
        const res = evalRPN(rpn);
        const rounded = Math.round((res + Number.EPSILON) * 1e12) / 1e12;
        current = String(rounded);
        tokens = [];
    } catch (e) {
        current = 'Erro';
        tokens = [];
    }
}
buttons.forEach(btn => {
    btn.addEventListener('click', e => {
        const action = btn.dataset.action;
        const value = btn.dataset.value;
        if (action === 'digit') handleDigit(value);
        else if (action === 'decimal') handleDecimal();
        else if (action === 'operator') handleOperator(value);
        else if (action === 'clear') handleClear();
        else if (action === 'backspace') handleBackspace();
        else if (action === 'negate') handleNegate();
        else if (action === 'equals') handleEquals();
        updateDisplay();
    });
});
d.addEventListener('keydown', e => {
    if (e.key >= '0' && e.key <= '9') { handleDigit(e.key); updateDisplay(); return; }
    if (e.key === '.') { handleDecimal(); updateDisplay(); return; }
    if (e.key === 'Enter' || e.key === '=') { handleEquals(); updateDisplay(); return; }
    if (e.key === 'Backspace') { handleBackspace(); updateDisplay(); return; }
    if (e.key === 'Escape') { handleClear(); updateDisplay(); return; }
    if (e.key === '+' || e.key === '-' || e.key === '' || e.key === '/') {
        const map = { '': '×', '/': '÷', '-': '−', '+': '+' };
        handleOperator(map[e.key]);
        updateDisplay();
        return;
    }
});
updateDisplay();
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').catch(() => { });
}