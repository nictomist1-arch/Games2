// js/arena/EnemyGenerator.js
// Генератор врагов на основе конфигурации

class EnemyGenerator {
    constructor() {
        this.enemyTypes = window.EnemyTypeConfig;
        this.waveConfigs = this.initWaveConfigs();
    }

    initWaveConfigs() {
        return {
            easy: {
                weight: 1,
                types: ['goblin', 'zombie'],
                minCount: 3,
                maxCount: 6,
                bossChance: 0
            },
            medium: {
                weight: 1.5,
                types: ['goblin', 'skeleton', 'zombie', 'ghost'],
                minCount: 5,
                maxCount: 10,
                bossChance: 0.1
            },
            hard: {
                weight: 2,
                types: ['skeleton', 'ghost', 'orc'],
                minCount: 8,
                maxCount: 15,
                bossChance: 0.2
            },
            elite: {
                weight: 3,
                types: ['orc', 'boss'],
                minCount: 3,
                maxCount: 7,
                bossChance: 0.5
            },
            boss: {
                weight: 5,
                types: ['boss'],
                minCount: 1,
                maxCount: 2,
                bossChance: 1
            }
        };
    }

    /**
     * Генерирует волну врагов на основе сложности и времени
     * @param {number} difficulty - текущая сложность
     * @param {number} gameTime - время игры в секундах
     * @param {number} heroLevel - уровень героя
     * @returns {Array} - массив конфигураций врагов
     */
    generateWave(difficulty, gameTime, heroLevel) {
        // Определяем тип волны в зависимости от времени
        let waveType = 'easy';
        if (gameTime > 120) waveType = 'elite';
        else if (gameTime > 60) waveType = 'hard';
        else if (gameTime > 30) waveType = 'medium';

        const config = this.waveConfigs[waveType];
        
        // Базовая сложность с учетом времени и уровня героя
        const baseDifficulty = difficulty * (1 + gameTime / 60) * (1 + heroLevel / 10);
        
        // Количество врагов
        const count = Math.floor(
            Math.random() * (config.maxCount - config.minCount + 1) + config.minCount
        );

        const enemies = [];
        
        // Генерируем врагов
        for (let i = 0; i < count; i++) {
            // Случайный тип из доступных для этой волны
            const typeKey = config.types[Math.floor(Math.random() * config.types.length)];
            const enemyConfig = this.enemyTypes[typeKey];
            
            // Индивидуальная сложность для каждого врага
            const enemyDifficulty = baseDifficulty * (0.8 + Math.random() * 0.4);
            
            // Проверяем, не босс ли это
            const isBoss = Math.random() < config.bossChance && enemyConfig.isBoss;
            
            enemies.push({
                type: typeKey,
                config: enemyConfig,
                difficulty: enemyDifficulty,
                isBoss: isBoss,
                scale: isBoss ? 1.5 : 1,
                hpMultiplier: isBoss ? 3 : 1,
                damageMultiplier: isBoss ? 2 : 1,
                expMultiplier: isBoss ? 5 : 1
            });
        }

        return {
            waveType: waveType,
            count: enemies.length,
            enemies: enemies,
            bossPresent: enemies.some(e => e.isBoss)
        };
    }

    /**
     * Генерирует мини-босса (сильный враг)
     * @param {number} difficulty - сложность
     * @param {number} heroLevel - уровень героя
     * @returns {Object} - конфигурация мини-босса
     */
    generateMiniBoss(difficulty, heroLevel) {
        // Выбираем случайного врага, который может быть боссом
        const possibleTypes = ['orc', 'ghost'];
        const typeKey = possibleTypes[Math.floor(Math.random() * possibleTypes.length)];
        const enemyConfig = this.enemyTypes[typeKey];

        return {
            type: typeKey,
            config: enemyConfig,
            difficulty: difficulty * 2.5,
            isBoss: true,
            scale: 1.3,
            hpMultiplier: 2,
            damageMultiplier: 1.5,
            expMultiplier: 3,
            abilities: ['rage', 'summon']
        };
    }

    /**
     * Генерирует финального босса
     * @param {number} difficulty - сложность
     * @param {number} heroLevel - уровень героя
     * @returns {Object} - конфигурация босса
     */
    generateFinalBoss(difficulty, heroLevel) {
        return {
            type: 'boss',
            config: this.enemyTypes['boss'],
            difficulty: difficulty * 5,
            isBoss: true,
            scale: 2,
            hpMultiplier: 5,
            damageMultiplier: 3,
            expMultiplier: 10,
            abilities: ['summon', 'rage', 'heal', 'teleport']
        };
    }

    /**
     * Получает описание волны
     * @param {Object} wave - данные волны
     * @returns {string} - описание
     */
    getWaveDescription(wave) {
        const emojis = {
            easy: '🟢',
            medium: '🟡',
            hard: '🟠',
            elite: '🔴',
            boss: '💀'
        };

        const bossText = wave.bossPresent ? ' [БОСС]' : '';
        
        return `${emojis[wave.waveType] || '⚔️'} Волна ${wave.waveType.toUpperCase()}${bossText}: ${wave.count} врагов`;
    }
}

window.EnemyGenerator = EnemyGenerator;