import Head from 'next/head'
import { useEffect, useState } from 'react'
import NFTMap from '../components/NFTMap'
import Web3Modal from "web3modal"
import Web3 from 'web3'
import { CHAIN_ID, SITE_ERROR, SMARTCONTRACT_ABI, SMARTCONTRACT_ABI_ERC20, SMARTCONTRACT_ADDRESS, SMARTCONTRACT_ADDRESS_ERC20 } from '../../config'
import { ethers, providers } from 'ethers'
import Sidebar from '../components/Sidebar'
import MainContent from '../components/MainContent'
import Header from '../components/Header'
import Moralis from 'moralis'
import MobileFooter from '../components/MobileFooter'
import { errorAlert, errorAlertCenter } from '../components/toastGroup'
import { providerOptions } from '../hook/connectWallet'
import { checkNetwork } from '../hook/ethereum'

export default function NFTLIST({
  startLoading,
  closeLoading,
  headerAlert,
  closeAlert,
  ...props
}) {

  let stakedNfts = []
  const [filterState, setFilterState] = useState(2)
  const [stakedList, setStakedList] = useState([])
  const [unStakedList, setUnstakedList] = useState([])
  const [checkAble, setCheckAble] = useState(false)
  const [connected, setConnected] = useState(false)
  const [signerAddress, setSignerAddress] = useState("")
  const [currentSigner, setCurrentSigner] = useState()
  const [signerBalance, setSignerBalance] = useState(0)
  const [loading, setLoading] = useState(false)

  const connectWallet = async () => {
    setLoading(true)
    if (await checkNetwork()) {
      const web3Modal = new Web3Modal({
        network: 'mainnet', // optional
        cacheProvider: true,
        providerOptions, // required
      })
      const provider = await web3Modal.connect()
      const web3Provider = new providers.Web3Provider(provider)
      const signer = web3Provider.getSigner()
      setCurrentSigner(signer)
      const address = await signer.getAddress()

      setConnected(true)
      setSignerAddress(address)

      const contract_20 = new ethers.Contract(
        SMARTCONTRACT_ADDRESS_ERC20,
        SMARTCONTRACT_ABI_ERC20,
        signer
      )
      const bal = await contract_20.balanceOf(address)
      setSignerBalance(ethers.utils.formatEther(bal))
      setLoading(false)
      provider.on("accountsChanged", (accounts) => {
        setSignerAddress(accounts[0])
      });
      provider.on("chainChanged", (chainId) => {
        window.location.reload()
      });
    }
  }

  const setPastNFTs = async () => {
    startLoading()
    const web3 = new Web3(Web3.givenProvider)
    const accounts = await web3.eth.getAccounts()

    const web3Modal = new Web3Modal({
      network: 'mainnet', // optional
      cacheProvider: true,
      providerOptions, // required
    })
    const provider = await web3Modal.connect()
    const web3Provider = new providers.Web3Provider(provider)
    const signer = web3Provider.getSigner()
    const contract = new ethers.Contract(
      SMARTCONTRACT_ADDRESS,
      SMARTCONTRACT_ABI,
      signer
    )
    stakedNfts = []
    const userNFTs = await Moralis.Web3API.account.getNFTs({ chain: 'bsc testnet', address: accounts[0] })
    if (userNFTs.total !== 0) {
      startLoading()
      for (var i = 0; i < userNFTs.result.length; i++) {
        if (userNFTs.result[i].name !== "MoM") {
          const nftDump = await contract.status(accounts[0], userNFTs.result[i].token_address, userNFTs.result[i].token_id)
          console.log(nftDump.action, nftDump.stakedTime.toString())
          stakedNfts.push({
            cid: -1,
            name: userNFTs.result[i].name,
            action: nftDump.action,
            token_address: userNFTs.result[i].token_address,
            token_id: userNFTs.result[i].token_id,
            reward: nftDump.reward,
            timestamp: nftDump.stakedTime.toString(),
            percent: nftDump.percent,
            token_uri: userNFTs.result[i].token_uri,
          })
        }
      }
      closeLoading()
      setUnstakedList(stakedNfts)
    } else {
      closeLoading()
    }
  }

  const getNFTLIST = () => {
    startLoading()
    setPastNFTs()
    // setStakedNFTs()
  }

  useEffect(() => {
    async function fetchData() {
      if (typeof window.ethereum !== 'undefined') {
        if (await checkNetwork("no-alert")) {
          connectWallet()
          getNFTLIST()
          ethereum.on('accountsChanged', function (accounts) {
            window.location.reload()
          })
          if (ethereum.selectedAddress !== null) {
            setSignerAddress(ethereum.selectedAddress)
            setConnected(true)
          }
          ethereum.on('chainChanged', (chainId) => {
            if (parseInt(chainId) === CHAIN_ID) {
              connectWallet()
            } else {
              setConnected(false)
              errorAlert(SITE_ERROR[0])
            }
          })
        }
      } else {
        errorAlertCenter(SITE_ERROR[1])
      }
    }
    fetchData();
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <Header
        signerAddress={signerAddress}
        connectWallet={connectWallet}
        connected={connected}
        signerBalance={signerBalance}
        loading={loading}
        headerAlert={headerAlert}
        closeAlert={closeAlert}
      />
      <MainContent>
        <Sidebar
          connected={connected}
          headerAlert={headerAlert}
        />
        <div className='page-content'>
          <Head>
            <title>Dusty Vaults | NFTs List</title>
            <meta name="description" content="NFT Bank" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <NFTMap
            address={signerAddress}
            signer={currentSigner}
            setForce={(e) => setForceRender(e)}
            filterState={filterState}
            setFilterState={(e) => setFilterState(e)}
            checkAble={checkAble}
            setCheckAble={(e) => setCheckAble(e)}
            getNFTLIST={() => getNFTLIST()}
            stakedList={stakedList}
            unStakedList={unStakedList}
            startLoading={startLoading}
            closeLoading={closeLoading}
            headerAlert={headerAlert}
            balance={signerBalance}
          />
        </div>
      </MainContent>
      <MobileFooter connected={connected} />
    </>
  )
}
