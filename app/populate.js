import Voting from '../artifacts/contracts/Voting.sol/Voting';
import buildDecision from './decision.js';
import {address} from './__config.json';
import {ethers} from 'ethers';


const provider = new ethers.providers.Web3Provider(ethereum);
const contract = new ethers.Contract(address, Voting.abi, provider);

const decisions = [];
async function populateDecisions() {
  const count = await contract.decisionCount;
  for(let i = 0; i < count; i++) {
    decisions.push(await contract.decisions(i));
  }
  renderDecisions();
  listenForDecisions();
}
document.getElementById('populatedecisions').addEventListener("click", populateDecisions);


async function listenForDecisions() {
  const contract = new ethers.Contract(address, Voting.abi, provider);
  contract.on("DecisionCreated", async (id) => {
    if(!decisions[id]) {
      const decision = await contract.decisions(id);
      decisions.push(decision);
      renderDecisions();
    }
  });
  contract.on("VoteCast", async (id) => {
    const decision = await contract.decisions(id);
    decisions[id] = decision;
    renderDecisions();
  });
}
function renderDecisions() {
  const paragraph = document.getElementById("displaydecisions");
  paragraph.innerHTML = decisions.map(decision => buildDecision({decision})).join("");
  decisions.forEach((decision, id) => {
    addListeners(id);
  });
}


function addListeners(id) {
  document.getElementById(`yes-${id}`).addEventListener("click", async () => {
    const signer = provider.getSigner();
    await ethereum.request({ method: 'eth_requestAccounts' });
    await contract.connect(signer).castVote(id, true);
  });
  document.getElementById(`no-${id}`).addEventListener("click", async () => {
    const signer = provider.getSigner();
    await ethereum.request({ method: 'eth_requestAccounts' });
    await contract.connect(signer).castVote(id, false);
  });
}

