// js/ui/templates/achievements.js
// Шаблон для отображения достижений

const AchievementsTemplate = {
    /**
     * Создает HTML для списка достижений
     * @param {Array} achievements - массив достижений
     * @param {Array} completedIds - ID выполненных достижений
     * @returns {string} HTML
     */
    render(achievements, completedIds) {
        const achievementsHtml = achievements.map(ach => {
            const isCompleted = completedIds.includes(ach.id);
            
            return `
                <div class="achievement-card ${isCompleted ? 'completed' : ''}" 
                     style="
                        background: ${isCompleted ? '#1a4d2e' : '#16213e'};
                        border: 2px solid ${isCompleted ? '#4aff4a' : '#0f3460'};
                        border-radius: 10px;
                        padding: 15px;
                        margin-bottom: 10px;
                        display: flex;
                        gap: 15px;
                        align-items: center;
                        opacity: ${isCompleted ? 1 : 0.7};
                     ">
                    <div style="font-size: 3rem;">${isCompleted ? '🏆' : '🔒'}</div>
                    <div style="flex: 1;">
                        <h3 style="color: ${isCompleted ? '#4aff4a' : '#fff'}; margin-bottom: 5px;">
                            ${ach.name}
                            ${isCompleted ? ' ✓' : ''}
                        </h3>
                        <p style="color: #aaa; font-size: 0.9rem;">${ach.description}</p>
                        <div style="margin-top: 10px; font-size: 0.8rem; color: #ffd700;">
                            Награда: ${this.formatReward(ach.reward)}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        const progress = (completedIds.length / achievements.length) * 100;

        return `
            <h2 style="color: #e94560; margin-bottom: 20px;">🏆 Достижения</h2>
            
            <div style="margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span>Прогресс: ${completedIds.length}/${achievements.length}</span>
                    <span>${Math.round(progress)}%</span>
                </div>
                <div style="width: 100%; height: 10px; background: #0f3460; border-radius: 5px; overflow: hidden;">
                    <div style="width: ${progress}%; height: 100%; background: linear-gradient(90deg, #e94560, #4aff4a);"></div>
                </div>
            </div>
            
            <div style="max-height: 400px; overflow-y: auto; padding-right: 10px;">
                ${achievementsHtml}
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
                <button id="closeAchievementsBtn" style="width: auto; padding: 10px 30px; background: #4aff4a; color: #000; border: none; border-radius: 5px; cursor: pointer;">Закрыть</button>
            </div>
        `;
    },

    formatReward(reward) {
        const parts = [];
        if (reward.resources) {
            Object.entries(reward.resources).forEach(([type, amount]) => {
                const icons = { proviziya: '🍞', toplivo: '⛽', instrumenty: '🔧' };
                parts.push(`${icons[type] || '💰'} ${amount}`);
            });
        }
        if (reward.materials) {
            Object.entries(reward.materials).forEach(([type, amount]) => {
                const icons = { wood: '🪵', metal: '⚙️', cloth: '🧵' };
                parts.push(`${icons[type] || '📦'} ${amount}`);
            });
        }
        return parts.join(' + ') || '✨ Слава';
    }
};

window.AchievementsTemplate = AchievementsTemplate;