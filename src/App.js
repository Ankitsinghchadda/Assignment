import "./App.css";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "./abi";

function App() {
  const contractAddress = "0x70A6cC3A4FC7637c1d126049614cc4b3C761b088";
  const [number, setNumber] = useState(0);
  const [info, setInfo] = useState({
    StoredNumber: undefined,
    NumberOfUsers: undefined,
  });
  const connectingWithProvider = async (connectButton) => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
      } catch (error) {
        console.log(error);
      }
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      const account =
        accounts[0].slice(0, 6) +
        "...." +
        accounts[0].slice(accounts[0].length - 4);
      connectButton.innerHTML = account;

      console.log(account);
      if (provider.network.chainId !== 80001) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x13881",
              rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
              chainName: "Mumbai Testnet",
              nativeCurrency: {
                name: "MATIC",
                symbol: "MATIC",
                decimals: 18,
              },
              blockExplorerUrls: ["https://polygonscan.com/"],
            },
          ],
        });
      }
      localStorage.setItem("Connected", "Injected");
    }
  };

  const connect = async (e) => {
    const connectButton = e.target;
    if (typeof window.ethereum !== "undefined") {
      connectingWithProvider(connectButton);
    } else {
      connectButton.innerHTML = "Please install MetaMask";
    }
  };

  const update = async (e) => {
    if (e.target.innerHTML === "Updating....") {
      return;
    }
    console.log(number);
    if (typeof window.ethereum !== "undefined" && number !== "") {
      e.target.innerHTML = "Updating....";

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      try {
        const transactionResponse = await contract.updateNumber(
          ethers.utils.parseEther(number.toString())
        );
        await listenForTransactionMine(transactionResponse, provider);
        e.target.innerHTML = "Update";
      } catch (error) {
        console.log(error);
        e.target.innerHTML = "Update";
      }
    } else {
      number
        ? alert("Please connect to wallet")
        : alert("Enter a valid value in input section");
    }
  };

  const listenForTransactionMine = (transactionResponse, provider) => {
    console.log(`Mining ${transactionResponse.hash}`);
    return new Promise((resolve, reject) => {
      provider.once(transactionResponse.hash, (transactionReceipt) => {
        alert(
          `Completed with ${transactionReceipt.confirmations} confirmations. `
        );
        resolve();
      });
    });
  };

  const handleChange = (e) => {
    console.log(number);
    setNumber(e.target.value);
  };

  const getInfo = async () => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      try {
        const transactionResponse = await contract.getInfo();
        setInfo({
          StoredNumber: ethers.utils.formatEther(transactionResponse[0]),
          NumberOfUsers: parseInt(transactionResponse[1]).toString(),
        });
      } catch (e) {
        console.log(e);
      }
    } else {
      alert("Please connect to wallet");
    }
  };

  useEffect(() => {
    if (localStorage.getItem("Connected")) {
      const connectButton = document.getElementById("connect_btn");
      connectingWithProvider(connectButton);
    }
  }, []);
  return (
    <div className="App">
      <div className="navbar">
        <h1>UniFarm || Jr. Blockchain Developer || Assignment</h1>
        <button id="connect_btn" onClick={connect}>
          Connect
        </button>
      </div>

      <div className="mainSection">
        <h1>Functions To call:</h1>

        <div className="updateNumber">
          <label htmlFor="numberInput">
            1. Enter the number you want to store in Blockchain:
          </label>
          <input
            name="numberInput"
            type="number"
            min={0}
            value={number}
            onChange={handleChange}
          />
          <button className="updateButton" onClick={update}>
            Update
          </button>
        </div>

        <div className="getInfo">
          <label htmlFor="infoButton">
            2. Get the Number and Total number of Wallet entered the Smart
            contract:
          </label>
          <button className="getInfoButton" onClick={getInfo}>
            {" "}
            Get Info
          </button>

          <div className="details">
            {info.StoredNumber ? (
              <h1>Stored Number = {info.StoredNumber}</h1>
            ) : (
              <></>
            )}
            {info.NumberOfUsers ? (
              <h1>Number of Users = {info.NumberOfUsers}</h1>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
