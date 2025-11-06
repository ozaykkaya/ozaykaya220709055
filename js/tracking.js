// Tracking form handler
document.getElementById('trackingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const orderId = document.getElementById('orderId').value.trim();
    const shipments = getFromStorage(DATA_KEYS.SHIPMENTS) || [];
    const shipment = shipments.find(s => s.id === orderId);
    
    const trackingResult = document.getElementById('trackingResult');
    const notFound = document.getElementById('notFound');
    
    if (!shipment) {
        trackingResult.style.display = 'none';
        notFound.style.display = 'block';
        return;
    }
    
    // Display shipment information
    notFound.style.display = 'none';
    trackingResult.style.display = 'block';
    
    document.getElementById('resultOrderId').textContent = shipment.id;
    document.getElementById('resultCustomerName').textContent = shipment.customerName;
    document.getElementById('resultProduct').textContent = `${shipment.productName} (${shipment.category})`;
    document.getElementById('resultWeight').textContent = formatWeight(shipment.weight);
    document.getElementById('resultDestination').textContent = `${shipment.destinationCity}, ${shipment.destinationCountry}`;
    document.getElementById('resultContainer').textContent = shipment.containerId || 'Not assigned yet';
    
    // Display status with badge
    const statusBadges = {
        'Pending': 'status-pending',
        'Ready for Transport': 'status-ready',
        'In Transit': 'status-transit',
        'Delivered': 'status-delivered'
    };
    
    const statusClass = statusBadges[shipment.status] || 'status-pending';
    document.getElementById('resultStatus').innerHTML = `<span class="status-badge ${statusClass}">${shipment.status}</span>`;
    
    document.getElementById('resultPrice').textContent = formatCurrency(shipment.totalPrice);
    document.getElementById('resultDelivery').textContent = shipment.deliveryTime + ' days from dispatch';
    
    // Display timeline
    displayTimeline(shipment);
});

function displayTimeline(shipment) {
    const timeline = document.getElementById('timeline');
    const statuses = ['Pending', 'Ready for Transport', 'In Transit', 'Delivered'];
    const currentIndex = statuses.indexOf(shipment.status);
    
    let timelineHTML = '<div style="padding: 1rem 0;">';
    
    statuses.forEach((status, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        
        timelineHTML += `
            <div style="display: flex; align-items: center; margin-bottom: 1.5rem; ${!isCompleted ? 'opacity: 0.4;' : ''}">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: ${isCompleted ? 'linear-gradient(135deg, var(--secondary-blue), var(--accent-blue))' : 'var(--border-color)'}; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 1rem;">
                    ${isCompleted ? '✓' : index + 1}
                </div>
                <div>
                    <div style="font-weight: 600; color: ${isCompleted ? 'var(--primary-blue)' : 'var(--text-light)'};">
                        ${status}
                        ${isCurrent ? ' <span style="color: var(--success);">(Current)</span>' : ''}
                    </div>
                    <div style="font-size: 0.9rem; color: var(--text-light);">
                        ${getStatusDescription(status)}
                    </div>
                </div>
            </div>
        `;
        
        // Add connector line except for last item
        if (index < statuses.length - 1) {
            timelineHTML += `
                <div style="width: 2px; height: 20px; background: ${isCompleted ? 'var(--secondary-blue)' : 'var(--border-color)'}; margin-left: 20px; margin-bottom: 0.5rem;"></div>
            `;
        }
    });
    
    timelineHTML += '</div>';
    timeline.innerHTML = timelineHTML;
}

function getStatusDescription(status) {
    const descriptions = {
        'Pending': 'Shipment request received and awaiting container assignment',
        'Ready for Transport': 'Packed in container and ready for pickup',
        'In Transit': 'Currently being transported to destination',
        'Delivered': 'Successfully delivered to destination'
    };
    return descriptions[status] || '';
}
