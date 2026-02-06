/* ===================================
   SmartStock AI - Predictions & Analytics
   =================================== */

class PredictionsManager {
    constructor() {
        this.animationTimeout = null;
    }

    // Render predictions chart
    render() {
        const container = document.getElementById('predictionChart');
        if (!container) return;

        const categoryData = dataManager.getCategoryData();
        const categories = Object.keys(categoryData);

        if (categories.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #999;">
                    <div style="font-size: 3em; margin-bottom: 15px;">📊</div>
                    <p>No data available for predictions</p>
                </div>
            `;
            return;
        }

        // Calculate max value for scaling
        const maxValue = Math.max(
            ...categories.map(category => {
                const multiplier = getSeasonalMultiplier(category);
                return categoryData[category].value * multiplier;
            })
        );

        // Sort categories by predicted value (descending)
        const sortedCategories = categories.sort((a, b) => {
            const aValue = categoryData[a].value * getSeasonalMultiplier(a);
            const bValue = categoryData[b].value * getSeasonalMultiplier(b);
            return bValue - aValue;
        });

        const season = getCurrentSeason();
        const seasonName = season.charAt(0).toUpperCase() + season.slice(1);

        container.innerHTML = `
            <h3>Category Performance & ${seasonName} Forecast</h3>
            <div style="margin-bottom: 15px; padding: 10px; background: #f5f7fa; border-radius: 8px;">
                <small style="color: #666;">
                    <strong>Current Season:</strong> ${seasonName} 
                    <span style="margin-left: 15px;">📈 Predictions based on historical seasonal trends</span>
                </small>
            </div>
            ${sortedCategories.map(category => 
                this.createChartBarHTML(category, categoryData[category], maxValue)
            ).join('')}
        `;

        // Trigger animation
        this.animateCharts();
    }

    // Create HTML for single chart bar
    createChartBarHTML(category, data, maxValue) {
        const multiplier = getSeasonalMultiplier(category);
        const currentValue = data.value;
        const predictedValue = currentValue * multiplier;
        const percentage = (predictedValue / maxValue) * 100;
        const growth = ((multiplier - 1) * 100).toFixed(1);
        const growthSign = growth >= 0 ? '+' : '';
        const seasonal = getSeasonalIndicator(multiplier);

        return `
            <div class="chart-bar">
                <div class="chart-label">
                    ${category}
                    <br>
                    <small style="color: #999; font-weight: normal;">${data.items.length} items</small>
                </div>
                <div class="chart-bar-container">
                    <div class="chart-bar-fill" data-width="${percentage}" style="width: 0%">
                        ${formatCurrency(predictedValue)} (${growthSign}${growth}%)
                    </div>
                </div>
            </div>
        `;
    }

    // Animate chart bars
    animateCharts() {
        if (this.animationTimeout) {
            clearTimeout(this.animationTimeout);
        }

        this.animationTimeout = setTimeout(() => {
            const bars = document.querySelectorAll('.chart-bar-fill');
            bars.forEach(bar => {
                const targetWidth = bar.getAttribute('data-width');
                bar.style.width = `${targetWidth}%`;
            });
        }, 100);
    }

    // Get insights based on current data
    getInsights() {
        const categoryData = dataManager.getCategoryData();
        const categories = Object.keys(categoryData);
        const insights = [];

        // Find categories with high growth potential
        categories.forEach(category => {
            const multiplier = getSeasonalMultiplier(category);
            if (multiplier >= 1.3) {
                insights.push({
                    type: 'opportunity',
                    category: category,
                    message: `${category} is in peak season (+${((multiplier - 1) * 100).toFixed(0)}%). Consider stocking up.`,
                    priority: 'high'
                });
            } else if (multiplier <= 0.9) {
                insights.push({
                    type: 'warning',
                    category: category,
                    message: `${category} is in off-season (${((multiplier - 1) * 100).toFixed(0)}%). Reduce inventory to minimize holding costs.`,
                    priority: 'medium'
                });
            }
        });

        // Find low stock items in high-demand categories
        const lowStockItems = dataManager.getLowStockItems();
        lowStockItems.forEach(item => {
            const multiplier = getSeasonalMultiplier(item.category);
            if (multiplier >= 1.2) {
                insights.push({
                    type: 'critical',
                    category: item.category,
                    message: `${item.name} is low in stock during peak season. Reorder immediately.`,
                    priority: 'critical'
                });
            }
        });

        return insights;
    }

    // Calculate reorder recommendations
    getReorderRecommendations() {
        const recommendations = [];
        const lowStockItems = dataManager.getLowStockItems();

        lowStockItems.forEach(item => {
            const multiplier = getSeasonalMultiplier(item.category);
            const seasonal = getSeasonalIndicator(multiplier);
            
            // Calculate recommended reorder quantity based on seasonal demand
            const baseReorder = item.reorderLevel * 2;
            const recommendedQuantity = Math.ceil(baseReorder * multiplier);

            recommendations.push({
                item: item,
                currentStock: item.quantity,
                recommendedReorder: recommendedQuantity,
                reason: `${seasonal.text} - ${seasonal.percentage} demand adjustment`,
                urgency: item.quantity < 5 ? 'high' : 'medium'
            });
        });

        return recommendations.sort((a, b) => {
            const urgencyOrder = { high: 0, medium: 1, low: 2 };
            return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        });
    }

    // Export predictions data
    exportPredictionsData() {
        const categoryData = dataManager.getCategoryData();
        const season = getCurrentSeason();
        
        const predictions = Object.entries(categoryData).map(([category, data]) => {
            const multiplier = getSeasonalMultiplier(category);
            return {
                category: category,
                currentValue: data.value,
                predictedValue: data.value * multiplier,
                seasonalMultiplier: multiplier,
                currentSeason: season,
                itemCount: data.items.length,
                totalQuantity: data.quantity
            };
        });

        return {
            predictions: predictions,
            insights: this.getInsights(),
            recommendations: this.getReorderRecommendations(),
            generatedAt: new Date().toISOString()
        };
    }
}

// Create global instance
const predictionsManager = new PredictionsManager();