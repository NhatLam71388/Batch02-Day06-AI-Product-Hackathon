export const els = {
    modelSelect: document.getElementById('model-select'),
    newChatBtn: document.getElementById('new-chat-btn'),
    
    sections: {
        welcome: document.getElementById('step-welcome'),
        loading: document.getElementById('step-loading'),
        proposals: document.getElementById('step-proposals'),
        itinerary: document.getElementById('step-itinerary')
    },
    
    loadingText: document.getElementById('loading-text'),
    
    chat: {
        form: document.getElementById('chat-form'),
        input: document.getElementById('chat-input'),
        history: document.getElementById('chat-history')
    },
    proposalsContainer: document.getElementById('proposals-container'),
    
    itinerary: {
        title: document.getElementById('itinerary-title'),
        reason: document.getElementById('itinerary-reason'),
        cost: document.getElementById('itinerary-cost'),
        fatigue: document.getElementById('itinerary-fatigue'),
        weather: document.getElementById('itinerary-weather'),
        verificationList: document.getElementById('verification-list'),
        reviewsList: document.getElementById('itinerary-reviews'),
        timeline: document.getElementById('itinerary-timeline')
    },
    
    buttons: {
        backToProposals: document.getElementById('back-to-proposals-btn'),
        actionBtns: document.querySelectorAll('.action-btn'),
        customEditBtn: document.getElementById('custom-edit-btn'),
        customEditInput: document.getElementById('custom-edit-input')
    },
    
    log: {
        btn: document.getElementById('view-logs-btn'),
        modal: document.getElementById('log-modal'),
        closeBtn: document.getElementById('close-log-btn'),
        container: document.getElementById('log-container')
    },
    
    history: {
        btn: document.getElementById('history-toggle-btn'),
        sidebar: document.getElementById('history-sidebar'),
        closeBtn: document.getElementById('close-history-btn'),
        list: document.getElementById('history-list')
    }
};

export function showSection(sectionId) {
    Object.values(els.sections).forEach(sec => sec.classList.add('hidden'));
    els.sections[sectionId].classList.remove('hidden');
}

export function showToast(message, type = 'error') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    toast.innerHTML = `
        <div class="toast-msg">${message}</div>
        <button class="toast-close">&times;</button>
    `;
    
    container.appendChild(toast);
    
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        toast.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    });
    
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

export function addMessageToUI(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${sender}-message`;
    
    const avatar = sender === 'ai' ? '🤖' : '👤';
    
    msgDiv.innerHTML = `
        <div class="chat-avatar">${avatar}</div>
        <div class="message-content">${marked.parse(text)}</div>
    `;
    
    els.chat.history.appendChild(msgDiv);
    els.chat.history.scrollTop = els.chat.history.scrollHeight;
}

export function addLog(title, data, type = 'request') {
    const time = new Date().toLocaleTimeString('vi-VN');
    const isFirstLog = els.log.container.querySelector('p.subtitle');
    if (isFirstLog) {
        els.log.container.innerHTML = ''; // clear empty state
    }
    
    let content = data;
    if (typeof data === 'object') {
        content = JSON.stringify(data, null, 2);
    }
    
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.innerHTML = `
        <div class="log-title">
            <span>${title}</span>
            <span class="log-time">${time}</span>
        </div>
        <div class="log-code">${content}</div>
    `;
    
    els.log.container.appendChild(entry);
    els.log.container.scrollTop = els.log.container.scrollHeight;
}
