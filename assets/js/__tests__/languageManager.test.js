import { languageManager } from '../languageManager.js';

describe('languageManager', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    document.documentElement.lang = 'en';
  });

  test('getCurrentLang returns "en" when no language is set', () => {
    localStorage.getItem.mockReturnValue(null);
    expect(languageManager.getCurrentLang()).toBe('en');
  });

  test('getCurrentLang returns stored language', () => {
    localStorage.getItem.mockReturnValue('fr');
    expect(languageManager.getCurrentLang()).toBe('fr');
  });

  test('setLanguage updates localStorage and HTML lang attribute', async () => {
    await languageManager.setLanguage('fr');
    
    expect(localStorage.setItem).toHaveBeenCalledWith('preferred-language', 'fr');
    expect(document.documentElement.lang).toBe('fr');
  });

  test('updateUIElements updates text content of elements with data attributes', () => {
    // Setup DOM elements
    document.body.innerHTML = `
      <div data-en="Hello" data-fr="Bonjour"></div>
      <button class="lang-btn" data-lang="en"></button>
      <button class="lang-btn active" data-lang="fr"></button>
    `;

    localStorage.getItem.mockReturnValue('fr');
    languageManager.updateUIElements();

    expect(document.querySelector('[data-en]').textContent).toBe('Bonjour');
    expect(document.querySelector('[data-lang="fr"]').classList.contains('active')).toBe(true);
    expect(document.querySelector('[data-lang="en"]').classList.contains('active')).toBe(false);
  });
}); 