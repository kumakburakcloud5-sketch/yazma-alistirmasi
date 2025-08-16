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
const retryIncorrectButton = document.getElementById('retry-incorrect');
const newSessionButton = document.getElementById('new-session');

const WORDS_PER_PAGE = 8;

let masterWordList = [];
let currentWordList = [];
let incorrectWordsList = [];
let currentWordIndex = 0;
let correctWordsCount = 0;
let incorrectWordsCount = 0;

// Diziyi karıştırır
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Sayaçları günceller
function updateCounters() {
    correctCountElement.textContent = `Doğru: ${correctWordsCount}`;
    incorrectCountElement.textContent = `Yanlış: ${incorrectWordsCount}`;
}

// Yanlış yazılan kelimeler listesini günceller
function displayIncorrectWords() {
    if (incorrectWordsList.length > 0) {
        incorrectWordsBox.classList.remove('hidden');
        incorrectWordsListElement.innerHTML = '';
        incorrectWordsList.forEach(item => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<strong>Doğrusu:</strong> ${item.correctWord} <br> <strong>Senin Yazdığın:</strong> <span>${item.typedWord}</span>`;
            incorrectWordsListElement.appendChild(listItem);
        });
    } else {
        incorrectWordsBox.classList.add('hidden');
    }
}

// O anki kelimeyi vurgular
function updateDisplayedWords() {
    const wordsInBox = wordBox.querySelectorAll('span');
    wordsInBox.forEach(span => span.classList.remove('current'));
    if (currentWordIndex < wordsInBox.length) {
        wordsInBox[currentWordIndex].classList.add('current');
    }
}

// Kelime setini oluşturur ve ekranda gösterir
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

// Yeni bir çalışma oturumu başlatır
function startNewSession(mode = 'new') {
    endSessionModal.classList.add('hidden');
    currentWordIndex = 0;
    correctWordsCount = 0;
    incorrectWordsCount = 0;
    updateCounters();
    inputBox.value = '';
    
    if (mode === 'new') {
        incorrectWordsList = [];
        displayIncorrectWords();
        generateAndDisplayWords(masterWordList);
    } else if (mode === 'practice') {
        if (incorrectWordsList.length > 0) {
            const practiceList = incorrectWordsList.map(item => item.correctWord);
            generateAndDisplayWords(practiceList);
        } else {
            alert("Yanlış kelime bulunamadı, yeni bir çalışma başlatılıyor.");
            generateAndDisplayWords(masterWordList);
        }
    }
    inputBox.focus();
}

inputBox.addEventListener('keyup', (e) => {
    if (e.key === ' ') {
        const typedWord = inputBox.value.trim();
        const currentWord = currentWordList[currentWordIndex];
        
        // Boş metni kontrol et
        if (typedWord === '') {
            inputBox.value = '';
            return;
        }

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
        
        // Eğer tüm kelimeler bitmişse modalı göster
        if (currentWordIndex >= currentWordList.length) {
            endSessionModal.classList.remove('hidden');
        } else {
            updateDisplayedWords();
        }
    }
});

// "Sadece Bunları Çalış" butonuna tıklandığında
practiceButton.addEventListener('click', () => {
    startNewSession('practice');
});

// "Kopyala" butonuna tıklandığında
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

// Modal butonları
retryIncorrectButton.addEventListener('click', () => startNewSession('practice'));
newSessionButton.addEventListener('click', () => startNewSession('new'));


// Sayfa yüklendiğinde çalıştır
window.onload = () => {
    fetch('kelimeler.txt')
        .then(response => response.text())
        .then(data => {
            masterWordList = data.split(/\s+/).filter(word => word.length > 0);
            
            if (masterWordList.length < WORDS_PER_PAGE) {
                 masterWordList = [...masterWordList, ...masterWordList];
            }
            startNewSession('new');
        })
        .catch(error => {
            console.error('Hata: Kelimeler dosyası yüklenemedi.', error);
            wordBox.textContent = "Kelimeler yüklenirken bir hata oluştu.";
        });
};
