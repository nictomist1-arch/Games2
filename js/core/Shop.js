class Shop {
    constructor() {
        this.items = []; // Все доступные предметы
        this.dailyItems = []; // Предметы в продаже сегодня
        this.lastUpdate = Date.now();
        this.refreshInterval = 30 * 1000; // 30 секунд для теста
        this.initializeShop();
    }
    
    initializeShop() {
        // Создаем каталог предметов
        this.items = [
            // Оружие
            new Weapon('weapon_sword_wood', 'Деревянный меч', 'common', 10, { damage: 5, range: 1 }, '⚔️'),
            new Weapon('weapon_sword_iron', 'Железный меч', 'rare', 30, { damage: 12, range: 1, attackSpeed: 1.2 }, '⚔️'),
            new Weapon('weapon_bow_short', 'Короткий лук', 'common', 15, { damage: 7, range: 3, attackSpeed: 0.8 }, '🏹'),
            new Weapon('weapon_bow_long', 'Длинный лук', 'rare', 40, { damage: 15, range: 5, attackSpeed: 0.7 }, '🏹'),
            new Weapon('weapon_staff', 'Посох мага', 'epic', 60, { damage: 20, range: 4 }, '🔮'),
            
            // Броня
            new Armor('armor_leather', 'Кожаная броня', 'common', 15, { defense: 5, bonusHp: 10 }, '🛡️'),
            new Armor('armor_chain', 'Кольчуга', 'rare', 35, { defense: 12, bonusHp: 25 }, '🛡️'),
            new Armor('armor_plate', 'Латы', 'epic', 60, { defense: 20, bonusHp: 40 }, '🛡️'),
            new Armor('armor_robe', 'Магическая мантия', 'rare', 30, { defense: 8, bonusHp: 30 }, '👘'),
            
            // Расходники
            new Consumable('consumable_hp_small', 'Малое зелье здоровья', 'common', 5, 'heal', 30, '💗'),
            new Consumable('consumable_hp_medium', 'Среднее зелье здоровья', 'rare', 15, 'heal', 75, '💗'),
            new Consumable('consumable_hp_large', 'Большое зелье здоровья', 'epic', 30, 'heal', 150, '💗'),
            new Consumable('consumable_exp', 'Том опыта', 'rare', 50, 'exp', 25, '📚'),
            new Consumable('consumable_resource', 'Мешок провизии', 'common', 10, 'resource', 20, '🎒'),
            
            // Материалы
            new Material('material_wood', 'Древесина', 'common', 2, '🪵'),
            new Material('material_metal', 'Металл', 'common', 3, '⚙️'),
            new Material('material_cloth', 'Ткань', 'common', 2, '🧵'),
            new Material('material_leather', 'Кожа', 'rare', 5, '🧶'),
            new Material('material_essence', 'Магическая эссенция', 'epic', 15, '✨')
        ];
        
        this.refreshDailyItems();
    }
    
    refreshDailyItems() {
        // Перемешиваем и берем 6 случайных предметов
        const shuffled = [...this.items].sort(() => 0.5 - Math.random());
        this.dailyItems = shuffled.slice(0, 6);
        this.lastUpdate = Date.now();
        
        // Добавляем случайные скидки некоторым предметам
        this.dailyItems = this.dailyItems.map(item => {
            // 30% шанс на скидку
            if (Math.random() < 0.3) {
                const discount = Math.floor(Math.random() * 30) + 20; // 20-50% скидка
                return {
                    ...item,
                    discount: discount,
                    originalPrice: item.getPrice(),
                    getPrice: function() {
                        return Math.floor(this.originalPrice * (100 - this.discount) / 100);
                    }
                };
            }
            return item;
        });
        
        return this.dailyItems;
    }
    
    checkAndRefresh() {
        if (Date.now() - this.lastUpdate > this.refreshInterval) {
            this.refreshDailyItems();
            return true;
        }
        return false;
    }
    
    buyItem(itemId, heroId) {
        const itemIndex = this.dailyItems.findIndex(i => i.id === itemId);
        if (itemIndex === -1) {
            return { success: false, message: 'Предмет не найден в магазине' };
        }
        
        const item = this.dailyItems[itemIndex];
        const price = item.getPrice();
        const hero = window.GameState.heroes.find(h => h.id === heroId);
        
        if (!hero) {
            return { success: false, message: 'Герой не найден' };
        }
        
        // Проверка ресурсов (используем провизию как валюту)
        if (window.GameState.resources.proviziya < price) {
            return { 
                success: false, 
                message: `Недостаточно провизии! Нужно ${price}, есть ${Math.floor(window.GameState.resources.proviziya)}` 
            };
        }
        
        // Создаем копию предмета для инвентаря
        const itemCopy = this.createItemCopy(item);
        
        // Проверка инвентаря
        const added = hero.addToInventory(itemCopy);
        
        if (!added) {
            return { success: false, message: 'Инвентарь героя полон' };
        }
        
        // Списываем ресурсы
        window.GameState.updateResource('proviziya', -price);
        
        // Убираем предмет из магазина (один экземпляр)
        this.dailyItems.splice(itemIndex, 1);
        
        return { 
            success: true, 
            message: `Куплен ${item.name} за ${price} провизии`,
            item: itemCopy
        };
    }
    
    createItemCopy(item) {
        // Создаем копию в зависимости от типа
        switch (item.type) {
            case 'weapon':
                return new Weapon(
                    item.id + '_' + Date.now(),
                    item.name,
                    item.rarity,
                    item.basePrice,
                    { damage: item.damage, range: item.range, attackSpeed: item.attackSpeed },
                    item.icon
                );
            case 'armor':
                return new Armor(
                    item.id + '_' + Date.now(),
                    item.name,
                    item.rarity,
                    item.basePrice,
                    { defense: item.defense, bonusHp: item.bonusHp },
                    item.icon
                );
            case 'consumable':
                return new Consumable(
                    item.id + '_' + Date.now(),
                    item.name,
                    item.rarity,
                    item.basePrice,
                    item.effect,
                    item.value,
                    item.icon
                );
            case 'material':
                return new Material(
                    item.id + '_' + Date.now(),
                    item.name,
                    item.rarity,
                    item.basePrice,
                    item.icon
                );
            default:
                return { ...item };
        }
    }
    
    getTimeUntilRefresh() {
        const elapsed = Date.now() - this.lastUpdate;
        return Math.max(0, Math.ceil((this.refreshInterval - elapsed) / 1000));
    }
}

window.Shop = Shop;