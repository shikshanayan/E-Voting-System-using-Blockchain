const mainPage = document.getElementById('mainPage');
const registration = document.getElementById('registration');
const login = document.getElementById('login');
const blockchainPage = document.getElementById('blockchain');

// Show Registration Form
document.getElementById('goToRegistration').addEventListener('click', () => {
  mainPage.classList.add('hidden');
  registration.classList.remove('hidden');
});

// Show Login Form
document.getElementById('goToLogin').addEventListener('click', () => {
  mainPage.classList.add('hidden');
  login.classList.remove('hidden');
});

// Show Blockchain Viewer
document.getElementById('goToBlockchain').addEventListener('click', () => {
  mainPage.classList.add('hidden');
  blockchainPage.classList.remove('hidden');

  // Populate Blockchain Data
  const blockchain = JSON.parse(localStorage.getItem('blockchain')) || [];
  const container = document.getElementById('blockchainData');
  container.innerHTML = ''; // Clear previous content

  if (blockchain.length === 0) {
    container.innerHTML = '<p>No data in the blockchain.</p>';
  } else {
    blockchain.forEach((block, index) => {
      const blockElement = document.createElement('div');
      blockElement.innerHTML = `
        <h3>Block ${index + 1}</h3>
        <p><strong>Name:</strong> ${block.name}</p>
        <p><strong>Voter ID:</strong> ${block.voterId}</p>
        <p><strong>Aadhaar ID:</strong> ${block.aadhaarId}</p>
        <p><strong>Passkey:</strong> ${block.passkey}</p>
        <p><strong>Phone:</strong> ${block.phone}</p>
        <p><strong>Timestamp:</strong> ${block.timestamp}</p>
      `;
      blockElement.style.border = '1px solid #ddd';
      blockElement.style.margin = '10px 0';
      blockElement.style.padding = '10px';
      container.appendChild(blockElement);
    });
  }
});

// Back Button Logic
document.querySelectorAll('.back-btn').forEach((button) => {
  button.addEventListener('click', () => {
    registration.classList.add('hidden');
    login.classList.add('hidden');
    blockchainPage.classList.add('hidden');
    mainPage.classList.remove('hidden');
  });
});

// Reset Blockchain
document.getElementById('resetBlockchain').addEventListener('click', () => {
  const previousBlockchain = JSON.parse(localStorage.getItem('blockchain')) || [];

  if (previousBlockchain.length === 0) {
    alert('Blockchain is already empty!');
    return;   
  }
  // Backup the previous blockchain data (optional)
  localStorage.setItem('previousBlockchain', JSON.stringify(previousBlockchain));

  // Clear the blockchain data from localStorage
  localStorage.removeItem('blockchain');
  localStorage.removeItem('currentUser'); // Optional: Clears logged-in user

  // Clear the blockchain data from the page
  const container = document.getElementById('blockchainData');
  container.innerHTML = '<p>No data in the blockchain.</p>';

  alert('Blockchain has been reset! You can start adding new blocks.');

  // Optional: Refresh the page to reset the application state
  location.reload();

});
