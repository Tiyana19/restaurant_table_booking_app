document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    const reservationList = document.getElementById("reservationList");
    const BACKEND_URL = 'https://restaurant-table-booking-app.onrender.com';
    if (!token) {
      reservationList.innerHTML = "<p>Please log in to view your reservations.</p>";
      return;
    }
  
    try {
      const res = await fetch(`${BACKEND_URL}/reservations`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        reservationList.innerHTML = `<p>${data.message || "Failed to load reservations."}</p>`;
        return;
      }
  
      if (data.length === 0) {
        reservationList.innerHTML = "<p>No reservations found.</p>";
        return;
      }
  
      data.forEach(reservation => {
        const div = document.createElement("div");
        div.classList.add("reservation-card");
        div.innerHTML = `
          <h4>${reservation.restaurant.name}</h4>
          <p><strong>Date:</strong> ${reservation.date}</p>
          <p><strong>Time:</strong> ${reservation.time}</p>
          <p><strong>Guests:</strong> ${reservation.numberOfGuests}</p>
          <button class="cancel-btn" data-id="${reservation.id}">Cancel</button>
        `;
        reservationList.appendChild(div);
      });
  
      document.querySelectorAll(".cancel-btn").forEach(button => {
        button.addEventListener("click", async () => {
          const bookingId = button.getAttribute("data-id");
  
          const confirmCancel = confirm("Are you sure you want to cancel this reservation?");
          if (!confirmCancel) return;
  
          const res = await fetch(`http://localhost:3000/reservations/${bookingId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
  
          if (res.ok) {
            alert("Reservation cancelled.");
            location.reload();
          } else {
            const err = await res.json();
            alert(err.message || "Failed to cancel reservation.");
          }
        });
      });
  
    } catch (err) {
      console.error("Error fetching reservations:", err);
      reservationList.innerHTML = "<p>Error loading reservations.</p>";
    }
  });
  