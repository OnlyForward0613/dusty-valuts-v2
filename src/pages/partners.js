import { useState, useEffect } from "react"
import Head from "next/head"
import Sidebar from "../components/Sidebar"
import Web3Modal from "web3modal"
import MainContent from "../components/MainContent"
import Header from "../components/Header"
import { providers, ethers } from "ethers"
import { CHAIN_ID, SITE_ERROR, SMARTCONTRACT_ABI_ERC20, SMARTCONTRACT_ADDRESS_ERC20 } from "../../config"
import { errorAlert, errorAlertCenter } from "../components/toastGroup"
import MobileFooter from "../components/MobileFooter"
import { providerOptions } from "../hook/connectWallet"
import { checkNetwork } from "../hook/ethereum"
import { Container } from "@mui/material"
import { ReactSVG } from "react-svg"

let web3Modal = undefined

export default function Partners({ headerAlert, closeAlert, closeLoading }) {
  const [connected, setConnected] = useState(false)
  const [signerAddress, setSignerAddress] = useState("")
  const [signerBalance, setSignerBalance] = useState(0)
  const [loading, setLoading] = useState(false)

  const connectWallet = async () => {
    closeLoading()
    setLoading(true)
    if (await checkNetwork()) {
      web3Modal = new Web3Modal({
        network: 'mainnet', // optional
        cacheProvider: true,
        providerOptions, // required
      })
      const provider = await web3Modal.connect()
      const web3Provider = new providers.Web3Provider(provider)

      const signer = web3Provider.getSigner()
      const address = await signer.getAddress()

      const contract_20 = new ethers.Contract(
        SMARTCONTRACT_ADDRESS_ERC20,
        SMARTCONTRACT_ABI_ERC20,
        signer
      )

      const bal = await contract_20.balanceOf(address)
      setSignerBalance(ethers.utils.formatEther(bal))
      setLoading(false)
      setConnected(true)
      setSignerAddress(address)

      // Subscribe to accounts change
      provider.on("accountsChanged", (accounts) => {
        setSignerAddress(accounts[0])
      })

      // Subscribe to chainId change
      provider.on("chainChanged", (chainId) => {
        window.location.reload()
      })
    }
  }

  useEffect(() => {
    closeLoading()
    async function fetchData() {
      if (typeof window.ethereum !== 'undefined') {
        if (await checkNetwork()) {
          connectWallet()
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
    fetchData()
    // eslint-disable-next-line
  }, [])

  return (
    <>
      <Header
        signerAddress={signerAddress}
        connectWallet={connectWallet}
        connected={connected}
        loading={loading}
        signerBalance={signerBalance}
        headerAlert={headerAlert}
        closeAlert={closeAlert}
      />
      <MainContent>
        <Sidebar
          connected={connected}
          headerAlert={headerAlert}
        />
        <div className="partner page-content">
          <Head>
            <title>Dusty Vaults | Partners</title>
            <meta name="description" content="Check partners of DustyVaults" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <Container>
            <div className="section-title" style={{ paddingTop: !headerAlert ? 35 : 60 }}>
              <h1 style={{ textTransform: "capitalize" }}>Partners</h1>
              <p>The following companies / projects have partnered with us to allow their customers to generate yield through DustyVaults with their NFT&apos;s. Please do check them out!</p>
            </div>
            <div className="landing-content">
              <div className="item-card">
                {/* eslint-disable-next-line */}
                <img
                  src="./partners/1.jpg"
                  alt=""
                />
                <p>SATOSHI SPuD is the common man&apos;s NFT. They are releasing this collection to show everybody that they can do it too.&nbsp;
                  <a
                    href="https://twitter.com/Potato_BC"
                    target="_blank"
                    rel="noreferrer"
                  >
                    @Potato_BC
                  </a>
                </p>
                <div className="item-hover">
                  <a
                    href="https://instagram.com/satoshi_spud"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ReactSVG src="./icons/instagram.svg" width={30} height={30} />
                  </a>
                  <a
                    href="http://vt.tiktok.com/ZSe4DbHTL/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ReactSVG src="./icons/tiktok.svg" width={30} height={30} />
                  </a>
                </div>
              </div>
              <div className="item-card">
                {/* eslint-disable-next-line */}
                <img
                  src="./partners/4.jpg"
                  alt=""
                />
                <p>BoujeeBoys is an upcoming collection of 6,666 with merchandise, metaverse integration and a lot of giveaways.</p>
                <div className="item-hover">
                  <a
                    href="https://instagram.com/boujeeboys_nft"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ReactSVG src="./icons/instagram.svg" width={30} height={30} />
                  </a>
                </div>
              </div>
              <div className="item-card">
                {/* eslint-disable-next-line */}
                <img
                  src="./partners/6.jpg"
                  alt=""
                />
                <p>Ship With Wolves is a wonderful collection of wolves living on the ethereum blockchain created by 2 brothers&nbsp;
                  <a
                    href="https://twitter.com/shipwithwolves"
                    target="_blank"
                    rel="noreferrer"
                  >
                    @shipwithwolves
                  </a>
                </p>
                <div className="item-hover">
                  <a
                    href="https://opensea.io/collection/ship-with-wolves"
                    target="_blank"
                    rel="noreferrer"
                    style={{ background: "transparent" }}
                  >
                    <ReactSVG src="./icons/opeansea.svg" width={30} height={30} />
                  </a>
                </div>
              </div>
            </div>
            <div className="come-soon">
              <span></span>
              <p>More coming soon...</p>
              <h5>Want to partner?
                <a
                  href="https://form.jotform.com/220128465418050"
                  target="_blank"
                  rel="noreferrer"
                >
                  Click here!
                </a>
              </h5>
            </div>
          </Container>
        </div>
      </MainContent>
      <MobileFooter connected={connected} />
    </>
  )
}