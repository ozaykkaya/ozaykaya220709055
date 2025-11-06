// Data storage using localStorage
const DATA_KEYS = {
    SHIPMENTS: 'globalfreight_shipments',
    CONTAINERS: 'globalfreight_containers',
    INVENTORY: 'globalfreight_inventory',
    FLEET: 'globalfreight_fleet'
};

// Container configurations
const CONTAINER_TYPES = {
    Small: { capacity: 2000, ratePerKm: 5 },
    Medium: { capacity: 5000, ratePerKm: 8 },
    Large: { capacity: 10000, ratePerKm: 12 }
};

// Fleet data
const FLEET_DATA = {
    ships: [
        { id: 'S001', name: 'BlueSea', capacity: 100000, fuelCostPerKm: 40, crewCost: 20000, maintenance: 10000, status: 'Available' },
        { id: 'S002', name: 'OceanStar', capacity: 120000, fuelCostPerKm: 50, crewCost: 25000, maintenance: 12000, status: 'Available' },
        { id: 'S003', name: 'AegeanWind', capacity: 90000, fuelCostPerKm: 35, crewCost: 18000, maintenance: 8000, status: 'Available' }
    ],
    trucks: [
        { id: 'T001', name: 'RoadKing', capacity: 10000, fuelCostPerKm: 8, driverCost: 3000, maintenance: 2000, status: 'Available' },
        { id: 'T002', name: 'FastMove', capacity: 12000, fuelCostPerKm: 9, driverCost: 3500, maintenance: 2500, status: 'Available' },
        { id: 'T003', name: 'CargoPro', capacity: 9000, fuelCostPerKm: 7, driverCost: 2800, maintenance: 2000, status: 'Available' },
        { id: 'T004', name: 'HeavyLoad', capacity: 15000, fuelCostPerKm: 10, driverCost: 4000, maintenance: 3000, status: 'Available' }
    ]
};

// Initialize inventory
const INITIAL_INVENTORY = [
    { category: 'Fresh', quantity: 4500, minStock: 2000, status: 'OK' },
    { category: 'Frozen', quantity: 1200, minStock: 1000, status: 'Low' },
    { category: 'Organic', quantity: 8000, minStock: 2500, status: 'OK' }
];

// Distance calculation from Muğla (sorted by distance)
const CITY_DISTANCES = {
    'Athens, Greece': 350,
    'Cairo, Egypt': 840,
    'Belgrade, Serbia': 1015,
    'Baku, Azerbaijan': 1950,
    'Berlin, Germany': 2030,
    'Moscow, Russia': 2190,
    'Paris, France': 2420,
    'Madrid, Spain': 2670,
    'London, United Kingdom': 2810,
    'New Delhi, India': 4760,
    'Dhaka, Bangladesh': 6065,
    'Beijing, China': 7133,
    'Seoul, South Korea': 8315,
    'Washington D.C., United States': 8490,
    'Tokyo, Japan': 9350,
    'Manila, Philippines': 9370,
    'Jakarta, Indonesia': 9490,
    'Mexico City, Mexico': 11627
};

// Get list of cities and countries
const DESTINATIONS = Object.keys(CITY_DISTANCES).map(destination => {
    const [city, country] = destination.split(', ');
    return { city, country, fullName: destination };
});

// Helper functions for localStorage
function getFromStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Initialize data if not exists
function initializeData() {
    if (!getFromStorage(DATA_KEYS.SHIPMENTS)) {
        saveToStorage(DATA_KEYS.SHIPMENTS, []);
    }
    if (!getFromStorage(DATA_KEYS.CONTAINERS)) {
        saveToStorage(DATA_KEYS.CONTAINERS, {
            Small: [],
            Medium: [],
            Large: []
        });
    }
    if (!getFromStorage(DATA_KEYS.INVENTORY)) {
        saveToStorage(DATA_KEYS.INVENTORY, INITIAL_INVENTORY);
    }
    if (!getFromStorage(DATA_KEYS.FLEET)) {
        saveToStorage(DATA_KEYS.FLEET, FLEET_DATA);
    }
}

// Calculate distance (simplified)
function calculateDistance(cityCountry) {
    // Try to find exact match first (city, country format)
    if (CITY_DISTANCES[cityCountry]) {
        return CITY_DISTANCES[cityCountry];
    }
    
    // Try case-insensitive match
    const cityCountryLower = cityCountry.toLowerCase();
    for (let key in CITY_DISTANCES) {
        if (key.toLowerCase() === cityCountryLower) {
            return CITY_DISTANCES[key];
        }
    }
    
    // Default distance for unknown cities
    return 2000;
}

// Calculate delivery time in days (simplified)
function calculateDeliveryTime(distance) {
    // Assume average speed of 500 km/day including loading/unloading
    return Math.ceil(distance / 500);
}

// Generate unique order ID
function generateOrderId() {
    return 'SHP-' + Date.now();
}

// Generate unique container ID
function generateContainerId(type) {
    const containers = getFromStorage(DATA_KEYS.CONTAINERS);
    const count = containers[type].length + 1;
    return `${type}-${count}`;
}

// Format currency
function formatCurrency(amount) {
    return '₺' + amount.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// Format weight
function formatWeight(weight) {
    return weight.toLocaleString('tr-TR') + ' kg';
}

// Check inventory availability
function checkInventory(category, quantity) {
    const inventory = getFromStorage(DATA_KEYS.INVENTORY);
    const item = inventory.find(i => i.category === category);
    
    if (!item) {
        return { available: false, message: 'Category not found in inventory' };
    }
    
    if (item.quantity <= 0) {
        return { 
            available: false, 
            message: `Out of stock! ${category} blueberries are currently unavailable. Please contact us for restocking.` 
        };
    }
    
    if (item.quantity < quantity) {
        return { 
            available: false, 
            message: `Insufficient stock. Available: ${item.quantity} kg, Requested: ${quantity} kg. Please reduce the quantity or choose another category.` 
        };
    }
    
    return { available: true, message: 'Stock available' };
}

// Update inventory
function updateInventory(category, quantity) {
    const inventory = getFromStorage(DATA_KEYS.INVENTORY);
    const item = inventory.find(i => i.category === category);
    
    if (item) {
        // Make sure we don't go below 0
        const newQuantity = item.quantity - quantity;
        item.quantity = Math.max(0, newQuantity);
        
        // Update status
        if (item.quantity <= 0) {
            item.status = 'Out of Stock';
        } else if (item.quantity < item.minStock) {
            item.status = 'Low';
        } else {
            item.status = 'OK';
        }
        
        saveToStorage(DATA_KEYS.INVENTORY, inventory);
    }
}

// Restock inventory
function restockInventory(category, quantity) {
    const inventory = getFromStorage(DATA_KEYS.INVENTORY);
    const item = inventory.find(i => i.category === category);
    
    if (item) {
        item.quantity += quantity;
        
        // Update status
        if (item.quantity < item.minStock) {
            item.status = 'Low';
        } else {
            item.status = 'OK';
        }
        
        saveToStorage(DATA_KEYS.INVENTORY, inventory);
    }
}

// Check container capacity
function checkContainerCapacity(type, weight) {
    const containerConfig = CONTAINER_TYPES[type];
    
    if (!containerConfig) {
        return { 
            available: false, 
            message: 'Invalid container type' 
        };
    }
    
    if (weight > containerConfig.capacity) {
        return { 
            available: false, 
            message: `There is no enough space in ${type} container. Maximum capacity: ${containerConfig.capacity} kg, Requested: ${weight} kg` 
        };
    }
    
    return { available: true, message: 'Capacity available' };
}

// Container Optimization Algorithm (First-Fit Decreasing)
function optimizeContainers() {
    const shipments = getFromStorage(DATA_KEYS.SHIPMENTS);
    const containers = {
        Small: [],
        Medium: [],
        Large: []
    };
    
    // Get pending shipments
    const pendingShipments = shipments.filter(s => s.status === 'Pending');
    
    // Sort by weight (largest first)
    pendingShipments.sort((a, b) => b.weight - a.weight);
    
    // Pack shipments into containers
    pendingShipments.forEach(shipment => {
        const type = shipment.containerType;
        let placed = false;
        
        // Try to fit into existing containers of the same type
        for (let container of containers[type]) {
            const remainingCapacity = CONTAINER_TYPES[type].capacity - container.currentLoad;
            
            if (shipment.weight <= remainingCapacity) {
                container.currentLoad += shipment.weight;
                container.shipments.push(shipment.id);
                shipment.containerId = container.id;
                
                // Mark as ready if container is sufficiently full (>80%)
                if (container.currentLoad >= CONTAINER_TYPES[type].capacity * 0.8) {
                    container.status = 'Ready for Transport';
                    shipment.status = 'Ready for Transport';
                }
                
                placed = true;
                break;
            }
        }
        
        // Create new container if not placed
        if (!placed) {
            const newContainer = {
                id: generateContainerId(type),
                type: type,
                capacity: CONTAINER_TYPES[type].capacity,
                currentLoad: shipment.weight,
                status: shipment.weight >= CONTAINER_TYPES[type].capacity * 0.8 ? 'Ready for Transport' : 'Loading',
                shipments: [shipment.id]
            };
            
            containers[type].push(newContainer);
            shipment.containerId = newContainer.id;
            
            if (newContainer.status === 'Ready for Transport') {
                shipment.status = 'Ready for Transport';
            }
        }
    });
    
    // Save updated data
    saveToStorage(DATA_KEYS.CONTAINERS, containers);
    saveToStorage(DATA_KEYS.SHIPMENTS, shipments);
    
    return containers;
}

// Calculate fleet expense
function calculateFleetExpense(vehicle, distance) {
    if (vehicle.type === 'Ship') {
        return (vehicle.fuelCostPerKm * distance) + vehicle.crewCost + vehicle.maintenance;
    } else {
        return (vehicle.fuelCostPerKm * distance) + vehicle.driverCost + vehicle.maintenance;
    }
}

// Calculate total fleet expenses
function calculateTotalFleetExpenses() {
    // For demonstration, calculate based on average usage
    const fleet = getFromStorage(DATA_KEYS.FLEET);
    let total = 0;
    
    // Assume each ship makes an average trip of 2000 km
    fleet.ships.forEach(ship => {
        total += (ship.fuelCostPerKm * 2000) + ship.crewCost + ship.maintenance;
    });
    
    // Assume each truck makes an average trip of 500 km
    fleet.trucks.forEach(truck => {
        total += (truck.fuelCostPerKm * 500) + truck.driverCost + truck.maintenance;
    });
    
    return total;
}

// Calculate financial summary
function calculateFinancialSummary() {
    const shipments = getFromStorage(DATA_KEYS.SHIPMENTS);
    const completedShipments = shipments.filter(s => s.status === 'Delivered');
    
    // Calculate revenue
    const totalRevenue = completedShipments.reduce((sum, s) => sum + s.totalPrice, 0);
    
    // Calculate fleet expenses
    const fleetExpenses = calculateTotalFleetExpenses();
    
    // Other expenses (fixed)
    const otherExpenses = 80000;
    
    // Total expenses
    const totalExpenses = fleetExpenses + otherExpenses;
    
    // Net income
    const netIncome = totalRevenue - totalExpenses;
    
    // Tax (20%)
    const tax = netIncome > 0 ? netIncome * 0.20 : 0;
    
    // Profit after tax
    const profitAfterTax = netIncome - tax;
    
    return {
        totalRevenue,
        fleetExpenses,
        otherExpenses,
        totalExpenses,
        netIncome,
        tax,
        profitAfterTax
    };
}

// Initialize data on page load
initializeData();
