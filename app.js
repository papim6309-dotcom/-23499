// Основной JavaScript файл
class AlbionMarketApp {
    constructor() {
        this.currentTheme = 'albion';
        this.currentFilters = {
            search: '',
            city: '',
            tier: '',
            quality: ''
        };
        this.sortConfig = {
            field: 'name',
            direction: 'asc'
        };
        this.watchedItems = new Set();
        this.init();
    }

    init() {
        this.loadTheme();
        this.loadWatchedItems();
        this.renderTable();
        this.setupEventListeners();
        this.updateStats();
        this.updateLastUpdateTime();
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'albion';
        this.setTheme(savedTheme);
    }

    setTheme(theme) {
        this.currentTheme = theme;
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Устанавливаем выбранную тему в селекторе
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.value = theme;
        }
    }

    loadWatchedItems() {
        const saved = localStorage.getItem('watchedItems');
        if (saved) {
            this.watchedItems = new Set(JSON.parse(saved));
        }
    }

    saveWatchedItems() {
        localStorage.setItem('watchedItems', JSON.stringify([...this.watchedItems]));
    }

    setupEventListeners() {
        // Переключение темы
        document.getElementById('themeSelect').addEventListener('change', (e) => {
            this.setTheme(e.target.value);
        });

        // Поиск
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.currentFilters.search = e.target.value;
            this.renderTable();
        });

        // Фильтры
        document.getElementById('cityFilter').addEventListener('change', (e) => {
            this.currentFilters.city = e.target.value;
            this.renderTable();
        });

        document.getElementById('tierFilter').addEventListener('change', (e) => {
            this.currentFilters.tier = e.target.value;
            this.renderTable();
        });

        document.getElementById('qualityFilter').addEventListener('change', (e) => {
            this.currentFilters.quality = e.target.value;
            this.renderTable();
        });

        // Сброс фильтров
        document.getElementById('clearFilters').addEventListener('click', () => {
            this.clearFilters();
        });

        // Обновление данных
        document.querySelector('.refresh-btn').addEventListener('click', () => {
            this.refreshData();
        });

        // Навигация
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(link.getAttribute('href').substring(1));
            });
        });

        // Сортировка таблицы
        document.querySelectorAll('th[data-sort]').forEach(th => {
            th.addEventListener('click', () => {
                this.sortTable(th.dataset.sort);
            });
        });

        // Экспорт данных
        document.getElementById('exportData').addEventListener('click', () => {
            this.exportToCSV();
        });
    }

    clearFilters() {
        this.currentFilters = {
            search: '',
            city: '',
            tier: '',
            quality: ''
        };
        
        document.getElementById('searchInput').value = '';
        document.getElementById('cityFilter').value = '';
        document.getElementById('tierFilter').value = '';
        document.getElementById('qualityFilter').value = '';
        
        this.renderTable();
        this.showNotification('Фильтры сброшены', 'success');
    }

    sortTable(field) {
        if (this.sortConfig.field === field) {
            this.sortConfig.direction = this.sortConfig.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortConfig.field = field;
            this.sortConfig.direction = 'asc';
        }
        
        // Обновляем индикаторы сортировки
        document.querySelectorAll('th[data-sort]').forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
            if (th.dataset.sort === field) {
                th.classList.add(`sort-${this.sortConfig.direction}`);
            }
        });
        
        this.renderTable();
    }

    switchTab(tabName) {
        // Обновляем активную вкладку
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[href="#${tabName}"]`).classList.add('active');

        // Переключаем контент
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-content`).classList.add('active');

        this.showNotification(`Переключено на вкладку: ${this.getTabName(tabName)}`);
    }

    getTabName(tabId) {
        const names = {
            'prices': 'Цены',
            'history': 'История'
        };
        return names[tabId] || tabId;
    }

    renderTable() {
        const tableBody = document.getElementById('priceTableBody');
        let data = getMarketData(this.currentFilters);
        
        // Сортировка данных
        data = this.sortData(data);
        
        if (data.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align: center; padding: 3rem;">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">🔍</div>
                        <h3 style="color: var(--text-secondary); margin-bottom: 0.5rem;">Ничего не найдено</h3>
                        <p style="color: var(--text-secondary);">Попробуйте изменить параметры поиска или фильтры</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tableBody.innerHTML = '';

        data.forEach(item => {
            Object.entries(item.locations).forEach(([city, prices]) => {
                const profit = prices.sellPrice - prices.buyPrice;
                const profitPercent = prices.buyPrice > 0 ? ((profit / prices.buyPrice) * 100).toFixed(1) : '0';
                const itemKey = `${item.id}-${city}`;
                const isWatched = this.watchedItems.has(itemKey);
                
                const row = document.createElement('tr');
                row.className = 'fade-in';
                row.innerHTML = `
                    <td>
                        <div class="item-cell">
                            <div class="item-icon">T${item.tier}</div>
                            <div class="item-info">
                                <div class="item-name">${item.displayName}</div>
                                <div class="item-meta">
                                    <span class="tier-badge">T${item.tier}</span>
                                    ${item.quality ? `<span class="quality-badge quality-${item.quality}">${this.getQualityLabel(item.quality)}</span>` : ''}
                                </div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="type-badge type-${item.type.toLowerCase()}">${this.getTypeLabel(item.type)}</span>
                    </td>
                    <td>
                        <span class="tier-badge">T${item.tier}</span>
                    </td>
                    <td>
                        ${item.quality ? `<span class="quality-badge quality-${item.quality}">${this.getQualityLabel(item.quality)}</span>` : '⚪ Нормальное'}
                    </td>
                    <td>
                        <span class="city-badge">${city}</span>
                    </td>
                    <td class="price-cell">${this.formatPrice(prices.sellPrice)}</td>
                    <td class="price-cell">${this.formatPrice(prices.buyPrice)}</td>
                    <td class="${profit >= 0 ? 'profit-positive' : 'profit-negative'}">
                        ${this.formatPrice(profit)} (${profitPercent}%)
                    </td>
                    <td class="quantity-cell ${prices.quantity > 1000 ? 'quantity-high' : prices.quantity > 100 ? 'quantity-medium' : 'quantity-low'}">
                        ${this.formatNumber(prices.quantity)}
                    </td>
                    <td>
                        <button class="watch-btn ${isWatched ? 'watching' : ''}" 
                                onclick="app.toggleWatch('${itemKey}', '${item.displayName}', '${city}')"
                                title="${isWatched ? 'Убрать из отслеживания' : 'Добавить в отслеживание'}">
                            <i class="fas ${isWatched ? 'fa-eye-slash' : 'fa-eye'}"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        });
    }

    sortData(data) {
        return data.sort((a, b) => {
            let aValue, bValue;
            
            switch (this.sortConfig.field) {
                case 'name':
                    aValue = a.displayName;
                    bValue = b.displayName;
                    break;
                case 'type':
                    aValue = a.type;
                    bValue = b.type;
                    break;
                case 'tier':
                    aValue = a.tier;
                    bValue = b.tier;
                    break;
                case 'quality':
                    aValue = a.quality || 'normal';
                    bValue = b.quality || 'normal';
                    break;
                case 'city':
                    aValue = Object.keys(a.locations)[0];
                    bValue = Object.keys(b.locations)[0];
                    break;
                case 'sellPrice':
                    aValue = Object.values(a.locations)[0].sellPrice;
                    bValue = Object.values(b.locations)[0].sellPrice;
                    break;
                case 'buyPrice':
                    aValue = Object.values(a.locations)[0].buyPrice;
                    bValue = Object.values(b.locations)[0].buyPrice;
                    break;
                case 'profit':
                    const aProfit = Object.values(a.locations)[0].sellPrice - Object.values(a.locations)[0].buyPrice;
                    const bProfit = Object.values(b.locations)[0].sellPrice - Object.values(b.locations)[0].buyPrice;
                    aValue = aProfit;
                    bValue = bProfit;
                    break;
                case 'quantity':
                    aValue = Object.values(a.locations)[0].quantity;
                    bValue = Object.values(b.locations)[0].quantity;
                    break;
                default:
                    return 0;
            }
            
            if (this.sortConfig.direction === 'desc') {
                [aValue, bValue] = [bValue, aValue];
            }
            
            if (typeof aValue === 'string') {
                return aValue.localeCompare(bValue);
            } else {
                return aValue - bValue;
            }
        });
    }

    getTypeLabel(type) {
        const types = {
            'Resource': '📦 Ресурс',
            'Weapon': '⚔️ Оружие',
            'Armor': '🛡️ Броня',
            'Tool': '🛠️ Инструмент'
        };
        return types[type] || type;
    }

    getQualityLabel(quality) {
        const qualities = {
            'normal': '⚪',
            'good': '🟢',
            'excellent': '🔵',
            'outstanding': '🟣'
        };
        return qualities[quality] || '⚪';
    }

    formatPrice(price) {
        if (price >= 1000000) {
            return (price / 1000000).toFixed(2) + 'M';
        }
        if (price >= 1000) {
            return (price / 1000).toFixed(1) + 'k';
        }
        return price.toString();
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toString();
    }

    refreshData() {
        const refreshBtn = document.querySelector('.refresh-btn');
        const refreshIcon = refreshBtn.querySelector('i');
        
        refreshBtn.classList.add('loading');
        refreshIcon.style.animation = 'spin 1s linear';
        
        // Имитация загрузки данных
        setTimeout(() => {
            refreshBtn.classList.remove('loading');
            refreshIcon.style.animation = '';
            this.renderTable();
            this.updateStats();
            this.updateLastUpdateTime();
            this.showNotification('Данные успешно обновлены', 'success');
        }, 1500);
    }

    updateStats() {
        const data = getMarketData();
        let totalItems = 0;
        let totalProfit = 0;
        let activeMarkets = 0;
        
        data.forEach(item => {
            Object.values(item.locations).forEach(prices => {
                totalItems++;
                if (prices.quantity > 0) activeMarkets++;
                const profit = prices.buyPrice > 0 ? ((prices.sellPrice - prices.buyPrice) / prices.buyPrice) * 100 : 0;
                totalProfit += profit;
            });
        });
        
        const avgProfit = totalItems > 0 ? (totalProfit / totalItems).toFixed(1) : '0';
        const marketPercentage = totalItems > 0 ? Math.round((activeMarkets / totalItems) * 100) : '0';
        
        // Обновляем статистику
        const statValues = document.querySelectorAll('.stat-value');
        if (statValues.length >= 4) {
            statValues[0].textContent = totalItems;
            statValues[1].textContent = marketPercentage + '%';
            statValues[2].textContent = this.formatNumber(totalItems * 12);
            statValues[3].textContent = avgProfit + '%';
        }
    }

    updateLastUpdateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('ru-RU');
        document.getElementById('lastUpdate').textContent = timeString;
    }

    toggleWatch(itemKey, itemName, city) {
        if (this.watchedItems.has(itemKey)) {
            this.watchedItems.delete(itemKey);
            this.showNotification(`Убрано из отслеживания: ${itemName} в ${city}`, 'warning');
        } else {
            this.watchedItems.add(itemKey);
            this.showNotification(`Добавлено в отслеживание: ${itemName} в ${city}`, 'success');
        }
        
        this.saveWatchedItems();
        this.renderTable();
    }

    exportToCSV() {
        const data = getMarketData(this.currentFilters);
        let csv = 'Предмет,Тип,Тиер,Качество,Город,Цена продажи,Цена покупки,Прибыль,Прибыль %,Объем\\n';
        
        data.forEach(item => {
            Object.entries(item.locations).forEach(([city, prices]) => {
                const profit = prices.sellPrice - prices.buyPrice;
                const profitPercent = prices.buyPrice > 0 ? ((profit / prices.buyPrice) * 100).toFixed(1) : '0';
                
                csv += `"${item.displayName}","${item.type}","T${item.tier}","${item.quality || 'normal'}","${city}",${prices.sellPrice},${prices.buyPrice},${profit},${profitPercent}%,${prices.quantity}\\n`;
            });
        });
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `albion-market-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification('Данные экспортированы в CSV', 'success');
    }

    showNotification(message, type = 'success') {
        document.querySelectorAll('.notification').forEach(notification => {
            notification.remove();
        });
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 4000);
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AlbionMarketApp();
});