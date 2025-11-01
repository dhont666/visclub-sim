/**
 * Visclub SiM - Bot Chat Interface
 * Interactieve chat interface voor de Weer & Vangst Bot
 */

class BotChatInterface {
    constructor() {
        this.bot = new WeerVangstBot();
        this.messages = [];
        this.isOpen = false;
        this.init();
    }

    init() {
        this.createChatInterface();
        this.attachEventListeners();
        this.addWelcomeMessage();
    }

    createChatInterface() {
        // Create chat button
        const button = document.createElement('button');
        button.className = 'bot-chat-button';
        button.innerHTML = '<i class="fas fa-fish"></i>';
        button.id = 'botChatButton';
        document.body.appendChild(button);

        // Create chat window
        const chatWindow = document.createElement('div');
        chatWindow.className = 'bot-chat-window';
        chatWindow.id = 'botChatWindow';
        chatWindow.innerHTML = `
            <div class="bot-chat-header">
                <div class="bot-chat-header-info">
                    <div class="bot-avatar">
                        🐟
                    </div>
                    <div class="bot-status">
                        <h4>Vis Advies Bot</h4>
                        <div class="bot-status-indicator">
                            <span class="status-dot"></span>
                            <span>Online</span>
                        </div>
                    </div>
                </div>
                <button class="bot-close-btn" id="botCloseBtn">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div class="bot-chat-messages" id="botChatMessages">
                <!-- Messages will be added here -->
            </div>

            <div class="bot-quick-replies" id="botQuickReplies">
                <!-- Quick reply buttons will be added here -->
            </div>

            <div class="bot-chat-input">
                <input
                    type="text"
                    id="botChatInput"
                    placeholder="Stel je vraag over vissen..."
                    autocomplete="off"
                />
                <button class="bot-send-btn" id="botSendBtn">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        `;
        document.body.appendChild(chatWindow);
    }

    attachEventListeners() {
        // Toggle chat window
        document.getElementById('botChatButton').addEventListener('click', () => {
            this.toggleChat();
        });

        document.getElementById('botCloseBtn').addEventListener('click', () => {
            this.toggleChat();
        });

        // Send message on button click
        document.getElementById('botSendBtn').addEventListener('click', () => {
            this.sendMessage();
        });

        // Send message on Enter key
        document.getElementById('botChatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const chatWindow = document.getElementById('botChatWindow');

        if (this.isOpen) {
            chatWindow.classList.add('active');
        } else {
            chatWindow.classList.remove('active');
        }
    }

    addWelcomeMessage() {
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'bot-welcome';
        welcomeDiv.innerHTML = `
            <div class="bot-welcome-icon">🎣</div>
            <h3>Welkom bij de Vis Advies Bot!</h3>
            <p>Ik help je met advies over de beste vistijden, aas keuze en weersomstandigheden.</p>

            <div class="bot-suggestions">
                <div class="suggestion-card" data-question="Wat zijn de beste weersomstandigheden om te vissen?">
                    <div class="suggestion-icon">🌤️</div>
                    <div class="suggestion-text">
                        <strong>Weer & Vangst</strong>
                        <small>Optimale weersomstandigheden</small>
                    </div>
                </div>

                <div class="suggestion-card" data-question="Welk aas moet ik gebruiken voor karper?">
                    <div class="suggestion-icon">🎣</div>
                    <div class="suggestion-text">
                        <strong>Aas Advies</strong>
                        <small>Beste aas per vissoort</small>
                    </div>
                </div>

                <div class="suggestion-card" data-question="Wanneer is het beste seizoen om te vissen?">
                    <div class="suggestion-icon">📅</div>
                    <div class="suggestion-text">
                        <strong>Seizoen Tips</strong>
                        <small>Beste periodes per vissoort</small>
                    </div>
                </div>

                <div class="suggestion-card" data-question="Hoe beïnvloedt luchtdruk het vissen?">
                    <div class="suggestion-icon">📊</div>
                    <div class="suggestion-text">
                        <strong>Luchtdruk</strong>
                        <small>Invloed op visgedrag</small>
                    </div>
                </div>
            </div>
        `;

        const messagesContainer = document.getElementById('botChatMessages');
        messagesContainer.appendChild(welcomeDiv);

        // Add click handlers to suggestion cards
        document.querySelectorAll('.suggestion-card').forEach(card => {
            card.addEventListener('click', () => {
                const question = card.getAttribute('data-question');
                this.handleUserMessage(question);
                welcomeDiv.remove();
            });
        });
    }

    sendMessage() {
        const input = document.getElementById('botChatInput');
        const message = input.value.trim();

        if (message === '') return;

        this.handleUserMessage(message);
        input.value = '';
    }

    handleUserMessage(message) {
        // Add user message to chat
        this.addMessage(message, 'user');

        // Show typing indicator
        this.showTyping();

        // Simulate bot thinking time
        setTimeout(() => {
            this.hideTyping();

            // Get bot response
            const response = this.bot.processQuestion(message);

            // Add bot response
            this.addBotResponse(response);

            // Add relevant quick replies
            this.updateQuickReplies(message);
        }, 800);
    }

    addMessage(text, type) {
        const messagesContainer = document.getElementById('botChatMessages');

        const messageDiv = document.createElement('div');
        messageDiv.className = `bot-message ${type}`;

        const time = new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });

        messageDiv.innerHTML = `
            <div class="bot-message-content">
                ${text}
                <div class="bot-message-time">${time}</div>
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addBotResponse(response) {
        const messagesContainer = document.getElementById('botChatMessages');

        const messageDiv = document.createElement('div');
        messageDiv.className = 'bot-message bot';

        const time = new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });

        // Format the response
        let formattedContent = this.formatBotResponse(response);

        messageDiv.innerHTML = `
            <div class="bot-message-content">
                ${formattedContent}
                <div class="bot-message-time">${time}</div>
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    formatBotResponse(response) {
        if (typeof response === 'string') {
            return response;
        }

        // Format structured response
        let html = `<div class="bot-advice">`;
        html += `<h3>${response.title}</h3>`;

        response.sections.forEach(section => {
            if (section.subtitle) {
                html += `<h4>${section.subtitle}</h4>`;
            }

            section.content.forEach(line => {
                // Handle markdown-style formatting
                line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                line = line.replace(/• /g, '&bull; ');

                if (line.trim() === '') {
                    html += '<br/>';
                } else {
                    html += `<p>${line}</p>`;
                }
            });
        });

        html += `</div>`;
        return html;
    }

    showTyping() {
        const messagesContainer = document.getElementById('botChatMessages');

        const typingDiv = document.createElement('div');
        typingDiv.className = 'bot-message bot';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;

        messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTyping() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    updateQuickReplies(lastMessage) {
        const quickRepliesContainer = document.getElementById('botQuickReplies');
        quickRepliesContainer.innerHTML = '';

        let suggestions = [];

        // Determine relevant quick replies based on context
        if (lastMessage.toLowerCase().includes('karper')) {
            suggestions = [
                'Beste aas voor karper',
                'Seizoen voor karpervissen',
                'Weer voor karper'
            ];
        } else if (lastMessage.toLowerCase().includes('snoekbaars')) {
            suggestions = [
                'Aas voor snoekbaars',
                'Gesloten tijd snoekbaars',
                'Beste licht voor snoekbaars'
            ];
        } else if (lastMessage.toLowerCase().includes('weer')) {
            suggestions = [
                'Luchtdruk advies',
                'Wind invloed',
                'Beste seizoen'
            ];
        } else {
            suggestions = [
                'Karper tips',
                'Weer advies',
                'Aas keuze'
            ];
        }

        suggestions.forEach(suggestion => {
            const btn = document.createElement('button');
            btn.className = 'quick-reply-btn';
            btn.textContent = suggestion;
            btn.addEventListener('click', () => {
                this.handleUserMessage(suggestion);
                quickRepliesContainer.innerHTML = '';
            });
            quickRepliesContainer.appendChild(btn);
        });
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('botChatMessages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Initialize the bot when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check if bot dependencies are loaded
    if (typeof WeerVangstBot !== 'undefined') {
        window.botChatInterface = new BotChatInterface();
        console.log('🤖 Vis Advies Bot geïnitialiseerd');
    } else {
        console.error('❌ WeerVangstBot niet geladen');
    }
});
