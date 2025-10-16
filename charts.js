// Инициализация графиков для вкладки История
class ChartsManager {
    constructor() {
        this.charts = {};
        this.init();
    }

    init() {
        this.createPriceHistoryChart();
        this.createCityComparisonChart();
        this.createArbitrageChart();
        this.createVolatilityChart();
    }

    createPriceHistoryChart() {
        const ctx = document.getElementById('priceHistoryChart').getContext('2d');
        
        // Генерация данных за последние 30 дней
        const dates = this.generateDates(30);
        const items = [
            { name: 'Сосновое бревно T4', color: 'rgb(139, 69, 19)' },
            { name: 'Кедровое бревно T5', color: 'rgb(210, 105, 30)' },
            { name: 'Буковое бревно T6', color: 'rgb(205, 133, 63)' },
            { name: 'Железная руда T4', color: 'rgb(112, 128, 144)' },
            { name: 'Титановая руда T5', color: 'rgb(169, 169, 169)' }
        ];

        const datasets = items.map((item, index) => {
            const basePrice = 100 + (index * 50);
            return {
                label: item.name,
                data: this.generatePriceData(basePrice, 30),
                borderColor: item.color,
                backgroundColor: this.hexToRgb(item.color, 0.1),
                borderWidth: 2,
                tension: 0.4,
                fill: true
            };
        });

        this.charts.priceHistory = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: datasets
            },
            options: {
                responsive: true,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Динамика цен за 30 дней',
                        font: {
                            size: 16
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y} серебра`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Дата'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Цена (серебро)'
                        },
                        beginAtZero: false
                    }
                }
            }
        });
    }

    createCityComparisonChart() {
        const ctx = document.getElementById('cityComparisonChart').getContext('2d');
        
        const cities = ['Лимхерст', 'Бриджуотч', 'Мартлок', 'Тетфорд', 'Форт Стерлинг', 'Кэрлион'];
        const items = [
            'Сосновое бревно T4',
            'Кедровое бревно T5', 
            'Железная руда T4',
            'Титановая руда T5',
            'Длинный лук T6'
        ];

        const datasets = items.map((item, index) => {
            const colors = [
                'rgb(139, 69, 19)',
                'rgb(210, 105, 30)',
                'rgb(112, 128, 144)',
                'rgb(169, 169, 169)',
                'rgb(75, 0, 130)'
            ];
            
            return {
                label: item,
                data: cities.map(() => 80 + Math.random() * 120 + (index * 30)),
                backgroundColor: this.hexToRgb(colors[index], 0.7),
                borderColor: colors[index],
                borderWidth: 1
            };
        });

        this.charts.cityComparison = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: cities,
                datasets: datasets
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Сравнение средних цен по городам',
                        font: {
                            size: 16
                        }
                    }
                },
                scales: {
                    x: {
                        stacked: false,
                    },
                    y: {
                        stacked: false,
                        title: {
                            display: true,
                            text: 'Цена (серебро)'
                        }
                    }
                }
            }
        });
    }

    createArbitrageChart() {
        const ctx = document.getElementById('arbitrageChart').getContext('2d');
        
        const opportunities = [
            { item: 'Сосновое бревно T4', profit: 25.3 },
            { item: 'Кедровое бревно T5', profit: 18.7 },
            { item: 'Железная руда T4', profit: 32.1 },
            { item: 'Титановая руда T5', profit: 22.8 },
            { item: 'Грубая кожа T4', profit: 15.4 },
            { item: 'Толстая кожа T5', profit: 28.9 },
            { item: 'Длинный лук T6', profit: 16.2 }
        ];

        this.charts.arbitrage = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: opportunities.map(op => op.item),
                datasets: [{
                    label: 'Прибыль %',
                    data: opportunities.map(op => op.profit),
                    backgroundColor: [
                        'rgba(139, 69, 19, 0.8)',
                        'rgba(210, 105, 30, 0.8)',
                        'rgba(112, 128, 144, 0.8)',
                        'rgba(169, 169, 169, 0.8)',
                        'rgba(46, 139, 87, 0.8)',
                        'rgba(34, 139, 34, 0.8)',
                        'rgba(75, 0, 130, 0.8)'
                    ],
                    borderColor: [
                        'rgb(139, 69, 19)',
                        'rgb(210, 105, 30)',
                        'rgb(112, 128, 144)',
                        'rgb(169, 169, 169)',
                        'rgb(46, 139, 87)',
                        'rgb(34, 139, 34)',
                        'rgb(75, 0, 130)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Топ арбитражных возможностей',
                        font: {
                            size: 16
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Прибыль: ${context.parsed.y}%`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Прибыль (%)'
                        }
                    }
                }
            }
        });
    }

    createVolatilityChart() {
        const ctx = document.getElementById('volatilityChart').getContext('2d');
        
        const items = [
            'Сосновое бревно T4',
            'Кедровое бревно T5',
            'Буковое бревно T6', 
            'Железная руда T4',
            'Титановая руда T5',
            'Длинный лук T6',
            'Пластинчатый доспех T5'
        ];

        // Волатильность в процентах
        const volatility = [12.5, 18.3, 25.7, 8.9, 15.2, 32.1, 28.4];

        this.charts.volatility = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: items,
                datasets: [{
                    label: 'Волатильность цен (%)',
                    data: volatility,
                    backgroundColor: 'rgba(139, 69, 19, 0.2)',
                    borderColor: 'rgb(139, 69, 19)',
                    pointBackgroundColor: 'rgb(210, 105, 30)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(139, 69, 19)'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Волатильность рынка по предметам',
                        font: {
                            size: 16
                        }
                    }
                },
                scales: {
                    r: {
                        angleLines: {
                            display: true
                        },
                        suggestedMin: 0,
                        suggestedMax: 40
                    }
                }
            }
        });
    }

    // Вспомогательные методы
    generateDates(days) {
        const dates = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }));
        }
        return dates;
    }

    generatePriceData(basePrice, days) {
        const data = [basePrice];
        for (let i = 1; i < days; i++) {
            const change = (Math.random() - 0.5) * 20; // ±10%
            const newPrice = Math.max(50, data[i - 1] + change);
            data.push(Math.round(newPrice));
        }
        return data;
    }

    hexToRgb(hex, alpha = 1) {
        // Для простоты возвращаем тот же цвет с альфа-каналом
        return hex.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
    }

    updateCharts() {
        // Метод для обновления всех графиков
        Object.values(this.charts).forEach(chart => {
            chart.update();
        });
    }
}

// Инициализация графиков когда DOM загружен и переключена вкладка
document.addEventListener('DOMContentLoaded', () => {
    window.chartsManager = new ChartsManager();
    
    // Переинициализация графиков при переключении на вкладку истории
    document.querySelector('[href="#history"]').addEventListener('click', () => {
        setTimeout(() => {
            if (window.chartsManager) {
                // Можно добавить обновление данных графиков
                window.chartsManager.updateCharts();
            }
        }, 100);
    });
});