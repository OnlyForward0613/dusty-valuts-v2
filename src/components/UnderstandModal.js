import { Box, Checkbox, IconButton, Modal } from "@mui/material"
import { useState } from "react"
import { ClipLoader } from "react-spinners"
import { SMARTCONTRACT_ABI, SMARTCONTRACT_ABI_ERC20, SMARTCONTRACT_ADDRESS, SMARTCONTRACT_ADDRESS_ERC20 } from "../../config"
import { BigStakeButton, BpCheckedIcon, BpIcon } from "./styleHook"
import { errorAlert, successAlert, warningAlert } from "./toastGroup"
import Web3Modal from "web3modal"
import { ethers } from "ethers"
import { ReactSVG } from 'react-svg'

export default function UnderstandModal({
  open,
  close,
  tokenAddress,
  tokenId,
  timeStamp,
  ...props }) {
  const [loading, setLoading] = useState(false)

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

  const autoUnstake = async () => {
    setLoading(true)
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
      }, 5000);
    } catch (err) {
      alertBox(err)
    }
    setLoading(false)
  }

  return (
    <Modal
      open={open}
      style={{ backdropFilter: "blur(3px)" }}
    >
      <Box sx={style} className="modal-box" style={{ border: "1px solid #f90c0c" }}>
        <div className="stake-modal">
          <div className="modal-content" style={{ textAlign: "center" }}>
            <ReactSVG
              src="./withdraw.svg"
            />
            <h2>You have already withdrawn NFTs from our vault. Therefore, you cannot receive compensation. You need to unstake that NFT.</h2>
            <div className="modal-action">
              <BigStakeButton onClick={() => autoUnstake()} disabled={loading}>
                {loading ?
                  <ClipLoader loading={loading} size={24} color="#fff" />
                  :
                  "Understand"
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
  width: 640,
  bgcolor: '#200000',
  boxShadow: 24,
  borderRadius: "12px",
  p: 4,
}