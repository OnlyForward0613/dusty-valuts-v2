import { Box, Checkbox, IconButton, Modal } from "@mui/material"
import { useEffect, useState } from "react"
import { ClipLoader } from "react-spinners"
import CostSlider from "./CostSlider"
import { BigStakeButton, BpCheckedIcon, BpIcon } from "./styleHook"
import { errorAlert, successAlert, warningAlert } from "./toastGroup"
import Web3Modal from 'web3modal'
import { ethers } from 'ethers'
import { SMARTCONTRACT_ABI, SMARTCONTRACT_ABI_ERC20, SMARTCONTRACT_ADDRESS, SMARTCONTRACT_ADDRESS_ERC20 } from "../../config"
import Swal from "sweetalert2"

export default function MultiStakeModal({
  open,
  close,
  balance,
  image,
  count,
  data,
  hide,
  calcelMulti,
  ...props
}) {
  const [loading, setLoading] = useState(false)
  const [agreeVali, setAgreeVali] = useState(false)
  const [agree, setAgree] = useState(false)
  const [amount, setAmount] = useState(1)
  const [real, setReal] = useState(1)
  const [step, setStep] = useState(0)
  const steps = [0.01, 0.1, 0.12, 0.15, 0.2, 0.25, 0.35, 0.42, 0.5]
  const [images, setImages] = useState([])
  const [addressArray, setAddressArray] = useState([])
  const [idArray, setIDArray] = useState([])

  const handleChange = (e) => {
    setAgree(e.target.checked)
    setAgreeVali(false)
  }

  const stake = async () => {
    setLoading(true)
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract20 = new ethers.Contract(
      SMARTCONTRACT_ADDRESS_ERC20,
      SMARTCONTRACT_ABI_ERC20,
      signer
    )

    const contract = new ethers.Contract(
      SMARTCONTRACT_ADDRESS,
      SMARTCONTRACT_ABI,
      signer
    )
    if (parseFloat(balance) > parseFloat(amount) * count) {
      if (agree) {
        try {
          const isr = count * amount * Math.pow(10, 18)
          const erc20Approve = await contract20.approve(SMARTCONTRACT_ADDRESS, isr.toLocaleString('fullwide', { useGrouping: false }))
          await erc20Approve.wait()
          try {
            const isr = amount * Math.pow(10, 18)
            const stakeAction = await contract.stakeByHash(addressArray, idArray, isr.toLocaleString('fullwide', { useGrouping: false }))
            await stakeAction.wait()
            calcelMulti()
            close()
            Swal.fire({
              title: 'Congratulation! You staked successfully.',
              showCancelButton: true,
              confirmButtonText: 'CONFIRM',
            }).then((result) => {
              if (result.isConfirmed) {
                location.reload()
              }
            })
          } catch (err) {
            alertBox(err)
          }
        } catch (err) {
          alertBox(err)
        }
      } else {
        setAgreeVali(true)
      }
    } else {
      errorAlert("You don't have enough Dusty!")
    }
    setLoading(false)
  }

  const alertBox = (err) => {
    setLoading(false)
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

  const setGalley = () => {
    if (data.length !== 0) {
      let imgs = []
      let add_Array = []
      let id_Array = []
      data.map((e) => {
        if (e.checked) {
          imgs.push(e.image)
          add_Array.push(e.token_address)
          id_Array.push(e.token_id)
        }
      })
      setImages(imgs)
      setAddressArray(add_Array)
      setIDArray(id_Array)
    }
  }

  useEffect(() => {
    setGalley()
    // eslint-disable-next-line
  }, [hide])

  return (
    <Modal
      open={open}
      // onClose={close}
      style={{ backdropFilter: "blur(3px)" }}
    >
      <Box sx={style} className="modal-box">
        <div className="stake-modal">
          <div className="modal-close">
            <IconButton onClick={() => close()} disabled={loading}>
              <svg width="14" height="14" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_7_12)">
                  <path d="M15.5667 1.42462L9.20279 7.78859L2.83883 1.42463C2.13172 0.717514 0.717507 2.13173 1.42461 2.83884L7.78857 9.2028L1.42461 15.5668C0.717509 16.2739 2.13172 17.6881 2.83883 16.981L9.20279 10.617L15.5667 16.981C16.2739 17.6881 17.6881 16.2739 16.981 15.5668L10.617 9.2028L16.981 2.83884C17.6881 2.13173 16.2739 0.717515 15.5667 1.42462Z" fill="white" />
                </g>
                <defs>
                  <clipPath id="clip0_7_12">
                    <rect width="18" height="18" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </IconButton>
          </div>
          <div className="modal-cover">
            <div className="modal-images" style={{ transform: `translate(${count > 4 ? "13%, 10%" : count * 4 + "%, 10%"})` }}>
              {images.map((item, key) => (
                key < 5 &&
                // eslint-disable-next-line
                <img
                  src={item}
                  alt=""
                  key={key}
                />
              ))}
            </div>
            <div className="modal-cover-content">
              <h1>{count} NFT{count !== 1 && "s"}</h1>
              <div className="balence-info">
                <p className="reward-value">Value:&nbsp;$Dusty&nbsp;<span>{(parseFloat(real) * count).toFixed(2)}</span></p>
              </div>
              <p className="reward-value">You can earn&nbsp;<span className="gold-color">$Dusty&nbsp;<span>{((parseFloat(real) + parseFloat(real) * steps[step]) * count).toFixed(2)}</span></span> after 12 months.</p>
              <p className="reward-value">+<span className="gold-color" style={{ fontSize: 12 }}>&nbsp;{(real * steps[step]).toFixed(2)} {count !== 1 && <>&nbsp;x&nbsp;{count} = {(real * steps[step] * count).toFixed(2)}</>}</span> $dusty</p>
            </div>
          </div>
          <div className="modal-content">
            <CostSlider
              setAmount={(value) => setAmount(value)}
              balance={balance}
              disabled={loading}
              count={count}
              setReal={(e) => setReal(e)}
              setStep={(e) => setStep(e)}
            />
            <div className="agree-mode">
              <Checkbox
                checked={agree}
                onChange={handleChange}
                size="sm"
                checkedIcon={<BpCheckedIcon />}
                icon={<BpIcon />}
              />
              <p>
                I understand this is a 12 monthly storage option and that if I wish to withdraw my NFTs
                prior to that I will not receive my initial $Dusty or earned fees.
              </p>
              {agreeVali &&
                <p className="check-validation">This field is required!</p>
              }
            </div>
            <div className="modal-action">
              <BigStakeButton disabled={loading} onClick={() => stake()}>
                {loading ?
                  <ClipLoader loading={loading} size={24} color="#fff" />
                  :
                  "Stake"
                }
              </BigStakeButton>
            </div>
          </div>
        </div>
      </Box>
    </Modal>
  )
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 680,
  bgcolor: '#333',
  boxShadow: 24,
  borderRadius: "12px",
  p: 3,

}