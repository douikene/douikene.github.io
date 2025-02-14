class CVChat {
    constructor() {
        console.log('Chat widget initializing...');
        this.container = document.querySelector('.chat-widget');
        this.messagesContainer = document.getElementById('chat-messages');
        this.input = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-message');
        this.toggleButton = document.querySelector('.chat-header');
        this.cvData = null;
        
        this.init();
    }

    async init() {
        // Load CV data
        try {
            const response = await fetch('/data/cv.en.json');
            this.cvData = await response.json();
        } catch (error) {
            console.error('Error loading CV data:', error);
        }

        // Event listeners
        this.toggleButton.addEventListener('click', () => {
            this.container.classList.toggle('open');
        });

        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        this.sendButton.addEventListener('click', () => this.sendMessage());
    }

    async sendMessage() {
        const message = this.input.value.trim();
        if (!message) return;

        // Clear input
        this.input.value = '';

        // Add user message
        this.addMessage(message, 'user');

        // Show loading
        this.addLoadingIndicator();

        try {
            const response = await this.getAIResponse(message);
            this.removeLoadingIndicator();
            this.addMessage(response, 'system');
        } catch (error) {
            this.removeLoadingIndicator();
            this.addMessage('Sorry, I encountered an error. Please try again.', 'system');
        }
    }

    addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = text;
        this.messagesContainer.appendChild(messageDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    addLoadingIndicator() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message system loading';
        loadingDiv.innerHTML = `
            <div class="loading-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        this.messagesContainer.appendChild(loadingDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    removeLoadingIndicator() {
        const loading = this.messagesContainer.querySelector('.loading');
        if (loading) loading.remove();
    }

    async getAIResponse(message) {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message,
                cvData: this.cvData
            })
        });

        if (!response.ok) {
            throw new Error('Failed to get AI response');
        }

        const data = await response.json();
        return data.response;
    }
}

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CVChat();
}); 