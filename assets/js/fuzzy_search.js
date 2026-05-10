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

/**
 * Normalizes a string for comparison by:
 * - Converting to lowercase
 * - Removing apostrophes
 * - Removing hyphens
 */
function normalizeString(str) {
    return str.toLowerCase()
        .replace(/['']/g, '')
        .replace(/-/g, '')
        .trim();
}

/**
 * Calculates the Levenshtein distance between two strings
 */
function levenshteinDistance(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    
    const matrix = [];
    
    for (let i = 0; i <= len1; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    
    return matrix[len1][len2];
}

/**
 * Searches through the SURAHS array
 * @param {string} query - The search query
 * @returns {string[]} Array of matching surah names, sorted by relevance
 */
export function searchSurahs(query) {
    if (!query || query.trim().length === 0) {
        return [...SURAHS];
    }
    
    const results = [];
    const normalizedQuery = normalizeString(query);
    
    SURAHS.forEach(surah => {
        const normalizedSurah = normalizeString(surah);
        let score = 0;
        
        // Exact match
        if (normalizedQuery === normalizedSurah) {
            score = 100;
        }
        // Starts with
        else if (normalizedSurah.indexOf(normalizedQuery) === 0) {
            score = 90;
        }
        // Contains
        else if (normalizedSurah.includes(normalizedQuery)) {
            score = 80;
        }
        // Word boundary match
        else if (normalizedSurah.split(/[\s-]+/).some(word => word.startsWith(normalizedQuery))) {
            score = 70;
        }
        // Fuzzy match for longer queries
        else if (normalizedQuery.length >= 3) {
            const distance = levenshteinDistance(normalizedQuery, normalizedSurah);
            const maxLength = Math.max(normalizedQuery.length, normalizedSurah.length);
            const similarity = ((maxLength - distance) / maxLength) * 60;
            
            if (similarity >= 24) {
                score = similarity;
            }
        }
        
        if (score > 0) {
            results.push({ name: surah, score: score });
        }
    });
    
    results.sort((a, b) => b.score - a.score);
    return results.map(result => result.name);
}