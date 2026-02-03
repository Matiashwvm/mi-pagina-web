const GRID_SIZE = 12;
const words = ['PERRO', 'GATO', 'LEON', 'TIGRE', 'OSO', 'LOBO'];
const animalEmojis = {
    'PERRO': '🐕',
    'GATO': '🐱',
    'LEON': '🦁',
    'TIGRE': '🐅',
    'OSO': '🐻',
    'LOBO': '🐺'
};

let grid = [];
let foundWords = new Set();
let selectedCells = [];
let isSelecting = false;

function initGame() {
    grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(''));
    foundWords = new Set();
    selectedCells = [];
    closeModal();
    
    placeWords();
    fillEmptySpaces();
    renderGrid();
    renderWordsList();
    updateScore();
}

function placeWords() {
    const directions = [
        [0, 1],
        [1, 0],
        [1, 1],
        [-1, 1],
    ];

    words.forEach(word => {
        let placed = false;
        let attempts = 0;
        
        while (!placed && attempts < 100) {
            const direction = directions[Math.floor(Math.random() * directions.length)];
            const startRow = Math.floor(Math.random() * GRID_SIZE);
            const startCol = Math.floor(Math.random() * GRID_SIZE);
            
            if (canPlaceWord(word, startRow, startCol, direction)) {
                placeWord(word, startRow, startCol, direction);
                placed = true;
            }
            attempts++;
        }
    });
}

function canPlaceWord(word, row, col, [dRow, dCol]) {
    for (let i = 0; i < word.length; i++) {
        const newRow = row + (dRow * i);
        const newCol = col + (dCol * i);
        
        if (newRow < 0 || newRow >= GRID_SIZE || newCol < 0 || newCol >= GRID_SIZE) {
            return false;
        }
        
        if (grid[newRow][newCol] !== '' && grid[newRow][newCol] !== word[i]) {
            return false;
        }
    }
    return true;
}

function placeWord(word, row, col, [dRow, dCol]) {
    for (let i = 0; i < word.length; i++) {
        const newRow = row + (dRow * i);
        const newCol = col + (dCol * i);
        grid[newRow][newCol] = word[i];
    }
}

function fillEmptySpaces() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            if (grid[i][j] === '') {
                grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
            }
        }
    }
}

function renderGrid() {
    const gridElement = document.getElementById('grid');
    gridElement.innerHTML = '';
    
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.textContent = grid[i][j];
            cell.dataset.row = i;
            cell.dataset.col = j;
            
            cell.addEventListener('mousedown', startSelection);
            cell.addEventListener('mouseenter', continueSelection);
            cell.addEventListener('mouseup', endSelection);
            cell.addEventListener('touchstart', handleTouchStart, {passive: false});
            cell.addEventListener('touchmove', handleTouchMove, {passive: false});
            cell.addEventListener('touchend', endSelection);
            
            gridElement.appendChild(cell);
        }
    }
}

function handleTouchStart(e) {
    e.preventDefault();
    startSelection({target: e.target});
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element && element.classList.contains('cell')) {
        continueSelection({target: element});
    }
}

function startSelection(e) {
    if (e.target.classList.contains('found')) return;
    isSelecting = true;
    selectedCells = [e.target];
    e.target.classList.add('selected');
}

function continueSelection(e) {
    if (!isSelecting || e.target.classList.contains('found')) return;
    
    if (!selectedCells.includes(e.target)) {
        selectedCells.push(e.target);
        e.target.classList.add('selected');
    }
}

function endSelection() {
    if (!isSelecting) return;
    isSelecting = false;
    
    const selectedWord = selectedCells.map(cell => cell.textContent).join('');
    const reversedWord = selectedWord.split('').reverse().join('');
    
    if (words.includes(selectedWord) && !foundWords.has(selectedWord)) {
        foundWords.add(selectedWord);
        selectedCells.forEach(cell => {
            cell.classList.remove('selected');
            cell.classList.add('found');
        });
        createEnhancedCelebration(selectedWord);
        updateScore();
        renderWordsList();
        
        if (foundWords.size === words.length) {
            setTimeout(() => showSuccessModal(), 800);
        }
    } else if (words.includes(reversedWord) && !foundWords.has(reversedWord)) {
        foundWords.add(reversedWord);
        selectedCells.forEach(cell => {
            cell.classList.remove('selected');
            cell.classList.add('found');
        });
        createEnhancedCelebration(reversedWord);
        updateScore();
        renderWordsList();
        
        if (foundWords.size === words.length) {
            setTimeout(() => showSuccessModal(), 800);
        }
    } else {
        selectedCells.forEach(cell => cell.classList.remove('selected'));
    }
    
    selectedCells = [];
}

function renderWordsList() {
    const wordsListElement = document.getElementById('wordsList');
    wordsListElement.innerHTML = words.map((word, index) => `
        <div class="word-item ${foundWords.has(word) ? 'found' : ''}">
            ${animalEmojis[word]} ${word}
            <button class="edit-word-btn" data-index="${index}">✏️</button>
        </div>
    `).join('');

    document.querySelectorAll('.edit-word-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            editWord(index);
        });
    });
}

function updateScore() {
    const scoreElement = document.getElementById('score');
    scoreElement.textContent = `Encontradas: ${foundWords.size}/${words.length}`;
    
    if (foundWords.size > 0) {
        scoreElement.style.animation = 'none';
        setTimeout(() => {
            scoreElement.style.animation = 'scoreShine 3s linear infinite';
        }, 10);
    }
}
function createEnhancedCelebration(word) {
    const colors = ['#ff6b35', '#a05195', '#4fa152', '#ffd700', '#5bc0de'];
    const emoji = animalEmojis[word];
    for (let i = 0; i < 40; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * window.innerWidth + 'px';
            confetti.style.top = '-20px';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            confetti.style.animation = `confettiFall ${2 + Math.random() * 2}s linear forwards`;
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 4000);
        }, i * 20);
    }
    for (let i = 0; i < 12; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.textContent = emoji;
            particle.style.left = (window.innerWidth / 2 + (Math.random() - 0.5) * 200) + 'px';
            particle.style.top = (window.innerHeight / 2) + 'px';
            particle.style.animation = `particleBounce ${1.5 + Math.random()}s ease-out forwards`;
            document.body.appendChild(particle);
            
            setTimeout(() => particle.remove(), 2500);
        }, i * 50);
    }
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const star = document.createElement('div');
            star.className = 'particle';
            star.textContent = '⭐';
            star.style.left = (window.innerWidth / 2 + (Math.random() - 0.5) * 300) + 'px';
            star.style.top = (window.innerHeight / 2 - 50) + 'px';
            star.style.animation = `particleBounce ${1 + Math.random()}s ease-out forwards`;
            document.body.appendChild(star);
            
            setTimeout(() => star.remove(), 2000);
        }, i * 80);
    }
}

function showSuccessModal() {
    document.getElementById('modalOverlay').classList.add('show');
    document.getElementById('successModal').classList.add('show');
    
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const colors = ['#ff6b35', '#a05195', '#4fa152', '#ffd700', '#5bc0de'];
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * window.innerWidth + 'px';
            confetti.style.top = '-20px';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            confetti.style.animation = `confettiFall ${2 + Math.random() * 3}s linear forwards`;
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 5000);
        }, i * 30);
    }
    const allEmojis = Object.values(animalEmojis);
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.textContent = allEmojis[Math.floor(Math.random() * allEmojis.length)];
            particle.style.left = (window.innerWidth / 2 + (Math.random() - 0.5) * 400) + 'px';
            particle.style.top = (window.innerHeight / 2 + (Math.random() - 0.5) * 200) + 'px';
            particle.style.animation = `particleBounce ${1.5 + Math.random()}s ease-out forwards`;
            document.body.appendChild(particle);
            
            setTimeout(() => particle.remove(), 3000);
        }, i * 60);
    }
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('show');
    document.getElementById('successModal').classList.remove('show');
}

document.addEventListener('mouseup', () => {
    isSelecting = false;
});
initGame();
function addNewWord() {
    const newWord = document.getElementById('newWordInput').value.trim().toUpperCase();
    if (newWord && !words.includes(newWord) && newWord.length <= GRID_SIZE) {
        words.push(newWord);
        animalEmojis[newWord] = '🦓';
        initGame();
        document.getElementById('newWordInput').value = '';
    } else {
        alert(`La palabra debe ser única, no estar ya en la lista, y tener ${GRID_SIZE} letras o menos.`);
    }
}
document.getElementById('addWordButton').addEventListener('click', addNewWord);
document.getElementById('newWordInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addNewWord();
});
function editWord(index) {
    const newWord = prompt("Edita la palabra:", words[index]);
    if (newWord && newWord.trim() !== "") {
        const oldWord = words[index];
        const normalizedNewWord = newWord.trim().toUpperCase();
        if (!words.includes(normalizedNewWord) || normalizedNewWord === oldWord) {
            if (normalizedNewWord.length <= GRID_SIZE) {
                words[index] = normalizedNewWord;
                if (foundWords.has(oldWord)) {
                    foundWords.delete(oldWord);
                    foundWords.add(normalizedNewWord);
                }
                if (!animalEmojis[normalizedNewWord]) {
                    animalEmojis[normalizedNewWord] = '🦓';
                }
                initGame();
            } else {
                alert(`La palabra debe tener ${GRID_SIZE} letras o menos.`);
            }
        } else {
            alert("Esta palabra ya existe en la lista.");
        }
    }
}