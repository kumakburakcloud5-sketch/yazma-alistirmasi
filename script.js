const wordBox = document.getElementById('word-box');
const inputBox = document.getElementById('input-box');
const correctCountElement = document.getElementById('correct-count');
const incorrectCountElement = document.getElementById('incorrect-count');
const incorrectWordsListElement = document.getElementById('incorrect-words-list');
const copyButton = document.getElementById('copy-button');
const copyMessageElement = document.getElementById('copy-message');

const WORDS_PER_PAGE = 8;

let masterWordList = [];
let currentWordList = [];
let currentWordIndex = 0;
let correctWordsCount = 0;
let incorrectWordsCount = 0;
let incorrectWordsList = [];

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
        if (index === 0) {
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
        } else {
            incorrectWordsCount++;
            // Yanlış kelimeyi listeye ekle
            incorrectWordsList.push({ typedWord: typedWord, correctWord: currentWord });
            displayIncorrectWords();
        }

        // Doğru veya yanlış fark etmeksizin bir sonraki kelimeye geç
        currentWordIndex++;
        inputBox.value = '';

        updateCounters();

        if (currentWordIndex >= WORDS_PER_PAGE) {
            currentWordIndex = 0;
            generateAndDisplayWords();
        } else {
            updateDisplayedWords();
        }
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
    }).catch(err => {
        console.error('Kopyalama hatası:', err);
    });
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
            incorrectWordsList = [];
            
            updateCounters();
            generateAndDisplayWords();
            displayIncorrectWords();
            inputBox.focus();
        })
        .catch(error => {
            console.error('Hata: Kelimeler dosyası yüklenemedi.', error);
            wordBox.textContent = "Kelimeler yüklenirken bir hata oluştu.";
        });
};
