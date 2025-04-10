document.addEventListener("DOMContentLoaded", async () => {
    const historyContainer = document.getElementById("reservationHistory");
    const token = localStorage.getItem("token");
    const BACKEND_URL = 'https://restaurant-table-booking-app.onrender.com';

    if (!token) {
      historyContainer.innerHTML = "<p>Please log in to view your reservations.</p>";
      return;
    }
  
    try {
      const res = await fetch(`${BACKEND_URL}/my-reservations`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      const reservations = await res.json();
  
      if (reservations.length === 0) {
        historyContainer.innerHTML = "<p>No reservations found.</p>";
        return;
      }
  
      reservations.forEach((r) => {
        const div = document.createElement("div");
        div.classList.add("reservation-card");
        div.innerHTML = `
          <h3>${r.restaurant.name}</h3>
          <p><strong>Date:</strong> ${r.date}</p>
          <p><strong>Time:</strong> ${r.time}</p>
          <p><strong>Guests:</strong> ${r.numberOfGuests}</p>
          <p><strong>Location:</strong> ${r.restaurant.location}</p>
          <p><strong>Cuisine:</strong> ${r.restaurant.cuisine}</p>
        `;
        historyContainer.appendChild(div);
      });
    } catch (err) {
      console.error("Failed to load reservations:", err);
      historyContainer.innerHTML = "<p>Could not load reservations.</p>";
    }
  });
  