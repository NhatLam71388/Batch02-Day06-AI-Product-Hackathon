/**
 * TripEscape AI - Client-side Controller (Fullstack Version)
 * Developed by ColorOfDreams
 */

// App State
const state = {
    currentStage: 'clarify', // clarify, routes, itinerary
    userInput: {
        origin: 'Hà Nội',
        destination: '',
        budget: '2.5 triệu',
        mood: 'Khám phá, trải nghiệm ẩm thực',
        custom: ''
    },
    selectedRoute: null,
    routesProposed: [],
    currentItinerary: null,
    activeDay: 1
};

// DOM Elements
const elements = {
    modeBadge: document.getElementById('mode-badge'),
    modeText: document.getElementById('mode-text'),
    historyList: document.getElementById('history-list'),
    btnClearHistory: document.getElementById('btn-clear-history'),
    
    // Stages
    stageClarify: document.getElementById('stage-clarify'),
    stageRoutes: document.getElementById('stage-routes'),
    stageItinerary: document.getElementById('stage-itinerary'),
    
    // Forms
    clarifyForm: document.getElementById('clarify-form'),
    btnBackToClarify: document.getElementById('btn-back-to-clarify'),
    btnBackToRoutes: document.getElementById('btn-back-to-routes'),
    
    // Containers
    routesContainer: document.getElementById('routes-container'),
    routesLoader: document.getElementById('routes-loader'),
    itineraryLoader: document.getElementById('itinerary-loader'),
    failureWarningCard: document.getElementById('failure-warning-card'),
    warningTitle: document.getElementById('warning-title'),
    warningDesc: document.getElementById('warning-desc'),
    
    // Timeline
    timelineTabs: document.querySelectorAll('.timeline-tabs .tab-btn'),
    dayTimelines: {
        1: document.getElementById('day-1-timeline'),
        2: document.getElementById('day-2-timeline'),
        3: document.getElementById('day-3-timeline')
    },
    
    // Trip Meta
    metaRouteName: document.getElementById('meta-route-name'),
    metaRouteVehicle: document.getElementById('meta-route-vehicle'),
    metaRouteBudget: document.getElementById('meta-route-budget'),
    
    // Stats
    fatigueVal: document.getElementById('fatigue-val'),
    fatigueBar: document.getElementById('fatigue-bar'),
    fatigueDesc: document.getElementById('fatigue-desc'),
    costTotalVal: document.getElementById('cost-total-val'),
    costTransport: document.getElementById('cost-transport'),
    costHotel: document.getElementById('cost-hotel'),
    costFood: document.getElementById('cost-food'),
    costActivities: document.getElementById('cost-activities'),
    
    // Verify alerts & Corrections
    verifyAlertsContainer: document.getElementById('verify-alerts-container'),
    btnCorrections: document.querySelectorAll('.btn-correction'),
    inputCustomCorrection: document.getElementById('input-custom-correction'),
    btnCustomCorrection: document.getElementById('btn-custom-correction'),
    btnPrintTrip: document.getElementById('btn-print-trip')
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Check Backend Server engine status
    checkBackendStatus();

    // Bind Event Listeners
    initEventListeners();
});

// Fetch backend server status
async function checkBackendStatus() {
    try {
        const res = await fetch('/api/status');
        if (!res.ok) throw new Error('API status not ok');
        const data = await res.json();
        
        if (data.live) {
            elements.modeBadge.querySelector('.badge-dot').className = 'badge-dot dot-live';
            elements.modeText.textContent = 'Chế độ: Live API (Gemini)';
        } else {
            elements.modeBadge.querySelector('.badge-dot').className = 'badge-dot dot-mock';
            elements.modeText.textContent = 'Chế độ: Demo (Mocking)';
        }
        
        // Render sub-badges under the "Trạng thái AI Engine"
        const detailsContainer = document.getElementById('api-details-container');
        if (detailsContainer) {
            detailsContainer.innerHTML = '';
            const apis = [
                { name: 'Gemini', active: data.geminiActive },
                { name: 'OpenRouter', active: data.openRouterActive },
                { name: 'Tavily Search', active: data.tavilyActive },
                { name: 'Weather', active: data.weatherActive }
            ];
            apis.forEach(api => {
                const badge = document.createElement('span');
                badge.className = `api-details-badge ${api.active ? 'active' : 'inactive'}`;
                badge.innerHTML = `<i class="fa-solid ${api.active ? 'fa-check' : 'fa-xmark'}"></i> ${api.name}`;
                detailsContainer.appendChild(badge);
            });
        }
    } catch (err) {
        console.error('Không kết nối được tới backend server:', err);
        elements.modeBadge.querySelector('.badge-dot').className = 'badge-dot dot-mock';
        elements.modeText.textContent = 'Chế độ: Offline (Mock)';
        
        const detailsContainer = document.getElementById('api-details-container');
        if (detailsContainer) {
            detailsContainer.innerHTML = `
                <span class="api-details-badge inactive"><i class="fa-solid fa-xmark"></i> Gemini</span>
                <span class="api-details-badge inactive"><i class="fa-solid fa-xmark"></i> OpenRouter</span>
                <span class="api-details-badge inactive"><i class="fa-solid fa-xmark"></i> Tavily Search</span>
                <span class="api-details-badge inactive"><i class="fa-solid fa-xmark"></i> Weather</span>
            `;
        }
    }
}

// Event Listeners initialization
function initEventListeners() {
    // Bind clear search history button
    if (elements.btnClearHistory) {
        elements.btnClearHistory.addEventListener('click', (e) => {
            e.stopPropagation();
            clearSearchHistory();
        });
    }

    // Clarifying Form submit
    elements.clarifyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Collect Inputs
        state.userInput = {
            origin: document.getElementById('param-origin').value,
            destination: document.getElementById('param-destination').value,
            budget: document.getElementById('param-budget').value,
            mood: document.getElementById('param-mood').value,
            custom: document.getElementById('param-custom').value
        };

        handleClarifySubmit();
    });

    // Back to clarify button
    elements.btnBackToClarify.addEventListener('click', () => {
        switchStage('clarify');
    });

    // Back to routes button
    elements.btnBackToRoutes.addEventListener('click', () => {
        switchStage('routes');
    });

    // Timeline Day Tabs
    elements.timelineTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            elements.timelineTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const day = parseInt(tab.getAttribute('data-day'));
            state.activeDay = day;
            
            // Toggle active timeline view
            Object.keys(elements.dayTimelines).forEach(d => {
                if (parseInt(d) === day) {
                    elements.dayTimelines[d].classList.add('active');
                } else {
                    elements.dayTimelines[d].classList.remove('active');
                }
            });
        });
    });

    // Correction Tags click
    elements.btnCorrections.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-action');
            handleCorrection(action);
        });
    });

    // Custom correction submit
    elements.btnCustomCorrection.addEventListener('click', () => {
        const text = elements.inputCustomCorrection.value.trim();
        if (text) {
            handleCorrection('custom', text);
            elements.inputCustomCorrection.value = '';
        }
    });

    // Custom correction hit Enter key
    elements.inputCustomCorrection.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const text = elements.inputCustomCorrection.value.trim();
            if (text) {
                handleCorrection('custom', text);
                elements.inputCustomCorrection.value = '';
            }
        }
    });

    // Print trip action
    elements.btnPrintTrip.addEventListener('click', () => {
        window.print();
    });

    // Render search history from localStorage on load
    renderSearchHistory();
}

// Stage switcher helper
function switchStage(stage) {
    state.currentStage = stage;
    elements.stageClarify.classList.remove('active');
    elements.stageRoutes.classList.remove('active');
    elements.stageItinerary.classList.remove('active');

    if (stage === 'clarify') {
        elements.stageClarify.classList.add('active');
    } else if (stage === 'routes') {
        elements.stageRoutes.classList.add('active');
    } else if (stage === 'itinerary') {
        elements.stageItinerary.classList.add('active');
    }
}

// Check if inputs represent an impossible trip (Failure path)
function isImpossibleTrip(input) {
    // Tắt kiểm tra chặn để hỗ trợ phạm vi lập lịch trình rộng toàn quốc/quốc tế theo yêu cầu của user
    return { impossible: false };
}

// Process Clarify Form Submit
async function handleClarifySubmit() {
    switchStage('routes');
    elements.routesContainer.innerHTML = '';
    elements.routesLoader.style.display = 'flex';
    elements.failureWarningCard.style.display = 'none';

    // 1. Check Failure Path (Impossible requirements)
    const checkResult = isImpossibleTrip(state.userInput);
    if (checkResult.impossible) {
        elements.routesLoader.style.display = 'none';
        elements.failureWarningCard.style.display = 'flex';
        elements.warningTitle.textContent = 'Phát hiện yêu cầu phi thực tế!';
        elements.warningDesc.textContent = checkResult.reason + ' AI đề xuất bạn lựa chọn các cung đường biển miền Bắc/Bắc Trung Bộ gần hơn dưới đây để đảm bảo an toàn và sức khoẻ.';
        
        // Fetch recommendations from Backend (which will automatically fallback to local database mock alternatives)
        const modelVal = document.getElementById('select-model') ? document.getElementById('select-model').value : 'gemini-2.5-flash';
        try {
            const res = await fetch('/api/recommend-routes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...state.userInput, model: modelVal })
            });
            const data = await res.json();
            // Show only the first 2 alternative routes for warning path
            renderRouteOptions(data.routes.slice(0, 2));
            saveSearchToHistory(state.userInput, state.routesProposed);
        } catch (err) {
            console.error('Lỗi gọi API Backend:', err);
        }
        return;
    }

    // 2. Fetch routes from Backend
    try {
        const modelVal = document.getElementById('select-model') ? document.getElementById('select-model').value : 'gemini-2.5-flash';
        const res = await fetch('/api/recommend-routes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...state.userInput, model: modelVal })
        });
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        
        // Update live API status indicator based on response
        updateStatusBadge(data.live);

        if (data.error) {
            showToast('Máy chủ AI bận hoặc gặp lỗi (503). Hệ thống tự động kích hoạt chế độ dự phòng (Mocking) để hiển thị cung đường.', 'warning');
        }

        renderRouteOptions(data.routes);
        saveSearchToHistory(state.userInput, state.routesProposed);
    } catch (err) {
        console.error('Lỗi tải cung đường từ Backend:', err);
        elements.routesLoader.style.display = 'none';
        elements.routesContainer.innerHTML = '<p class="help-text">Không thể kết nối đến Backend Server. Hãy chắc chắn server đang chạy.</p>';
    }
}

// Helper to update live badge dynamically based on API response
function updateStatusBadge(isLive) {
    if (isLive) {
        elements.modeBadge.querySelector('.badge-dot').className = 'badge-dot dot-live';
        elements.modeText.textContent = 'Chế độ: Live API (Gemini)';
    } else {
        elements.modeBadge.querySelector('.badge-dot').className = 'badge-dot dot-mock';
        elements.modeText.textContent = 'Chế độ: Demo (Mocking)';
    }
    // Re-check backend status to update key sub-badges
    checkBackendStatus();
}

// Render Proposed Route Cards
function renderRouteOptions(routes) {
    elements.routesLoader.style.display = 'none';
    state.routesProposed = routes;
    
    if (routes.length === 0) {
        elements.routesContainer.innerHTML = '<p class="help-text">Không tìm thấy cung đường nào phù hợp.</p>';
        return;
    }

    routes.forEach(route => {
        const card = document.createElement('div');
        card.className = 'route-card';
        card.innerHTML = `
            <div class="route-card-header">
                <span class="route-badge">${route.type === 'discovery' ? 'Khám phá' : route.type === 'relaxed' ? 'Nghỉ dưỡng' : 'Phiêu lưu'}</span>
                <i class="fa-solid fa-route" style="color: var(--primary-color);"></i>
            </div>
            <h3>${route.name}</h3>
            <p class="route-vibe">${route.vibe}</p>
            <div class="route-stats">
                <div class="route-stat-item">
                    <span>Khoảng cách</span>
                    <strong>${route.distance}</strong>
                </div>
                <div class="route-stat-item">
                    <span>Ngân sách ước tính</span>
                    <strong>${route.cost}</strong>
                </div>
                <div class="route-stat-item">
                    <span>Độ mệt</span>
                    <strong>${route.fatigue}</strong>
                </div>
            </div>
            <div class="route-reason">
                <strong>Lý do phù hợp:</strong> ${route.reason}
            </div>
            <button class="btn-select-route" data-id="${route.id}">Lên lịch trình chi tiết</button>
        `;
        
        card.querySelector('.btn-select-route').addEventListener('click', (e) => {
            e.stopPropagation();
            selectRoute(route);
        });
        
        elements.routesContainer.appendChild(card);
    });
}

// Select a Route and generate itinerary
async function selectRoute(route) {
    state.selectedRoute = route;
    switchStage('itinerary');
    
    // Set metadata headers
    elements.metaRouteName.innerHTML = `<i class="fa-solid fa-map"></i> ${route.name}`;
    elements.metaRouteBudget.innerHTML = `<i class="fa-solid fa-money-bill-wave"></i> Ngân sách: ~${route.cost}`;

    // Clear timelines
    Object.keys(elements.dayTimelines).forEach(d => {
        elements.dayTimelines[d].innerHTML = '';
    });
    
    elements.itineraryLoader.style.display = 'flex';

    // Fetch itinerary from Backend
    try {
        const modelVal = document.getElementById('select-model') ? document.getElementById('select-model').value : 'gemini-2.5-flash';
        const res = await fetch('/api/generate-itinerary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                route,
                origin: state.userInput.origin,
                budget: state.userInput.budget,
                mood: state.userInput.mood,
                model: modelVal
            })
        });
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        
        updateStatusBadge(data.live);

        if (data.error) {
            showToast('Không thể tạo lịch trình qua AI (503). Hệ thống tự động kích hoạt chế độ dự phòng để hiển thị lịch trình mẫu.', 'warning');
        }

        state.currentItinerary = data.itinerary;
        renderItinerary(data.itinerary);
        updateSearchHistoryWithItinerary(state.userInput, state.selectedRoute, state.currentItinerary);
    } catch (err) {
        console.error('Lỗi tải lịch trình từ Backend:', err);
        elements.itineraryLoader.style.display = 'none';
        elements.dayTimelines[1].innerHTML = '<p class="help-text">Không thể kết nối đến Backend Server để tải lịch trình.</p>';
    }
}

// Render Itinerary into DOM
function renderItinerary(itinerary) {
    elements.itineraryLoader.style.display = 'none';

    // Render weather badges on day tabs
    const defaultTabTitles = {
        1: "Ngày 1: Lên đường & Check-in",
        2: "Ngày 2: Trải nghiệm & Khám phá",
        3: "Ngày 3: Mua quà & Trở về"
    };

    elements.timelineTabs.forEach(tab => {
        const day = parseInt(tab.getAttribute('data-day'));
        const baseTitle = defaultTabTitles[day] || `Ngày ${day}`;
        tab.innerHTML = baseTitle;
        
        if (itinerary.weatherForecast && Array.isArray(itinerary.weatherForecast)) {
            const forecast = itinerary.weatherForecast.find(f => f.day === day);
            if (forecast) {
                const badge = document.createElement('span');
                badge.className = 'tab-weather-badge';
                badge.title = `${forecast.text}, ${forecast.temp}°C`;
                
                let iconUrl = forecast.icon || "";
                if (iconUrl.startsWith('//')) {
                    iconUrl = `https:${iconUrl}`;
                }
                
                badge.innerHTML = `
                    <img src="${iconUrl}" alt="${forecast.text}">
                    <span>${forecast.temp}°C</span>
                `;
                tab.appendChild(badge);
            }
        }
    });

    // 1. Render Indicators
    elements.fatigueVal.textContent = `${itinerary.fatigue}/5`;
    elements.fatigueBar.style.width = `${itinerary.fatigue * 20}%`;
    
    if (itinerary.fatigue <= 2) {
        elements.fatigueBar.style.background = 'var(--success-color)';
    } else if (itinerary.fatigue <= 3) {
        elements.fatigueBar.style.background = 'var(--warning-color)';
    } else {
        elements.fatigueBar.style.background = 'var(--error-color)';
    }
    
    elements.fatigueDesc.textContent = itinerary.fatigueDesc;
    elements.costTotalVal.textContent = itinerary.totalCost;
    
    elements.costTransport.textContent = itinerary.costs.transport || '0đ';
    elements.costHotel.textContent = itinerary.costs.hotel || '0đ';
    elements.costFood.textContent = itinerary.costs.food || '0đ';
    elements.costActivities.textContent = itinerary.costs.activities || '0đ';

    // 2. Render Timeline Items for each day
    Object.keys(elements.dayTimelines).forEach(d => {
        const container = elements.dayTimelines[d];
        container.innerHTML = '';
        
        const dayItems = itinerary.days[d] || [];
        if (dayItems.length === 0) {
            container.innerHTML = '<p class="help-text">Không có lịch trình cho ngày này.</p>';
            return;
        }

        dayItems.forEach((item, index) => {
            const isImportant = item.title.includes('Xuất phát') || item.title.includes('phà') || item.title.includes('bình minh') || item.title.includes('Khám phá');
            
            const itemEl = document.createElement('div');
            itemEl.className = `timeline-item ${isImportant ? 'important-item' : ''}`;
            
            let highlightStyle = '';
            if (item.highlight) {
                highlightStyle = 'style="border-color: var(--primary-color); box-shadow: 0 0 10px rgba(0,242,254,0.15);"';
            }
            
            const queryName = `${item.loc} ${item.title}`;
            const verifyLink = item.verifyLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryName + ' đánh giá giá cả')}`;

            itemEl.innerHTML = `
                <div class="timeline-time-badge">${item.time}</div>
                <div class="timeline-marker"></div>
                <div class="timeline-item-body" ${highlightStyle}>
                    <div class="timeline-item-header">
                        <h4>${item.title}</h4>
                        ${item.cost && item.cost !== 'Miễn phí' ? `<span class="timeline-item-cost">${item.cost}</span>` : '<span class="timeline-item-cost" style="background: rgba(255,255,255,0.03); color: var(--text-muted);">Free</span>'}
                    </div>
                    <p>${item.desc}</p>
                    <div class="timeline-item-footer">
                        <span class="timeline-location"><i class="fa-solid fa-location-dot"></i> ${item.loc}</span>
                        <div class="timeline-footer-actions">
                            <a href="${verifyLink}" target="_blank" class="btn-item-verify" title="Xem đánh giá, vị trí và giá cả thực tế trên Google Maps">
                                <i class="fa-solid fa-shield-halved"></i> Xác thực (Xem giá & đánh giá)
                            </a>
                            <a href="https://www.google.com/maps/search/${encodeURIComponent(item.loc + ' ' + (state.userInput.origin || ''))}" target="_blank" class="btn-item-action">
                                <i class="fa-solid fa-map-location-dot"></i> Bản đồ
                            </a>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(itemEl);
        });
    });

    // 3. Render Verify Alerts (Trust Path)
    elements.verifyAlertsContainer.innerHTML = '';
    const alerts = itinerary.verifyAlerts || [];
    if (alerts.length === 0) {
        elements.verifyAlertsContainer.innerHTML = `
            <div class="verify-alert-item" style="border-left: 3px solid var(--success-color);">
                <div class="alert-icon" style="color: var(--success-color);"><i class="fa-solid fa-circle-check"></i></div>
                <div class="alert-content">
                    <h4>Mọi thông tin đã tối ưu</h4>
                    <p>Cung đường ven biển này đã có dữ liệu xác minh rất tốt. Hãy lên đường thôi!</p>
                </div>
            </div>
        `;
    } else {
        alerts.forEach(alert => {
            const alertEl = document.createElement('div');
            alertEl.className = 'verify-alert-item warning';
            alertEl.innerHTML = `
                <div class="alert-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
                <div class="alert-content">
                    <h4>${alert.title}</h4>
                    <p>${alert.text}</p>
                    ${alert.link ? `<a href="${alert.link}" target="_blank" class="verify-link"><i class="fa-solid fa-circle-info"></i> Xác minh thực tế</a>` : ''}
                </div>
            `;
            elements.verifyAlertsContainer.appendChild(alertEl);
        });
    }

    elements.timelineTabs[0].click();
}

// Handle plan adjustments (Correction Path)
async function handleCorrection(action, customText = '') {
    elements.itineraryLoader.style.display = 'flex';
    elements.btnCorrections.forEach(btn => btn.classList.remove('active'));
    
    if (action !== 'custom') {
        const activeBtn = Array.from(elements.btnCorrections).find(btn => btn.getAttribute('data-action') === action);
        if (activeBtn) activeBtn.classList.add('active');
    }

    // Call Backend Refine Itinerary endpoint
    try {
        const modelVal = document.getElementById('select-model') ? document.getElementById('select-model').value : 'gemini-2.5-flash';
        const res = await fetch('/api/refine-itinerary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action,
                customText,
                currentItinerary: state.currentItinerary,
                model: modelVal
            })
        });
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        
        updateStatusBadge(data.live);

        if (data.error) {
            showToast('Không thể hiệu chỉnh lịch trình qua AI (503). Hệ thống tự động kích hoạt chế độ dự phòng để điều chỉnh lịch trình cục bộ.', 'warning');
        }

        state.currentItinerary = data.itinerary;
        renderItinerary(data.itinerary);
        updateSearchHistoryWithItinerary(state.userInput, state.selectedRoute, state.currentItinerary);
    } catch (err) {
        console.error('Lỗi hiệu chỉnh lịch trình qua Backend:', err);
        elements.itineraryLoader.style.display = 'none';
    }
}

// Load search history from localStorage
function getSearchHistory() {
    try {
        const history = localStorage.getItem('tripescape_search_history');
        return history ? JSON.parse(history) : [];
    } catch (e) {
        console.error('Error parsing search history:', e);
        return [];
    }
}

// Save a search query to history
function saveSearchToHistory(input, routesProposed) {
    if (!input || !input.destination || !input.destination.trim()) return;

    let history = getSearchHistory();
    
    // Check if duplicate search already exists
    const duplicateIndex = history.findIndex(item => 
        item.userInput &&
        item.userInput.origin === input.origin &&
        item.userInput.destination.toLowerCase().trim() === input.destination.toLowerCase().trim() &&
        item.userInput.budget === input.budget &&
        item.userInput.mood === input.mood &&
        (item.userInput.custom || '').trim() === (input.custom || '').trim()
    );

    let existingItem = null;
    if (duplicateIndex > -1) {
        existingItem = history.splice(duplicateIndex, 1)[0];
    }

    const historyItem = {
        userInput: { ...input },
        routesProposed: routesProposed || (existingItem ? existingItem.routesProposed : []),
        selectedRoute: existingItem ? existingItem.selectedRoute : null,
        currentItinerary: existingItem ? existingItem.currentItinerary : null
    };

    // Add to beginning of history
    history.unshift(historyItem);

    // Limit to 5 items
    if (history.length > 5) {
        history = history.slice(0, 5);
    }

    try {
        localStorage.setItem('tripescape_search_history', JSON.stringify(history));
    } catch (e) {
        console.error('Error saving search history:', e);
    }

    renderSearchHistory();
}

// Update search history item with generated itinerary details
function updateSearchHistoryWithItinerary(userInput, selectedRoute, currentItinerary) {
    if (!userInput || !userInput.destination || !userInput.destination.trim()) return;

    let history = getSearchHistory();
    
    const index = history.findIndex(item => 
        item.userInput &&
        item.userInput.origin === userInput.origin &&
        item.userInput.destination.toLowerCase().trim() === userInput.destination.toLowerCase().trim() &&
        item.userInput.budget === userInput.budget &&
        item.userInput.mood === userInput.mood &&
        (item.userInput.custom || '').trim() === (userInput.custom || '').trim()
    );

    if (index > -1) {
        history[index].selectedRoute = selectedRoute ? { ...selectedRoute } : null;
        history[index].currentItinerary = currentItinerary ? { ...currentItinerary } : null;
        
        try {
            localStorage.setItem('tripescape_search_history', JSON.stringify(history));
        } catch (e) {
            console.error('Error updating search history with itinerary:', e);
        }
    }
}

// Clear search history
function clearSearchHistory() {
    try {
        localStorage.removeItem('tripescape_search_history');
    } catch (e) {
        console.error('Error clearing search history:', e);
    }
    renderSearchHistory();
}

// Render search history to the DOM
function renderSearchHistory() {
    if (!elements.historyList) return;
    elements.historyList.innerHTML = '';
    
    const history = getSearchHistory();
    
    if (history.length === 0) {
        elements.historyList.innerHTML = '<li style="cursor: default; font-style: italic; color: var(--text-muted); background: none; border: none; padding: 10px 0; justify-content: center; font-size: 12px; transform: none; display: flex; align-items: center; gap: 8px;"><i class="fa-solid fa-circle-info"></i> Chưa có lịch sử tra cứu</li>';
        return;
    }
    
    history.forEach((item, index) => {
        const li = document.createElement('li');
        li.setAttribute('data-index', index);
        
        const hasCachedItinerary = item.currentItinerary && item.selectedRoute;
        const iconClass = hasCachedItinerary ? 'fa-solid fa-cloud-arrow-down' : 'fa-solid fa-clock-rotate-left';
        const titleColorStyle = hasCachedItinerary ? 'color: var(--primary-color);' : '';
        const titleText = `${item.userInput.origin} ➔ ${item.userInput.destination}`;
        const subtitleText = `${item.userInput.budget}${hasCachedItinerary ? ' • Đã lưu offline' : ''}`;
        
        li.innerHTML = `
            <i class="${iconClass}" style="font-size: 12px; color: ${hasCachedItinerary ? 'var(--primary-color)' : 'var(--text-muted)'};"></i>
            <div class="history-item-details">
                <span class="history-item-title" style="${titleColorStyle}">${titleText}</span>
                <span class="history-item-subtitle">${subtitleText}</span>
            </div>
        `;
        
        li.addEventListener('click', () => {
            loadSearchHistoryItem(item);
        });
        
        elements.historyList.appendChild(li);
    });
}

// Load a specific history item
function loadSearchHistoryItem(item) {
    if (!item || !item.userInput) return;
    
    const originEl = document.getElementById('param-origin');
    const destEl = document.getElementById('param-destination');
    const budgetEl = document.getElementById('param-budget');
    const moodEl = document.getElementById('param-mood');
    const customEl = document.getElementById('param-custom');
    
    if (originEl) originEl.value = item.userInput.origin;
    if (destEl) destEl.value = item.userInput.destination;
    if (budgetEl) budgetEl.value = item.userInput.budget;
    if (moodEl) moodEl.value = item.userInput.mood;
    if (customEl) customEl.value = item.userInput.custom || '';
    
    state.userInput = { ...item.userInput };
    state.routesProposed = item.routesProposed ? [ ...item.routesProposed ] : [];
    state.selectedRoute = item.selectedRoute ? { ...item.selectedRoute } : null;
    state.currentItinerary = item.currentItinerary ? { ...item.currentItinerary } : null;
    
    if (state.currentItinerary && state.selectedRoute) {
        if (state.routesProposed.length > 0) {
            elements.routesContainer.innerHTML = '';
            renderRouteOptions(state.routesProposed);
        }
        
        renderItinerary(state.currentItinerary);
        switchStage('itinerary');
        
        elements.metaRouteName.innerHTML = `<i class="fa-solid fa-map"></i> ${state.selectedRoute.name}`;
        elements.metaRouteBudget.innerHTML = `<i class="fa-solid fa-money-bill-wave"></i> Ngân sách: ~${state.selectedRoute.cost}`;
        
        showToast('Đã tải lịch trình đã lưu trong lịch sử tra cứu!', 'success');
    } else if (state.routesProposed && state.routesProposed.length > 0) {
        elements.routesContainer.innerHTML = '';
        renderRouteOptions(state.routesProposed);
        switchStage('routes');
        showToast('Đã tải danh sách cung đường từ lịch sử tra cứu!', 'success');
    } else {
        switchStage('clarify');
        handleClarifySubmit();
    }
}

// Show Toast Notification
function showToast(message, type = 'warning') {
    // Remove existing toast if any
    const existing = document.getElementById('app-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = `app-toast toast-${type}`;
    
    let icon = '<i class="fa-solid fa-triangle-exclamation"></i>';
    if (type === 'success') icon = '<i class="fa-solid fa-circle-check"></i>';
    if (type === 'error') icon = '<i class="fa-solid fa-circle-exclamation"></i>';

    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
            <p>${message}</p>
        </div>
        <button class="toast-close"><i class="fa-solid fa-xmark"></i></button>
    `;

    document.body.appendChild(toast);

    // Bind close action
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.add('toast-hide');
        setTimeout(() => toast.remove(), 300);
    });

    // Auto dismiss after 6 seconds
    setTimeout(() => {
        if (document.body.contains(toast)) {
            toast.classList.add('toast-hide');
            setTimeout(() => toast.remove(), 300);
        }
    }, 6000);
}

