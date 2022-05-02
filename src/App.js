import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, { useEffect, useState } from "react";
import { ethers } from "ethers"
import myEpicNft from "./utils/MyEpicNFT.json"

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = "0x4720401dB6d8D0981577427059d383a1C31171b9"

const App = () => {

  const [currentAccount, setCurrentAccount] = useState("")

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window

    if (!ethereum) {
      console.log("Make sure you have Metamask!")
    } else {
      console.log("We have the ethereum object", ethereum)
    }

    const accounts = await ethereum.request({ method: "eth_accounts" })

    if (accounts.length !== 0) {
      const account = accounts[0]
      console.log("Found an authorized account:", account)
      setCurrentAccount(account)
      setupEventListener()
      checkChain()
      checkTotal()
    } else {
      console.log("No authorized account found")
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        return alert("Get MetaMask!")
      }

      const accounts = await ethereum.request({method: 'eth_requestAccounts'})

      console.log("Connected", accounts[0])
      setCurrentAccount(accounts[0])
      setupEventListener()
    } catch (error) {
      console.log(error)
    }
  }

  const setupEventListener = async () => {
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer)

        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          console.log(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        })

        console.log("Setup event listener!")
      } else {
        console.log("Ethereum object doesn't exist")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMint = async () => {
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer)

        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await connectedContract.makeAnEpicNFT()

        console.log("Mining... plase wait")
        await nftTxn.wait()

        console.log("Mined, see transaction: https://rinkeby.etherscan.io/tx/" + nftTxn.hash)
      } else {
        console.log("Ethereum object doesn't exist")
      }
    } catch (error) {
      console.log(error)
    }
  }

  async function checkChain() {
    const { ethereum } = window

    let chainId = await ethereum.request({ method:  'eth_chainId'})
    console.log("Connected to chaind " + chainId)

    const rinkeyChaindId = "0x4"
    if (chainId !== rinkeyChaindId) {
      console.log("You are not connected to the Rinkeby Test Network!!")
    }
  }

  async function checkTotal() {
    const { ethereum } = window

    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer)
    let total = await connectedContract.getTotalNFTsMintedSoFar()
    console.log("NFT Total", total.toNumber())
  }

  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  const renderMintUI = () => (
    <button onClick={askContractToMint} className="cta-button connect-wallet-button">
      Mint NFT
    </button>
  )

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          { currentAccount === '' ? renderNotConnectedContainer() : renderMintUI()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
