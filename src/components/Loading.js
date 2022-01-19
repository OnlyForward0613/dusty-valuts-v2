import { useEffect, useState } from "react"
import ScaleLoader from "react-spinners/ScaleLoader"
import { HINT } from "../../config"

export default function Loading({ loading, children, ...props }) {
  const [hintText, setHintText] = useState([])
  useEffect(() => {
    const random = Math.floor(Math.random() * HINT.length)
    const sentence = HINT[random].split("@@")
    setHintText(sentence)
  }, [])
  return (
    <div className={true ? "loading active" : "loading"}>
      <ScaleLoader loading={true} size={150} color="#f8cf5b" />
      <div className="site-hine">
        {hintText.map((item, key) => (
          <p key={key}>{item}</p>
        ))}
      </div>
    </div>
  )
}