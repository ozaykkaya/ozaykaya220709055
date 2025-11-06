// Shipment form handler
document.getElementById('shipmentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const alertContainer = document.getElementById('alertContainer');
    alertContainer.innerHTML = '';
    
    // Get destination and split into city and country
    const destinationFull = document.getElementById('destination').value;
    const [destinationCity, destinationCountry] = destinationFull.split(', ');
    
    // Get form data
    const formData = {
        customerName: document.getElementById('customerName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        productName: document.getElementById('productName').value,
        category: document.getElementById('category').value,
        weight: parseInt(document.getElementById('weight').value),
        containerType: document.getElementById('containerType').value,
        destinationCity: destinationCity,
        destinationCountry: destinationCountry,
        notes: document.getElementById('notes').value
    };
    
    // Validate inventory
    const inventoryCheck = checkInventory(formData.category, formData.weight);
    if (!inventoryCheck.available) {
        showAlert(inventoryCheck.message, 'error');
        return;
    }
    
    // Validate container capacity
    const capacityCheck = checkContainerCapacity(formData.containerType, formData.weight);
    if (!capacityCheck.available) {
        showAlert(capacityCheck.message, 'warning');
        return;
    }
    
    // Calculate distance using the full destination string
    const distance = calculateDistance(destinationFull);
    
    // Calculate price
    const ratePerKm = CONTAINER_TYPES[formData.containerType].ratePerKm;
    const totalPrice = distance * ratePerKm;
    
    // Calculate delivery time
    const deliveryTime = calculateDeliveryTime(distance);
    
    // Create shipment object
    const shipment = {
        id: generateOrderId(),
        ...formData,
        distance: distance,
        ratePerKm: ratePerKm,
        totalPrice: totalPrice,
        deliveryTime: deliveryTime,
        status: 'Pending',
        containerId: null,
        createdAt: new Date().toISOString()
    };
    
    // Update inventory
    updateInventory(formData.category, formData.weight);
    
    // Save shipment
    const shipments = getFromStorage(DATA_KEYS.SHIPMENTS) || [];
    shipments.push(shipment);
    saveToStorage(DATA_KEYS.SHIPMENTS, shipments);
    
    // Store current shipment for result page
    sessionStorage.setItem('currentShipment', JSON.stringify(shipment));
    
    // Redirect to result page
    window.location.href = 'result.html';
});

// Auto-select container type based on weight
document.getElementById('weight').addEventListener('input', function() {
    const weight = parseInt(this.value) || 0;
    const containerSelect = document.getElementById('containerType');
    
    if (weight > 0) {
        if (weight <= 2000) {
            containerSelect.value = 'Small';
        } else if (weight <= 5000) {
            containerSelect.value = 'Medium';
        } else if (weight <= 10000) {
            containerSelect.value = 'Large';
        } else {
            // Weight exceeds all container capacities
            containerSelect.value = '';
            showAlert('Weight exceeds maximum container capacity (10,000 kg). Please split into multiple shipments.', 'warning');
        }
    }
});

function showAlert(message, type) {
    const alertContainer = document.getElementById('alertContainer');
    const alertClass = type === 'error' ? 'alert-error' : type === 'warning' ? 'alert-warning' : 'alert-info';
    
    alertContainer.innerHTML = `
        <div class="alert ${alertClass}">
            <strong>${type === 'error' ? '❌ Error:' : type === 'warning' ? '⚠️ Warning:' : 'ℹ️ Info:'}</strong> ${message}
        </div>
    `;
}
