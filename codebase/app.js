import { els, showSection } from './src/utils/ui.js';
import { handleChatSubmit } from './src/features/chat.js';
import { handleQuickEdit } from './src/features/itinerary.js';
import { state } from './src/store/state.js';
import { initHistory } from './src/features/history.js';

function init() {
    initHistory();

    els.newChatBtn.addEventListener('click', () => {
        state.chatHistory = [];
        els.chat.history.innerHTML = `
            <div class="chat-message ai-message">
                <div class="chat-avatar">🤖</div>
                <div class="message-content">Chào bạn! Mình là TripEscape AI. Bạn đang muốn đi trốn cuối tuần ở đâu nhỉ?</div>
            </div>
        `;
        showSection('welcome');
    });
    
    els.chat.form.addEventListener('submit', handleChatSubmit);
    
    // Log Modal logic
    els.log.btn.addEventListener('click', () => {
        els.log.modal.classList.remove('hidden');
    });
    
    els.log.closeBtn.addEventListener('click', () => {
        els.log.modal.classList.add('hidden');
    });
    
    els.log.modal.addEventListener('click', (e) => {
        if (e.target === els.log.modal) {
            els.log.modal.classList.add('hidden');
        }
    });

    // Auto-resize textarea
    els.chat.input.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    els.chat.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            els.chat.form.querySelector('button[type="submit"]').click();
            
            // Reset height after submit
            setTimeout(() => {
                els.chat.input.style.height = 'auto';
            }, 10);
        }
    });
    
    els.buttons.backToProposals.addEventListener('click', () => showSection('proposals'));
    
    els.buttons.actionBtns.forEach(btn => {
        btn.addEventListener('click', (e) => handleQuickEdit(e.target.dataset.action));
    });
    
    els.buttons.customEditBtn.addEventListener('click', () => {
        const val = els.buttons.customEditInput.value.trim();
        if (val) handleQuickEdit(val);
    });

    // Resizer Logic
    const resizer = document.getElementById('drag-resizer');
    const leftPane = document.querySelector('.left-pane');
    const rightPane = document.querySelector('.right-pane');
    const splitLayout = document.querySelector('.split-layout');
    let isDragging = false;

    resizer.addEventListener('mousedown', () => {
        isDragging = true;
        resizer.classList.add('dragging');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const containerRect = splitLayout.getBoundingClientRect();
        const leftWidth = e.clientX - containerRect.left;
        
        if (leftWidth > 350 && leftWidth < containerRect.width - 350) {
            const leftPercentage = (leftWidth / containerRect.width) * 100;
            const rightPercentage = 100 - leftPercentage;
            
            leftPane.style.flex = `${leftPercentage}`;
            rightPane.style.flex = `${rightPercentage}`;
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            resizer.classList.remove('dragging');
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    });
}

document.addEventListener('DOMContentLoaded', init);
