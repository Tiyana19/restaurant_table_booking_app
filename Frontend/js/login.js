const form = document.getElementById('loginForm');
const errorDiv = document.getElementById('error');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      errorDiv.textContent = data.message || 'Login failed';
      return;
    }

    localStorage.setItem('token', data.token);
    alert('Login successful!');
    window.location.href = 'restaurants.html';
  } catch (err) {
    errorDiv.textContent = 'Something went wrong. Please try again.';
  }
});
