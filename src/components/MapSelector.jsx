import { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});


const destinationIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});


function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker 
      position={position} 
      icon={destinationIcon}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          setPosition(e.target.getLatLng());
        },
      }}
    />
  );
}

function MapSelector({ onSelectLocation, onAddressFound, initialPosition = null }) {

  const defaultCenter = [10.2353, -67.5911];
  const [position, setPosition] = useState(initialPosition);
  const [mapCenter] = useState(initialPosition || defaultCenter);


  useEffect(() => {
    if (position && onSelectLocation) {
      onSelectLocation({
        lat: position.lat,
        lng: position.lng
      });
    }


    if (position && onAddressFound) {
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${position.lat}&lon=${position.lng}&format=json&addressdetails=1&accept-language=es`)
        .then(res => res.json())
        .then(data => {
          if (data && data.display_name) {

            const addr = data.address || {};
            const partes = [
              addr.road,
              addr.neighbourhood || addr.suburb,
              addr.city || addr.town || addr.village,
              addr.state
            ].filter(Boolean);
            const direccion = partes.length > 0 ? partes.join(", ") : data.display_name;
            onAddressFound(direccion);
          }
        })
        .catch(() => {});
    }
  }, [position]);

  return (
    <div className="w-full">
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-sm text-blue-800 font-medium mb-2">
          <MapPin className="w-4 h-4 inline-block mr-1 text-blue-800" /> Selecciona la ubicación de entrega
        </p>
        <p className="text-xs text-blue-600">
          Haz clic en el mapa o arrastra el marcador para indicar dónde debe llegar el pedido
        </p>

      </div>

      <div className="w-full h-96 rounded-xl overflow-hidden shadow-lg border-2 border-gray-200">
        <MapContainer 
          center={mapCenter} 
          zoom={15} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>

      {!position && (
        <p className="text-center text-sm text-gray-500 mt-3">
          Haz clic en cualquier parte del mapa para marcar tu ubicación
        </p>
      )}
    </div>
  );
}

export default MapSelector;
