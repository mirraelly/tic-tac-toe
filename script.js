const victorySound = new Howl({
    src: ['sounds/victory-sound.wav'],
    volume: 0.8
});

const drawSound = new Howl({
    src: ['sounds/drow.mp3'],
    volume: 0.6
});

const cells = document.querySelectorAll('.cell');
const message = document.getElementById('message');
const restartButton = document.getElementById('restartButton');
const soundToggleButton = document.getElementById('soundToggleButton');
const soundIcon = document.getElementById('soundIcon');
const scorePlayerX = document.getElementById('scorePlayerX');
const scorePlayerO = document.getElementById('scorePlayerO');
const scoreDraws = document.getElementById('scoreDraws');
const resetScoreButton = document.getElementById('resetScoreButton');

let currentPlayer = 'X';
let board = Array(9).fill('');
let gameActive = true;
let soundOn = true;
let scoreX = 0;
let scoreO = 0;
let draws = 0;

const wins = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

const updateScoreboard = () => {
    scorePlayerX.textContent = `Jogador X: ${scoreX}`;
    scorePlayerO.textContent = `Jogador O: ${scoreO}`;
    scoreDraws.textContent = `Empates: ${draws}`;
};


const updateMessage = text => message.textContent = text;

const handleClick = e => {
    const i = e.target.dataset.cell;
    if (!gameActive || board[i]) return;

    board[i] = currentPlayer;
    e.target.textContent = currentPlayer;
    e.target.classList.add(currentPlayer);

    const winCombo = wins.find(combo => combo.every(c => board[c] === currentPlayer));
    if (winCombo) {
        winCombo.forEach(i => cells[i].classList.add('win'));
        updateMessage(`Jogador ${currentPlayer} venceu!`);
        message.classList.add('win-message');
        if (soundOn) victorySound.play();
        setTimeout(() => {
            message.classList.remove('win-message');
        }, 3000);
        firework();
        gameActive = false;

        if (currentPlayer === 'X') {
            scoreX++;
        } else {
            scoreO++;
        }
        updateScoreboard();
    }
    else if (board.every(cell => cell)) {
        updateMessage('Empate!');
        message.classList.add('draw');
        if (soundOn) drawSound.play();
        setTimeout(() => {
            message.classList.remove('draw');
        }, 3000);
        drawDrawConfetti();
        gameActive = false;

        draws++;
        updateScoreboard();
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateMessage(`Vez do jogador ${currentPlayer}`);
    }
};

function firework() {
    const duration = 2000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti(Object.assign({}, defaults, {
            particleCount,
            origin: { x: Math.random(), y: Math.random() * 0.5 }
        }));
    }, 250);
}

function drawDrawConfetti() {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 10, spread: 60, ticks: 120, zIndex: 1000, colors: ['#a0aec0', '#cbd5e1', '#f1f5f9'] };

    const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            clearInterval(interval);
            return;
        }

        confetti(Object.assign({}, defaults, {
            particleCount: 5,
            origin: { x: Math.random(), y: 0 }
        }));
    }, 200);
}

const startGame = () => {
    victorySound.stop();
    drawSound.stop();
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

soundToggleButton.addEventListener('click', () => {
    soundOn = !soundOn;
    if (soundOn) {
        soundIcon.classList.remove('fa-volume-mute');
        soundIcon.classList.add('fa-volume-up');
    } else {
        soundIcon.classList.remove('fa-volume-up');
        soundIcon.classList.add('fa-volume-mute');
    }
});

resetScoreButton.addEventListener('click', () => {
    scoreX = 0;
    scoreO = 0;
    draws = 0;
    updateScoreboard();
    startGame();
});