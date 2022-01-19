import { useEffect, useState } from "react"
import ScaleLoader from "react-spinners/ScaleLoader"
import { HINT } from "../../config"
import Typist from "react-typist"


export default function MapPageLoading({ loading, ...props }) {
  const [hintText, setHintText] = useState("")
  const setText = () => {
    const random = Math.floor(Math.random() * HINT.length)
    setHintText(HINT[random])
  }
  useEffect(() => {
    setText()
  }, [])
  return (
    <div className="map-loading">
      <ScaleLoader loading={loading} size={150} color="#f8cf5b" />
      <div className="site-hint">
        <p>HINT:</p>
        {hintText !== "" &&
          <Typist avgTypingDelay={30}>
            <span>{hintText}</span>
          </Typist>
        }
      </div>
    </div>
  )
}