"use strict";

const SURAHS = [
    "Al-Fatiha", "Al-Baqarah", "Aal-E-Imran", "An-Nisa", "Al-Ma'idah",
    "Al-An'am", "Al-A'raf", "Al-Anfal", "At-Tawbah", "Yunus", "Hud",
    "Yusuf", "Ar-Ra'd", "Ibrahim", "Al-Hijr", "An-Nahl", "Al-Isra",
    "Al-Kahf", "Maryam", "Ta-Ha", "Al-Anbiya", "Al-Hajj", "Al-Mu'minun",
    "An-Nur", "Al-Furqan", "Ash-Shu'ara", "An-Naml", "Al-Qasas",
    "Al-Ankabut", "Ar-Rum", "Luqman", "As-Sajdah", "Al-Ahzab", "Saba",
    "Fatir", "Ya-Sin", "As-Saffat", "Sad", "Az-Zumar", "Ghafir",
    "Fussilat", "Ash-Shura", "Az-Zukhruf", "Ad-Dukhan", "Al-Jathiyah",
    "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf",
    "Adh-Dhariyat", "At-Tur", "An-Najm", "Al-Qamar", "Ar-Rahman",
    "Al-Waqi'ah", "Al-Hadid", "Al-Mujadila", "Al-Hashr",
    "Al-Mumtahanah", "As-Saff", "Al-Jumu'ah", "Al-Munafiqun",
    "At-Taghabun", "At-Talaq", "At-Tahrim", "Al-Mulk", "Al-Qalam",
    "Al-Haqqah", "Al-Ma'arij", "Nuh", "Al-Jinn", "Al-Muzzammil",
    "Al-Muddaththir", "Al-Qiyamah", "Al-Insan", "Al-Mursalat",
    "An-Naba", "An-Nazi'at", "Abasa", "At-Takwir", "Al-Infitar",
    "Al-Mutaffifin", "Al-Inshiqaq", "Al-Buruj", "At-Tariq",
    "Al-Ala", "Al-Ghashiyah", "Al-Fajr", "Al-Balad", "Ash-Shams",
    "Al-Layl", "Ad-Duhaa", "Ash-Sharh", "At-Tin", "Al-Alaq",
    "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah", "Al-Adiyat",
    "Al-Qari'ah", "At-Takathur", "Al-Asr", "Al-Humazah", "Al-Fil",
    "Quraysh", "Al-Ma'un", "Al-Kawthar", "Al-Kafirun", "An-Nasr",
    "Al-Masad", "Al-Ikhlas", "Al-Falaq", "An-Nas"
];

const surah = document.getElementById('surah-content');
const navigation = document.getElementById('navigation');
const main = document.getElementById('main');

// Helper function to clear element (compatible with older browsers)
function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function loadSurah(surahName) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `file:///android_asset/surahs/${surahName}`, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status === 0) {
                surah.innerText = xhr.responseText.replace(/\n+/g, ' ');
                localStorage.setItem("currentSurah", surahName);
                let scrollPos = localStorage.getItem(`${surahName}-Scroll`);
                if(scrollPos) {
                    let func = () => surah.scrollTop = Number(scrollPos);
                    setTimeout(func, 200);
                }
                else {
                    surah.scrollTop = 0;
                }
            } else {
                surah.innerText = 'Failed to load Surah';
            }
        }
    };
    xhr.send();
}

function hideNavigation(surahName) {
    main.style.height = '93vh';
    navigation.style.height = '7vh';
    
    // Clear navigation using compatible method
    clearElement(navigation);
    
    let navigate = document.createElement('button');
    navigate.innerText = '☰';
    navigate.addEventListener('click', function() {
        showNavigation();
    });
    navigation.appendChild(navigate);
    
    let visible = document.createElement('button');
    visible.innerText = surahName;
    visible.className = "current-surah";
    navigation.appendChild(visible);
}

function showNavigation() {
    // Clear navigation using compatible method
    clearElement(navigation);
    
    main.style.height = '70vh';
    navigation.style.height = '30vh';
    
    const closeButton = document.createElement('button');
    closeButton.innerText = "✕";
    closeButton.addEventListener('click', function () {
        if (localStorage.getItem("currentSurah")) {
            hideNavigation(localStorage.getItem("currentSurah"));
        }
    });
    navigation.appendChild(closeButton);
    
    SURAHS.forEach(function(name) {
        const button = document.createElement('button');
        button.innerText = name;
        button.addEventListener('click', function() {
            loadSurah(name);
            hideNavigation(name);
        });
        navigation.appendChild(button);
    });
}

// Initialize the app
let currentSurah = localStorage.getItem("currentSurah");
let scrollPosition = localStorage.getItem(`${currentSurah}-Scroll`);

if (currentSurah) {
    hideNavigation(currentSurah);
    loadSurah(currentSurah);
    let func = () => surah.scrollTop = Number(scrollPosition);
    setTimeout(func, 200);
} else {
    showNavigation();
}

// Save scroll position
surah.addEventListener('scroll', function(event) {
    let currentSurah = localStorage.getItem("currentSurah");
    if (currentSurah) {
        localStorage.setItem(`${currentSurah}-Scroll`, surah.scrollTop);
    }
});

// Handle orientation changes
function getOrientationMode() {
    if (window.matchMedia("(orientation: portrait)").matches) return "portrait";
    if (window.matchMedia("(orientation: landscape)").matches) return "landscape";
    return window.innerHeight >= window.innerWidth ? "portrait" : "landscape";
}

// Orientation change handler with better compatibility
window.addEventListener("orientationchange", function() {
    setTimeout(function() {
        if (getOrientationMode() === "landscape") {
            navigation.style.display = "none";
            main.style.height = "100vh";
        } else {
            navigation.style.display = "block";
            if (localStorage.getItem("currentSurah")) {
                main.style.height = '93vh';
                navigation.style.height = '7vh';
            } else {
                main.style.height = '70vh';
                navigation.style.height = '30vh';
            }
        }
    }, 150);
});

// Also handle resize for devices that don't fire orientationchange
window.addEventListener("resize", function() {
    setTimeout(function() {
        if (getOrientationMode() === "landscape") {
            navigation.style.display = "none";
            main.style.height = "100vh";
        }
    }, 150);
});