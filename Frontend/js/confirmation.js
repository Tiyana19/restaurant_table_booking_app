document.addEventListener('DOMContentLoaded', () => {
    const confirmation = JSON.parse(localStorage.getItem('latestBooking'));
  
    const detailsEl = document.getElementById('confirmation-details');
  
    if (confirmation) {
      detailsEl.innerHTML = `
        <strong>Restaurant:</strong> ${confirmation.restaurantName}<br>
        <strong>Date:</strong> ${confirmation.date}<br>
        <strong>Time:</strong> ${confirmation.time}<br>
        <strong>Guests:</strong> ${confirmation.numberOfGuests}
      `;
    } else {
      detailsEl.textContent = 'No reservation details found.';
    }
  });
  