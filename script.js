const cells = document.querySelectorAll('.cell');
const message = document.getElementById('message');
const restartButton = document.getElementById('restartButton');

let currentPlayer = 'X';
let board = Array(9).fill('');
let gameActive = true;

const wins = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

const updateMessage = text => message.textContent = text;

const handleClick = e => {
    const i = e.target.dataset.cell;
    if (!gameActive || board[i]) return;

    board[i] = currentPlayer;
    e.target.textContent = currentPlayer;
    e.target.classList.add(currentPlayer);

    if (wins.some(combo => combo.every(c => board[c] === currentPlayer))) {
        updateMessage(`Jogador ${currentPlayer} venceu!`);
        gameActive = false;
    } else if (board.every(cell => cell)) {
        updateMessage('Empate!');
        gameActive = false;
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateMessage(`Vez do jogador ${currentPlayer}`);
    }
};

const startGame = () => {
    board = Array(9).fill('');
    currentPlayer = 'X';
    gameActive = true;
    updateMessage(`Vez do jogador ${currentPlayer}`);
    cells.forEach(cell => {
        cell.textContent = '';
        cell.className = 'cell';
    });
};

cells.forEach(cell => cell.addEventListener('click', handleClick));
restartButton.addEventListener('click', startGame);
startGame();