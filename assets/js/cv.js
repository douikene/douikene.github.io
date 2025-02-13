async function loadCV() {
    try {
        const response = await fetch('/data/cv.json');
        const data = await response.json();
        renderCV(data);
        document.body.classList.add('loaded');
        document.getElementById('cv-content').classList.remove('loading');
    } catch (error) {
        console.error('Error loading CV data:', error);
        document.getElementById('cv-content').innerHTML = 'Error loading CV data';
    }
}

function renderCV(data) {
    const content = document.getElementById('cv-content');
    
    content.innerHTML = `
        <div class="profile-header">
            <div class="profile-info">
                <h1>${data.personalInfo.name}</h1>
                <div class="contact">
                    <p>${data.personalInfo.title}</p>
                    <p>
                        <i class="fas fa-map-marker-alt"></i> ${data.personalInfo.location} | 
                        <i class="fas fa-phone"></i> <a href="tel:${data.personalInfo.phone}">${data.personalInfo.phone}</a> | 
                        <i class="fas fa-envelope"></i> <a href="mailto:${data.personalInfo.email}">${data.personalInfo.email}</a> | 
                        <i class="fab fa-github"></i> <a href="${data.personalInfo.github}" target="_blank">douikene</a> |
                        <i class="fab fa-linkedin"></i> <a href="https://www.linkedin.com/in/douikene/" target="_blank">douikene</a> |
                        <i class="fas fa-globe"></i> <a href="${data.personalInfo.url}" target="_blank">douikene</a>
                    </p>
                    <a href="#" class="download-btn" onclick="printCV(); return false;">
                        <i class="fas fa-download"></i> Download CV
                    </a>
                </div>
            </div>
            <div class="profile-image">
                <img src="${data.personalInfo.picture}" alt="${data.personalInfo.name}">
            </div>
        </div>

        <section>
            <h2>Professional Summary</h2>
            <p>${data.professionalSummary}</p>
        </section>

        <section>
            <h2>Professional Experience</h2>
            ${renderExperience(data.experience)}
        </section>

        <section>
            <h2>Education & Certifications</h2>
            <ul>
                ${data.education.map(edu => `
                    <li><strong>${edu.degree}</strong> – ${edu.institution} (${edu.year})</li>
                `).join('')}
                <li>${data.certifications.join(', ')}</li>
            </ul>
        </section>

        <section>
            <h2>Technical Skills</h2>
            <ul>
                ${Object.entries(data.skills).map(([category, skills]) => `
                    <li><strong>${formatCategory(category)}:</strong> ${skills.join(', ')}</li>
                `).join('')}
            </ul>
        </section>

        <section>
            <h2>Languages</h2>
            <p>${data.languages.map(l => `${l.language} (${l.level})`).join(', ')}</p>
        </section>

        <section>
            <h2>Personal Interests</h2>
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

// Load the CV when the page loads
window.addEventListener('load', loadCV); 