// Функция для создания тестовых героев
function createTestHeroes() {
    return [
        new Hero('hero1', 'Торгар', { hp: 120, attack: 18, defense: 12, speed: 10 }, 'warrior'),
        new Hero('hero2', 'Эльвира', { hp: 80, attack: 22, defense: 6, speed: 10 }, 'archer'),
        new Hero('hero3', 'Мерлин', { hp: 70, attack: 25, defense: 4, speed: 10 }, 'mage'),
        new Hero('hero4', 'Шэдоу', { hp: 85, attack: 20, defense: 5, speed: 10 }, 'rogue'),
        new Hero('hero5', 'Ульрик', { hp: 140, attack: 15, defense: 15, speed: 10 }, 'paladin') // Новый герой
    ];
}

// Ждём, пока загрузится DOM, потом выполняем код
// async означает, что функция будет работать асинхронно
document.addEventListener('DOMContentLoaded', async () => {
    // Показываем шапку игры
    const gameHeader = document.querySelector('.game-header');
    if (gameHeader) {
        gameHeader.style.display = 'flex';
        gameHeader.style.visibility = 'visible';
    }
    
    // Показываем индикатор загрузки
    showLoadingIndicator('Загрузка спрайтов из папки images...');
    
    try {
        // Создаём менеджер спрайтов и сохраняем его в глобальной переменной
        window.spriteManager = new SpriteManager();
        
        // Загружаем спрайты и ждём, пока они загрузятся (await)
        await window.spriteManager.loadSprites();
        
        // Инициализируем игру
        initializeGame();
        
        // Прячем индикатор загрузки
        hideLoadingIndicator();
        
        // Показываем уведомление об успехе
        showNotification('✅ Спрайты загружены!', 2000);
        
    } catch (error) {
        // Если произошла ошибка при загрузке спрайтов
        console.error('Ошибка загрузки:', error);
        hideLoadingIndicator();
        
        // Всё равно запускаем игру (будут использоваться заглушки)
        initializeGame();
        showNotification('⚠️ Используются заглушки вместо спрайтов', 3000);
    }
});

// Функция для показа индикатора загрузки
function showLoadingIndicator(text) {
    // Удаляем старый индикатор, если он есть
    const existing = document.getElementById('loadingIndicator');
    if (existing) existing.remove();
    
    // Создаём новый
    const loader = document.createElement('div');
    loader.id = 'loadingIndicator';
    loader.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #16213e;
        color: #e94560;
        padding: 20px 40px;
        border-radius: 10px;
        z-index: 9999;
        border: 2px solid #e94560;
        font-size: 18px;
        box-shadow: 0 0 30px rgba(233,69,96,0.3);
    `;
    loader.textContent = text || 'Загрузка...';
    document.body.appendChild(loader);
}

// Функция для скрытия индикатора загрузки
function hideLoadingIndicator() {
    const loader = document.getElementById('loadingIndicator');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 500);
    }
}

// Функция для показа уведомлений
function showNotification(text, duration) {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #e94560;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 10000;
        animation: fadeInOut ${duration}ms;
    `;
    notif.textContent = text;
    document.body.appendChild(notif);
    
    // Удаляем уведомление через указанное время
    setTimeout(() => notif.remove(), duration);
}

// Функция инициализации игры
function initializeGame() {
    console.log('🎮 Инициализация игры...');
    
    // === 1. СОЗДАЁМ ГЕРОЕВ ===
    const warrior = new Hero('hero1', 'Торгар', { hp: 120, attack: 18, defense: 12, speed: 10 }, 'warrior');
    const archer = new Hero('hero2', 'Эльвира', { hp: 80, attack: 22, defense: 6, speed: 10 }, 'archer');
    const mage = new Hero('hero3', 'Мерлин', { hp: 70, attack: 25, defense: 4, speed: 10 }, 'mage');
    const rogue = new Hero('hero4', 'Шэдоу', { hp: 85, attack: 20, defense: 5, speed: 10 }, 'rogue');
    const paladin = new Hero('hero5', 'Ульрик', { hp: 140, attack: 15, defense: 15, speed: 10 }, 'paladin');
    
    // Добавляем героев в общее состояние игры
    window.GameState.heroes.push(warrior, archer, mage, rogue, paladin);
    window.GameState.selectHero('hero1'); // Выбираем первого героя (Воина)
    
    // === 2. ДОБАВЛЯЕМ ТЕСТОВЫЕ ПРЕДМЕТЫ В ИНВЕНТАРЬ ===
    const testItems = [
        new Consumable('consumable_hp_small', 'Малое зелье здоровья', 'common', 5, 'heal', 30, '💗'),
        new Weapon('weapon_sword_wood', 'Деревянный меч', 'common', 10, { damage: 5, range: 1 }, '⚔️'),
        new Weapon('weapon_bow_1', 'Короткий лук', 'common', 15, { damage: 7, range: 3 }, '🏹'),
        new Armor('armor_cloth_1', 'Тканевая броня', 'common', 8, { defense: 3, hp: 5 }, '👕'),
        // Новое оружие - арбалет
        new Weapon('weapon_crossbow_1', 'Арбалет', 'rare', 45, { damage: 18, range: 4, attackSpeed: 0.6 }, '🎯'),
        // Тестовые баффы
        new Consumable('potion_strength', 'Зелье силы', 'rare', 20, 'buff', 10, '💪'),
        new Consumable('potion_speed', 'Зелье скорости', 'rare', 15, 'buff', 5, '⚡'),
        new Consumable('potion_defense', 'Зелье защиты', 'rare', 18, 'buff', 8, '🛡️'),
        // Еда
        new Consumable('food_berry', 'Ягоды', 'common', 3, 'heal', 15, '🍓'),
        new Consumable('food_meat', 'Мясо', 'common', 8, 'heal', 30, '🍖')
    ];
    
    testItems.forEach(item => {
        window.GameState.heroes[0].addToInventory(item);
        window.GameState.heroes[1].addToInventory(item);
    });
    
    // === 3. ИНИЦИАЛИЗИРУЕМ БАЗОВЫЕ СИСТЕМЫ ===
    window.GameState.initShop();      // Магазин
    window.GameState.initRecipes();   // Крафт
    
    // Инициализируем менеджер навыков
    window.GameState.skillManager = new SkillManager();
    
    // === 4. ИНИЦИАЛИЗИРУЕМ НОВЫЕ СИСТЕМЫ ===
    // Система достижений
    window.achievementsSystem = new AchievementsSystem();
    
    // Система баффов
    window.buffManager = new BuffManager();
    
    // Генератор врагов
    window.enemyGenerator = new EnemyGenerator();
    
    // === 5. ИНИЦИАЛИЗИРУЕМ МЕНЕДЖЕРЫ UI ===
    // Менеджер отображения баффов - ДОБАВЛЯЕМ ЭТУ СТРОКУ
    window.buffUIManager = new BuffUIManager();
    
    // Запускаем UI
    window.ui = new UIManager();
    
    // Создаём контроллер арены
    window.arenaController = new ArenaController();
    
    // === 6. ДОБАВЛЯЕМ КНОПКУ ДЛЯ ПРОСМОТРА ДОСТИЖЕНИЙ ===
    addAchievementsButton();
    
    // === 7. ДОБАВЛЯЕМ ИНФОРМАЦИЮ О НОВЫХ СИСТЕМАХ ===
    addNewSystemsInfo();
    
    // === 8. ДОБАВЛЯЕМ ТЕСТОВЫЕ БАФФЫ ДЛЯ ПРОВЕРКИ (для отладки) ===
    addTestBuffsButton();
    
    console.log('✅ Игра готова!');
    console.log('📊 Загружено систем: Достижения, Баффы, Генератор врагов, BuffUIManager');
}

// Функция для добавления кнопки достижений
function addAchievementsButton() {
    const lobbyElement = document.querySelector('#screenLobby');
    if (!lobbyElement) return;
    
    // Проверяем, не добавлена ли уже кнопка
    if (document.getElementById('achievementsBtn')) return;
    
    const achievementsBtn = document.createElement('button');
    achievementsBtn.id = 'achievementsBtn';
    achievementsBtn.textContent = '🏆 Достижения';
    achievementsBtn.style.marginTop = '20px';
    achievementsBtn.style.marginRight = '10px';
    achievementsBtn.style.background = '#ffd700';
    achievementsBtn.style.color = '#000';
    achievementsBtn.style.fontWeight = 'bold';
    achievementsBtn.style.width = 'auto';
    achievementsBtn.style.padding = '10px 20px';
    achievementsBtn.onclick = () => {
        const modal = document.getElementById('heroModal');
        const modalBody = document.getElementById('modalBody');
        
        if (!window.AchievementsTemplate) {
            console.error('AchievementsTemplate не загружен');
            return;
        }
        
        modalBody.innerHTML = window.AchievementsTemplate.render(
            window.achievementsSystem?.achievements || [],
            window.achievementsSystem?.completedAchievements || []
        );
        modal.style.display = 'block';
        
        const closeBtn = document.getElementById('closeAchievementsBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
    };
    
    lobbyElement.appendChild(achievementsBtn);
}

// Функция для добавления тестовой кнопки баффов
function addTestBuffsButton() {
    const lobbyElement = document.querySelector('#screenLobby');
    if (!lobbyElement) return;
    
    // Проверяем, не добавлена ли уже кнопка
    if (document.getElementById('testBuffsBtn')) return;
    
    const testBuffsBtn = document.createElement('button');
    testBuffsBtn.id = 'testBuffsBtn';
    testBuffsBtn.textContent = '✨ Тест баффов';
    testBuffsBtn.style.marginTop = '20px';
    testBuffsBtn.style.background = '#4aff4a';
    testBuffsBtn.style.color = '#000';
    testBuffsBtn.style.fontWeight = 'bold';
    testBuffsBtn.style.width = 'auto';
    testBuffsBtn.style.padding = '10px 20px';
    testBuffsBtn.onclick = () => {
        // Показываем информацию о доступных баффах
        const modal = document.getElementById('heroModal');
        const modalBody = document.getElementById('modalBody');
        
        modalBody.innerHTML = `
            <h2 style="color: #4aff4a; margin-bottom: 20px;">✨ Доступные баффы</h2>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                <div class="buff-card" style="background: #16213e; padding: 15px; border-radius: 10px; text-align: center; cursor: pointer; border: 2px solid #e94560;" onclick="window.buffManager?.addBuff('potion_strength', window.GameState.getCurrentHero()); window.ui?.showNotification('💪 Зелье силы применено!');">
                    <div style="font-size: 3rem;">💪</div>
                    <h3>Зелье силы</h3>
                    <p>+10 к атаке на 30с</p>
                </div>
                <div class="buff-card" style="background: #16213e; padding: 15px; border-radius: 10px; text-align: center; cursor: pointer; border: 2px solid #4aff4a;" onclick="window.buffManager?.addBuff('potion_speed', window.GameState.getCurrentHero()); window.ui?.showNotification('⚡ Зелье скорости применено!');">
                    <div style="font-size: 3rem;">⚡</div>
                    <h3>Зелье скорости</h3>
                    <p>+5 к скорости на 20с</p>
                </div>
                <div class="buff-card" style="background: #16213e; padding: 15px; border-radius: 10px; text-align: center; cursor: pointer; border: 2px solid #4caaff;" onclick="window.buffManager?.addBuff('potion_defense', window.GameState.getCurrentHero()); window.ui?.showNotification('🛡️ Зелье защиты применено!');">
                    <div style="font-size: 3rem;">🛡️</div>
                    <h3>Зелье защиты</h3>
                    <p>+8 к защите на 25с</p>
                </div>
                <div class="buff-card" style="background: #16213e; padding: 15px; border-radius: 10px; text-align: center; cursor: pointer; border: 2px solid #ffd700;" onclick="window.buffManager?.addBuff('blessing', window.GameState.getCurrentHero()); window.ui?.showNotification('✨ Благословение получено!');">
                    <div style="font-size: 3rem;">✨</div>
                    <h3>Благословение</h3>
                    <p>+15 к защите на 45с</p>
                </div>
            </div>
            <div style="margin-top: 20px; text-align: center;">
                <button id="closeBuffsBtn" style="width: auto; padding: 10px 30px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer;">Закрыть</button>
            </div>
        `;
        modal.style.display = 'block';
        
        document.getElementById('closeBuffsBtn').addEventListener('click', () => {
            modal.style.display = 'none';
        });
    };
    
    lobbyElement.appendChild(testBuffsBtn);
}

// Функция для добавления информации о новых системах
function addNewSystemsInfo() {
    const lobbyElement = document.querySelector('#screenLobby');
    if (!lobbyElement) return;
    
    // Проверяем, не добавлена ли уже информация
    if (document.getElementById('newSystemsInfo')) return;
    
    const infoDiv = document.createElement('div');
    infoDiv.id = 'newSystemsInfo';
    infoDiv.style.cssText = `
        background: linear-gradient(135deg, #16213e, #1a1a2e);
        border-radius: 10px;
        padding: 15px;
        margin-top: 20px;
        border-left: 4px solid #4aff4a;
        border-right: 4px solid #e94560;
    `;
    infoDiv.innerHTML = `
        <h3 style="color: #4aff4a; margin-bottom: 10px; text-align: center;">✨ Новые системы ✨</h3>
        <div style="display: flex; gap: 20px; flex-wrap: wrap; justify-content: center;">
            <div style="text-align: center;">
                <div style="font-size: 2rem;">🏆</div>
                <div style="font-size: 0.9rem; color: #ffd700;">Достижения</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 2rem;">💪</div>
                <div style="font-size: 0.9rem; color: #4aff4a;">Баффы</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 2rem;">⚡</div>
                <div style="font-size: 0.9rem; color: #4caaff;">Динамическая сложность</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 2rem;">🌨️</div>
                <div style="font-size: 0.9rem; color: #aa4aff;">Зимние навыки</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 2rem;">📊</div>
                <div style="font-size: 0.9rem; color: #e94560;">BuffUIManager</div>
            </div>
        </div>
        <p style="color: #888; font-size: 0.8rem; text-align: center; margin-top: 10px;">
            Баффы отображаются в верхней панели арены. Нажмите "Тест баффов" для проверки!
        </p>
    `;
    
    lobbyElement.appendChild(infoDiv);
}

// ОБРАБОТЧИКИ КНОПОК ЛОКАЦИЙ
document.querySelectorAll('.start-match-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Получаем данные о локации из атрибутов data-
        const location = e.target.closest('.location-card').dataset.location;
        const costType = e.target.dataset.costType;
        
        // Получаем текущего выбранного героя
        const hero = window.GameState.getCurrentHero();
        
        // Проверки
        if (!hero) {
            showNotification('❌ Сначала выберите героя!', 2000);
            return;
        }
        
        if (window.GameState.resources[costType] < 1) {
            showNotification(`❌ Не хватает ${costType}!`, 2000);
            return;
        }
        
        // Тратим ресурс
        window.GameState.updateResource(costType, -1);
        
        // Запускаем экспедицию
        const started = window.arenaController.startExpedition(location, hero);
        
        // Если не удалось запустить, возвращаем ресурс
        if (!started) {
            window.GameState.updateResource(costType, 1);
        }
    });
});

// Добавляем CSS-анимацию для уведомлений и баффов
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -20px); }
        10% { opacity: 1; transform: translate(-50%, 0); }
        90% { opacity: 1; transform: translate(-50%, 0); }
        100% { opacity: 0; transform: translate(-50%, -20px); }
    }
    
    @keyframes glowPulse {
        0% { box-shadow: 0 0 5px #4aff4a; }
        50% { box-shadow: 0 0 20px #4aff4a; }
        100% { box-shadow: 0 0 5px #4aff4a; }
    }
    
    .buff-card {
        transition: all 0.3s ease;
        cursor: pointer;
    }
    
    .buff-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0,0,0,0.3);
        filter: brightness(1.2);
    }
    
    #achievementsBtn:hover, #testBuffsBtn:hover {
        transform: scale(1.05);
        filter: brightness(1.1);
    }
`;
document.head.appendChild(style);

// Сохранение перед закрытием
window.addEventListener('beforeunload', () => {
    if (window.GameState) {
        window.GameState.save();
        console.log('💾 Игра сохранена');
    }
});

// Для отладки - добавляем глобальный доступ к buffManager
window.debug = {
    addBuff: (buffId) => {
        const hero = window.GameState.getCurrentHero();
        if (hero && window.buffManager) {
            window.buffManager.addBuff(buffId, hero);
            console.log(`✅ Бафф ${buffId} применен к герою ${hero.name}`);
        }
    },
    getBuffs: () => {
        return window.buffManager?.getActiveBuffs() || [];
    }
};