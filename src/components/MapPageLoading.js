import ScaleLoader from "react-spinners/ScaleLoader"

export default function MapPageLoading({ loading, ...props }) {
    return (
        <div className="map-loading">
            <ScaleLoader loading={loading} size={150} color="#fff" />
        </div>
    )
}