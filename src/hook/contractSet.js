import Web3Modal from "web3modal"
import { providers, ethers } from "ethers"
import { providerOptions } from "./connectWallet"
import { SMARTCONTRACT_ADDRESS_ERC20, SMARTCONTRACT_ABI_ERC20 } from "../../config"

export const getContractERC20 = async () => {
  const web3Modal = new Web3Modal({
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
}