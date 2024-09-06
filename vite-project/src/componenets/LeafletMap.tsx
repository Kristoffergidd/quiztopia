import 'leaflet/dist/leaflet.css';
import './LeafletMap.css';
import leaflet, { Map, LeafletMouseEvent } from 'leaflet';
import { useState, useEffect, useRef } from 'react';

interface Location {
  longitude: string;
  latitude: string;
}

interface Question {
  question: string;
  answer: string;
  location: Location;
}

interface LeafletMapProps {
  questions?: Question[];
  setLocation?: (location: Location) => void;
}

const LeafletMap: React.FC<LeafletMapProps> = ({ questions = [], setLocation }) => {
  const [map, setMap] = useState<Map | null>(null);
  const [userMarker, setUserMarker] = useState<leaflet.Marker | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      const newMap = leaflet.map(mapRef.current, {
        center: [0, 0],
        zoom: 2,
      });

      leaflet
        .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        })
        .addTo(newMap);

      mapInstanceRef.current = newMap;
      setMap(newMap);

      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const newMarker = leaflet
              .marker([latitude, longitude])
              .addTo(newMap)
              .bindPopup('You are here');
            setUserMarker(newMarker);
            newMap.setView([latitude, longitude], 13);
          },
          (error) => {
            console.error('Error getting user location:', error);
          }
        );
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setMap(null);
        setUserMarker(null);
      }
    };
  }, []);

  useEffect(() => {
    if (map) {
      map.eachLayer((layer) => {
        if (layer instanceof leaflet.Marker && layer !== userMarker) {
          map.removeLayer(layer);
        }
      });

      questions.forEach((question) => {
        leaflet
          .marker([
            parseFloat(question.location.latitude),
            parseFloat(question.location.longitude),
          ])
          .addTo(map)
          .bindPopup(`<b> question: ${question.question}</b><br> answer: ${question.answer}`);
      });

      if (questions.length > 0) {
        const bounds = leaflet.latLngBounds(
          questions.map((question) => [
            parseFloat(question.location.latitude),
            parseFloat(question.location.longitude),
          ])
        );
        map.fitBounds(bounds);
      }
    }
  }, [map, questions, userMarker]);

  useEffect(() => {
    if (map && setLocation) {
      const handleMapClick = (event: LeafletMouseEvent) => {
        const { lat, lng } = event.latlng;
        
        console.log('Map clicked:', { lat, lng });
      
    
        try {
          setLocation({ latitude: lat.toString(), longitude: lng.toString() });

          const marker = leaflet
            .marker([lat, lng])
            .addTo(map)
            .bindPopup(`Clicked location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
            .openPopup();

            setUserMarker(marker);
            
          console.log('Marker created at:', { lat, lng });
        } catch (error) {
          console.error('Error creating marker:', error);
        }
      };
  
      map.on('click', handleMapClick);
      
      return () => {
        map.off('click', handleMapClick);
        console.log('Event listener removed');
      };
    }
  }, [map, setLocation]);



  return <div ref={mapRef} id="map" style={{ height: '500px', width: '100%' }}></div>;
};

export default LeafletMap;
