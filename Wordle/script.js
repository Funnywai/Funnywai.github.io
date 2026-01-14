const boardEl = document.getElementById('board');
const keyboardEl = document.getElementById('keyboard');
const messageEl = document.getElementById('message');
const resetBtn = document.getElementById('resetBtn');

const ROWS = 6;
const COLS = 5;

// Compact list keeps the game offline-friendly
const WORD_BANK = [
    'APPLE', 'ROUTE', 'SHINE', 'BRAVE', 'CRANE', 'FLAIR', 'GRAPE', 'HONEY', 'IRONY', 'JAZZY',
    'KNIFE', 'LUNAR', 'MIRTH', 'NERVE', 'OPERA', 'PRISM', 'QUICK', 'RANCH', 'SOLID', 'THORN',
    'ULTRA', 'VIVID', 'WALTZ', 'XENON', 'YEARN', 'ZESTY', 'SPARK', 'BLOOM', 'CLOUD', 'DELTA',
    'EARTH', 'FAITH', 'GIANT', 'HABIT', 'IVORY', 'JUICE', 'KNOCK', 'LASER', 'METAL', 'NOBLE',
    'OCEAN', 'PIXEL', 'QUIRK', 'RIPEN', 'SLICE', 'TRACE', 'UNION', 'VISIT', 'WHEAT', 'YOUNG'
];

let target = pickWord();
let board = Array.from({ length: ROWS }, () => Array(COLS).fill(''));
let currentRow = 0;
let currentCol = 0;
let gameOver = false;

function pickWord() {
    return WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
}

function buildBoard() {
    boardEl.innerHTML = '';
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.dataset.row = r;
            tile.dataset.col = c;
            const span = document.createElement('span');
            tile.appendChild(span);
            boardEl.appendChild(tile);
        }
    }
}

function buildKeyboard() {
    keyboardEl.innerHTML = '';
    const layout = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
    ];

    layout.forEach(row => {
        const rowEl = document.createElement('div');
        rowEl.className = 'key-row';
        row.forEach(letter => addKey(letter, rowEl, letter.length > 1));
        keyboardEl.appendChild(rowEl);
    });
}

function addKey(label, parent, wide = false) {
    const key = document.createElement('button');
    key.type = 'button';
    key.className = 'key' + (wide ? ' wide' : '');
    key.textContent = label;
    key.dataset.key = label;
    key.addEventListener('click', () => handleInput(label));
    parent.appendChild(key);
}

function updateBoard() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const tile = boardEl.querySelector(`.tile[data-row="${r}"][data-col="${c}"]`);
            const span = tile.querySelector('span');
            const letter = board[r][c];
            span.textContent = letter;
            tile.classList.toggle('filled', !!letter);
        }
    }
}

function showMessage(text, color = null) {
    messageEl.textContent = text;
    if (color) messageEl.style.color = color; else messageEl.style.color = 'var(--accent)';
}

function handleInput(key) {
    if (gameOver) return;

    if (key === 'BACK' || key === 'BACKSPACE') {
        if (currentCol > 0) {
            currentCol -= 1;
            board[currentRow][currentCol] = '';
            updateBoard();
        }
        return;
    }

    if (key === 'ENTER') {
        submitGuess();
        return;
    }

    if (/^[A-Z]$/.test(key)) {
        if (currentCol < COLS) {
            board[currentRow][currentCol] = key;
            currentCol += 1;
            updateBoard();
        }
    }
}

function submitGuess() {
    if (currentCol < COLS) {
        showMessage('Need all five letters.');
        return;
    }

    const guess = board[currentRow].join('');
    if (!WORD_BANK.includes(guess) && guess !== target) {
        showMessage('Word not in list.');
        return;
    }

    const feedback = scoreGuess(guess, target);
    paintRow(feedback, currentRow);
    paintKeyboard(feedback);

    if (guess === target) {
        showMessage('Nice! You solved it.', 'var(--accent-2)');
        gameOver = true;
        return;
    }

    currentRow += 1;
    currentCol = 0;

    if (currentRow === ROWS) {
        showMessage(`Out of tries. Word was ${target}.`, 'var(--muted)');
        gameOver = true;
    }
}

function scoreGuess(guess, answer) {
    const result = Array(COLS).fill('absent');
    const answerCounts = {};

    // Count letters in answer
    for (const ch of answer) {
        answerCounts[ch] = (answerCounts[ch] || 0) + 1;
    }

    // First pass for correct positions
    for (let i = 0; i < COLS; i++) {
        if (guess[i] === answer[i]) {
            result[i] = 'correct';
            answerCounts[guess[i]] -= 1;
        }
    }

    // Second pass for present letters
    for (let i = 0; i < COLS; i++) {
        if (result[i] === 'correct') continue;
        const ch = guess[i];
        if (answerCounts[ch] > 0) {
            result[i] = 'present';
            answerCounts[ch] -= 1;
        }
    }

    return result.map((state, idx) => ({ letter: guess[idx], state }));
}

function paintRow(feedback, rowIndex) {
    feedback.forEach(({ letter, state }, colIndex) => {
        const tile = boardEl.querySelector(`.tile[data-row="${rowIndex}"][data-col="${colIndex}"]`);
        tile.classList.remove('correct', 'present', 'absent');
        tile.classList.add(state);
        tile.querySelector('span').textContent = letter;
        tile.style.animation = 'pop 0.2s ease';
        setTimeout(() => tile.style.animation = '', 250);
    });
}

function paintKeyboard(feedback) {
    feedback.forEach(({ letter, state }) => {
        const key = keyboardEl.querySelector(`[data-key="${letter}"]`);
        if (!key) return;

        const priority = { correct: 3, present: 2, absent: 1 };
        const existing = key.dataset.state;
        if (!existing || priority[state] > priority[existing]) {
            key.dataset.state = state;
            key.classList.remove('correct', 'present', 'absent');
            key.classList.add(state);
        }
    });
}

function resetGame() {
    target = pickWord();
    board = Array.from({ length: ROWS }, () => Array(COLS).fill(''));
    currentRow = 0;
    currentCol = 0;
    gameOver = false;
    showMessage('New game. Good luck!');
    updateBoard();
    keyboardEl.querySelectorAll('.key').forEach(key => {
        key.classList.remove('correct', 'present', 'absent');
        delete key.dataset.state;
    });
}

// Keyboard handlers
window.addEventListener('keydown', (e) => {
    const key = e.key.toUpperCase();
    if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-Z]$/.test(key)) {
        e.preventDefault();
        handleInput(key);
    }
});

resetBtn.addEventListener('click', resetGame);

// Startup
buildBoard();
buildKeyboard();
updateBoard();
showMessage('Type any five-letter word.');
