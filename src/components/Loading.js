import { useEffect, useState } from "react"
import ScaleLoader from "react-spinners/ScaleLoader"
import { HINT } from "../../config"
import Typist from "react-typist"

export default function Loading({ loading, children, ...props }) {
  const [hintText, setHintText] = useState("")
  const [title, setTitle] = useState("")
  const setText = () => {
    const random = Math.floor(Math.random() * HINT.length)
    setTitle(HINT[random].title)
    setHintText(HINT[random].description)
  }
  useEffect(() => {
    setText()
    // eslint-disable-next-line
  }, [])
  return (
    <div className={true ? "loading active" : "loading"}>
      <ScaleLoader loading={true} size={150} color="#f8cf5b" />
      <div className="site-hint">
        <p>HINT:</p>
        <h5 style={{ fontSize: 14 }}>{title}</h5>
        {hintText !== "" &&
          <Typist avgTypingDelay={30}>
            <span>{hintText}</span>
          </Typist>
        }
      </div>
    </div >
  )
}