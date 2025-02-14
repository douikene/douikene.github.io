import '../cv.js';

describe('CV Module', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="cv-content" class="loading">Loading...</div>';
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('loadCV fetches and renders CV data', async () => {
    const mockTranslations = {
      loading: { en: 'Loading...' },
      downloadCV: { en: 'Download CV' },
      sections: {
        en: {
          summary: 'Professional Summary',
          experience: 'Experience',
          education: 'Education',
          skills: 'Skills',
          languages: 'Languages',
          interests: 'Interests'
        }
      }
    };

    const mockCVData = {
      personalInfo: {
        name: 'Test Name',
        title: 'Test Title',
        location: 'Test Location',
        email: 'test@example.com',
        github: 'https://github.com/test',
        linkedin: 'https://linkedin.com/in/test',
        url: 'https://test.github.io'
      },
      professionalSummary: 'Test summary',
      experience: [],
      education: [],
      skills: {},
      languages: [],
      interests: []
    };

    // Mock fetch responses
    global.fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockTranslations))
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockCVData))
      }));

    // Trigger CV load
    await loadCV();

    // Check if content was rendered
    const content = document.getElementById('cv-content');
    expect(content.classList.contains('loading')).toBe(false);
    expect(content.innerHTML).toContain(mockCVData.personalInfo.name);
    expect(content.innerHTML).toContain(mockCVData.personalInfo.title);
  });

  test('handles fetch errors gracefully', async () => {
    global.fetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));

    await loadCV();

    const content = document.getElementById('cv-content');
    expect(content.innerHTML).toContain('Error loading CV');
  });
}); 