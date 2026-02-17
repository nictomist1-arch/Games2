// Хранилище состояния игры (глобальная переменная)
const GameState = {
    resources: {
        proviziya: 50, // Увеличим начальные ресурсы для тестов покупок
        toplivo: 5,
        instrumenty: 3,
        gold: 100 // Добавляем золото как универсальную валюту
    },
    materials: {
        wood: 0,
        metal: 0,
        cloth: 0,
        leather: 0,
        essence: 0
    },
    heroes: [],
    currentHeroId: null,
    unlockedLocations: ['forest'],
    unlockedRecipes: [],
    settings: { sound: true, music: true },
    shop: null, // Будет инициализирован позже
    
    _listeners: [],
    lastPassiveUpdate: Date.now(),
    
    subscribe(listener) {
        this._listeners.push(listener);
    },
    
    notify() {
        this._listeners.forEach(listener => {
            try {
                listener(this);
            } catch (e) {
                console.error('Ошибка в слушателе:', e);
            }
        });
    },
    
    updateResource(type, amount) {
        if (this.resources[type] !== undefined) {
            this.resources[type] = Math.max(0, this.resources[type] + amount);
            this.notify();
        }
    },
    
    updateMaterial(type, amount) {
        if (this.materials[type] !== undefined) {
            this.materials[type] = Math.max(0, this.materials[type] + amount);
            this.notify();
        }
    },
    
    initShop() {
        this.shop = new window.Shop();
        this.notify();
    },
    
    // Пассивное обновление ресурсов
    passiveUpdate() {
        const now = Date.now();
        const diffSeconds = Math.floor((now - this.lastPassiveUpdate) / 1000);
        
        if (diffSeconds >= 1) {
            let resourcesGained = { proviziya: 0, toplivo: 0, instrumenty: 0, gold: 0 };
            
            // Каждый открытый герой генерирует ресурсы
            if (this.heroes && this.heroes.length > 0) {
                this.heroes.forEach(hero => {
                    if (hero && hero.isUnlocked) {
                        const generation = hero.getPassiveGeneration ? hero.getPassiveGeneration() : { proviziya: 0.1 };
                        Object.entries(generation).forEach(([resource, rate]) => {
                            resourcesGained[resource] = (resourcesGained[resource] || 0) + rate * diffSeconds;
                        });
                    }
                });
            }
            
            // Применяем накопленное
            let changed = false;
            Object.entries(resourcesGained).forEach(([resource, amount]) => {
                if (amount >= 1 && this.resources[resource] !== undefined) {
                    const intPart = Math.floor(amount);
                    this.resources[resource] += intPart;
                    changed = true;
                }
            });
            
            // Проверяем обновление магазина
            if (this.shop) {
                const refreshed = this.shop.checkAndRefresh();
                if (refreshed) {
                    changed = true;
                }
            }
            
            this.lastPassiveUpdate = now;
            if (changed) {
                this.notify();
            }
        }
    },
    
    getCurrentHero() {
        return this.heroes.find(h => h && h.id === this.currentHeroId);
    },
    
    selectHero(heroId) {
        this.currentHeroId = heroId;
        this.notify();
        
        // Обновляем отображение в шапке
        const heroNameSpan = document.getElementById('currentHeroName');
        if (heroNameSpan) {
            const hero = this.getCurrentHero();
            heroNameSpan.textContent = `Герой: ${hero && hero.name ? hero.name : 'Не выбран'}`;
        }
    },
    
    save() {
        try {
            const saveData = {
                resources: { ...this.resources },
                materials: { ...this.materials },
                currentHeroId: this.currentHeroId,
                unlockedLocations: [...this.unlockedLocations],
                unlockedRecipes: [...this.unlockedRecipes],
                settings: { ...this.settings },
                heroes: this.heroes.map(hero => ({
                    id: hero.id,
                    name: hero.name,
                    type: hero.type,
                    level: hero.level,
                    exp: hero.exp,
                    expToNextLevel: hero.expToNextLevel,
                    baseStats: { ...hero.baseStats },
                    currentStats: { ...hero.currentStats },
                    inventory: hero.inventory ? hero.inventory.map(item => item ? { ...item } : null) : [],
                    equipment: {
                        weapon: hero.equipment?.weapon ? { ...hero.equipment.weapon } : null,
                        armor: hero.equipment?.armor ? { ...hero.equipment.armor } : null,
                        accessory: hero.equipment?.accessory ? { ...hero.equipment.accessory } : null
                    },
                    skills: [...(hero.skills || [])],
                    skillPoints: hero.skillPoints || 0,
                    isUnlocked: hero.isUnlocked !== undefined ? hero.isUnlocked : true
                }))
            };
            
            localStorage.setItem('gameState', JSON.stringify(saveData));
            console.log('Игра сохранена');
        } catch (e) {
            console.error('Ошибка сохранения:', e);
        }
    },
    
    load() {
        const saved = localStorage.getItem('gameState');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                
                // Загружаем простые данные
                if (data.resources) Object.assign(this.resources, data.resources);
                if (data.materials) Object.assign(this.materials, data.materials);
                this.currentHeroId = data.currentHeroId || null;
                this.unlockedLocations = data.unlockedLocations || ['forest'];
                this.unlockedRecipes = data.unlockedRecipes || [];
                if (data.settings) Object.assign(this.settings, data.settings);
                
                // Загружаем героев
                if (data.heroes && Array.isArray(data.heroes) && data.heroes.length > 0) {
                    this.heroes = data.heroes.map(heroData => {
                        try {
                            if (!heroData || !heroData.id || !heroData.name || !heroData.type) {
                                return null;
                            }
                            
                            const baseStats = heroData.baseStats || { hp: 100, attack: 10, defense: 5 };
                            
                            const hero = new Hero(
                                heroData.id,
                                heroData.name,
                                baseStats,
                                heroData.type
                            );
                            
                            hero.level = heroData.level || 1;
                            hero.exp = heroData.exp || 0;
                            hero.expToNextLevel = heroData.expToNextLevel || 100;
                            
                            if (heroData.currentStats) {
                                hero.currentStats = { ...heroData.currentStats };
                            } else {
                                hero.currentStats = { ...baseStats };
                            }
                            
                            // Восстанавливаем инвентарь
                            if (heroData.inventory && Array.isArray(heroData.inventory)) {
                                hero.inventory = heroData.inventory.map(itemData => {
                                    if (itemData) {
                                        // Восстанавливаем предметы с правильными классами
                                        return this.restoreItem(itemData);
                                    }
                                    return null;
                                });
                            }
                            
                            hero.equipment = heroData.equipment || { weapon: null, armor: null, accessory: null };
                            hero.skills = heroData.skills || [];
                            hero.skillPoints = heroData.skillPoints || 0;
                            hero.isUnlocked = heroData.isUnlocked !== undefined ? heroData.isUnlocked : true;
                            
                            return hero;
                        } catch (e) {
                            console.error('Ошибка загрузки героя:', e);
                            return null;
                        }
                    }).filter(hero => hero !== null);
                }
                
                console.log('Игра загружена');
            } catch (e) {
                console.error('Ошибка загрузки сохранения:', e);
            }
        }
    },
    
    restoreItem(itemData) {
        if (!itemData) return null;
        
        switch (itemData.type) {
            case 'weapon':
                return new Weapon(
                    itemData.id,
                    itemData.name,
                    itemData.rarity,
                    itemData.basePrice,
                    { damage: itemData.damage, range: itemData.range, attackSpeed: itemData.attackSpeed },
                    itemData.icon
                );
            case 'armor':
                return new Armor(
                    itemData.id,
                    itemData.name,
                    itemData.rarity,
                    itemData.basePrice,
                    { defense: itemData.defense, bonusHp: itemData.bonusHp },
                    itemData.icon
                );
            case 'consumable':
                return new Consumable(
                    itemData.id,
                    itemData.name,
                    itemData.rarity,
                    itemData.basePrice,
                    itemData.effect,
                    itemData.value,
                    itemData.icon
                );
            case 'material':
                return new Material(
                    itemData.id,
                    itemData.name,
                    itemData.rarity,
                    itemData.basePrice,
                    itemData.icon
                );
            default:
                return { ...itemData };
        }
    }
};

// Запускаем цикл пассивного обновления
setInterval(() => {
    if (window.GameState) {
        window.GameState.passiveUpdate();
    }
}, 1000);

// Делаем глобальной
window.GameState = GameState;