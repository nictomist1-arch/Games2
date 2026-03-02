class UIManager {
    constructor() {
        this.screens = {
            lobby: document.getElementById('screenLobby'),
            heroes: document.getElementById('screenHeroes'),
            shop: document.getElementById('screenShop'),
            craft: document.getElementById('screenCraft')
        };
        
        this.navButtons = document.querySelectorAll('.nav-btn');
        this.resourceElements = {
            proviziya: document.querySelector('#proviziya span'),
            toplivo: document.querySelector('#toplivo span'),
            instrumenty: document.querySelector('#instrumenty span'),
            gold: document.querySelector('#gold span') // Добавим в HTML позже
        };
        
        this.modal = document.getElementById('heroModal');
        this.modalBody = document.getElementById('modalBody');
        
        this.shopTimer = null;
        
        this.initEventListeners();
        this.subscribeToState();
        this.updateResourcesUI();
        
        setTimeout(() => this.renderHeroes(), 100);
    }
    
    initEventListeners() {
        this.navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const screenId = e.target.dataset.screen;
                this.showScreen(screenId);
                this.setActiveNavButton(e.target);
            });
        });
        
        const closeBtn = document.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.modal.style.display = 'none';
            });
        }
        
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.modal.style.display = 'none';
            }
        });
    }
    
    showScreen(screenId) {
        Object.values(this.screens).forEach(screen => {
            if (screen) {
                screen.classList.remove('active');
            }
        });
        
        if (this.screens[screenId]) {
            this.screens[screenId].classList.add('active');
            
            // Обновляем контент при переключении на соответствующие экраны
            if (screenId === 'heroes') {
                this.renderHeroes();
            } else if (screenId === 'shop') {
                this.renderShop();
            } else if (screenId === 'craft') { // НОВОЕ
                this.renderCraft();
            }
        }
    }
    
    setActiveNavButton(activeBtn) {
        this.navButtons.forEach(btn => btn.classList.remove('active'));
        activeBtn.classList.add('active');
    }
    
    subscribeToState() {
        window.GameState.subscribe((state) => {
            this.updateResourcesUI();
            
            // Проверяем, активен ли экран героев перед обновлением
            if (this.screens.heroes && this.screens.heroes.classList.contains('active')) {
                this.renderHeroes();
            }
            
            // Проверяем, активен ли экран магазина
            if (this.screens.shop && this.screens.shop.classList.contains('active')) {
                this.renderShop();
            }
            
            // Проверяем, активен ли экран крафта
            if (this.screens.craft && this.screens.craft.classList.contains('active')) {
                this.renderCraft();
            }
        });
    }
    
    updateResourcesUI() {
        if (this.resourceElements.proviziya) {
            this.resourceElements.proviziya.textContent = Math.floor(window.GameState.resources.proviziya || 0);
        }
        if (this.resourceElements.toplivo) {
            this.resourceElements.toplivo.textContent = Math.floor(window.GameState.resources.toplivo || 0);
        }
        if (this.resourceElements.instrumenty) {
            this.resourceElements.instrumenty.textContent = Math.floor(window.GameState.resources.instrumenty || 0);
        }
        if (this.resourceElements.gold) {
            this.resourceElements.gold.textContent = Math.floor(window.GameState.resources.gold || 0);
        }
    }
    
    renderHeroes() {
        const container = document.getElementById('heroesList');
        if (!container) return;
        
        container.innerHTML = '';
        
        const heroes = window.GameState.heroes || [];
        if (heroes.length === 0) {
            container.innerHTML = '<div class="empty-state">Нет доступных героев</div>';
            return;
        }
        
        heroes.forEach(hero => {
            if (!hero) return;
            
            try {
                const heroCard = document.createElement('div');
                heroCard.className = 'hero-card';
                
                if (hero.id === window.GameState.currentHeroId) {
                    heroCard.classList.add('selected');
                }
                
                const currentStats = hero.currentStats || hero.baseStats || { hp: 100, attack: 10, defense: 5 };
                const expPercent = hero.expToNextLevel ? (hero.exp / hero.expToNextLevel) * 100 : 0;
                
                heroCard.innerHTML = `
                    <div class="hero-type">${this.getHeroTypeIcon(hero.type)} ${this.getHeroTypeName(hero.type)}</div>
                    <h3>${hero.name || 'Без имени'} <span class="hero-level">Ур. ${hero.level || 1}</span></h3>
                    <div class="hero-stats">
                        <div class="stat-item">❤️ ${currentStats.hp || 0}</div>
                        <div class="stat-item">⚔️ ${currentStats.attack || 0}</div>
                        <div class="stat-item">🛡️ ${currentStats.defense || 0}</div>
                        ${currentStats.speed ? `<div class="stat-item">⚡ ${currentStats.speed}</div>` : ''}
                    </div>
                    <div class="hero-exp">
                        <div class="exp-bar">
                            <div class="exp-fill" style="width: ${expPercent}%"></div>
                        </div>
                        <div class="exp-text">${hero.exp || 0}/${hero.expToNextLevel || 100} опыта</div>
                    </div>
                    <div class="hero-skills">
                        <div class="skill-points">🎯 Очки навыков: ${hero.skillPoints || 0}</div>
                    </div>
                    <div class="hero-actions">
                        <button class="select-hero-btn" data-hero-id="${hero.id}">Выбрать для боя</button>
                        <button class="inventory-hero-btn" data-hero-id="${hero.id}">Инвентарь</button>
                    </div>
                `;
                
                container.appendChild(heroCard);
            } catch (e) {
                console.error('Ошибка при создании карточки героя:', e);
            }
        });
        
        this.attachHeroButtonListeners();
    }
    
    renderShop() {
        const container = document.getElementById('shopItems');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Проверяем, выбран ли герой
        const currentHero = window.GameState.getCurrentHero();
        if (!currentHero) {
            container.innerHTML = '<div class="empty-state">Сначала выберите героя</div>';
            return;
        }
        
        // Проверяем, инициализирован ли магазин
        if (!window.GameState.shop) {
            container.innerHTML = '<div class="empty-state">Магазин временно закрыт</div>';
            return;
        }
        
        const items = window.GameState.shop.dailyItems;
        if (items.length === 0) {
            container.innerHTML = '<div class="empty-state">В магазине пусто</div>';
            return;
        }
        
        items.forEach(item => {
            if (!item) return;
            
            const itemCard = document.createElement('div');
            itemCard.className = 'shop-item';
            
            // Цветовая дифференциация редкости
            let rarityColor = '#ffffff';
            if (item.rarity === 'rare') rarityColor = '#4caaff';
            if (item.rarity === 'epic') rarityColor = '#aa4cff';
            if (item.rarity === 'legendary') rarityColor = '#ffaa4c';
            
            const price = item.getPrice();
            const hasDiscount = item.discount !== undefined;
            
            itemCard.innerHTML = `
                <div class="item-icon">${item.icon}</div>
                <h3 style="color: ${rarityColor};">${item.name}</h3>
                <p class="item-type">${item.type}</p>
                <p class="item-description">${item.description}</p>
                <div class="item-price">
                    ${hasDiscount ? 
                        `<span class="old-price">💰 ${item.originalPrice}</span>` : 
                        ''
                    }
                    <span class="current-price" style="color: ${hasDiscount ? '#ff6b6b' : 'inherit'}">
                        💰 ${price}
                    </span>
                    ${hasDiscount ? 
                        `<span class="discount-badge">-${item.discount}%</span>` : 
                        ''
                    }
                </div>
                <p class="item-rarity" style="color: ${rarityColor};">${item.rarity}</p>
                <button class="buy-item-btn" data-item-id="${item.id}">Купить</button>
            `;
            
            container.appendChild(itemCard);
        });
        
        // Добавляем таймер обновления
        this.addShopTimer(container);
        
        // Добавляем обработчики покупки
        this.attachShopButtonListeners();
    }
    
    addShopTimer(container) {
        const timeLeft = window.GameState.shop.getTimeUntilRefresh();
        
        const timerHTML = `
            <div class="shop-info">
                <p>🔄 Ассортимент обновится через: <span id="shopTimer">${timeLeft}</span>с</p>
                <p>💰 Ваш баланс: ${Math.floor(window.GameState.resources.proviziya)} провизии</p>
            </div>
        `;
        
        container.innerHTML += timerHTML;
        
        // Очищаем предыдущий таймер
        if (this.shopTimer) {
            clearInterval(this.shopTimer);
        }
        
        // Запускаем обновление таймера каждую секунду
        this.shopTimer = setInterval(() => {
            const timerElement = document.getElementById('shopTimer');
            if (timerElement) {
                const newTimeLeft = window.GameState.shop.getTimeUntilRefresh();
                timerElement.textContent = newTimeLeft;
                
                if (newTimeLeft <= 0) {
                    this.renderShop(); // Перерисовываем при обновлении
                }
            }
        }, 1000);
    }
    
    attachShopButtonListeners() {
        document.querySelectorAll('.buy-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const itemId = e.target.dataset.itemId;
                const currentHero = window.GameState.getCurrentHero();
                
                if (!currentHero) {
                    alert('Сначала выберите героя!');
                    return;
                }
                
                const result = window.GameState.shop.buyItem(itemId, currentHero.id);
                
                if (result.success) {
                    alert(result.message);
                    this.renderShop(); // Обновляем отображение магазина
                } else {
                    alert(result.message);
                }
            });
        });
    }
    
    /**
     * Отрисовывает экран крафта
     */
    renderCraft() {
        const container = document.getElementById('craftRecipes');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (!window.GameState.recipeManager) {
            container.innerHTML = '<div class="empty-state">Система крафта не инициализирована</div>';
            return;
        }
        
        const currentHero = window.GameState.getCurrentHero();
        if (!currentHero) {
            container.innerHTML = '<div class="empty-state">Сначала выберите героя</div>';
            return;
        }
        
        // Отображаем доступные материалы
        const materials = window.GameState.getMaterials();
        const materialsDiv = document.createElement('div');
        materialsDiv.className = 'materials-display';
        materialsDiv.innerHTML = `
            <div class="material-item"> 🌲 <span id="materialWood">${materials.wood}</span> древесины</div>
            <div class="material-item"> ⛓️ <span id="materialIron">${materials.iron}</span> железа</div>
            <div class="material-item"> 🌯 <span id="materialCloth">${materials.cloth}</span> ткани</div>
        `;
        container.appendChild(materialsDiv);
        
        // Заголовок с открытыми рецептами
        const title = document.createElement('h3');
        title.textContent = 'Доступные рецепты:';
        title.style.marginBottom = '15px';
        container.appendChild(title);
        
        // Отображаем открытые рецепты
        const unlockedRecipes = window.GameState.recipeManager.getUnlockedRecipes();
        
        if (unlockedRecipes.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'empty-state';
            emptyDiv.innerHTML = '<p>Нет доступных рецептов. Сражайтесь, чтобы открыть новые!</p>';
            container.appendChild(emptyDiv);
            return;
        }
        
        const recipesGrid = document.createElement('div');
        recipesGrid.className = 'craft-grid';
        
        unlockedRecipes.forEach(recipe => {
            // Преобразуем материалы для проверки
            const materialsForCheck = {
                'material_wood': window.GameState.materials.wood || 0,
                'material_iron': window.GameState.materials.metal || 0,
                'material_cloth': window.GameState.materials.cloth || 0
            };
            
            // Проверяем, можно ли скрафтить
            const canCraft = recipe.canCraft(currentHero, materialsForCheck);
            
            const recipeCard = document.createElement('div');
            recipeCard.className = 'craft-item';
            
            // Собираем строку с материалами
            const materialsList = recipe.materials.map(m => {
                const icons = {
                    'material_wood': '🌲',
                    'material_iron': '⛓️',
                    'material_cloth': '🌯'
                };
                return `${icons[m.itemId] || '📦'} ${m.quantity}`;
            }).join(' + ');
            
            // Определяем цвет редкости
            let rarityColor = '#ffffff';
            if (recipe.resultItem.rarity === 'rare') rarityColor = '#4caaff';
            if (recipe.resultItem.rarity === 'epic') rarityColor = '#aa4cff';
            if (recipe.resultItem.rarity === 'legendary') rarityColor = '#ffaa4c';
            
            recipeCard.innerHTML = `
                <div class="item-icon" style="font-size: 3rem;">${recipe.resultItem.icon}</div>
                <h4 style="color: ${rarityColor};">${recipe.name}</h4>
                <p class="item-description">${recipe.resultItem.description}</p>
                <div class="craft-materials" style="margin: 10px 0;">
                    <strong>Требуется:</strong> ${materialsList}
                </div>
                <div class="craft-requirements" style="font-size: 0.9rem; color: #a0a0a0; margin-bottom: 10px;">
                    Уровень: ${recipe.requiredLevel}
                </div>
                <button class="craft-item-btn" data-recipe-id="${recipe.id}" 
                    style="${!canCraft.success ? 'background: #666; cursor: not-allowed;' : ''}"
                    ${!canCraft.success ? 'disabled' : ''}>
                    ${canCraft.success ? '🔨 Скрафтить' : canCraft.message}
                </button>
            `;
            
            recipesGrid.appendChild(recipeCard);
        });
        
        container.appendChild(recipesGrid);
        
        // Добавляем обработчики крафта
        document.querySelectorAll('.craft-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (btn.disabled) return;
                
                const recipeId = e.target.dataset.recipeId;
                const currentHero = window.GameState.getCurrentHero();
                
                if (!currentHero) {
                    alert('Сначала выберите героя!');
                    return;
                }
                
                const result = window.GameState.craftItem(recipeId, currentHero.id);
                
                if (result.success) {
                    alert(result.message);
                    this.renderCraft(); // Обновляем экран крафта
                    
                    // Если открылся новый рецепт, показываем уведомление
                    if (result.newRecipe) {
                        setTimeout(() => {
                            alert(`🔓 Открыт новый рецепт: ${result.newRecipe.name}!`);
                        }, 100);
                    }
                } else {
                    alert(result.message);
                }
            });
        });
    }
    
    getHeroTypeIcon(type) {
        const icons = {
            'warrior': '⚔️',
            'archer': '🏹',
            'mage': '🔮',
            'rogue': '🗡️'
        };
        return icons[type] || '👤';
    }
    
    getHeroTypeName(type) {
        const names = {
            'warrior': 'Воин',
            'archer': 'Лучник',
            'mage': 'Маг',
            'rogue': 'Разбойник'
        };
        return names[type] || type;
    }
    
    attachHeroButtonListeners() {
        document.querySelectorAll('.select-hero-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const heroId = btn.dataset.heroId;
                window.GameState.selectHero(heroId);
            });
        });
        
        document.querySelectorAll('.inventory-hero-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const heroId = btn.dataset.heroId;
                this.showHeroInventory(heroId);
            });
        });
    }
    
    showHeroInventory(heroId) {
        const hero = window.GameState.heroes.find(h => h && h.id === heroId);
        if (!hero) {
            alert('Герой не найден');
            return;
        }
        
        try {
            // Подсчитываем свободные слоты
            const freeSlots = hero.inventory.filter(slot => slot === null).length;
            const totalSlots = hero.inventory.length;
            
            // Создаем сетку инвентаря 3x3
            const inventoryGrid = [];
            for (let i = 0; i < 3; i++) {
                let row = '<div class="inventory-row">';
                for (let j = 0; j < 3; j++) {
                    const index = i * 3 + j;
                    const item = hero.inventory && hero.inventory[index] ? hero.inventory[index] : null;
                    
                    if (item) {
                        let rarityColor = '#ffffff';
                        if (item.rarity === 'rare') rarityColor = '#4caaff';
                        if (item.rarity === 'epic') rarityColor = '#aa4cff';
                        if (item.rarity === 'legendary') rarityColor = '#ffaa4c';
                        
                        row += `
                            <div class="inventory-slot filled" data-slot="${index}" data-item-id="${item.id}" style="border-color: ${rarityColor}; position: relative;">
                                <div class="item-icon">${item.icon || '📦'}</div>
                                <div class="item-name">${item.name || 'Предмет'}</div>
                                <div class="item-type">${item.type || 'unknown'}</div>
                                ${item.type === 'consumable' ? 
                                    '<button class="use-item-btn" data-hero-id="' + heroId + '" data-slot="' + index + '">Использовать</button>' : 
                                    (item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory' ? 
                                    '<button class="equip-item-btn" data-hero-id="' + heroId + '" data-slot="' + index + '">Экипировать</button>' : '')}
                            </div>
                        `;
                    } else {
                        row += `<div class="inventory-slot empty" data-slot="${index}">Пусто</div>`;
                    }
                }
                row += '</div>';
                inventoryGrid.push(row);
            }
            
            const equipment = hero.equipment || { weapon: null, armor: null, accessory: null };
            
            this.modalBody.innerHTML = `
                <h2>Инвентарь ${hero.name || 'Героя'}</h2>
                <div class="inventory-info" style="margin-bottom: 10px; text-align: center; color: #ffd700;">
                    Свободно: ${freeSlots}/${totalSlots} слотов
                </div>
                <div class="inventory-container">
                    ${inventoryGrid.join('')}
                </div>
                <h3>Экипировка</h3>
                <div class="equipment-container">
                    <div class="equipment-slot ${equipment.weapon ? 'filled' : 'empty'}">
                        <div class="slot-label">⚔️ Оружие</div>
                        <div class="slot-content">
                            ${equipment.weapon ? 
                                `<span class="item-name">${equipment.weapon.name || 'Оружие'}</span>
                                 <button class="unequip-btn" data-slot="weapon">Снять</button>` : 
                                'Пусто'}
                        </div>
                    </div>
                    <div class="equipment-slot ${equipment.armor ? 'filled' : 'empty'}">
                        <div class="slot-label">🛡️ Броня</div>
                        <div class="slot-content">
                            ${equipment.armor ? 
                                `<span class="item-name">${equipment.armor.name || 'Броня'}</span>
                                 <button class="unequip-btn" data-slot="armor">Снять</button>` : 
                                'Пусто'}
                        </div>
                    </div>
                    <div class="equipment-slot ${equipment.accessory ? 'filled' : 'empty'}">
                        <div class="slot-label">📿 Аксессуар</div>
                        <div class="slot-content">
                            ${equipment.accessory ? 
                                `<span class="item-name">${equipment.accessory.name || 'Аксессуар'}</span>
                                 <button class="unequip-btn" data-slot="accessory">Снять</button>` : 
                                'Пусто'}
                        </div>
                    </div>
                </div>
                <div class="hero-actions">
                    <button class="close-inventory-btn">Закрыть</button>
                </div>
            `;
            
            // Добавляем обработчики для предметов
            this.modalBody.querySelectorAll('.inventory-slot.filled').forEach(slot => {
                slot.addEventListener('click', (e) => {
                    if (e.target.classList.contains('use-item-btn') || e.target.classList.contains('equip-item-btn')) return;
                    
                    const slotIndex = parseInt(slot.dataset.slot);
                    const item = hero.inventory[slotIndex];
                    
                    if (item) {
                        this.showItemDetails(item, hero, slotIndex);
                    }
                });
            });
            
            // Обработчики для использования расходников
            this.modalBody.querySelectorAll('.use-item-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const slot = e.target.closest('.inventory-slot');
                    const slotIndex = parseInt(slot.dataset.slot);
                    const item = hero.inventory[slotIndex];
                    
                    if (item && item.type === 'consumable') {
                        this.useConsumable(hero, item, slotIndex);
                    }
                });
            });
            
            // Обработчики для экипировки
            this.modalBody.querySelectorAll('.equip-item-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const slot = e.target.closest('.inventory-slot');
                    const slotIndex = parseInt(slot.dataset.slot);
                    const item = hero.inventory[slotIndex];
                    
                    if (item) {
                        let equipSlot = 'weapon';
                        if (item.type === 'armor') equipSlot = 'armor';
                        if (item.type === 'accessory') equipSlot = 'accessory';
                        
                        if (hero.equip(item, equipSlot)) {
                            hero.inventory[slotIndex] = null;
                            alert(`Экипировано: ${item.name}`);
                            this.modal.style.display = 'none';
                            this.showHeroInventory(heroId);
                        } else {
                            alert('Не удалось экипировать предмет');
                        }
                    }
                });
            });
            
            // Обработчики для снятия экипировки
            this.modalBody.querySelectorAll('.unequip-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const slot = btn.dataset.slot;
                    if (hero.unequip) {
                        hero.unequip(slot);
                    }
                    this.modal.style.display = 'none';
                    this.showHeroInventory(heroId);
                });
            });
            
            // Закрытие
            const closeBtn = this.modalBody.querySelector('.close-inventory-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.modal.style.display = 'none';
                });
            }
            
            this.modal.style.display = 'block';
        } catch (e) {
            console.error('Ошибка при показе инвентаря:', e);
            alert('Ошибка при открытии инвентаря');
        }
    }
    
    showItemDetails(item, hero, slotIndex) {
        let rarityColor = '#ffffff';
        if (item.rarity === 'rare') rarityColor = '#4caaff';
        if (item.rarity === 'epic') rarityColor = '#aa4cff';
        if (item.rarity === 'legendary') rarityColor = '#ffaa4c';
        
        let actionButtons = '';
        
        if (item.type === 'consumable') {
            actionButtons = '<button class="use-item-detail-btn">Использовать</button>';
        } else if (item.type === 'weapon') {
            actionButtons = '<button class="equip-item-btn" data-slot="weapon">Экипировать как оружие</button>';
        } else if (item.type === 'armor') {
            actionButtons = '<button class="equip-item-btn" data-slot="armor">Экипировать как броню</button>';
        } else if (item.type === 'accessory') {
            actionButtons = '<button class="equip-item-btn" data-slot="accessory">Экипировать как аксессуар</button>';
        }
        
        const detailsHtml = `
            <h2 style="color: ${rarityColor};">${item.name}</h2>
            <div style="font-size: 4rem; text-align: center;">${item.icon}</div>
            <p><strong>Тип:</strong> ${item.type}</p>
            <p><strong>Редкость:</strong> <span style="color: ${rarityColor};">${item.rarity}</span></p>
            <p><strong>Описание:</strong> ${item.description}</p>
            ${item.damage ? `<p><strong>Урон:</strong> ${item.damage}</p>` : ''}
            ${item.defense ? `<p><strong>Защита:</strong> ${item.defense}</p>` : ''}
            ${item.bonusHp ? `<p><strong>Бонус HP:</strong> +${item.bonusHp}</p>` : ''}
            ${item.effect ? `<p><strong>Эффект:</strong> ${item.effect} (${item.value})</p>` : ''}
            <div class="item-actions">
                ${actionButtons}
                <button class="close-detail-btn">Закрыть</button>
            </div>
        `;
        
        this.modalBody.innerHTML = detailsHtml;
        
        // Обработчики
        const useBtn = this.modalBody.querySelector('.use-item-detail-btn');
        if (useBtn) {
            useBtn.addEventListener('click', () => {
                this.useConsumable(hero, item, slotIndex);
            });
        }
        
        const equipBtn = this.modalBody.querySelector('.equip-item-btn');
        if (equipBtn) {
            equipBtn.addEventListener('click', () => {
                const slot = equipBtn.dataset.slot;
                hero.equip(item, slot);
                this.modal.style.display = 'none';
                this.showHeroInventory(hero.id);
            });
        }
        
        const closeBtn = this.modalBody.querySelector('.close-detail-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.modal.style.display = 'none';
            });
        }
    }
    
    useConsumable(hero, item, slotIndex) {
        if (confirm(`Использовать ${item.name}?`)) {
            if (hero.useConsumable(slotIndex)) {
                alert(`Использован ${item.name}!`);
                this.modal.style.display = 'none';
                this.showHeroInventory(hero.id);
            } else {
                alert('Не удалось использовать предмет');
            }
        }
    }
    
    showModal(content) {
        this.modalBody.innerHTML = content;
        this.modal.style.display = 'block';
    }
}

window.UIManager = UIManager;