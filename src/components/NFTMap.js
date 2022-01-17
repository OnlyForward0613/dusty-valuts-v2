import { useEffect, useState } from "react"
import NFTCard from "./NFTCard"
import ItemFilter from "./ItemFilter"
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { IconButton } from "@mui/material"
import ClickAwayListener from '@mui/material/ClickAwayListener'
import { DoActionButton, MoreMenuButton, CancelButton } from "./styleHook"

export default function NFTMap({
  groupNFT,
  total,
  address,
  signer,
  useForceUpdate,
  forceRender,
  setForce,
  filterState,
  setFilterState,
  checkAble,
  setCheckAble,
  getNFTLIST,
  unstakedList,
  stakedList,
  startLoading,
  closeLoading,
  headerAlert,
  ...props
}) {
  const [pageRerender, setPageRerender] = useState("")
  const [all, setAll] = useState(0)
  const [unstaked, setUnstaked] = useState(0)
  const [staked, setStaked] = useState(0)
  const [more, setMore] = useState(false)
  const [multiStakeAble, setMultiStakeAble] = useState(false)
  const [multiUnstakeAble, setMultiUnstakeAble] = useState(false)

  const [selectCount, setSelectCount] = useState(0)
  const [renderArray, setRenderArray] = useState([])

  const [hide, setHide] = useState(false) // don't think about this. this is state for re-render

  let nftData = []
  // mapping new render cards
  const renderNFTs = (data) => {
    if (data) {
      setRenderArray(data)
    } else {
      nftData = []
      for (let i = 0; i < stakedList.length; i++) {
        // setRenderArray()
        const item = {
          name: unstakedList[i].name,
          token_address: unstakedList[i].token_address,
          token_id: unstakedList[i].token_id,
          token_uri: unstakedList[i].token_uri,
          reward: unstakedList[i].reward,
          action: unstakedList[i].action,
          image: unstakedList[i].image,
          description: unstakedList[i].description,
          reward: unstakedList[i].reward,
          percent: unstakedList[i].percent,
          timestamp: unstakedList[i].timestamp,
          checked: false
        }
        nftData.push(item)
      }

      for (let j = 0; j < unstakedList.length; j++) {
        const item = {
          name: unstakedList[j].name,
          token_address: unstakedList[j].token_address,
          token_id: unstakedList[j].token_id,
          token_uri: unstakedList[j].token_uri,
          reward: unstakedList[j].reward,
          action: unstakedList[j].action,
          image: unstakedList[j].image,
          description: unstakedList[j].description,
          reward: unstakedList[j].reward,
          percent: unstakedList[j].percent,
          timestamp: unstakedList[j].timestamp,
          checked: false
        }
        nftData.push(item)
      }
      setRenderArray(nftData)
    }
  }
  // set checked card state by id
  const setCheckedCardByHash = (tokenAddress, tokenId, name, hash, image) => {
    let data = renderArray
    const index = data.map(function (e) { return e.token_uri }).indexOf(hash)
    data[index].checked = !data[index].checked
    setHide(!hide)
    renderNFTs(data)
  }

  const setMultiAbleState = (state) => {
    if (state === 1) {
      setMultiStakeAble(true)
    } else if (state === 2) {
      setMultiUnstakeAble(true)
    }
    setCheckAble(true)
    setMore(false)
  }

  const selectAll = () => {

  }

  const deselectAll = () => {

  }

  useEffect(() => {
    setAll(unstakedList.length + stakedList.length)
    setUnstaked(unstakedList.length)
    setStaked(stakedList.length)
    ///////////////
    renderNFTs()
    //////////////
    if ((unstakedList.length + stakedList.length) === 0) {
      closeLoading()
    }
    // eslint-disable-next-line
  }, [unstakedList, stakedList])

  return (
    <div className="map-page" style={{ paddingTop: !headerAlert ? 5 : 30 }}>
      <ClickAwayListener onClickAway={() => setMore(false)}>
        <div className="more-option" style={{ paddingTop: !headerAlert ? 90 : 115 }}>
          <IconButton component="span" style={{ border: "1px solid #ccc" }} size="small" onClick={() => setMore(!more)}>
            <MoreVertIcon style={{ color: "#fff" }} />
          </IconButton>
          {more &&
            <div className="more-menu">
              <div className="more-menu-item">
                <MoreMenuButton fullWidth onClick={() => setMultiAbleState(1)}>Multi Stake</MoreMenuButton>
              </div>
              <div className="more-menu-item">
                <MoreMenuButton fullWidth onClick={() => setMultiAbleState(2)}>Multi Unstake</MoreMenuButton>
              </div>
            </div>
          }
        </div>
      </ClickAwayListener>
      <ItemFilter
        filterState={filterState}
        setFilterState={(e) => setFilterState(e)}
        checkAble={checkAble}
        setCheckAble={(e) => setCheckAble(e)}
        all={all}
        unstaked={unstaked}
        staked={staked}
      />
      {multiStakeAble &&
        <div className="multi-infobox">
          <p><span>{selectCount}</span>Selected</p>
          <div className="infobox-button">
            <DoActionButton>Select All</DoActionButton>
          </div>
          <div className="infobox-button">
            <DoActionButton>stake</DoActionButton>
          </div>
          <div className="infobox-button">
            <CancelButton onClick={() => setMultiStakeAble(false)}>cancel</CancelButton>
          </div>
        </div>
      }
      <div className="nft-map">
        {renderArray.length !== 0 && renderArray.map((item, key) => (
          <NFTCard
            key={key}
            data={item}
            state={0}
            filterState={filterState}
            address={address}
            pageRerender={pageRerender}
            reRender={(e) => setPageRerender(e)}
            useForceUpdate={useForceUpdate}
            signer={signer}
            forceRender={forceRender}
            setForce={(e) => setForce(e)}
            checkAble={checkAble}
            setCheckAble={(e) => setCheckAble(e)}
            getNFTLIST={() => getNFTLIST()}
            setCheckedCardByHash={(tokenAddress, tokenId, name, hash, image) =>
              setCheckedCardByHash(tokenAddress, tokenId, name, hash, image)}
          />
        ))}
        {(stakedList.lenth + unstakedList.length) === 0 &&
          <h3 className="empty-text">
            You don&apos;t have any NFTs on this Wallet
          </h3>
        }
      </div>
    </div>
  )
}
