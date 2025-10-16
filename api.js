// Albion Online API Service
class AlbionAPI {
    constructor() {
        this.baseUrl = 'https://albion-online-data.com/api/v2/stats';
        this.cache = new Map();
    }

    async getItemPrices(itemName, locations = 'all') {
        try {
            const url = `${this.baseUrl}/prices/${itemName}?locations=${locations}`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching item prices:', error);
            return null;
        }
    }

    async getPriceHistory(itemName, locations = 'all', date = null) {
        try {
            let url = `${this.baseUrl}/history/${itemName}?locations=${locations}`;
            if (date) {
                url += `&date=${date}`;
            }
            
            const response = await fetch(url);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching price history:', error);
            return null;
        }
    }

    async searchItems(query) {
        try {
            const url = `https://albion-online-data.com/api/v2/stats/items?q=${encodeURIComponent(query)}`;
            
            const response = await fetch(url);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error searching items:', error);
            return null;
        }
    }

    async cachedRequest(url, ttl = 300000) {
        const now = Date.now();
        const cached = this.cache.get(url);
        
        if (cached && (now - cached.timestamp < ttl)) {
            return cached.data;
        }
        
        const data = await this.fetchData(url);
        this.cache.set(url, {
            data: data,
            timestamp: now
        });
        
        return data;
    }

    async fetchData(url) {
        const response = await fetch(url);
        return await response.json();
    }
}

// Создаем глобальный экземпляр API
const albionAPI = new AlbionAPI();