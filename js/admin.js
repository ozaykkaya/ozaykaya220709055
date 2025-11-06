// Check if admin is logged in
window.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    
    if (!isLoggedIn) {
        window.location.href = 'admin-login.html';
        return;
    }
    
    // Initialize dashboard
    loadShipments();
    loadContainers();
    loadFleet();
    loadFinancials();
    loadInventory();
    loadReports();
});

// Logout handler
document.getElementById('logoutBtn').addEventListener('click', function(e) {
    e.preventDefault();
    sessionStorage.removeItem('adminLoggedIn');
    window.location.href = 'admin-login.html';
});

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const tabName = this.getAttribute('data-tab');
        
        // Remove active class from all tabs and contents
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        this.classList.add('active');
        document.getElementById(tabName).classList.add('active');
    });
});

// Load shipments
function loadShipments() {
    const shipments = getFromStorage(DATA_KEYS.SHIPMENTS) || [];
    const tbody = document.getElementById('shipmentsTableBody');
    
    if (shipments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 2rem; color: var(--text-light);">No shipments yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = shipments.map(shipment => `
        <tr>
            <td>${shipment.id}</td>
            <td>${shipment.customerName}</td>
            <td>${shipment.productName}</td>
            <td>${formatWeight(shipment.weight)}</td>
            <td>${shipment.destinationCity}, ${shipment.destinationCountry}</td>
            <td>${shipment.containerId || 'Not assigned'}</td>
            <td><span class="status-badge status-${shipment.status.toLowerCase().replace(/ /g, '')}">${shipment.status}</span></td>
            <td>${formatCurrency(shipment.totalPrice)}</td>
            <td>
                <button class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;" onclick="updateShipmentStatus('${shipment.id}')">Update Status</button>
            </td>
        </tr>
    `).join('');
}

// Update shipment status
function updateShipmentStatus(shipmentId) {
    const shipments = getFromStorage(DATA_KEYS.SHIPMENTS);
    const shipment = shipments.find(s => s.id === shipmentId);
    
    if (!shipment) return;
    
    const statuses = ['Pending', 'Ready for Transport', 'In Transit', 'Delivered'];
    const currentIndex = statuses.indexOf(shipment.status);
    
    if (currentIndex < statuses.length - 1) {
        shipment.status = statuses[currentIndex + 1];
        saveToStorage(DATA_KEYS.SHIPMENTS, shipments);
        loadShipments();
        loadReports();
        alert(`Shipment ${shipmentId} status updated to: ${shipment.status}`);
    } else {
        alert('Shipment is already delivered!');
    }
}

// Load containers
function loadContainers() {
    const containers = getFromStorage(DATA_KEYS.CONTAINERS) || { Small: [], Medium: [], Large: [] };
    
    displayContainersByType('smallContainers', containers.Small, 'Small');
    displayContainersByType('mediumContainers', containers.Medium, 'Medium');
    displayContainersByType('largeContainers', containers.Large, 'Large');
}

function displayContainersByType(elementId, containers, type) {
    const element = document.getElementById(elementId);
    const capacity = CONTAINER_TYPES[type].capacity;
    
    if (containers.length === 0) {
        element.innerHTML = '<p style="color: var(--text-light); padding: 1rem;">No containers assigned</p>';
        return;
    }
    
    element.innerHTML = containers.map(container => {
        const utilizationPercent = (container.currentLoad / capacity * 100).toFixed(1);
        const remainingCapacity = capacity - container.currentLoad;
        
        return `
            <div style="margin-bottom: 1.5rem; padding: 1rem; background: var(--light-bg); border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <strong>${container.id}</strong>
                    <span class="status-badge status-${container.status.toLowerCase().replace(/ /g, '')}">${container.status}</span>
                </div>
                <div style="margin-bottom: 0.5rem;">
                    <div style="font-size: 0.9rem; color: var(--text-light); margin-bottom: 0.3rem;">
                        Load: ${formatWeight(container.currentLoad)} / ${formatWeight(capacity)}
                    </div>
                    <div style="background: var(--border-color); height: 20px; border-radius: 10px; overflow: hidden;">
                        <div style="width: ${utilizationPercent}%; height: 100%; background: linear-gradient(90deg, var(--secondary-blue), var(--accent-blue)); transition: width 0.3s;"></div>
                    </div>
                    <div style="font-size: 0.85rem; color: var(--text-light); margin-top: 0.3rem;">
                        Utilization: ${utilizationPercent}% | Remaining: ${formatWeight(remainingCapacity)}
                    </div>
                </div>
                <div style="font-size: 0.85rem; color: var(--text-light);">
                    Shipments: ${container.shipments.length}
                </div>
            </div>
        `;
    }).join('');
}

// Optimize containers
document.getElementById('optimizeBtn').addEventListener('click', function() {
    const containers = optimizeContainers();
    loadContainers();
    loadShipments();
    
    // Create beautiful modal
    showOptimizationModal(containers);
});

// Show optimization result modal
function showOptimizationModal(containers) {
    // Remove existing modal if any
    const existingModal = document.getElementById('optimizationModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const totalContainers = containers.Small.length + containers.Medium.length + containers.Large.length;
    
    const modal = document.createElement('div');
    modal.id = 'optimizationModal';
    modal.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;">
            <div style="background: white; border-radius: 16px; padding: 2.5rem; max-width: 500px; width: 90%; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); animation: slideIn 0.3s ease-out;">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; animation: scaleIn 0.5s ease-out;">
                        <span style="font-size: 3rem;">✓</span>
                    </div>
                    <h2 style="color: var(--primary-blue); margin-bottom: 0.5rem; font-size: 1.8rem;">Optimization Completed!</h2>
                    <p style="color: var(--text-light); font-size: 1rem;">Container packing has been optimized successfully</p>
                </div>
                
                <div style="background: var(--light-bg); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 2px solid var(--border-color);">
                        <span style="color: var(--text-dark); font-weight: 600;">📦 Total Containers Created:</span>
                        <span style="color: var(--secondary-blue); font-size: 1.5rem; font-weight: 700;">${totalContainers}</span>
                    </div>
                    
                    <div style="margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <div style="width: 12px; height: 12px; background: linear-gradient(135deg, var(--secondary-blue), var(--accent-blue)); border-radius: 3px;"></div>
                            <span style="color: var(--text-dark);">Small Containers:</span>
                        </div>
                        <span style="color: var(--primary-blue); font-weight: 700;">${containers.Small.length}</span>
                    </div>
                    
                    <div style="margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <div style="width: 12px; height: 12px; background: linear-gradient(135deg, var(--accent-blue), var(--light-blue)); border-radius: 3px;"></div>
                            <span style="color: var(--text-dark);">Medium Containers:</span>
                        </div>
                        <span style="color: var(--primary-blue); font-weight: 700;">${containers.Medium.length}</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <div style="width: 12px; height: 12px; background: linear-gradient(135deg, var(--light-blue), #93c5fd); border-radius: 3px;"></div>
                            <span style="color: var(--text-dark);">Large Containers:</span>
                        </div>
                        <span style="color: var(--primary-blue); font-weight: 700;">${containers.Large.length}</span>
                    </div>
                </div>
                
                <div style="background: linear-gradient(135deg, #dbeafe, #bfdbfe); border-radius: 12px; padding: 1rem; margin-bottom: 1.5rem;">
                    <div style="display: flex; align-items: start; gap: 0.75rem;">
                        <span style="font-size: 1.5rem;">💡</span>
                        <div>
                            <p style="color: var(--primary-blue); font-size: 0.9rem; margin: 0; font-weight: 500;">
                                Shipments have been efficiently packed using the First-Fit Decreasing algorithm to maximize space utilization and minimize costs.
                            </p>
                        </div>
                    </div>
                </div>
                
                <button onclick="document.getElementById('optimizationModal').remove()" style="width: 100%; padding: 0.875rem; background: linear-gradient(135deg, var(--secondary-blue), var(--accent-blue)); color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 15px -3px rgba(0, 0, 0, 0.1)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                    Got it! 🚀
                </button>
            </div>
        </div>
        
        <style>
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes scaleIn {
                0% {
                    transform: scale(0);
                }
                50% {
                    transform: scale(1.1);
                }
                100% {
                    transform: scale(1);
                }
            }
        </style>
    `;
    
    document.body.appendChild(modal);
}

// Load fleet
function loadFleet() {
    const fleet = getFromStorage(DATA_KEYS.FLEET);
    
    // Load ships
    const shipsBody = document.getElementById('shipsTableBody');
    shipsBody.innerHTML = fleet.ships.map(ship => `
        <tr>
            <td><strong>${ship.name}</strong></td>
            <td>${formatWeight(ship.capacity)}</td>
            <td>${formatCurrency(ship.fuelCostPerKm)}</td>
            <td>${formatCurrency(ship.crewCost)}</td>
            <td>${formatCurrency(ship.maintenance)}</td>
            <td><strong>${formatCurrency((ship.fuelCostPerKm * 2000) + ship.crewCost + ship.maintenance)}</strong></td>
            <td><span class="status-badge status-ok">${ship.status}</span></td>
        </tr>
    `).join('');
    
    // Load trucks
    const trucksBody = document.getElementById('trucksTableBody');
    trucksBody.innerHTML = fleet.trucks.map(truck => `
        <tr>
            <td><strong>${truck.name}</strong></td>
            <td>${formatWeight(truck.capacity)}</td>
            <td>${formatCurrency(truck.fuelCostPerKm)}</td>
            <td>${formatCurrency(truck.driverCost)}</td>
            <td>${formatCurrency(truck.maintenance)}</td>
            <td><strong>${formatCurrency((truck.fuelCostPerKm * 500) + truck.driverCost + truck.maintenance)}</strong></td>
            <td><span class="status-badge status-ok">${truck.status}</span></td>
        </tr>
    `).join('');
}

// Load financials
function loadFinancials() {
    const financials = calculateFinancialSummary();
    
    document.getElementById('totalRevenue').textContent = formatCurrency(financials.totalRevenue);
    document.getElementById('fleetExpenses').textContent = formatCurrency(financials.fleetExpenses);
    document.getElementById('otherExpenses').textContent = formatCurrency(financials.otherExpenses);
    document.getElementById('netIncome').textContent = formatCurrency(financials.netIncome);
    document.getElementById('tax').textContent = formatCurrency(financials.tax);
    document.getElementById('profitAfterTax').textContent = formatCurrency(financials.profitAfterTax);
    
    // Financial breakdown
    const breakdown = document.getElementById('financialBreakdown');
    breakdown.innerHTML = `
        <div class="info-row">
            <span class="info-label">Total Revenue:</span>
            <span class="info-value" style="color: var(--success); font-weight: 700;">${formatCurrency(financials.totalRevenue)}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Fleet Expenses:</span>
            <span class="info-value" style="color: var(--error);">${formatCurrency(financials.fleetExpenses)}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Other Expenses:</span>
            <span class="info-value" style="color: var(--error);">${formatCurrency(financials.otherExpenses)}</span>
        </div>
        <div class="info-row" style="border-top: 2px solid var(--border-color); padding-top: 1rem;">
            <span class="info-label">Total Expenses:</span>
            <span class="info-value" style="color: var(--error); font-weight: 700;">${formatCurrency(financials.totalExpenses)}</span>
        </div>
        <div class="info-row" style="border-top: 2px solid var(--primary-blue); padding-top: 1rem;">
            <span class="info-label" style="font-size: 1.1rem;">Net Income:</span>
            <span class="info-value" style="color: ${financials.netIncome >= 0 ? 'var(--success)' : 'var(--error)'}; font-size: 1.2rem; font-weight: 700;">${formatCurrency(financials.netIncome)}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Tax (20%):</span>
            <span class="info-value" style="color: var(--error);">${formatCurrency(financials.tax)}</span>
        </div>
        <div class="info-row" style="border-top: 2px solid var(--primary-blue); padding-top: 1rem;">
            <span class="info-label" style="font-size: 1.2rem;">Profit After Tax:</span>
            <span class="info-value" style="color: ${financials.profitAfterTax >= 0 ? 'var(--success)' : 'var(--error)'}; font-size: 1.3rem; font-weight: 700;">${formatCurrency(financials.profitAfterTax)}</span>
        </div>
    `;
}

// Load inventory
function loadInventory() {
    const inventory = getFromStorage(DATA_KEYS.INVENTORY);
    const tbody = document.getElementById('inventoryTableBody');
    const alerts = document.getElementById('inventoryAlerts');
    
    // Check for low stock and out of stock
    const outOfStockItems = inventory.filter(item => item.quantity <= 0);
    const lowStockItems = inventory.filter(item => item.quantity > 0 && item.status === 'Low');
    
    let alertsHTML = '';
    
    if (outOfStockItems.length > 0) {
        alertsHTML += outOfStockItems.map(item => `
            <div class="alert alert-error">
                <strong>❌ Out of Stock:</strong> ${item.category} blueberries are completely out of stock! Current: ${formatWeight(item.quantity)}. Please restock immediately.
            </div>
        `).join('');
    }
    
    if (lowStockItems.length > 0) {
        alertsHTML += lowStockItems.map(item => `
            <div class="alert alert-warning">
                <strong>⚠️ Warning:</strong> ${item.category} blueberries stock running low — please restock. Current: ${formatWeight(item.quantity)}, Minimum: ${formatWeight(item.minStock)}
            </div>
        `).join('');
    }
    
    if (outOfStockItems.length === 0 && lowStockItems.length === 0) {
        alertsHTML = '<div class="alert alert-success"><strong>✓ All Good:</strong> All inventory levels are adequate.</div>';
    }
    
    alerts.innerHTML = alertsHTML;
    
    tbody.innerHTML = inventory.map(item => {
        const statusClass = item.quantity <= 0 ? 'outofstock' : item.status.toLowerCase();
        const displayStatus = item.quantity <= 0 ? 'Out of Stock' : item.status;
        
        return `
            <tr>
                <td><strong>${item.category} Blueberries</strong></td>
                <td>${formatWeight(item.quantity)}</td>
                <td>${formatWeight(item.minStock)}</td>
                <td><span class="status-badge status-${statusClass}">${displayStatus}</span></td>
                <td>
                    <button class="btn btn-success" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;" onclick="restockItem('${item.category}')">Restock</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Restock inventory item
function restockItem(category) {
    const quantity = prompt(`Enter quantity to restock for ${category} blueberries (kg):`);
    
    if (quantity && !isNaN(quantity) && parseInt(quantity) > 0) {
        restockInventory(category, parseInt(quantity));
        loadInventory();
        alert(`Successfully restocked ${quantity} kg of ${category} blueberries!`);
    }
}

// Load reports
function loadReports() {
    const shipments = getFromStorage(DATA_KEYS.SHIPMENTS);
    const financials = calculateFinancialSummary();
    const containers = getFromStorage(DATA_KEYS.CONTAINERS);
    const inventory = getFromStorage(DATA_KEYS.INVENTORY);
    
    // Business metrics
    const businessMetrics = document.getElementById('businessMetrics');
    businessMetrics.innerHTML = `
        <div class="info-row">
            <span class="info-label">Total Revenue:</span>
            <span class="info-value" style="font-weight: 700;">${formatCurrency(financials.totalRevenue)}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Total Expenses:</span>
            <span class="info-value">${formatCurrency(financials.totalExpenses)}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Net Income:</span>
            <span class="info-value">${formatCurrency(financials.netIncome)}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Tax (20%):</span>
            <span class="info-value">${formatCurrency(financials.tax)}</span>
        </div>
        <div class="info-row" style="border-top: 2px solid var(--primary-blue); padding-top: 1rem;">
            <span class="info-label">Profit After Tax:</span>
            <span class="info-value" style="font-weight: 700; color: var(--success);">${formatCurrency(financials.profitAfterTax)}</span>
        </div>
    `;
    
    // Operational statistics
    const totalContainers = containers.Small.length + containers.Medium.length + containers.Large.length;
    const totalCapacity = (containers.Small.length * 2000) + (containers.Medium.length * 5000) + (containers.Large.length * 10000);
    const totalLoad = [...containers.Small, ...containers.Medium, ...containers.Large].reduce((sum, c) => sum + c.currentLoad, 0);
    const utilization = totalCapacity > 0 ? (totalLoad / totalCapacity * 100).toFixed(1) : 0;
    
    const totalDistance = shipments.reduce((sum, s) => sum + s.distance, 0);
    
    const operationalStats = document.getElementById('operationalStats');
    operationalStats.innerHTML = `
        <div class="info-row">
            <span class="info-label">Total Shipments:</span>
            <span class="info-value" style="font-weight: 700;">${shipments.length}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Pending:</span>
            <span class="info-value">${shipments.filter(s => s.status === 'Pending').length}</span>
        </div>
        <div class="info-row">
            <span class="info-label">In Transit:</span>
            <span class="info-value">${shipments.filter(s => s.status === 'In Transit').length}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Delivered:</span>
            <span class="info-value">${shipments.filter(s => s.status === 'Delivered').length}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Active Containers:</span>
            <span class="info-value">${totalContainers}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Container Utilization:</span>
            <span class="info-value" style="font-weight: 700; color: var(--success);">${utilization}%</span>
        </div>
        <div class="info-row">
            <span class="info-label">Total Distance Covered:</span>
            <span class="info-value">${totalDistance.toLocaleString()} km</span>
        </div>
    `;
    
    // Popular routes
    const routeCounts = {};
    shipments.forEach(s => {
        const route = `Muğla → ${s.destinationCity}`;
        routeCounts[route] = (routeCounts[route] || 0) + 1;
    });
    
    const sortedRoutes = Object.entries(routeCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    
    const popularRoutes = document.getElementById('popularRoutes');
    if (sortedRoutes.length > 0) {
        popularRoutes.innerHTML = sortedRoutes.map(([route, count]) => `
            <div class="info-row">
                <span class="info-label">${route}:</span>
                <span class="info-value">${count} shipments</span>
            </div>
        `).join('');
    } else {
        popularRoutes.innerHTML = '<p style="color: var(--text-light);">No routes yet</p>';
    }
    
    // Products sold
    const categoryCounts = {};
    shipments.forEach(s => {
        categoryCounts[s.category] = (categoryCounts[s.category] || 0) + s.weight;
    });
    
    const productsSold = document.getElementById('productsSold');
    if (Object.keys(categoryCounts).length > 0) {
        productsSold.innerHTML = Object.entries(categoryCounts).map(([category, weight]) => `
            <div class="info-row">
                <span class="info-label">${category} Blueberries:</span>
                <span class="info-value">${formatWeight(weight)}</span>
            </div>
        `).join('');
        
        productsSold.innerHTML += `
            <div class="info-row" style="border-top: 2px solid var(--primary-blue); padding-top: 1rem;">
                <span class="info-label">Remaining Inventory:</span>
                <span class="info-value"></span>
            </div>
        `;
        
        inventory.forEach(item => {
            productsSold.innerHTML += `
                <div class="info-row">
                    <span class="info-label">${item.category}:</span>
                    <span class="info-value">${formatWeight(item.quantity)}</span>
                </div>
            `;
        });
    } else {
        productsSold.innerHTML = '<p style="color: var(--text-light);">No products sold yet</p>';
    }
}

// Generate report
document.getElementById('generateReportBtn').addEventListener('click', function() {
    loadReports();
    alert('Report generated successfully!');
});

// Export PDF (simplified - in production would use a PDF library)
document.getElementById('exportPdfBtn').addEventListener('click', function() {
    alert('PDF export functionality would be implemented here using a library like jsPDF.\n\nFor this demo, you can use the browser\'s Print function (Ctrl+P) to save as PDF.');
    window.print();
});
