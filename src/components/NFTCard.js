import { useEffect, useState } from "react"
import { DoActionButton, UnstakeButton } from "./styleHook"
import Countdown from "react-countdown"
import ClipLoader from "react-spinners/ClipLoader"
import { errorAlert, successAlert, warningAlert } from "./toastGroup"
import { ethers } from "ethers"
import { SMARTCONTRACT_ABI, SMARTCONTRACT_ABI_ERC20, SMARTCONTRACT_ADDRESS, SMARTCONTRACT_ADDRESS_ERC20 } from "../../config"
import Swal from "sweetalert2"
import Web3Modal from "web3modal"
import { Skeleton } from "@mui/material"
import StakeModal from "./StakeModal"

export default function NFTCard({
  state,
  data,
  filterState,
  signer,
  address,
  multiAble,
  multiStakeAble,
  multiUnstakeAble,
  cardId,
  setCheckedCardByHash,
  checkAble,
  checkAbleState,
  close,
  startLoading,
  closeLoading,
  ...props
}) {
  const [days, setDays] = useState(0)
  const [hours, setHours] = useState(0)
  const [minute, setMinute] = useState(0)
  const [second, setSecond] = useState(0)
  const [image, setImage] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [reward, setReward] = useState(0)
  const [percent, setPercent] = useState(0)
  const [stakedTime, setStakedTime] = useState("")
  const [tokenAddress, setTokenAddress] = useState("")
  const [tokenId, setTokenId] = useState("")
  const [hash, setHash] = useState("")
  const [action, setAction] = useState(0)
  const [balance, setBalance] = useState(0)
  const [unloading, setUnloading] = useState(false)
  const [modal, setModal] = useState(false)

  const alertBox = (err) => {
    setUnloading(false)
    closeLoading()
    if (err.code === 4001) {
      warningAlert("You denied the Action!")
    } else if (err.data !== undefined) {
      errorAlert(err.data.message)
    } else if (err.message !== undefined) {
      errorAlert(err.message)
    } else {
      errorAlert("We found the error. Please try again!")
    }
  }

  const setDetail = async (data) => {
    setAction(data.action)
    setReward(data.reward)
    setPercent(data.percent)
    setStakedTime(data.timestamp)
    setName(data.name + " #" + data.token_id)
    setTokenAddress(data.token_address)
    setTokenId(data.token_id)
    setHash(data.token_uri)

    let urdd = data.token_uri.split("://")
    let uri = ''
    let ipfsIssue = 0

    if (urdd[0] === "ipfs") {
      uri = "https://ipfs.io/ipfs/" + urdd[urdd.length - 1]
      ipfsIssue = 1
    } else {
      uri = data.token_uri
    }
    if (ipfsIssue === 0) {
      urdd = data.token_uri.split('ipfs/')
      if (urdd[0] === "https://ipfs.moralis.io:2053/") {
        uri = "https://ipfs.io/ipfs/" + urdd[urdd.length - 1]
      } else {
        uri = data.token_uri
      }
    }
    if (uri !== undefined) {
      await fetch(uri)
        .then(resp =>
          resp.json()
        ).then((json) => {
          let img = json.image
          if (img !== undefined) {
            const imgString = img.split("://")
            if (imgString[0] === "ipfs") {
              img = "https://ipfs.io/ipfs/" + imgString[imgString.length - 1]
            } else {
              img = json.image
            }
            setImage(img)
            setDescription(json.description)
          }
        })
    }

    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract_20 = new ethers.Contract(
      SMARTCONTRACT_ADDRESS_ERC20,
      SMARTCONTRACT_ABI_ERC20,
      signer
    )

    const bal = await contract_20.balanceOf(address)
    setBalance(parseFloat(ethers.utils.formatEther(bal.toString())).toFixed(2))

  }

  const handleTime = (e) => {
    setDays(e.days < 10 ? `0${e.days}` : e.days)
    setHours(e.hours < 10 ? `0${e.hours}` : e.hours)
    setMinute(e.minutes < 10 ? `0${e.minutes}` : e.minutes)
    setSecond(e.seconds < 10 ? `0${e.seconds}` : e.seconds)
  }

  const autoClaim = async () => {
    setUnloading(true)
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(
      SMARTCONTRACT_ADDRESS,
      SMARTCONTRACT_ABI,
      signer
    )
    try {
      const res = await contract.autoClaim(tokenAddress, tokenId) //danger part
      await res.wait()
      successAlert("You won! You received the Reward!", true)
    } catch (err) {
      alertBox(err)
    }
    setUnloading(false)
  }

  const openUnstake = () => {
    Swal.fire({
      title: 'Do you really want to remove this NFT from the vault? You will lose all $Dusty associated with it',
      showCancelButton: true,
      confirmButtonText: 'Unstake',
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        unstake()
      }
    })
  }

  const unstake = async () => {
    startLoading()
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const contract = new ethers.Contract(
      SMARTCONTRACT_ADDRESS,
      SMARTCONTRACT_ABI,
      signer
    )
    try {
      const stakeAction = await contract.unStake([tokenAddress], [tokenId])
      await stakeAction.wait()
      successAlert("Your unstaking has been successfully completed.")
      setTimeout(() => {
        location.reload()
      }, 5000)
    } catch (err) {
      alertBox(err)
    }
    closeLoading()
  }

  useEffect(() => {
    setTimeout(() => {
      setDetail(data)
    }, 2000)
    const now = new Date()
    if (action === 1 && new Date(parseInt(stakedTime) * 1000 + 365 * 24 * 3600 * 1000 + 7000) >= now) {
      autoClaim()
    }
    // eslint-disable-next-line
  }, [])

  return (
    <>
      {(filterState === action || filterState === 2) &&
        <div className={action !== 1 ? "nft-card" : "nft-card nft-card-active"}>
          {((checkAbleState === 1 && action === 0) || (checkAbleState === 2 && action === 1)) &&
            <div className={data.checked ? "card-checkbox check-effect" : "card-checkbox"} onClick={() => setCheckedCardByHash(hash, image)}>
              <button>
                {data.checked ?
                  <svg width="40" height="40" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 9L10 12L20 2" stroke="#DFAE00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M19 10V17C19 17.5304 18.7893 18.0391 18.4142 18.4142C18.0391 18.7893 17.5304 19 17 19H3C2.46957 19 1.96086 18.7893 1.58579 18.4142C1.21071 18.0391 1 17.5304 1 17V3C1 2.46957 1.21071 1.96086 1.58579 1.58579C1.96086 1.21071 2.46957 1 3 1H14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  :
                  <svg width="40" height="40" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.75 0C2.95435 0 2.19129 0.316071 1.62868 0.87868C1.06607 1.44129 0.75 2.20435 0.75 3V17C0.75 17.7956 1.06607 18.5587 1.62868 19.1213C2.19129 19.6839 2.95435 20 3.75 20H17.75C18.5456 20 19.3087 19.6839 19.8713 19.1213C20.4339 18.5587 20.75 17.7956 20.75 17V3C20.75 2.20435 20.4339 1.44129 19.8713 0.87868C19.3087 0.316071 18.5456 0 17.75 0H3.75ZM3.75 2H17.75C18.0152 2 18.2696 2.10536 18.4571 2.29289C18.6446 2.48043 18.75 2.73478 18.75 3V17C18.75 17.2652 18.6446 17.5196 18.4571 17.7071C18.2696 17.8946 18.0152 18 17.75 18H3.75C3.48478 18 3.23043 17.8946 3.04289 17.7071C2.85536 17.5196 2.75 17.2652 2.75 17V3C2.75 2.73478 2.85536 2.48043 3.04289 2.29289C3.23043 2.10536 3.48478 2 3.75 2V2Z" fill="white" />
                  </svg>
                }
              </button>
            </div>
          }
          {image === "" ?
            <Skeleton sx={{ bgcolor: '#ffffff20' }} style={{ width: "100%", height: "240px", borderRadius: 6, backgroundColor: "ffffff3d" }} variant="retangle" />
            :
            <>
              {/* eslint-disable-next-line */}
              <img
                alt=""
                src={image}
                referrerPolicy="no-referrer-when-downgrade"
              />
            </>
          }
          <p className="name">{name}</p>
          {action === 1 &&
            <>
              <div className="cost-ribbon">
                <p>{parseFloat(ethers.utils.formatEther(reward)).toFixed(1)}</p>
                {percent > 42 &&
                  // eslint-disable-next-line
                  <img
                    src="./gold-reward.png"
                    alt=""
                  />
                }
                {percent > 20 && percent <= 42 &&
                  // eslint-disable-next-line
                  <img
                    src="./silver-reward.png"
                    alt=""
                  />
                }
                {percent <= 20 &&
                  // eslint-disable-next-line
                  <img
                    src="./bronze-reward.png"
                    alt=""
                  />
                }
              </div>
              {action === 1 &&
                <p className="left-days">
                  <span>{days}</span> day: <span>{hours}</span> hour : <span>{minute}</span> min : <span>{second}</span> sec
                </p>
              }
            </>
          }
          {!checkAble &&
            <div className="card-action">
              {(action === 0 && (checkAbleState !== 1)) &&
                <DoActionButton onClick={() => setModal(true)} >
                  Stake
                </DoActionButton>
              }
              {(action === 1 && (checkAbleState !== 2)) &&
                <UnstakeButton onClick={() => openUnstake()} disabled={unloading}>
                  {unloading ?
                    <ClipLoader loading={unloading} size={12} color="#fff" />
                    :
                    "Unstake"
                  }
                </UnstakeButton>
              }
            </div>
          }
          {action === 1 &&
            <div style={{ display: "none" }}>
              <Countdown date={new Date(parseInt(stakedTime) * 1000 + 365 * 24 * 3600 * 1000 + 7000)} onTick={(e) => handleTime(e)} onComplete={() => autoClaim()} />
            </div>
          }
        </div>
      }
      <StakeModal
        open={modal}
        close={() => setModal(false)}
        image={image}
        description={description}
        name={name}
        tokenId={tokenId}
        balance={balance}
        tokenAddress={tokenAddress}
      />
    </>
  )
}
