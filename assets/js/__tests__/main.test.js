import '../main.js';

describe('Main Module', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="content" class="loading">Loading...</div>
      <button class="lang-btn" data-lang="en">EN</button>
      <button class="lang-btn" data-lang="fr">FR</button>
    `;
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('loadContent fetches and renders about page content', async () => {
    const mockTranslations = {
      nav: {
        en: { viewCV: 'View CV' },
        fr: { viewCV: 'Voir le CV' }
      }
    };

    const mockCVData = {
      personalInfo: {
        name: 'Test Name',
        title: 'Test Title'
      },
      professionalSummary: 'Test summary'
    };

    global.fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTranslations)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCVData)
      }));

    await loadContent();

    const content = document.getElementById('content');
    expect(content.classList.contains('loading')).toBe(false);
    expect(content.innerHTML).toContain(mockCVData.professionalSummary);
  });

  test('language switcher updates content', async () => {
    const langBtn = document.querySelector('[data-lang="fr"]');
    langBtn.click();

    expect(localStorage.setItem).toHaveBeenCalledWith('preferred-language', 'fr');
  });
}); 