// js/restaurant-list.js

document.addEventListener("DOMContentLoaded", () => {
    const restaurantList = document.getElementById("restaurantList");
    const searchForm = document.getElementById("searchForm");
  
    // Load all restaurants on page load
    fetchRestaurants();
  
    // Search handler
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
          
            // Show booking form when 'Book' button is clicked
            const bookBtn = div.querySelector(".book-btn");
            const form = div.querySelector(".booking-form");
            bookBtn.addEventListener("click", () => {
              form.classList.toggle("hidden");
            });
          
            // Handle booking form submission
            form.addEventListener("submit", async (e) => {
              e.preventDefault();
          
              const token = localStorage.getItem("token");
              const restaurantId = form.getAttribute("data-restaurant-id");
              const date = form.querySelector(".booking-date").value;
              const time = form.querySelector(".booking-time").value;
              const numberOfGuests = form.querySelector(".booking-guests").value;
          
              try {
                const res = await fetch("http://localhost:3000/reserve", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ restaurantId, date, time, numberOfGuests }),
                });
          
                const result = await res.json();
          
                if (res.ok) {
                  // ✅ Save to localStorage and redirect to confirmation
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
  