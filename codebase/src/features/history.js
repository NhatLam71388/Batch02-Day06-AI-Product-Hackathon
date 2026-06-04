import { els, showSection } from '../utils/ui.js';
import { renderItinerary } from './itinerary.js';
import { state } from '../store/state.js';

const STORAGE_KEY = 'tripescape_saved_itineraries';

// Load from local storage
export function getSavedItineraries() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error("Lỗi đọc lịch sử", e);
        return [];
    }
}

// Save to local storage
export function saveItinerary(routeProposal, itineraryData) {
    const history = getSavedItineraries();
    const newEntry = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        route: routeProposal,
        data: itineraryData
    };
    
    // Add to beginning of array
    history.unshift(newEntry);
    
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        renderHistoryList();
    } catch (e) {
        console.error("Lỗi lưu lịch sử", e);
    }
}

// Render history list in sidebar
export function renderHistoryList() {
    const history = getSavedItineraries();
    
    if (history.length === 0) {
        els.history.list.innerHTML = `<p class="subtitle text-center" style="margin-top: 2rem;">Chưa có lịch trình nào được lưu.</p>`;
        return;
    }
    
    els.history.list.innerHTML = '';
    
    history.forEach(item => {
        const date = new Date(item.createdAt).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
        
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <div class="history-item-title">${item.route.title}</div>
            <div class="history-item-date"><i class="ph ph-clock"></i> ${date}</div>
        `;
        
        div.addEventListener('click', () => {
            loadItineraryFromHistory(item);
        });
        
        els.history.list.appendChild(div);
    });
}

// Load an itinerary from history and display it
function loadItineraryFromHistory(historyItem) {
    // Update state
    state.currentRoute = historyItem.route;
    state.currentItinerary = historyItem.data;
    
    // Render and show
    renderItinerary(historyItem.data, historyItem.route);
    showSection('itinerary');
    
    // Close sidebar
    toggleHistorySidebar();
}

// Toggle sidebar visibility
export function toggleHistorySidebar() {
    els.history.sidebar.classList.toggle('hidden');
}

// Initialize history event listeners
export function initHistory() {
    els.history.btn.addEventListener('click', toggleHistorySidebar);
    els.history.closeBtn.addEventListener('click', toggleHistorySidebar);
    
    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!els.history.sidebar.classList.contains('hidden') && 
            !els.history.sidebar.contains(e.target) &&
            !els.history.btn.contains(e.target)) {
            toggleHistorySidebar();
        }
    });
    
    // Initial render
    renderHistoryList();
}
