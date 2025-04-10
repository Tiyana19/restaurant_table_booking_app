document.addEventListener("DOMContentLoaded", () => {
    const restaurantList = document.getElementById("restaurantList");
    const searchForm = document.getElementById("searchForm");
  
    
    fetchRestaurants();
  
  
    searchForm.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const name = document.getElementById("searchName").value;
      const location = document.getElementById("searchLocation").value;
      const cuisine = document.getElementById("searchCuisine").value;
  
      fetchRestaurants(name, location, cuisine);
    });
  
    async function fetchRestaurants(name = "", location = "", cuisine = "") {
      try {
        const query = new URLSearchParams({ name, location, cuisine });
        const res = await fetch(`/restaurants/search?${query}`);
        const data = await res.json();
  
        restaurantList.innerHTML = "";
  
        if (data.length === 0) {
          restaurantList.innerHTML = "<p>No restaurants found.</p>";
          return;
        }
  
        data.forEach((restaurant) => {
            const div = document.createElement("div");
            div.classList.add("restaurant-card");
            div.innerHTML = `
              <h3>${restaurant.name}</h3>
              <p><strong>Location:</strong> ${restaurant.location}</p>
              <p><strong>Cuisine:</strong> ${restaurant.cuisine}</p>
              <button class="book-btn">Book</button>
              <form class="booking-form hidden" data-restaurant-id="${restaurant.id}">
                <input type="date" class="booking-date" required />
                <input type="time" class="booking-time" required />
                <input type="number" class="booking-guests" placeholder="Guests" required min="1" />
                <button class="submit-booking">Submit</button>
              </form>
            `;
          
            restaurantList.appendChild(div);
          
            const bookBtn = div.querySelector(".book-btn");
            const form = div.querySelector(".booking-form");
            bookBtn.addEventListener("click", () => {
              form.classList.toggle("hidden");
            });
          
            
            form.addEventListener("submit", async (e) => {
              e.preventDefault();
          
              const token = localStorage.getItem("token");
              const restaurantId = form.getAttribute("data-restaurant-id");
              const date = form.querySelector(".booking-date").value;
              const time = form.querySelector(".booking-time").value;
              const numberOfGuests = form.querySelector(".booking-guests").value;
              const BACKEND_URL = "https://restaurant-table-booking-app.onrender.com";
              try {
                const res = await fetch(`${BACKEND_URL}/reserve`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ restaurantId, date, time, numberOfGuests }),
                });
          
                const result = await res.json();
          
                if (res.ok) {
                
                  localStorage.setItem("latestBooking", JSON.stringify({
                    restaurantName: restaurant.name,
                    date,
                    time,
                    numberOfGuests,
                  }));
          
                  window.location.href = "confirmation.html";
                } else {
                  alert(result.message || "Booking failed.");
                }
              } catch (err) {
                console.error("Booking error:", err);
                alert("An error occurred. Please try again.");
              }
            });
          });
          
      } catch (err) {
        console.error("Error fetching restaurants:", err);
        restaurantList.innerHTML = "<p>Error loading restaurants.</p>";
      }
    }
  });
  