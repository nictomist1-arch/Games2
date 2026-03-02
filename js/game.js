// Функция для создания тестовых героев
function createTestHeroes() {
    return [
        new Hero('hero1', 'Торгар', { hp: 120, attack: 18, defense: 12 }, 'warrior'),
        new Hero('hero2', 'Эльвира', { hp: 80, attack: 22, defense: 6, speed: 15 }, 'archer'),
        new Hero('hero3', 'Мерлин', { hp: 70, attack: 25, defense: 4 }, 'mage'),
        new Hero('hero4', 'Шэдоу', { hp: 85, attack: 20, defense: 5, speed: 18 }, 'rogue')
    ];
}

// Инициализация игры
document.addEventListener('DOMContentLoaded', () => {
    console.log('Инициализация игры...');
    
    // Проверяем, есть ли сохраненные герои
    if (!window.GameState.heroes || window.GameState.heroes.length === 0) {
        console.log('Создаем тестовых героев');
        window.GameState.heroes = createTestHeroes();
        
        // Добавляем тестовые предметы героям
        const testItems = [
            new Consumable('consumable_hp_small', 'Малое зелье здоровья', 'common', 5, 'heal', 30, '💗'),
            new Weapon('weapon_sword_wood', 'Деревянный меч', 'common', 10, { damage: 5, range: 1 }, '⚔️'),
            new Consumable('consumable_exp', 'Том опыта', 'rare', 50, 'exp', 25, '📚')
        ];
        
        if (window.GameState.heroes[0]) {
            window.GameState.heroes[0].addToInventory(testItems[0]);
            window.GameState.heroes[0].addToInventory(testItems[1]);
        }
        
        if (window.GameState.heroes[1]) {
            window.GameState.heroes[1].addToInventory(testItems[2]);
        }
        
        // Выбираем первого героя по умолчанию
        window.GameState.selectHero('hero1');
    }
    
    // Инициализируем магазин
    window.GameState.initShop();
    
    // Инициализируем систему крафта
    window.GameState.initRecipes();
    
    // Инициализация UI
    window.uiManager = new UIManager();
    
    // Устанавливаем активный экран по умолчанию
    const lobbyScreen = document.getElementById('screenLobby');
    if (lobbyScreen) {
        lobbyScreen.classList.add('active');
    }
    
    // Загрузка сохранения
    window.GameState.load();
    
    // Обновляем обработчики кнопок локаций
    document.querySelectorAll('.start-match-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const costType = e.target.dataset.costType;
            const locationCard = e.target.closest('.location-card');
            const location = locationCard ? locationCard.dataset.location : 'unknown';
            
            const currentHero = window.GameState.getCurrentHero();
            if (!currentHero) {
                alert('Сначала выберите героя!');
                return;
            }
            
            if (window.GameState.resources[costType] >= 1) {
                window.GameState.updateResource(costType, -1);
                
                // Добавляем опыт герою за матч
                if (currentHero.addExp) {
                    currentHero.addExp(10);
                }
                
                // Добавляем награды за бой (материалы и возможные рецепты)
                const rewards = window.GameState.addBattleRewards();
                
                let message = `Матч завершен в локации ${location}!\n`;
                message += `Герой ${currentHero.name} получил 10 опыта.\n`;
                
                const materialsGained = rewards.materials.filter(m => m.amount > 0);
                if (materialsGained.length > 0) {
                    message += `Получены материалы: ${materialsGained.map(m => {
                        const names = { wood: 'древесина', metal: 'железо', cloth: 'ткань' };
                        return `${names[m.type]}: ${m.amount}`;
                    }).join(', ')}\n`;
                }
                
                if (rewards.newRecipe) {
                    message += `🔓 Открыт новый рецепт: ${rewards.newRecipe.name}!`;
                }
                
                alert(message);
            } else {
                alert(`Недостаточно ${costType}!`);
            }
        });
    });
    
    // Добавляем информацию о пассивной генерации
    const lobbyElement = document.querySelector('#screenLobby');
    if (lobbyElement) {
        const passiveInfo = document.createElement('div');
        passiveInfo.className = 'passive-info';
        passiveInfo.innerHTML = `
            <p>⏱️ Ресурсы накапливаются автоматически (1/сек)</p>
            <p>🏪 Магазин обновляется каждые 30 секунд</p>
            <p>🔨 За бой можно получить материалы и новые рецепты (30%)</p>
        `;
        lobbyElement.appendChild(passiveInfo);
    }
    
    console.log('Игра запущена! Магазин и крафт инициализированы.');
});

// Сохранение перед закрытием
window.addEventListener('beforeunload', () => {
    if (window.GameState) {
        window.GameState.save();
    }
});