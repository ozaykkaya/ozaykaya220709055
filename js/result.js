// Display shipment result
window.addEventListener('DOMContentLoaded', function() {
    const shipmentData = sessionStorage.getItem('currentShipment');
    
    if (!shipmentData) {
        // If no shipment data, redirect to create shipment page
        window.location.href = 'create-shipment.html';
        return;
    }
    
    const shipment = JSON.parse(shipmentData);
    
    // Display shipment information
    document.getElementById('orderId').textContent = shipment.id;
    document.getElementById('customerName').textContent = shipment.customerName;
    document.getElementById('productInfo').textContent = `${shipment.productName} (${shipment.category})`;
    document.getElementById('weight').textContent = formatWeight(shipment.weight);
    document.getElementById('containerType').textContent = shipment.containerType;
    document.getElementById('destination').textContent = `${shipment.destinationCity}, ${shipment.destinationCountry}`;
    
    // Display price and delivery details
    document.getElementById('distance').textContent = shipment.distance.toLocaleString() + ' km';
    document.getElementById('rate').textContent = formatCurrency(shipment.ratePerKm) + ' per km';
    document.getElementById('deliveryTime').textContent = shipment.deliveryTime + ' days';
    document.getElementById('totalPrice').textContent = formatCurrency(shipment.totalPrice);
    
    // Clear session storage
    sessionStorage.removeItem('currentShipment');
});
