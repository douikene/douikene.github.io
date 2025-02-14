// Export the language manager functionality
export const languageManager = {
    getCurrentLang() {
        return localStorage.getItem('preferred-language') || 'en';
    },
    
    async setLanguage(lang) {
        localStorage.setItem('preferred-language', lang);
        document.documentElement.lang = lang;
        return true;
    },

    updateUIElements: () => {
        document.querySelectorAll('[data-en][data-fr]').forEach(el => {
            el.textContent = el.dataset[localStorage.getItem('preferred-language')] || 'en';
        });
        
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === localStorage.getItem('preferred-language'));
        });
    }
}; 