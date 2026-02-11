import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const truckIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/7541/7541900.png', 
    iconSize: [45, 45],
    iconAnchor: [22, 22],
    popupAnchor: [0, -20]
});

const homeIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/619/619153.png',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

function Recenter({ lat, lng, enabled = true }) {
    const map = useMap();
    useEffect(() => {
        if (enabled && typeof lat === 'number' && typeof lng === 'number') {
            map.setView([lat, lng], map.getZoom());
        }
    }, [lat, lng, map, enabled]);
    return null;
}


function useValhallaRoute(start, end) {
    const [route, setRoute] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!start || !end || !start[0] || !end[0]) {
            setRoute(null);
            return;
        }

        const fetchRoute = async () => {
            setLoading(true);
            
            try {
                const valhallaUrl = 'https://valhalla1.openstreetmap.de/route';
                const valhallaBody = {
                    locations: [
                        { lat: start[0], lon: start[1] },
                        { lat: end[0], lon: end[1] }
                    ],
                    costing: 'auto',
                    directions_options: { units: 'kilometers' }
                };
                
                
                
                const response = await fetch(valhallaUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(valhallaBody)
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.trip && data.trip.legs && data.trip.legs[0] && data.trip.legs[0].shape) {
                        const decoded = decodePolyline(data.trip.legs[0].shape);
                        setRoute(decoded);
                    } else {
                        throw new Error('Sin datos de ruta');
                    }
                } else {
                    throw new Error('Error en respuesta');
                }
            } catch (err) {
                console.error('Error con Valhalla:', err);
                setRoute(null);
            } finally {
                setLoading(false);
            }
        };

        fetchRoute();
    }, [start?.[0], start?.[1], end?.[0], end?.[1]]);

    return { route, loading };
}


function decodePolyline(encoded, precision = 6) {
    const factor = Math.pow(10, precision);
    let index = 0;
    let lat = 0;
    let lng = 0;
    const coordinates = [];

    while (index < encoded.length) {
        let b, shift = 0, result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lat += dlat;

        shift = 0;
        result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lng += dlng;

        coordinates.push([lat / factor, lng / factor]);
    }
    return coordinates;
}

function MapaEnVivo({ conductorCoords, destinoCoords, autoFollow = false }) {

    const defaultPos = [10.2353, -67.5911]; 
    
    const posCamion = (conductorCoords && conductorCoords[0]) ? conductorCoords : defaultPos;
    const posCasa = (destinoCoords && destinoCoords[0]) ? destinoCoords : [posCamion[0] + 0.003, posCamion[1] + 0.003];


    const { route, loading } = useValhallaRoute(
        conductorCoords && conductorCoords[0] ? conductorCoords : null,
        destinoCoords && destinoCoords[0] ? destinoCoords : null
    );

    return (
        <MapContainer center={posCamion} zoom={15} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
            />


            {route && route.length > 0 && (
                <Polyline
                    positions={route}
                    color="#3b82f6"
                    weight={5}
                    opacity={0.85}
                />
            )}


            {conductorCoords && conductorCoords[0] && (
                <>
                    <Marker position={posCamion} icon={truckIcon}>
                        <Popup>En camino...</Popup>
                    </Marker>
                    <Recenter lat={posCamion[0]} lng={posCamion[1]} enabled={autoFollow} />
                </>
            )}


            <Marker position={posCasa} icon={homeIcon}>
                <Popup><MapPin className="w-4 h-4 inline-block mr-1" /> Destino</Popup>
            </Marker>
        </MapContainer>
    );
}

export default MapaEnVivo;