const wordBox = document.getElementById('word-box');
const inputBox = document.getElementById('input-box');
const correctCountElement = document.getElementById('correct-count');
const incorrectCountElement = document.getElementById('incorrect-count');

const WORDS_PER_PAGE = 8;

let masterWordList = []; // Tüm kelimelerin tutulduğu ana liste
let currentWordList = []; // O an ekranda gösterilen kelimelerin listesi
let currentWordIndex = 0;
let correctWordsCount = 0;
let incorrectWordsCount = 0;

// Sayaçları güncelleyen fonksiyon
function updateCounters() {
    correctCountElement.textContent = `Doğru: ${correctWordsCount}`;
    incorrectCountElement.textContent = `Yanlış: ${incorrectWordsCount}`;
}

// Yeni bir 8 kelimelik rastgele set oluşturan ve ekrana basan fonksiyon
function generateAndDisplayWords() {
    if (masterWordList.length === 0) {
        wordBox.textContent = "Kelimeler yükleniyor veya bulunamadı...";
        return;
    }
    
    currentWordList = [];
    const tempWordList = [...masterWordList]; // Ana listenin kopyası
    
    // 8 kelimelik rastgele bir set seç
    for (let i = 0; i < WORDS_PER_PAGE; i++) {
        if (tempWordList.length === 0) break; // Kelime kalmadıysa döngüyü kır
        const randomIndex = Math.floor(Math.random() * tempWordList.length);
        currentWordList.push(tempWordList[randomIndex]);
        tempWordList.splice(randomIndex, 1); // Seçilen kelimeyi listeden çıkar
    }

    // Seçilen kelimeleri ekrana bas
    wordBox.innerHTML = '';
    currentWordList.forEach((word, index) => {
        const span = document.createElement('span');
        span.textContent = word + ' ';
        if (index === currentWordIndex) {
            span.classList.add('current');
        }
        wordBox.appendChild(span);
    });
}

inputBox.addEventListener('keyup', (e) => {
    if (e.key === ' ') {
        const typedWord = inputBox.value.trim();
        
        // Hata kontrolü
        if (currentWordIndex >= currentWordList.length) {
             // Eğer 8 kelime tamamlandıysa yeni bir set oluştur
             currentWordIndex = 0;
             generateAndDisplayWords();
             inputBox.value = '';
             return;
        }

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

        if (currentWordIndex >= currentWordList.length) {
            // Eğer son kelime doğru yazıldıysa, yeni seti bekle
            return;
        }
        
        generateAndDisplayWords();
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