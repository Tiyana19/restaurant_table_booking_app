// js/profile.js

document.addEventListener("DOMContentLoaded", () => {
    const userInfo = document.getElementById("userInfo");
    const updateForm = document.getElementById("updateProfileForm");
    const deleteBtn = document.getElementById("deleteAccountBtn");
  
    const token = localStorage.getItem("token");
  
    // Fetch current user info
    fetch("http://localhost:3000/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((user) => {
        userInfo.innerHTML = `
          <p><strong>Name:</strong> ${user.name}</p>
          <p><strong>Email:</strong> ${user.email}</p>
        `;
      });
  
    // Update user info
    updateForm.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const newName = document.getElementById("newName").value;
      const newPassword = document.getElementById("newPassword").value;
  
      const res = await fetch("http://localhost:3000/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName, password: newPassword }),
      });
  
      const data = await res.json();
      if (res.ok) {
        alert("Profile updated!");
        location.reload();
      } else {
        alert(data.message || "Update failed");
      }
    });
  
    // Delete account
    deleteBtn.addEventListener("click", async () => {
      if (!confirm("Are you sure you want to delete your account?")) return;
  
      const res = await fetch("http://localhost:3000/me", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (res.ok) {
        alert("Account deleted");
        localStorage.removeItem("token");
        window.location.href = "signup.html";
      } else {
        alert("Error deleting account");
      }
    });
  });
  