import { useEffect, useState } from "react"
import NFTCard from "./NFTCard"
import ItemFilter from "./ItemFilter"
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { ButtonGroup } from "@mui/material"
import ClickAwayListener from '@mui/material/ClickAwayListener'
import { DoActionButton, MoreMenuButton, CancelButton, OptionButton, UnstakeButton } from "./styleHook"
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
  stakedList,
  balance,
  startLoading,
  closeLoading,
  headerAlert,
  ...props
}) {
  const [pageRerender, setPageRerender] = useState("")
  const [unstaked, setUnstaked] = useState(0)
  const [staked, setStaked] = useState(0)
  const [more, setMore] = useState(false)
  const [multiStakeAble, setMultiStakeAble] = useState(false)
  const [multiUnstakeAble, setMultiUnstakeAble] = useState(false)
  const [selectCount, setSelectCount] = useState(0)
  const [renderArray, setRenderArray] = useState([])

  const [modal, setModal] = useState(false)
  const [hide, setHide] = useState(false) // don't think about this. this is state for re-render
  const [checkAbleState, setCheckAbleState] = useState(0)

  let nftData = []
  // mapping new render cards
  const renderNFTs = (data) => {
    if (data) {
      setRenderArray(data)
      setHide(!hide)
    } else {
      nftData = []
      if (stakedList.length !== 0) {
        let stakedCount = 0
        let unStakedCount = 0
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
          if (stakedList[i].action === 0) unStakedCount++
          else stakedCount++
        }
        setStaked(stakedCount)
        setUnstaked(unStakedCount)
        setRenderArray(nftData)
      }
    }
  }
  // set checked card state by id
  const setCheckedCardByHash = (hash, image) => {
    let data = renderArray
    const index = data.map(function (e) { return e.token_uri }).indexOf(hash)
    data[index].checked = !data[index].checked
    data[index].image = image
    renderNFTs(data)
    setCount()
    setHide(!hide) //for re-render
  }

  const setMultiAbleState = (state) => {
    setCheckAbleState(state)
    if (state === 1) {
      setMultiStakeAble(true)
      setMultiUnstakeAble(false)
    } else if (state === 2) {
      setMultiStakeAble(false)
      setMultiUnstakeAble(true)
    }
    setSelectCount(0)
    deselectAll()
    setCheckAble(true)
    setMore(false)
  }

  const selectAll = () => {
    let data = renderArray
    let cnt = 0
    data.map((e) => {
      if (checkAbleState === 1 && e.action === 0) {
        e.checked = true
        cnt++
      } else if (checkAbleState === 2 && e.action === 1) {
        e.checked = true
        cnt++
      }
    })
    setRenderArray(data)
    setSelectCount(cnt)
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
    setCheckAbleState(0)
    deselectAll()
  }

  const openStakeModal = () => {
    setModal(true)
    setHide(!hide)
  }

  const unstake = () => {

  }

  useEffect(() => {
    renderNFTs()
    if ((stakedList.length) === 0) {
      closeLoading()
    }
    // eslint-disable-next-line
  }, [stakedList])

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
        all={unstaked + staked}
        unstaked={unstaked}
        staked={staked}
      />
      {checkAble &&
        <div className="multi-infobox" style={{ top: !headerAlert ? 69 : 94 }}>
          <p><span>{selectCount}</span>Selected</p>
          <ButtonGroup variant="contained">
            <OptionButton onClick={() => selectAll()}>Select All</OptionButton>
            <OptionButton onClick={() => deselectAll()}>Deselect All</OptionButton>
          </ButtonGroup>
          <div className="infobox-button">
            <ButtonGroup variant="contained">
              {multiStakeAble &&
                <DoActionButton onClick={() => openStakeModal()} disabled={selectCount === 0}>stake</DoActionButton>
              }
              {multiUnstakeAble &&
                <UnstakeButton onClick={() => unstake()} disabled={selectCount === 0}>unstake</UnstakeButton>
              }
              <CancelButton onClick={() => calcelMulti()}>cancel</CancelButton>
            </ButtonGroup>
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
            checkAbleState={checkAbleState}
            setCheckAble={(e) => setCheckAble(e)}
            getNFTLIST={() => getNFTLIST()}
            openModal={() => setModal(true)}
            close={() => setModal(false)}
            setCheckedCardByHash={(hash, image) =>
              setCheckedCardByHash(hash, image)}
          />
        ))}
        {(stakedList.lenth + stakedList.length) === 0 &&
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
