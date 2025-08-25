import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { faDirections} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const MapView = () => {
    const position = [29.4854, 74.0758];
    const handleDirection = () => {
        const googleMapUrl = `https://www.google.com/maps/dir/?api=1&destination=${position[0]},${position[1]}`;
        window.open(googleMapUrl, '_blank');
    }
    return (
        <div className="mapview" style={{position:'absolute', height:'80%', width:'95%', padding:'20px 0 30px 0'}}>
            <MapContainer center={position} zoom={13.8} style={{ height: "100%", width: "100%",color:'#1A1A402', zIndex:0 }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <Marker position={position}>
                    <Popup>
                        Arshit Enterprises<br /> New Delhi, India
                    </Popup>
                </Marker>
            </MapContainer>
            <button onClick={handleDirection}
                style={{
                    top: "10px",
                    right: "10px",
                    padding: "8px 12px",
                    background: "transparent",
                    width:'100%',
                    opacity: 1,
                    color: "black",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "14px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
                }}>
                <FontAwesomeIcon icon={faDirections}/>
                Get Directions
            </button>
            <br /><br />
            
            
        </div>
    );
};

export default MapView;