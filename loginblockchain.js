async function hashData(data) {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}


async function calculateMerkleRoot(hashes) {
  if (hashes.length === 0) return null;
  if (hashes.length === 1) return hashes[0];

  let newLevel = [];
  for (let i = 0; i < hashes.length; i += 2) {
    const left = hashes[i];
    const right = i + 1 < hashes.length ? hashes[i + 1] : hashes[i];
    const combinedHash = await hashData(left + right);
    newLevel.push(combinedHash);
  }
  return calculateMerkleRoot(newLevel);
}



document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const loginVoterId = document.getElementById('loginVoterId').value.trim();
  const loginPasskey = document.getElementById('loginPasskey').value.trim();

  const blockchain = JSON.parse(localStorage.getItem('blockchain')) || [];

  const userBlock = blockchain.find((block) => block.voterId === loginVoterId);

  if (!userBlock) {
    alert('Invalid Voter ID or Passkey.');
    return;
  }

  if(userBlock.passkey != loginPasskey){
    alert('Invalid Voter ID or Passkey.');
    return;
  }

  const fieldHashes = [
    await hashData(userBlock.name),
    await hashData(loginVoterId),
    await hashData(userBlock.aadhaarId),
    await hashData(userBlock.phone),
    await hashData(loginPasskey),
  ];

  const calculatedMerkleRoot = await calculateMerkleRoot(fieldHashes);
    console.log('Login Voter ID:', loginVoterId);
    console.log('Login Passkey:', loginPasskey);
    console.log('Stored Voter ID:', userBlock.voterId);
    console.log('Stored Passkey:', userBlock.passkey);
    console.log('Stored Merkle Root:', userBlock.merkleRoot);
    console.log('Calculated Merkle Root:', calculatedMerkleRoot);

  if (userBlock.merkleRoot !== calculatedMerkleRoot) {
  alert('Invalid Voter ID or Passkey.');
  return;
  }


  alert(`Login successful! Welcome, ${userBlock.name}`);

  localStorage.setItem('currentUser', JSON.stringify({
    voterId: userBlock.voterId,
    merkleRoot: userBlock.merkleRoot, 
    name: userBlock.name,
    timestamp : Date.now()
  }));

  const currentUser = localStorage.getItem('currentUser');

// Parse the JSON string back into a JavaScript object
const userObject = JSON.parse(currentUser);

// Log the object to the console
console.log(userObject);

  window.location.href = 'index.html';
});



