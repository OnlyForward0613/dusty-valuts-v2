import { useEffect, useState } from "react"
import NFTCard from "./NFTCard"
import ItemFilter from "./ItemFilter"
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { ButtonGroup } from "@mui/material"
import ClickAwayListener from '@mui/material/ClickAwayListener'
import { DoActionButton, MoreMenuButton, CancelButton, OptionButton } from "./styleHook"
import MultiStakeModal from "./MultiStakeModal"

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
  unStakedList,
  stakedList,
  balance,
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

  const [modal, setModal] = useState(false)
  const [hide, setHide] = useState(false) // don't think about this. this is state for re-render

  let nftData = []
  // mapping new render cards
  const renderNFTs = (data) => {
    if (data) {
      setRenderArray(data)
      setHide(!hide)
    } else {
      nftData = []
      if (stakedList.length !== 0) {
        for (let i = 0; i < stakedList.length; i++) {
          const item = {
            name: stakedList[i].name,
            token_address: stakedList[i].token_address,
            token_id: stakedList[i].token_id,
            token_uri: stakedList[i].token_uri,
            reward: stakedList[i].reward,
            action: stakedList[i].action,
            image: stakedList[i].image,
            description: stakedList[i].description,
            reward: stakedList[i].reward,
            percent: stakedList[i].percent,
            timestamp: stakedList[i].timestamp,
            checked: false
          }
          nftData.push(item)
        }
      }

      if (unStakedList.length !== 0) {
        for (let j = 0; j < unStakedList.length; j++) {
          const item = {
            name: unStakedList[j].name,
            token_address: unStakedList[j].token_address,
            token_id: unStakedList[j].token_id,
            token_uri: unStakedList[j].token_uri,
            reward: unStakedList[j].reward,
            action: unStakedList[j].action,
            image: unStakedList[j].image,
            description: unStakedList[j].description,
            reward: unStakedList[j].reward,
            percent: unStakedList[j].percent,
            timestamp: unStakedList[j].timestamp,
            checked: false
          }
          nftData.push(item)
        }
        setRenderArray(nftData)
      }
    }
  }
  // set checked card state by id
  const setCheckedCardByHash = (tokenAddress, tokenId, name, hash, image) => {
    let data = renderArray
    const index = data.map(function (e) { return e.token_uri }).indexOf(hash)
    data[index].checked = !data[index].checked
    data[index].image = image
    renderNFTs(data)
    setCount()
    setHide(!hide) //for re-render
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
    let data = renderArray
    data.map((e) => e.checked = true)
    setRenderArray(data)
    setSelectCount(data.length)
  }

  const deselectAll = () => {
    let data = renderArray
    data.map((e) => e.checked = false)
    setRenderArray(data)
    setSelectCount(0)
  }

  const setCount = () => {
    let cnt = 0
    renderArray.map((item) =>
      item.checked && cnt++
    )
    setSelectCount(cnt)
    setHide(!hide)
  }

  const calcelMulti = () => {
    setCheckAble(false)
    setMultiStakeAble(false)
    setMultiUnstakeAble(false)
    deselectAll()
  }

  const openStakeModal = () => {
    setModal(true)
    setHide(!hide)
  }

  useEffect(() => {
    setAll(unStakedList.length + stakedList.length)
    setUnstaked(unStakedList.length)
    setStaked(stakedList.length)
    ///////////////
    renderNFTs()
    //////////////
    if ((unStakedList.length + stakedList.length) === 0) {
      closeLoading()
    }
    // eslint-disable-next-line
  }, [unStakedList, stakedList])

  return (
    <div className="map-page" style={{ paddingTop: !headerAlert ? 5 : 30 }}>
      <ClickAwayListener onClickAway={() => setMore(false)}>
        <div className="more-option" style={{ paddingTop: !headerAlert ? 90 : 115 }}>
          <button className="more-menu-button" onClick={() => setMore(!more)}>
            <MoreVertIcon style={{ color: "#fff" }} />
          </button>
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
        <div className="multi-infobox" style={{ top: !headerAlert ? 69 : 94 }}>
          <p><span>{selectCount}</span>Selected</p>
          <ButtonGroup variant="contained">
            <OptionButton onClick={() => selectAll()}>Select All</OptionButton>
            <OptionButton onClick={() => deselectAll()}>Deselect All</OptionButton>
          </ButtonGroup>
          <div className="infobox-button">
            <ButtonGroup variant="contained">
              <DoActionButton onClick={() => openStakeModal()} disabled={selectCount === 0}>stake</DoActionButton>
              <CancelButton onClick={() => calcelMulti()}>cancel</CancelButton>
            </ButtonGroup>
          </div>
          <div className="infobox-button">
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
            openModal={() => setModal(true)}
            close={() => setModal(false)}
            setCheckedCardByHash={(tokenAddress, tokenId, name, hash, image) =>
              setCheckedCardByHash(tokenAddress, tokenId, name, hash, image)}
          />
        ))}
        {(stakedList.lenth + unStakedList.length) === 0 &&
          <h3 className="empty-text">
            You don&apos;t have any NFTs on this Wallet
          </h3>
        }
      </div>
      <MultiStakeModal
        open={modal}
        close={() => setModal(false)}
        balance={balance}
        count={selectCount}
        data={renderArray}
        hide={hide}
      />
    </div >
  )
}
