const wordBox = document.getElementById('word-box');
const inputBox = document.getElementById('input-box');
const correctCountElement = document.getElementById('correct-count');
const incorrectCountElement = document.getElementById('incorrect-count');

const WORDS_PER_PAGE = 8;

let masterWordList = [];
let currentWordList = [];
let currentWordIndex = 0;
let correctWordsCount = 0;
let incorrectWordsCount = 0;

function updateCounters() {
    correctCountElement.textContent = `Doğru: ${correctWordsCount}`;
    incorrectCountElement.textContent = `Yanlış: ${incorrectWordsCount}`;
}

function generateAndDisplayWords() {
    if (masterWordList.length === 0) {
        wordBox.textContent = "Kelimeler yükleniyor veya bulunamadı...";
        return;
    }
    
    currentWordList = [];
    const tempWordList = [...masterWordList];
    
    for (let i = 0; i < WORDS_PER_PAGE; i++) {
        if (tempWordList.length === 0) break;
        const randomIndex = Math.floor(Math.random() * tempWordList.length);
        currentWordList.push(tempWordList[randomIndex]);
        tempWordList.splice(randomIndex, 1);
    }

    wordBox.innerHTML = '';
    currentWordList.forEach((word, index) => {
        const span = document.createElement('span');
        span.textContent = word + ' ';
        if (index === 0) { // Her yeni sette ilk kelimeyi vurgula
            span.classList.add('current');
        }
        wordBox.appendChild(span);
    });
}

function updateDisplayedWords() {
    const wordsInBox = wordBox.querySelectorAll('span');
    wordsInBox.forEach((span, index) => {
        span.classList.remove('current');
    });
    if (currentWordIndex < wordsInBox.length) {
        wordsInBox[currentWordIndex].classList.add('current');
    }
}

inputBox.addEventListener('keyup', (e) => {
    if (e.key === ' ') {
        const typedWord = inputBox.value.trim();
        
        const currentWord = currentWordList[currentWordIndex];

        if (typedWord === currentWord) {
            correctWordsCount++;
            currentWordIndex++;
            inputBox.value = '';
        } else {
            incorrectWordsCount++;
            inputBox.value = '';
        }

        updateCounters();
        
        // Eğer 8 kelimelik set tamamlandıysa, yeni bir set oluştur
        if (currentWordIndex >= WORDS_PER_PAGE) {
            currentWordIndex = 0;
            generateAndDisplayWords();
        } else {
            // Tamamlanmadıysa sadece aktif kelimeyi güncelle
            updateDisplayedWords();
        }
    }
});

window.onload = () => {
    fetch('kelimeler.txt')
        .then(response => response.text())
        .then(data => {
            masterWordList = data.split(/\s+/).filter(word => word.length > 0);
            
            if (masterWordList.length < WORDS_PER_PAGE) {
                wordBox.textContent = `Hata: Dosyada en az ${WORDS_PER_PAGE} kelime olmalıdır.`;
                return;
            }

            currentWordIndex = 0;
            correctWordsCount = 0;
            incorrectWordsCount = 0;
            updateCounters();
            generateAndDisplayWords();
            inputBox.focus();
        })
        .catch(error => {
            console.error('Hata: Kelimeler dosyası yüklenemedi.', error);
            wordBox.textContent = "Kelimeler yüklenirken bir hata oluştu.";
        });
};
