// =========================================================
// ГЛОБАЛЬНЫЕ КОНСТАНТЫ И ИНИЦИАЛИЗАЦИЯ
// =========================================================

const tg = window.Telegram.WebApp;
const API_BASE_URL = 'http://212.193.27.144:3000/api/v1'; 

let userState = {
    isAuthenticated: false,
    token: localStorage.getItem('jwtToken') || null,
    role: null,
    // *** АКТУАЛЬНО: Передаем всю строку initData ***
    initData: tg.initData || null 
};

// =========================================================
// ФУНКЦИИ УПРАВЛЕНИЯ UI
// =========================================================

window.logout = function() {
    userState.isAuthenticated = false;
    userState.token = null;
    userState.role = null;
    localStorage.removeItem('jwtToken');
    renderUI();
    document.getElementById('pin-input').value = '';
    
    // Очищаем поле ID при выходе
    const idInput = document.getElementById('telegram-id-input');
    if (idInput) idInput.value = '';
    
    displayPinMessage('Вы вышли из системы. Войдите снова.', false);
    tg.MainButton.hide(); 
}

function renderUI() {
    const pinAuthPanel = document.getElementById('pin-auth-panel');
    const adminPanel = document.getElementById('admin-panel');
    const mainPanel = document.getElementById('main-panel');
    const userInfoHeader = document.getElementById('user-info');
    
    // ... (UI-логика без изменений)
    pinAuthPanel.style.display = 'none';
    adminPanel.style.display = 'none';
    mainPanel.style.display = 'none';

    if (userState.isAuthenticated) {
        userInfoHeader.style.display = 'flex';
        document.getElementById('role-display').textContent = userState.role || 'N/A';
        
        tg.MainButton.setText("Закрыть Mini App");
        tg.MainButton.show();
        
        if (userState.role === 'admin' || userState.role === 'super_admin') {
            adminPanel.style.display = 'block';
            document.getElementById('admin-tg-id-display').textContent = 'ID получен сервером'; 
        } else {
            mainPanel.style.display = 'block';
        }
    } else {
        userInfoHeader.style.display = 'none';
        pinAuthPanel.style.display = 'block';
        tg.MainButton.hide(); 
    }
}

function displayPinMessage(message, isError = true) {
    const msgDiv = document.getElementById('pin-message');
    msgDiv.textContent = message;
    msgDiv.className = isError ? 'alert alert-danger' : 'alert alert-success'; 
    msgDiv.style.display = 'block';
}


// =========================================================
// ЛОГИКА АУТЕНТИФИКАЦИИ (ТЕПЕРЬ ПОДДЕРЖИВАЕТ РУЧНОЙ ВВОД ID)
// =========================================================

async function handlePinLogin(event) {
    event.preventDefault(); 
    
    const pinInput = document.getElementById('pin-input');
    const pin = pinInput.value;
    const idInput = document.getElementById('telegram-id-input');
    const manualTelegramId = idInput ? idInput.value : null;

    const submitButton = event.target.querySelector('button[type="submit"]');
    
    if (!pin || pin.length !== 4) {
        return displayPinMessage('Пожалуйста, введите корректный PIN-код (4 цифры).', true);
    }
    
    // *** ОПРЕДЕЛЕНИЕ МЕТОДА ВХОДА ***
    let loginData;

    // 1. Попытка входа через InitData (стандартный, безопасный путь)
    if (userState.initData) {
        loginData = {
            pin_code: pin,
            initData: userState.initData 
        };
    } 
    // 2. Аварийный вход через ручной ввод ID (если InitData нет)
    else if (manualTelegramId) {
        loginData = {
            pin_code: pin,
            telegram_id: manualTelegramId // Используем ручной ввод
        };
    }
    // 3. Провал, нет ни InitData, ни ручного ID
    else {
        return displayPinMessage('❌ Ошибка: Невозможно авторизоваться. Введите ваш Telegram ID вручную.', true);
    }

    submitButton.disabled = true;
    displayPinMessage('Вход...', false);

    // --- ОТЛАДОЧНЫЙ ЛОГ (можно оставить, пока не заработает) ---
    console.log('Attempting login with data:', loginData);
    // -----------------------------------------------------------

    try {
        // Если в loginData есть 'initData', Express использует InitDataController.
        // Если в loginData есть 'telegram_id', Express использует стандартный LoginController.
        // Мы используем /auth/login, который должен обработать оба случая.
        
        const response = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
        
        const { token, user } = response.data;
        
        // Сохраняем состояние
        userState.isAuthenticated = true;
        userState.token = token;
        userState.role = user.role;
        localStorage.setItem('jwtToken', token); 

        displayPinMessage(`Вход успешен! Роль: ${user.role}`, false);
        
        setTimeout(renderUI, 500);

    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Неизвестная ошибка сервера.';
        displayPinMessage(`❌ Ошибка: ${errorMessage}`, true);
        
    } finally {
        submitButton.disabled = false;
    }
}

async function checkAuthOnLoad() {
    // ... (логика проверки токена остается без изменений)
    if (!userState.token) {
        renderUI();
        return;
    }

    try {
        const response = await axios.get(`${API_BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${userState.token}`
            }
        });
        
        const profile = response.data.profile;
        userState.isAuthenticated = true;
        userState.role = profile.role;

        renderUI();

    } catch (error) {
        console.error("Token invalid or expired. Asking for re-login.", error);
        userState.token = null;
        userState.isAuthenticated = false;
        localStorage.removeItem('jwtToken');
        
        renderUI();
    }
}

// =========================================================
// ТОЧКА ВХОДА
// =========================================================

window.addEventListener('DOMContentLoaded', () => {
    tg.ready();
    
    const pinForm = document.getElementById('pin-form');
    if (pinForm) {
        pinForm.addEventListener('submit', handlePinLogin);
    }
    
    tg.MainButton.onClick(() => {
        tg.close();
    });

    setTimeout(checkAuthOnLoad, 50); 
});