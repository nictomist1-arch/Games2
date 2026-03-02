// js/core/BuffSystem.js
// Система временных модификаторов (баффов)

class Buff {
    constructor(id, name, type, value, duration, icon = '✨') {
        this.id = id;
        this.name = name;
        this.type = type; // 'damage', 'speed', 'defense', 'heal', 'special'
        this.value = value;
        this.duration = duration; // в секундах
        this.timeLeft = duration;
        this.icon = icon;
        this.isActive = true;
        this.description = this.getDescription();
    }

    getDescription() {
        switch(this.type) {
            case 'damage':
                return `Увеличивает атаку на ${this.value}`;
            case 'speed':
                return `Увеличивает скорость на ${this.value}`;
            case 'defense':
                return `Увеличивает защиту на ${this.value}`;
            case 'heal':
                return `Восстанавливает ${this.value} HP`;
            case 'special':
                return this.name;
            default:
                return this.name;
        }
    }

    update(deltaTime) {
        this.timeLeft -= deltaTime;
        if (this.timeLeft <= 0) {
            this.isActive = false;
        }
    }

    apply(hero) {
        switch(this.type) {
            case 'damage':
                hero.attack += this.value;
                break;
            case 'speed':
                hero.speed += this.value;
                break;
            case 'defense':
                hero.defense += this.value;
                break;
            case 'heal':
                hero.hp = Math.min(hero.hp + this.value, hero.maxHp);
                break;
        }
        console.log(`✨ Бафф ${this.name} применен: ${this.getDescription()}`);
    }

    remove(hero) {
        switch(this.type) {
            case 'damage':
                hero.attack -= this.value;
                break;
            case 'speed':
                hero.speed -= this.value;
                break;
            case 'defense':
                hero.defense -= this.value;
                break;
        }
        console.log(`⌛ Бафф ${this.name} закончился`);
    }
}

class BuffManager {
    constructor() {
        this.activeBuffs = [];
        this.buffConfigs = this.initBuffConfigs();
        this.maxBuffs = 10; // Максимальное количество одновременных баффов
        console.log('🎯 BuffManager инициализирован');
    }

    initBuffConfigs() {
        return {
            // Зелья
            potion_heal: {
                name: 'Лечение',
                type: 'heal',
                value: 50,
                duration: 0,
                icon: '💊',
                description: 'Мгновенно восстанавливает 50 HP'
            },
            potion_strength: {
                name: 'Сила',
                type: 'damage',
                value: 10,
                duration: 30,
                icon: '💪',
                description: 'Увеличивает атаку на 10 на 30 секунд'
            },
            potion_speed: {
                name: 'Скорость',
                type: 'speed',
                value: 5,
                duration: 20,
                icon: '⚡',
                description: 'Увеличивает скорость на 5 на 20 секунд'
            },
            potion_defense: {
                name: 'Защита',
                type: 'defense',
                value: 8,
                duration: 25,
                icon: '🛡️',
                description: 'Увеличивает защиту на 8 на 25 секунд'
            },
            
            // Еда
            food_berry: {
                name: 'Ягоды',
                type: 'heal',
                value: 15,
                duration: 0,
                icon: '🍓',
                description: 'Восстанавливает 15 HP'
            },
            food_meat: {
                name: 'Мясо',
                type: 'heal',
                value: 30,
                duration: 0,
                icon: '🍖',
                description: 'Восстанавливает 30 HP'
            },
            
            // Специальные
            artifact_power: {
                name: 'Артефакт силы',
                type: 'damage',
                value: 20,
                duration: 60,
                icon: '🔮',
                description: 'Увеличивает атаку на 20 на 60 секунд'
            },
            blessing: {
                name: 'Благословение',
                type: 'defense',
                value: 15,
                duration: 45,
                icon: '✨',
                description: 'Увеличивает защиту на 15 на 45 секунд'
            },
            
            // Новые баффы для разнообразия
            battle_fury: {
                name: 'Боевая ярость',
                type: 'damage',
                value: 15,
                duration: 15,
                icon: '🔥',
                description: 'Увеличивает атаку на 15 на 15 секунд'
            },
            wind_walk: {
                name: 'Поступь ветра',
                type: 'speed',
                value: 8,
                duration: 12,
                icon: '🌪️',
                description: 'Увеличивает скорость на 8 на 12 секунд'
            },
            stone_skin: {
                name: 'Каменная кожа',
                type: 'defense',
                value: 12,
                duration: 18,
                icon: '🪨',
                description: 'Увеличивает защиту на 12 на 18 секунд'
            }
        };
    }

    addBuff(buffId, hero) {
        const config = this.buffConfigs[buffId];
        if (!config) {
            console.warn(`⚠️ Бафф с ID ${buffId} не найден`);
            return false;
        }

        // Проверяем лимит баффов
        if (this.activeBuffs.length >= this.maxBuffs) {
            // Удаляем самый старый бафф
            const oldestBuff = this.activeBuffs.shift();
            oldestBuff.remove(hero);
        }

        const buff = new Buff(
            buffId,
            config.name,
            config.type,
            config.value,
            config.duration,
            config.icon
        );

        // Применяем эффект
        buff.apply(hero);
        
        // Если бафф имеет длительность, добавляем в активные
        if (buff.duration > 0) {
            this.activeBuffs.push(buff);
            console.log(`✅ Бафф добавлен: ${buff.name}, осталось: ${this.activeBuffs.length}/${this.maxBuffs}`);
        }

        return true;
    }

    removeBuff(buffId, hero) {
        const index = this.activeBuffs.findIndex(buff => buff.id === buffId);
        if (index !== -1) {
            const buff = this.activeBuffs[index];
            buff.remove(hero);
            this.activeBuffs.splice(index, 1);
            console.log(`✅ Бафф удален: ${buff.name}`);
            return true;
        }
        return false;
    }

    update(deltaTime, hero) {
        // Обновляем активные баффы
        for (let i = this.activeBuffs.length - 1; i >= 0; i--) {
            const buff = this.activeBuffs[i];
            buff.update(deltaTime);
            
            if (!buff.isActive) {
                buff.remove(hero);
                this.activeBuffs.splice(i, 1);
            }
        }
    }

    // === НОВЫЕ МЕТОДЫ ДЛЯ UI ===

    /**
     * Получает все активные баффы с полной информацией для UI
     * @returns {Array} массив объектов с данными баффов
     */
    getActiveBuffs() {
        return this.activeBuffs.map(buff => ({
            id: buff.id,
            name: buff.name,
            type: buff.type,
            value: buff.value,
            timeLeft: Math.ceil(buff.timeLeft), // Округляем до целого для отображения
            icon: buff.icon,
            description: this.getBuffDescription(buff),
            progress: (buff.timeLeft / buff.duration) * 100 // Процент оставшегося времени
        }));
    }

    /**
     * Получает описание баффа для тултипа
     * @param {Buff} buff - объект баффа
     * @returns {string} описание
     */
    getBuffDescription(buff) {
        const config = this.buffConfigs[buff.id];
        if (config && config.description) {
            return config.description;
        }
        
        // Если нет готового описания, генерируем
        switch(buff.type) {
            case 'damage':
                return `+${buff.value} к атаке`;
            case 'speed':
                return `+${buff.value} к скорости`;
            case 'defense':
                return `+${buff.value} к защите`;
            case 'heal':
                return `Восстанавливает ${buff.value} HP`;
            default:
                return buff.name;
        }
    }

    /**
     * Получает статистику по баффам
     * @returns {Object} статистика
     */
    getBuffStats() {
        const stats = {
            total: this.activeBuffs.length,
            byType: {
                damage: 0,
                speed: 0,
                defense: 0,
                heal: 0,
                special: 0
            },
            strongest: null,
            longest: null
        };

        let strongestValue = 0;
        let longestDuration = 0;

        this.activeBuffs.forEach(buff => {
            // Считаем по типам
            if (stats.byType[buff.type] !== undefined) {
                stats.byType[buff.type]++;
            } else {
                stats.byType.special++;
            }

            // Ищем самый сильный бафф (по значению)
            if (buff.value > strongestValue) {
                strongestValue = buff.value;
                stats.strongest = buff;
            }

            // Ищем самый длительный (по оставшемуся времени)
            if (buff.timeLeft > longestDuration) {
                longestDuration = buff.timeLeft;
                stats.longest = buff;
            }
        });

        return stats;
    }

    /**
     * Проверяет, есть ли активный бафф с указанным ID
     * @param {string} buffId - ID баффа
     * @returns {boolean} есть ли бафф
     */
    hasBuff(buffId) {
        return this.activeBuffs.some(buff => buff.id === buffId);
    }

    /**
     * Получает все баффы определенного типа
     * @param {string} type - тип баффа ('damage', 'speed', 'defense', 'heal')
     * @returns {Array} массив баффов указанного типа
     */
    getBuffsByType(type) {
        return this.activeBuffs.filter(buff => buff.type === type);
    }

    /**
     * Получает суммарное значение баффов определенного типа
     * @param {string} type - тип баффа
     * @returns {number} суммарное значение
     */
    getTotalBuffValue(type) {
        return this.activeBuffs
            .filter(buff => buff.type === type)
            .reduce((sum, buff) => sum + buff.value, 0);
    }

    /**
     * Очищает все активные баффы
     * @param {Object} hero - герой, с которого снимаются баффы
     */
    clearAllBuffs(hero) {
        this.activeBuffs.forEach(buff => buff.remove(hero));
        this.activeBuffs = [];
        console.log('🧹 Все баффы очищены');
    }

    /**
     * Получает информацию для отображения в UI
     * @returns {Object} данные для UI
     */
    getUIData() {
        return {
            buffs: this.getActiveBuffs(),
            count: this.activeBuffs.length,
            maxBuffs: this.maxBuffs,
            stats: this.getBuffStats()
        };
    }

    /**
     * Создает HTML для отображения баффов (для отладки)
     * @returns {string} HTML строка
     */
    renderBuffs() {
        if (this.activeBuffs.length === 0) {
            return '<div style="color: #666; text-align: center;">Нет активных баффов</div>';
        }

        const buffsHtml = this.activeBuffs.map(buff => `
            <div class="buff-item" style="
                background: #16213e;
                border: 2px solid ${this.getBuffColor(buff.type)};
                border-radius: 8px;
                padding: 10px;
                margin: 5px;
                display: inline-flex;
                align-items: center;
                gap: 10px;
                position: relative;
            ">
                <div style="font-size: 2rem;">${buff.icon}</div>
                <div>
                    <div style="font-weight: bold; color: #fff;">${buff.name}</div>
                    <div style="font-size: 0.8rem; color: #aaa;">${this.getBuffDescription(buff)}</div>
                    <div style="font-size: 0.7rem; color: #ffd700;">${Math.ceil(buff.timeLeft)}с</div>
                </div>
                <div style="
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    height: 3px;
                    width: ${(buff.timeLeft / buff.duration) * 100}%;
                    background: ${this.getBuffColor(buff.type)};
                    border-radius: 0 0 0 8px;
                "></div>
            </div>
        `).join('');

        return `
            <div style="margin: 10px 0;">
                <h4 style="color: #4aff4a; margin-bottom: 10px;">Активные баффы (${this.activeBuffs.length}/${this.maxBuffs})</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                    ${buffsHtml}
                </div>
            </div>
        `;
    }

    /**
     * Получает цвет для типа баффа
     * @param {string} type - тип баффа
     * @returns {string} цвет в формате CSS
     */
    getBuffColor(type) {
        const colors = {
            damage: '#e94560',
            speed: '#4aff4a',
            defense: '#4caaff',
            heal: '#ffd700',
            special: '#aa4aff'
        };
        return colors[type] || '#ffffff';
    }

    /**
     * Сериализует баффы для сохранения
     * @returns {Array} массив для сохранения
     */
    serialize() {
        return this.activeBuffs.map(buff => ({
            id: buff.id,
            timeLeft: buff.timeLeft
        }));
    }

    /**
     * Загружает баффы из сохранения
     * @param {Array} data - данные из сохранения
     * @param {Object} hero - герой
     */
    deserialize(data, hero) {
        if (!data || !Array.isArray(data)) return;
        
        this.clearAllBuffs(hero);
        
        data.forEach(item => {
            const config = this.buffConfigs[item.id];
            if (config) {
                const buff = new Buff(
                    item.id,
                    config.name,
                    config.type,
                    config.value,
                    config.duration,
                    config.icon
                );
                buff.timeLeft = item.timeLeft;
                buff.apply(hero);
                if (buff.timeLeft > 0) {
                    this.activeBuffs.push(buff);
                }
            }
        });
        
        console.log(`📦 Загружено ${this.activeBuffs.length} баффов из сохранения`);
    }
}

// Делаем классы глобальными
window.Buff = Buff;
window.BuffManager = BuffManager;