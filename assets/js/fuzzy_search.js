// fuzzy_search.js - Improved Version

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
 * - Removing apostrophes (')
 * - Replacing hyphens (-) with spaces
 * - Removing extra spaces
 */
function normalizeString(str) {
    return str
        .toLowerCase()
        .replace(/'/g, '')      // Remove apostrophes
        .replace(/-/g, ' ')     // Replace hyphens with spaces
        .replace(/\s+/g, ' ')   // Collapse multiple spaces
        .trim();                // Remove leading/trailing spaces
}

/**
 * Calculates Levenshtein distance between two strings
 * Used as a measure of similarity
 */
function levenshteinDistance(a, b) {
    const matrix = [];

    // Initialize matrix
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

/**
 * Calculates a similarity score between the query and target
 * Lower score = better match
 * 
 * Scoring strategy:
 * - Exact match: 0 (best)
 * - Starts with query: 0.1 - 0.2
 * - Contains query as whole word: 0.3 - 0.4
 * - Contains query as substring: 0.5 - 0.6
 * - Fuzzy match (Levenshtein): 1.0 - 5.0
 * - No match: Infinity
 */
function calculateSimilarityScore(normalizedQuery, normalizedTarget) {
    // Exact match after normalization
    if (normalizedQuery === normalizedTarget) return 0;
    
    // Target starts with query
    if (normalizedTarget.startsWith(normalizedQuery)) {
        return 0.1;
    }
    
    // Check if query matches the beginning of any word in the target
    const words = normalizedTarget.split(' ');
    for (const word of words) {
        if (word.startsWith(normalizedQuery)) {
            return 0.2;
        }
    }
    
    // Whole word match
    for (const word of words) {
        if (word === normalizedQuery) {
            return 0.3;
        }
    }
    
    // Contains query as substring (anywhere)
    if (normalizedTarget.includes(normalizedQuery)) {
        // Calculate position-based score: earlier match = better score
        const position = normalizedTarget.indexOf(normalizedQuery);
        const positionScore = position / normalizedTarget.length;
        return 0.4 + positionScore * 0.2;
    }
    
    // Check if any word contains the query
    for (const word of words) {
        if (word.includes(normalizedQuery)) {
            // Found in a specific word - better than general substring
            const position = word.indexOf(normalizedQuery);
            const positionScore = position / word.length;
            return 0.5 + positionScore * 0.2;
        }
    }
    
    // For very short queries (1-2 chars), be more lenient
    if (normalizedQuery.length <= 2) {
        // Check if all characters appear in order (subsequence match)
        let queryIndex = 0;
        for (let i = 0; i < normalizedTarget.length && queryIndex < normalizedQuery.length; i++) {
            if (normalizedTarget[i] === normalizedQuery[queryIndex]) {
                queryIndex++;
            }
        }
        if (queryIndex === normalizedQuery.length) {
            return 0.6;
        }
    }
    
    // Use Levenshtein distance for fuzzy matching
    // But only for queries of similar length or longer queries with typos
    if (normalizedQuery.length >= 3 || Math.abs(normalizedQuery.length - normalizedTarget.length) <= 3) {
        const distance = levenshteinDistance(normalizedQuery, normalizedTarget);
        
        // For longer targets, compare against substrings of similar length
        if (normalizedTarget.length > normalizedQuery.length + 3) {
            let minDistance = distance;
            
            // Check sliding windows of similar length
            for (let i = 0; i <= normalizedTarget.length - normalizedQuery.length; i++) {
                const substring = normalizedTarget.substring(i, i + normalizedQuery.length);
                const windowDistance = levenshteinDistance(normalizedQuery, substring);
                minDistance = Math.min(minDistance, windowDistance);
            }
            
            return 0.7 + minDistance * 0.1;
        }
        
        return 0.7 + distance * 0.1;
    }
    
    // No match found
    return Infinity;
}

/**
 * Main fuzzy search function
 * @param {string} query - The search query
 * @param {Object} options - Optional configuration
 * @param {number} options.threshold - Maximum score for a match (default: 3.0)
 * @param {number} options.maxResults - Maximum number of results to return (default: Infinity)
 * @param {boolean} options.sortByScore - Sort results by relevance score (default: true)
 * @returns {Array<{surah: string, score: number}>} Array of matching surahs with scores
 */
function fuzzySearch(query, options = {}) {
    const {
        threshold = 3.0,
        maxResults = Infinity,
        sortByScore = true
    } = options;

    if (!query || query.trim() === '') {
        return [];
    }

    const normalizedQuery = normalizeString(query);
    const results = [];

    for (const surah of SURAHS) {
        const normalizedSurah = normalizeString(surah);
        const score = calculateSimilarityScore(normalizedQuery, normalizedSurah);
        
        // Include if score is within threshold
        if (score <= threshold) {
            results.push({
                surah: surah,
                score: score,
                normalizedForm: normalizedSurah
            });
        }
    }

    // Sort by score (lower is better)
    if (sortByScore) {
        results.sort((a, b) => a.score - b.score);
    }

    // Return only the requested number of results
    return results.slice(0, maxResults);
}

/**
 * Simplified search function that returns just the surah names
 * @param {string} query - The search query
 * @returns {Array<string>} Array of matching surah names
 */
export function searchSurahs(query) {
    return fuzzySearch(query).map(result => result.surah);
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        fuzzySearch,
        searchSurahs,
        normalizeString,
        SURAHS
    };
}