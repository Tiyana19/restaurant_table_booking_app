// js/load-navbar.js
document.addEventListener("DOMContentLoaded", () => {
    fetch("navbar.html")
      .then(res => res.text())
      .then(html => {
        document.getElementById("navbarContainer").innerHTML = html;
  
        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
          logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("token");
            window.location.href = "login.html";
          });
        }
      })
      .catch(err => console.error("Failed to load navbar:", err));
  });
  