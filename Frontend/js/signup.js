const signupForm = document.getElementById('signupForm');
const errorDiv = document.getElementById('error');
const BACKEND_URL = "https://restaurant-table-booking-app.onrender.com";
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch(`${BACKEND_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      errorDiv.textContent = data.message || 'Signup failed';
      return;
    }

    alert('Signup successful! You can now log in.');
    window.location.href = 'login.html';
  } catch (err) {
    errorDiv.textContent = 'Something went wrong. Please try again.';
  }
});
