
const victorySound = new Howl({
    src: ['./assets/sounds/victory-sound.wav'],
    volume: 0.8
});

const drawSound = new Howl({
    src: ['./assets/sounds/draw.mp3'],
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

// Modal escolha de símbolo
const symbolModal = document.getElementById('symbolModal');
const chooseX = document.getElementById('chooseX');
const chooseO = document.getElementById('chooseO');
const playVsComputerButton = document.getElementById('playVsComputer');

const infoModal = document.getElementById('infoModal');
const infoMessage = document.getElementById('infoMessage');
const closeInfoModal = document.getElementById('closeInfoModal');

// Variáveis para modos
let vsComputer = false;
let playerSymbol = 'X';
let computerSymbol = 'O';
let difficultyLevel = 'easy'; // padrão

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

const updateMessage = () => {
    if (!gameActive) return;

    if (vsComputer) {
        if (currentPlayer === playerSymbol) {
            message.textContent = `Sua vez (${playerSymbol})`;
        } else {
            message.textContent = `Vez do computador (${computerSymbol})`;
        }
    } else {
        message.textContent = `Vez do jogador ${currentPlayer}`;
    }
};


const handleClick = e => {
    const i = e.target.dataset.cell;
    if (!gameActive || board[i]) return;

    // Se for contra computador e não for vez do humano, bloqueia
    if (vsComputer && currentPlayer !== playerSymbol) return;

    makeMove(i, currentPlayer);

    if (gameActive && vsComputer && currentPlayer === computerSymbol) {
        setTimeout(computerMove, 500);
    }
};

function makeMove(i, player) {
    board[i] = player;
    cells[i].textContent = player;
    cells[i].classList.add(player);

    const winCombo = wins.find(combo => combo.every(c => board[c] === player));
    if (winCombo) {
        winCombo.forEach(c => cells[c].classList.add('win'));
        // Define a mensagem de fim de jogo
        if (vsComputer && player === computerSymbol) {
            updateMessage('Computador venceu!');
        } else if (vsComputer && player === playerSymbol) {
            updateMessage('Você venceu!');
        } else {
            updateMessage(`Jogador ${player} venceu!`);
        }

        message.classList.add('win-message');

        // Tocar som e animação
        if (soundOn) {
            if (vsComputer && player === computerSymbol) {
                drawSound.play();          // som de empate
                drawDrawConfetti();       // animação de empate
            } else {
                victorySound.play();       // humano vence ou modo 2 jogadores
                firework();               // animação de vitória
            }
        }

        gameActive = false;

        if (player === 'X') scoreX++; else scoreO++;
        updateScoreboard();
        return;
    }


    if (board.every(cell => cell)) {
        message.textContent = getEndMessage(null); // Empate
        message.classList.add('draw');

        setTimeout(() => {
            message.classList.remove('draw');
        }, 3000);

        if (soundOn) drawSound.play();
        drawDrawConfetti();
        gameActive = false;
        draws++;
        updateScoreboard();
        return;
    }


    currentPlayer = (player === 'X') ? 'O' : 'X';
    updateMessage(`Vez do jogador ${currentPlayer}`);
}

// function computerMove() {
//     const emptyCells = board
//         .map((val, idx) => val === '' ? idx : null)
//         .filter(val => val !== null);

//     if (emptyCells.length === 0) return;

//     const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
//     makeMove(randomIndex, computerSymbol);
// }

// Movimento aleatório
function randomMove() {
    const available = board.map((val, idx) => val === '' ? idx : null).filter(v => v !== null);
    return available.length > 0 ? available[Math.floor(Math.random() * available.length)] : null;
}

// Melhor movimento: ganhar ou bloquear
function bestMove() {
    // Tenta ganhar
    for (let combo of wins) {
        const [a, b, c] = combo;
        if (board[a] === computerSymbol && board[b] === computerSymbol && board[c] === '') return c;
        if (board[a] === computerSymbol && board[c] === computerSymbol && board[b] === '') return b;
        if (board[b] === computerSymbol && board[c] === computerSymbol && board[a] === '') return a;
    }

    // Tenta bloquear humano
    for (let combo of wins) {
        const [a, b, c] = combo;
        if (board[a] === playerSymbol && board[b] === playerSymbol && board[c] === '') return c;
        if (board[a] === playerSymbol && board[c] === playerSymbol && board[b] === '') return b;
        if (board[b] === playerSymbol && board[c] === playerSymbol && board[a] === '') return a;
    }

    // Senão, joga aleatório
    return randomMove();
}


function computerMove() {
    let move;

    if (difficultyLevel === 'easy') {
        // Sempre aleatório
        move = randomMove();
    } else if (difficultyLevel === 'medium') {
        // 50% chance de jogar certo
        if (Math.random() < 0.5) {
            move = bestMove(); // tenta ganhar ou bloquear
        } else {
            move = randomMove();
        }
    } else if (difficultyLevel === 'hard') {
        // Sempre tenta ganhar/bloquear
        move = bestMove();
    }

    if (move !== null) {
        makeMove(move, computerSymbol);
    }
}


function firework() {
    const duration = 2000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

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

    const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

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
    gameActive = true;

    cells.forEach(cell => {
        cell.textContent = '';
        cell.className = 'cell';
    });

    if (vsComputer) {
        // Define quem começa
        currentPlayer = (playerSymbol === 'X') ? 'X' : 'O';

        // Atualiza a mensagem imediatamente
        if (currentPlayer === playerSymbol) {
            message.textContent = `Sua vez (${playerSymbol})`;
        } else {
            message.textContent = `Vez do computador (${computerSymbol})`;
        }

        // Se o jogador escolheu 'O', o computador inicia
        if (playerSymbol === 'O') {
            setTimeout(() => computerMove(), 500);
        }
    } else {
        // Modo 2 jogadores
        currentPlayer = 'X';
        message.textContent = `Vez do jogador ${currentPlayer}`;
    }
};



// Eventos principais
cells.forEach(cell => cell.addEventListener('click', handleClick));
restartButton.addEventListener('click', startGame);

soundToggleButton.addEventListener('click', () => {
    soundOn = !soundOn;
    if (soundOn) {
        soundIcon.classList.remove('fa-volume-mute');
        soundIcon.classList.add('fa-volume-up');
        soundToggleButton.setAttribute('aria-label', 'Desativar som');
    } else {
        soundIcon.classList.remove('fa-volume-up');
        soundIcon.classList.add('fa-volume-mute');
        soundToggleButton.setAttribute('aria-label', 'Ativar som');
        victorySound.stop();
        drawSound.stop();
    }
});

resetScoreButton.addEventListener('click', () => {
    scoreX = 0;
    scoreO = 0;
    draws = 0;
    updateScoreboard();
    startGame();

    // Atualiza a mensagem de vez após reiniciar o placar
    if (vsComputer) {
        if (currentPlayer === playerSymbol) {
            message.textContent = `Sua vez (${playerSymbol})`;
        } else {
            message.textContent = `Vez do computador (${computerSymbol})`;
        }

        // Se o jogador escolheu 'O', o computador inicia
        if (playerSymbol === 'O') {
            setTimeout(() => computerMove(), 500);
        }
    } else {
        message.textContent = `Vez do jogador ${currentPlayer}`;
    }
});

// Modo computador
playVsComputerButton.addEventListener('click', () => {
    if (vsComputer) {
        // Desativa modo computador
        vsComputer = false;
        playerSymbol = 'X';
        computerSymbol = 'O';
        startGame();
        infoMessage.textContent = 'Modo computador desativado.';
        infoModal.style.display = 'flex';
        playVsComputerButton.setAttribute('aria-label', 'Ativar modo computador');
        playVsComputerButton.querySelector('i').classList.remove('fa-people-arrows');
        playVsComputerButton.querySelector('i').classList.add('fa-robot');
    } else {
        // Ativa modo computador
        vsComputer = true;
        symbolModal.style.display = 'flex';
        playVsComputerButton.setAttribute('aria-label', 'Desativar modo computador');
        playVsComputerButton.querySelector('i').classList.remove('fa-robot');
        playVsComputerButton.querySelector('i').classList.add('fa-people-arrows');
    }
});

chooseX.addEventListener('click', () => {
    playerSymbol = 'X';
    computerSymbol = 'O';
    vsComputer = true;
    symbolModal.style.display = 'none';
    startGame();
});

chooseO.addEventListener('click', () => {
    playerSymbol = 'O';
    computerSymbol = 'X';
    vsComputer = true;
    symbolModal.style.display = 'none';
    startGame();
});

// Inicializa em modo 2 jogadores
updateScoreboard();
startGame();



function getWinnerMessage(player) {
    if (vsComputer) {
        return player === playerSymbol
            ? `Você (${playerSymbol}) venceu!`
            : `Computador (${computerSymbol}) venceu!`;
    } else {
        return `Jogador ${player} venceu!`;
    }
}

function getEndMessage(player) {
    if (!player) return 'Empate!';
    if (vsComputer) {
        return (player === playerSymbol) ? 'Você venceu!' : 'Computador venceu!';
    } else {
        return `Jogador ${player} venceu!`;
    }
}

function makeMove(i, player) {
    board[i] = player;
    cells[i].textContent = player;
    cells[i].classList.add(player);

    const winCombo = wins.find(combo => combo.every(c => board[c] === player));
    if (winCombo) {
        winCombo.forEach(c => cells[c].classList.add('win'));
        message.textContent = getEndMessage(player);
        message.classList.add('win-message');

        setTimeout(() => {
            message.classList.remove('win-message');
        }, 3000);

        // Sons
        if (soundOn) {
            if (vsComputer && player === computerSymbol) {
                drawSound.play(); // computador vence → som de empate
            } else if (!vsComputer || player === playerSymbol) {
                victorySound.play(); // humano vence ou modo 2 jogadores
            }
        }

        if (vsComputer && player === computerSymbol) {
            drawDrawConfetti();
        } else if (!vsComputer || player === playerSymbol) {
            firework();
        }


        gameActive = false;

        if (player === 'X') scoreX++; else scoreO++;
        updateScoreboard();
        return;
    }

    if (board.every(cell => cell)) {
        message.textContent = getEndMessage(null); // empate
        message.classList.add('draw');
        if (soundOn) drawSound.play();
        drawDrawConfetti();
        gameActive = false;
        draws++;
        updateScoreboard();
        return;
    }

    currentPlayer = (player === 'X') ? 'O' : 'X';
    updateMessage();
}

closeInfoModal.addEventListener('click', () => {
    infoModal.style.display = 'none';
});

// Captura escolha de dificuldade
document.querySelectorAll('input[name="difficulty"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        difficultyLevel = e.target.value;
    });
});