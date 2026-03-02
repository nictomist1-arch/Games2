// js/arena/BuffUIManager.js
// Менеджер отображения баффов в интерфейсе

class BuffUIManager {
    constructor() {
        this.buffSlots = [
            document.getElementById('buffSlot1'),
            document.getElementById('buffSlot2'),
            document.getElementById('buffSlot3'),
            document.getElementById('buffSlot4'),
            document.getElementById('buffSlot5')
        ];
        
        this.activeBuffs = [];
        this.updateInterval = null;
    }

    /**
     * Обновляет отображение баффов
     * @param {Array} buffs - массив активных баффов
     */
    updateBuffs(buffs) {
        this.activeBuffs = buffs || [];
        
        // Очищаем все слоты
        this.buffSlots.forEach(slot => {
            slot.className = 'buff-slot empty';
            slot.innerHTML = '?';
            slot.removeAttribute('data-type');
            slot.removeAttribute('data-time');
            
            // Удаляем тултип, если есть
            const oldTooltip = slot.querySelector('.buff-tooltip');
            if (oldTooltip) oldTooltip.remove();
        });

        // Заполняем слоты активными баффами
        this.activeBuffs.forEach((buff, index) => {
            if (index >= this.buffSlots.length) return;
            
            const slot = this.buffSlots[index];
            slot.className = 'buff-slot active';
            slot.setAttribute('data-type', buff.type || 'buff');
            slot.setAttribute('data-time', buff.timeLeft || 0);
            
            // Иконка баффа
            slot.innerHTML = buff.icon || '✨';
            
            // Таймер, если есть длительность
            if (buff.timeLeft && buff.timeLeft > 0) {
                const timerSpan = document.createElement('span');
                timerSpan.className = 'buff-timer';
                timerSpan.textContent = Math.ceil(buff.timeLeft);
                slot.appendChild(timerSpan);
            }
            
            // Тултип с описанием
            const tooltip = document.createElement('div');
            tooltip.className = 'buff-tooltip';
            tooltip.innerHTML = `
                <strong>${buff.name || 'Бафф'}</strong><br>
                ${buff.description || ''}<br>
                ${buff.timeLeft ? `Осталось: ${Math.ceil(buff.timeLeft)}с` : 'Постоянный'}
            `;
            slot.appendChild(tooltip);
        });
    }

    /**
     * Добавляет анимацию получения баффа
     * @param {number} slotIndex - индекс слота
     */
    animateBuffGain(slotIndex) {
        if (slotIndex >= 0 && slotIndex < this.buffSlots.length) {
            const slot = this.buffSlots[slotIndex];
            slot.classList.add('buff-gain');
            setTimeout(() => {
                slot.classList.remove('buff-gain');
            }, 500);
        }
    }

    /**
     * Запускает обновление таймеров каждую секунду
     */
    startTimerUpdates() {
        if (this.updateInterval) clearInterval(this.updateInterval);
        
        this.updateInterval = setInterval(() => {
            // Обновляем отображение таймеров
            this.buffSlots.forEach(slot => {
                const timer = slot.querySelector('.buff-timer');
                if (timer) {
                    const currentTime = parseInt(timer.textContent);
                    if (currentTime > 1) {
                        timer.textContent = currentTime - 1;
                    } else {
                        // Если время вышло, слот будет очищен при следующем обновлении
                    }
                }
            });
        }, 1000);
    }

    /**
     * Останавливает обновление таймеров
     */
    stopTimerUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    /**
     * Очищает все слоты
     */
    clearBuffs() {
        this.buffSlots.forEach(slot => {
            slot.className = 'buff-slot empty';
            slot.innerHTML = '?';
            slot.removeAttribute('data-type');
            slot.removeAttribute('data-time');
            
            const oldTooltip = slot.querySelector('.buff-tooltip');
            if (oldTooltip) oldTooltip.remove();
        });
        this.activeBuffs = [];
    }
}

window.BuffUIManager = BuffUIManager;