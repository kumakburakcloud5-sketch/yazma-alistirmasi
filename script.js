const wordBox = document.getElementById('word-box');
const inputBox = document.getElementById('input-box');
const correctCountElement = document.getElementById('correct-count');
const incorrectCountElement = document.getElementById('incorrect-count');
const incorrectWordsBox = document.querySelector('.incorrect-words-box');
const incorrectWordsListElement = document.getElementById('incorrect-words-list');
const copyButton = document.getElementById('copy-button');
const practiceButton = document.getElementById('practice-button');
const copyMessageElement = document.getElementById('copy-message');
const endSessionModal = document.getElementById('end-session-modal');
const newSessionButton = document.getElementById('new-session');

const WORDS_PER_PAGE = 8;

let masterWordList = [];
let currentWordList = [];
let incorrectWordsList = [];
let currentWordIndex = 0;
let correctWordsCount = 0;
let incorrectWordsCount = 0;

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function updateCounters() {
    correctCountElement.textContent = `Doğru: ${correctWordsCount}`;
    incorrectCountElement.textContent = `Yanlış: ${incorrectWordsCount}`;
}

function displayIncorrectWords() {
    incorrectWordsListElement.innerHTML = '';
    incorrectWordsList.forEach(item => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<strong>Doğrusu:</strong> ${item.correctWord} <br> <strong>Senin Yazdığın:</strong> <span>${item.typedWord}</span>`;
        incorrectWordsListElement.appendChild(listItem);
    });
}

function updateDisplayedWords() {
    const wordsInBox = wordBox.querySelectorAll('span');
    wordsInBox.forEach(span => span.classList.remove('current'));
    if (currentWordIndex < wordsInBox.length) {
        wordsInBox[currentWordIndex].classList.add('current');
    }
}

function generateAndDisplayWords(listToUse) {
    if (listToUse.length === 0) {
        wordBox.textContent = "Kelimeler yükleniyor veya bulunamadı...";
        return;
    }

    currentWordList = [];
    const tempWordList = [...listToUse];
    shuffleArray(tempWordList);

    for (let i = 0; i < WORDS_PER_PAGE; i++) {
        if (i < tempWordList.length) {
             currentWordList.push(tempWordList[i]);
        }
    }
    
    wordBox.innerHTML = '';
    currentWordList.forEach((word) => {
        const span = document.createElement('span');
        span.textContent = word + ' ';
        wordBox.appendChild(span);
    });
    
    updateDisplayedWords();
}

function startNewSession() {
    endSessionModal.classList.add('hidden');
    currentWordIndex = 0;
    correctWordsCount = 0;
    incorrectWordsCount = 0;
    updateCounters();
    inputBox.value = '';
    
    generateAndDisplayWords(masterWordList);
    inputBox.focus();
}

inputBox.addEventListener('keyup', (e) => {
    if (e.key === ' ') {
        const typedWord = inputBox.value.trim();
        
        if (typedWord === '') {
            inputBox.value = '';
            return;
        }
        
        const currentWord = currentWordList[currentWordIndex];
        
        if (typedWord === currentWord) {
            correctWordsCount++;
        } else {
            incorrectWordsCount++;
            incorrectWordsList.push({ typedWord: typedWord, correctWord: currentWord });
            displayIncorrectWords();
        }
        
        currentWordIndex++;
        inputBox.value = '';
        
        updateCounters();
        
        // Sadece 8 kelimelik set tamamlandığında yeni bir set oluştur
        if (currentWordIndex >= currentWordList.length) {
            generateAndDisplayWords(masterWordList);
        } else {
            updateDisplayedWords();
        }
        
        // Tüm kelimeler bittiğinde modalı göster
        if (correctWordsCount + incorrectWordsCount === masterWordList.length && masterWordList.length > 0) {
            endSessionModal.classList.remove('hidden');
        }
    }
});

practiceButton.addEventListener('click', () => {
    if (incorrectWordsList.length > 0) {
        currentWordIndex = 0;
        correctWordsCount = 0;
        incorrectWordsCount = 0;
        updateCounters();
        inputBox.value = '';
        const practiceList = incorrectWordsList.map(item => item.correctWord);
        generateAndDisplayWords(practiceList);
        inputBox.focus();
    } else {
        alert("Yanlış kelime bulunamadı, yeni bir çalışma başlatılıyor.");
    }
});

copyButton.addEventListener('click', () => {
    const listToCopy = incorrectWordsList.map(item => `${item.correctWord} (${item.typedWord})`).join('\n');
    navigator.clipboard.writeText(listToCopy).then(() => {
        copyMessageElement.textContent = "Kopyalandı!";
        copyMessageElement.style.opacity = 1;
        setTimeout(() => {
            copyMessageElement.style.opacity = 0;
        }, 2000);
    });
});

newSessionButton.addEventListener('click', () => startNewSession());

window.onload = () => {
    fetch('kelimeler.txt')
        .then(response => response.text())
        .then(data => {
            masterWordList = data.split(/\s+/).filter(word => word.length > 0);
            
            if (masterWordList.length < WORDS_PER_PAGE) {
                 masterWordList = [...masterWordList, ...masterWordList];
            }
            startNewSession();
        })
        .catch(error => {
            console.error('Hata: Kelimeler dosyası yüklenemedi.', error);
            wordBox.textContent = "Kelimeler yüklenirken bir hata oluştu.";
        });
};
