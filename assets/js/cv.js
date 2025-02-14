import { languageManager } from '/assets/js/languageManager.js';

let translations = null;

async function fetchWithRetry(url, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                // Add credentials if needed
                // credentials: 'include',
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response;
        } catch (error) {
            console.warn(`Attempt ${i + 1} failed:`, error);
            if (i === maxRetries - 1) throw error;
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
    }
}

async function loadTranslations() {
    console.log('🔄 Loading translations...');
    if (!translations) {
        try {
            const response = await fetchWithRetry('/data/translations.json');
            console.log('Translations response:', {
                ok: response.ok,
                status: response.status,
                statusText: response.statusText
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const text = await response.text();
            console.log('Raw translations text:', text);
            
            if (!text) {
                throw new Error('Empty translations response');
            }
            
            translations = JSON.parse(text);
            console.log('✅ Parsed translations:', translations);
            
            // Verify translations structure and current language
            const currentLang = languageManager.getCurrentLang();
            if (!translations.downloadCV?.[currentLang] || !translations.sections?.[currentLang]) {
                console.error('Missing translations for language:', currentLang);
                throw new Error(`Missing translations for language: ${currentLang}`);
            }
        } catch (error) {
            console.error('❌ Error loading translations:', error);
            console.error('Stack:', error.stack);
            throw error;
        }
    }
    return translations;
}

async function loadCV() {
    console.log('🔄 Starting loadCV...');
    const contentDiv = document.getElementById('cv-content');
    if (!contentDiv) {
        console.error('❌ cv-content element not found!');
        return;
    }
    
    try {
        // First load translations
        translations = await loadTranslations();
        const currentLang = languageManager.getCurrentLang();
        console.log('📍 Current language:', currentLang);
        
        contentDiv.innerHTML = translations.loading[currentLang];

        // Then load CV data
        const url = `/data/cv.${currentLang}.json`;
        console.log('🔄 Fetching CV data from:', url);
        
        const response = await fetchWithRetry(url);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text();
        console.log('Raw CV data:', text.substring(0, 100));
        const data = JSON.parse(text);
        console.log('✅ CV data loaded:', Object.keys(data));
        
        document.body.classList.add('loaded');
        contentDiv.classList.remove('loading');
        renderCV(data);
        updateLanguageButtons();
        console.log('✅ CV render complete');
    } catch (error) {
        console.error('❌ Error in loadCV:', error);
        
        if (languageManager.getCurrentLang() !== 'en') {
            console.log('🔄 Falling back to English...');
            await languageManager.setLanguage('en');
            loadCV();
            return;
        }
        contentDiv.innerHTML = `Error loading CV: ${error.message}<br>
            <small>Please try refreshing the page</small>`;
    }
}

function renderCV(data) {
    console.log('Rendering CV with data:', data);
    console.log('Current translations:', translations);
    console.log('Current language:', languageManager.getCurrentLang());
    
    const content = document.getElementById('cv-content');
    
    // Create contact links only if they exist
    const contactLinks = [];
    
    if (data.personalInfo.location) {
        contactLinks.push(`<i class="fas fa-map-marker-alt"></i> ${data.personalInfo.location}`);
    }
    
    if (data.personalInfo.phone) {
        contactLinks.push(`<i class="fas fa-phone"></i> <a href="tel:${data.personalInfo.phone}">${data.personalInfo.phone}</a>`);
    }
    
    if (data.personalInfo.email) {
        contactLinks.push(`<i class="fas fa-envelope"></i> <a href="mailto:${data.personalInfo.email}">${data.personalInfo.email}</a>`);
    }
    
    if (data.personalInfo.github) {
        // Extract username from GitHub URL
        const githubUsername = data.personalInfo.github.split('/').pop();
        contactLinks.push(`<i class="fab fa-github"></i> <a href="${data.personalInfo.github}" target="_blank">${githubUsername}</a>`);
    }
    
    if (data.personalInfo.linkedin) {
        contactLinks.push(`<i class="fab fa-linkedin"></i> <a href="${data.personalInfo.linkedin}" target="_blank">douikene</a>`);
    }
    
    if (data.personalInfo.url) {
        // Extract 'douikene' from the URL dynamically
        const displayName = data.personalInfo.url
            .replace(/https?:\/\/(www\.)?/i, '')  // Remove protocol and www
            .replace(/\.github\.io\/?.*$/, '');   // Remove .github.io and anything after
        contactLinks.push(`<i class="fas fa-globe"></i> <a href="${data.personalInfo.url}" target="_blank">${displayName}</a>`);
    }

    content.innerHTML = `
        <div class="profile-header">
            <div class="profile-info">
                <h1>${data.personalInfo.name}</h1>
                <div class="contact">
                    <p>${data.personalInfo.title}</p>
                    <p>${contactLinks.join(' | ')}</p>
                    <a href="#" class="download-btn" onclick="printCV(); return false;">
                        <i class="fas fa-download"></i> ${translations.downloadCV[languageManager.getCurrentLang()]}
                    </a>
                </div>
            </div>
            ${data.personalInfo.picture ? `
                <div class="profile-image">
                    <img src="${data.personalInfo.picture}" alt="${data.personalInfo.name}">
                </div>
            ` : ''}
        </div>

        <section>
            <h2>${translations.sections[languageManager.getCurrentLang()].summary}</h2>
            <p>${data.professionalSummary}</p>
        </section>

        <section>
            <h2>${translations.sections[languageManager.getCurrentLang()].experience}</h2>
            ${renderExperience(data.experience)}
        </section>

        <section>
            <h2>${translations.sections[languageManager.getCurrentLang()].education}</h2>
            <ul>
                ${data.education.map(edu => `
                    <li><strong>${edu.degree}</strong> – ${edu.institution} (${edu.year})</li>
                `).join('')}
                <li>${data.certifications.join(', ')}</li>
            </ul>
        </section>

        <section>
            <h2>${translations.sections[languageManager.getCurrentLang()].skills}</h2>
            <ul>
                ${Object.entries(data.skills).map(([category, skills]) => `
                    <li><strong>${formatCategory(category)}:</strong> ${skills.join(', ')}</li>
                `).join('')}
            </ul>
        </section>

        <section>
            <h2>${translations.sections[languageManager.getCurrentLang()].languages}</h2>
            <p>${data.languages.map(l => `${l.language} (${l.level})`).join(', ')}</p>
        </section>

        <section>
            <h2>${translations.sections[languageManager.getCurrentLang()].interests}</h2>
            <ul>
                ${data.interests.map(interest => `<li>${interest}</li>`).join('')}
            </ul>
        </section>
    `;

    const downloadBtn = document.querySelector('.download-btn');
    if (downloadBtn) {
        downloadBtn.onclick = function(e) {
            e.preventDefault();
            printCV();
        };
    }
}

function renderExperience(experience) {
    return experience.map(company => `
        <h3>${company.company} (${company.location})</h3>
        ${company.roles.map(role => `
            <p><strong>${role.title}</strong> (${role.period})</p>
            <ul>
                ${role.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
            </ul>
        `).join('')}
    `).join('');
}

function formatCategory(category) {
    return category
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
}

function printCV() {
    if (document.body.classList.contains('loaded')) {
        window.print();
    } else {
        alert('Please wait for CV to load completely before printing.');
    }
}

// Add language switcher functionality
function updateLanguageButtons() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === languageManager.getCurrentLang());
    });
}

// Replace the immediate initialization with a DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔄 DOM ready, initializing CV module...');
    
    // Set up language switcher
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const newLang = btn.dataset.lang;
            console.log('Language button clicked:', newLang);
            if (newLang !== languageManager.getCurrentLang()) {
                await languageManager.setLanguage(newLang);
                loadCV();
            }
        });
    });

    // Initial load
    loadCV().catch(error => {
        console.error('❌ Failed to load CV:', error);
        const contentDiv = document.getElementById('cv-content');
        if (contentDiv) {
            contentDiv.innerHTML = `Error loading CV: ${error.message}<br>
                <small>Please try refreshing the page</small>`;
        }
    });
}); 