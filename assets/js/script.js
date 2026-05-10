"use strict";

import { searchSurahs } from "./fuzzy_search.js";

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

const closed_state_height1 = "92.5vh";
const closed_state_height2 = "7.5vh";

const surah = document.getElementById('surah-content');
const navigation = document.getElementById('navigation');
const main = document.getElementById('main');
const box = document.createElement("input");

// Helper function to clear element (compatible with older browsers)
function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

// Helper function to dismiss keyboard on Android
function dismissKeyboard() {
    if (document.activeElement) {
        document.activeElement.blur();
    }
    // Alternative Android-specific method
    if (window.Keyboard && window.Keyboard.hide) {
        window.Keyboard.hide();
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
    main.style.height = closed_state_height1;
    navigation.style.height = closed_state_height2;
    
    // Clear navigation using compatible method
    clearElement(navigation);
    
    // Add closed-state class
    navigation.className = 'closed-state';
    
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
    
    // Dismiss keyboard when hiding navigation
    dismissKeyboard();
}

function renderSurahButtons(filteredSurahs, buttonsContainer) {
    // Clear existing buttons
    clearElement(buttonsContainer);
    
    // Add filtered surah buttons
    filteredSurahs.forEach(function(name) {
        const button = document.createElement('button');
        button.innerText = name;
        button.addEventListener('click', function() {
            dismissKeyboard();
            loadSurah(name);
            hideNavigation(name);
        });
        buttonsContainer.appendChild(button);
    });
    
    // If no results found, show a message
    if (filteredSurahs.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.innerText = 'No surahs found';
        buttonsContainer.appendChild(noResults);
    }
}

function showNavigation() {
    // Clear navigation using compatible method
    clearElement(navigation);
    
    // Remove closed-state class
    navigation.className = '';
    
    main.style.height = '68vh';
    navigation.style.height = '30vh';
    
    // Create search header (fixed at top)
    const searchHeader = document.createElement('div');
    searchHeader.className = 'search-header';
    
    const closeButton = document.createElement('button');
    closeButton.innerText = "✕";
    closeButton.className = "button";
    closeButton.addEventListener('click', function () {
        dismissKeyboard();
        if (localStorage.getItem("currentSurah")) {
            hideNavigation(localStorage.getItem("currentSurah"));
        }
    });
    searchHeader.appendChild(closeButton);

    box.id = "input";
    box.type = "text";
    box.placeholder = "Search";
    box.autocomplete = "off";
    box.autocorrect = "off";
    box.autocapitalize = "off";
    box.spellcheck = false;
    
    searchHeader.appendChild(box);
    navigation.appendChild(searchHeader);
    
    // Create scrollable buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'surah-buttons-container';
    navigation.appendChild(buttonsContainer);
    
    // Handle search input
    box.addEventListener('input', function() {
        const query = this.value.trim();
        if (query.length > 0) {
            // Use fuzzy search to get matching surahs
            const foundSurahs = searchSurahs(query);
            // Create ordered list with found surahs first
            const orderedSurahs = [];
            
            // Add found surahs first (in the order returned by search)
            foundSurahs.forEach(function(foundSurah) {
                orderedSurahs.push(foundSurah);
            });
            
            // Add remaining surahs that weren't found
            SURAHS.forEach(function(surah) {
                if (foundSurahs.indexOf(surah) === -1) {
                    orderedSurahs.push(surah);
                }
            });
            
            renderSurahButtons(orderedSurahs, buttonsContainer);
        } else {
            // If search is empty, show all surahs in original order
            renderSurahButtons(SURAHS, buttonsContainer);
        }
    });
    
    // Handle keyboard OK/Done/Enter key
    box.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            e.preventDefault();
            dismissKeyboard();
            
            // If there are matching results, load the first one
            const query = this.value.trim();
            if (query.length > 0) {
                const foundSurahs = searchSurahs(query);
                if (foundSurahs.length > 0) {
                    loadSurah(foundSurahs[0]);
                    hideNavigation(foundSurahs[0]);
                }
            }
        }
    });
    
    // Also handle Android keyboard done action
    box.addEventListener('keydown', function(e) {
        // Android often uses 'Unidentified' or specific keyCodes for done action
        if (e.key === 'Done' || e.key === 'Go' || e.key === 'Search' || 
            e.keyCode === 6 || e.keyCode === 13) {
            e.preventDefault();
            dismissKeyboard();
            
            const query = this.value.trim();
            if (query.length > 0) {
                const foundSurahs = searchSurahs(query);
                if (foundSurahs.length > 0) {
                    loadSurah(foundSurahs[0]);
                    hideNavigation(foundSurahs[0]);
                }
            }
        }
    });
    
    // Render all surahs initially
    renderSurahButtons(SURAHS, buttonsContainer);
    
    // Scroll navigation to top to ensure search box is visible
    navigation.scrollTop = 0;
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
    // Dismiss keyboard on orientation change
    dismissKeyboard();
    
    setTimeout(function() {
        if (getOrientationMode() === "landscape") {
            navigation.style.display = "none";
            main.style.height = "100vh";
        } else {
            navigation.style.display = "block";
            if (localStorage.getItem("currentSurah")) {
                main.style.height = closed_state_height1;
                navigation.style.height = closed_state_height2;
            } else {
                main.style.height = '68vh';
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

// Dismiss keyboard when touching the main content area
main.addEventListener('touchstart', function() {
    if (getOrientationMode() === "portrait") {
        dismissKeyboard();
    }
});

/* fix for the 'focus won't go away after keyboard dismissed */

let lastViewportHeight = window.innerHeight;

window.addEventListener('resize', function() {
    if (lastViewportHeight < window.innerHeight) {
        console.log("runs here");
        setTimeout(function() {
            if (document.activeElement === box) {
                box.blur();
                document.body.focus();
            }
        }, 100);
    }
    lastViewportHeight = window.innerHeight;
});
