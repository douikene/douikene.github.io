async function loadContent() {
    try {
        const response = await fetch('/data/cv.json');
        const data = await response.json();
        renderAbout(data);
        document.body.classList.add('loaded');
        document.getElementById('content').classList.remove('loading');
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('content').innerHTML = 'Error loading content';
    }
}

function renderAbout(data) {
    const content = document.getElementById('content');
    
    content.innerHTML = `
        <div class="about-section">
            <div class="profile-header">
                <div class="profile-info">
                    <h1>${data.personalInfo.name}</h1>
                    <div class="contact">
                        <p>${data.personalInfo.title}</p>
                        <p>
                            <i class="fas fa-map-marker-alt"></i> ${data.personalInfo.location} | 
                            <i class="fas fa-envelope"></i> <a href="mailto:${data.personalInfo.email}">${data.personalInfo.email}</a> | 
                            <i class="fab fa-github"></i> <a href="${data.personalInfo.github}" target="_blank">douikene</a> |
                            <i class="fab fa-linkedin"></i> <a href="https://www.linkedin.com/in/douikene/" target="_blank">douikene</a>
                        </p>
                    </div>
                </div>
                <div class="profile-image">
                    <img src="${data.personalInfo.picture}" alt="${data.personalInfo.name}">
                </div>
            </div>

            <div class="about-content">
                <p>${data.professionalSummary}</p>
                <a href="/cv" class="view-cv-btn">
                    <i class="fas fa-file-alt"></i> View Full CV
                </a>
            </div>
        </div>
    `;
}

window.addEventListener('load', loadContent); 