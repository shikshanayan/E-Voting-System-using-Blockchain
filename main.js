import { Block, Blockchain } from './blockchain.js';


// Instantiate blockchains for each candidate
let candidate1 = new Blockchain();
let candidate2 = new Blockchain();
let candidate3 = new Blockchain();
let usedVoterIds = new Set(JSON.parse(localStorage.getItem('usedVoterIds')) || []);


// Function to handle voting
function loadVotingChains() {
    const savedCandidate1Chain = JSON.parse(localStorage.getItem('candidate1Chain'));
    const savedCandidate2Chain = JSON.parse(localStorage.getItem('candidate2Chain'));
    const savedCandidate3Chain = JSON.parse(localStorage.getItem('candidate3Chain'));

    if (savedCandidate1Chain) candidate1.chain = savedCandidate1Chain;
    if (savedCandidate2Chain) candidate2.chain = savedCandidate2Chain;
    if (savedCandidate3Chain) candidate3.chain = savedCandidate3Chain;

    console.log("Voting chains loaded from localStorage.");
}

// Call this function when the program starts
loadVotingChains();


async function castVote() {
    const candidateSelect = document.getElementById('candidateSelect');
    const selectedCandidate = candidateSelect.value;


    // Retrieve the logged-in user information from localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // Validate logged-in user and voter ID
    if (!currentUser || !currentUser.voterId) {
        alert('No user logged in or invalid Voter ID. Please log in first.');
        return;
    }

    const voterId = currentUser.voterId; // Automatically get the voter ID from the logged-in user
    //const merkleRoot = currentUser.merkleRoot;

    // Validate candidate selection
    if (selectedCandidate === "select") {
        alert("Please select a candidate from the dropdown.");
        return;
    }

    // Check if voter ID has already voted
    if (usedVoterIds.has(voterId)) {
        alert("This Voter ID has already been used to vote. Voting again is not allowed.");
        return;
    }

    try {
        // Determine which blockchain to add the vote to
        const timestamp = new Date().toLocaleString();
        let targetBlockchain;

        switch (selectedCandidate) {
            case "Candidate 1":
                targetBlockchain = candidate1;
                break;
            case "Candidate 2":
                targetBlockchain = candidate2;
                break;
            case "Candidate 3":
                targetBlockchain = candidate3;
                break;
            default:
                alert("Invalid candidate selected.");
                return;
        }

        // Add a new block to the selected candidate's blockchain
        const previousHash = targetBlockchain.getLatestBlock()?.hash || '0';
        
        // Get merkleRoot from currentUser
        const merkleRoot = currentUser.merkleRoot;
        if (!merkleRoot) {
            throw new Error('Merkle root not found for current user');
        }

        const newBlock = new Block(
            targetBlockchain.chain.length,
            timestamp, // Pass merkleRoot here
            selectedCandidate,
            merkleRoot,
            previousHash
        );

        console.log("merkleroot",merkleRoot);

        await targetBlockchain.addBlock(newBlock);
        usedVoterIds.add(voterId);
        localStorage.setItem('usedVoterIds', JSON.stringify([...usedVoterIds]));


        localStorage.setItem('candidate1Chain', JSON.stringify(candidate1.chain));
        localStorage.setItem('candidate2Chain', JSON.stringify(candidate2.chain));
        localStorage.setItem('candidate3Chain', JSON.stringify(candidate3.chain));

        // Update result summary table
        updateResultSummary();

        console.log("New Block Created:", newBlock);
        console.log("Blockchain After Adding Block:", targetBlockchain.chain);

        // Alert user about successful voting
        alert("Vote cast successfully!");

        // Reset candidate selection
        candidateSelect.value = 'select';

    } catch (error) {
        console.error('Error casting vote:', error);
        alert('An error occurred while casting your vote. Please try again.');
    }
}

// Function to update the result summary table
function updateResultSummary() {
    const candidate1Votes = candidate1.chain.length - 1; // Exclude genesis block
    const candidate2Votes = candidate2.chain.length - 1; // Exclude genesis block
    const candidate3Votes = candidate3.chain.length - 1; // Exclude genesis block

    // Update the table cells
    document.getElementById("candidate1Votes").innerText = candidate1Votes;
    document.getElementById("candidate2Votes").innerText = candidate2Votes;
    document.getElementById("candidate3Votes").innerText = candidate3Votes;
}

// Function to view the blockchain
function viewBlockchain() {
    const blockchainContainer = document.getElementById('blockchainContainer');

    const candidates = [
        { name: "Candidate 1", blockchain: candidate1 },
        { name: "Candidate 2", blockchain: candidate2 },
        { name: "Candidate 3", blockchain: candidate3 },
    ];

    blockchainContainer.innerHTML = ''; 

    candidates.forEach(candidate => {
        const div = document.createElement('div');
        div.classList.add('mb-4');

        const heading = document.createElement('h3');
        heading.classList.add('font-bold', 'text-gray-700', 'mb-2');
        heading.innerText = `${candidate.name}'s Blockchain`;

        const pre = document.createElement('pre');
        pre.classList.add('bg-white', 'p-4', 'rounded-lg', 'shadow');
        pre.innerText = candidate.blockchain.chain
            .map(block => ({
                Index: block.index,
                Timestamp: block.timestamp,
                Candidate: block.data.candidate,
                MerkleRoot: block.merkleRoot,
                PreviousHash: block.previousHash,
                Hash: block.hash,
            }))
            .map(JSON.stringify)
            .join('\n');

        div.appendChild(heading);
        div.appendChild(pre);
        blockchainContainer.appendChild(div);
        blockchainContainer.scrollIntoView({ behavior: 'smooth' });
    });
}



// Attach event listeners
document.addEventListener('DOMContentLoaded', () => {
    const voteButton = document.getElementById('voteButton');
    if (voteButton) {
        voteButton.addEventListener('click', () => {
            castVote().catch(error => {
                console.error('Error in castVote:', error);
                alert('An error occurred while casting your vote. Please try again.');
            });
        });
    } else {
        console.error('Vote button not found!');
    }

    const viewChainButton = document.getElementById('viewChainButton');
    if (viewChainButton) {
        viewChainButton.addEventListener('click', viewBlockchain);
        
    } else {
        console.error('View Chain button not found!');
    }

    // Automatically fill voter ID and disable the field
    const voterIdInput = document.getElementById('voterIdInput');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && voterIdInput) {
        voterIdInput.value = currentUser.voterId;
        voterIdInput.disabled = true; // Prevent manual editing
    }
    updateResultSummary(); // Initialize the vote counts on page load
});



// to clear the blockchain
function clearVotingChains() {
    localStorage.removeItem('candidate1Chain');
    localStorage.removeItem('candidate2Chain');
    localStorage.removeItem('candidate3Chain');

    localStorage.removeItem('usedVoterIds');
    usedVoterIds = new Set();
    // Reinitialize the chains
    candidate1.chain = [candidate1.createGenesisBlock()];
    candidate2.chain = [candidate2.createGenesisBlock()];
    candidate3.chain = [candidate3.createGenesisBlock()];

    alert('All voting chains have been cleared!');
    location.reload(); // Refresh the page to reflect the cleared state
}

// Attach clear functionality to a button
document.getElementById('clearVotingChainsButton').addEventListener('click', clearVotingChains);


document.getElementById('backButton').addEventListener('click', () => {
    // Redirect to the desired page (e.g., registration page)
    window.location.href = 'registration+login.html'; // Change the path to your registration page
});
