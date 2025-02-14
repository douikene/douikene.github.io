import { languageManager } from '/assets/js/languageManager.js';

// Get base URL for file paths
const baseUrl = document.querySelector('base')?.href || window.location.origin;
console.log('Base URL:', baseUrl);

let translations = null;

async function loadContent() {
    const contentDiv = document.getElementById('content');
    if (!contentDiv) return;

    try {
        // First load translations
        const response = await fetch('/data/translations.json');
        const translations = await response.json();
        
        // Then load CV data for the current language
        const currentLang = languageManager.getCurrentLang();
        const cvResponse = await fetch(`/data/cv.${currentLang}.json`);
        const cvData = await cvResponse.json();

        // Create social links
        const socialLinks = [];
        
        if (cvData.personalInfo.github) {
            const githubUsername = cvData.personalInfo.github.split('/').pop();
            socialLinks.push(`<a href="${cvData.personalInfo.github}" target="_blank"><i class="fab fa-github"></i> ${githubUsername}</a>`);
        }
        
        if (cvData.personalInfo.linkedin) {
            socialLinks.push(`<a href="${cvData.personalInfo.linkedin}" target="_blank"><i class="fab fa-linkedin"></i> LinkedIn</a>`);
        }

        // Create contact info
        const contactInfo = [];
        
        if (cvData.personalInfo.location) {
            contactInfo.push(`<span><i class="fas fa-map-marker-alt"></i> ${cvData.personalInfo.location}</span>`);
        }
        
        if (cvData.personalInfo.email) {
            contactInfo.push(`<a href="mailto:${cvData.personalInfo.email}"><i class="fas fa-envelope"></i> ${cvData.personalInfo.email}</a>`);
        }
        
        if (cvData.personalInfo.phone) {
            contactInfo.push(`<a href="tel:${cvData.personalInfo.phone}"><i class="fas fa-phone"></i> ${cvData.personalInfo.phone}</a>`);
        }

        // Render the content
        contentDiv.innerHTML = `
            <div class="about-content">
                <div class="about-header">
                    <h1>${cvData.personalInfo.name}</h1>
                    <h2 class="title">${cvData.personalInfo.title}</h2>
                    <div class="contact-info">
                        ${contactInfo.join('')}
                    </div>
                    <div class="about-links">
                        ${socialLinks.join('')}
                    </div>
                </div>
                <p>${cvData.professionalSummary}</p>
                <a href="/cv" class="view-cv-btn">
                    <i class="fas fa-file-alt"></i> ${translations.nav[currentLang].viewCV}
                </a>
            </div>
        `;

        contentDiv.classList.remove('loading');
        document.body.classList.add('loaded');

    } catch (error) {
        console.error('Error loading content:', error);
        contentDiv.innerHTML = 'Error loading content. Please try refreshing the page.';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    loadContent();
});

// Language switcher
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (await languageManager.setLanguage(btn.dataset.lang)) {
                loadContent();
            }
        });
    });
});