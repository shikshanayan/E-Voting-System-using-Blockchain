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

async function calculateBlockHash(block) {
  const blockString = JSON.stringify(block);
  return await hashData(blockString);
}


const blockchain = JSON.parse(localStorage.getItem('blockchain')) || [];

// Handle Registration
document.getElementById('registrationForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const voterId = document.getElementById('voterId').value.trim();
  const aadhaarId = document.getElementById('aadhaarId').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const passkey = document.getElementById('passkey').value.trim();

  // Check if all fields are filled
  if (!name || !voterId || !aadhaarId || !phone || !passkey) {
    alert('All fields must be filled!');
    return;
  }

  // Prevent duplicate registrations
  const isDuplicate = blockchain.some(
    (block) =>
      block.voterId === voterId || block.aadhaarId === aadhaarId || block.phone === phone
  );
  if (isDuplicate) {
    alert('A user with the same Voter ID, Aadhaar ID, or Phone Number already exists!');
    return;
  }

  const fieldHashes = [
    await hashData(name),
    await hashData(voterId),
    await hashData(aadhaarId),
    await hashData(phone),
    await hashData(passkey),
  ];


  // Calculate Merkle Root
  const merkleRoot = await calculateMerkleRoot(fieldHashes);


  // Add to Blockchain
  const block = {
    name,
    voterId,
    aadhaarId,
    phone,
    passkey, // Store passkey as plain text
    merkleRoot,
    timestamp: new Date().toISOString(),
  };

  blockchain.push(block);

  // Save to localStorage
  localStorage.setItem('blockchain', JSON.stringify(blockchain));

  alert(`Registration successful! Merkle Root: ${merkleRoot}`);
  document.getElementById('registrationForm').reset();
});

async function calculateMerkleRoot(name, voterId, aadhaarId, phone, passkey) {
  const input = `${voterId}${passkey}${aadhaarId}${phone}${name}`;
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}
