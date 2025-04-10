// js/booking.js

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("book-btn")) {
      const form = e.target.nextElementSibling;
      form.classList.toggle("hidden");
    }
  
    if (e.target.classList.contains("submit-booking")) {
      e.preventDefault();
  
      const form = e.target.closest("form");
      const restaurantId = form.dataset.restaurantId;
      const date = form.querySelector(".booking-date").value;
      const time = form.querySelector(".booking-time").value;
      const guests = form.querySelector(".booking-guests").value;
  
      fetch("/reserve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"), // assuming token is stored
        },
        body: JSON.stringify({ restaurantId: Number(restaurantId), date, time, numberOfGuests: Number(guests) }),
      })
        .then((res) => res.json())
        .then((data) => {
          alert(data.message || "Booking complete!");
          form.reset();
          form.classList.add("hidden");
        })
        .catch((err) => {
          console.error("Booking error:", err);
          alert("Something went wrong.");
        });
    }
  });
  