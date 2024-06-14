import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Import marker icon image
import markerIconUrl from './marker-icon.png' // Replace with your marker icon file path

const MapComponent = () => {
  const mapRef = useRef(null) // Ref for map container element
  const [address, setAddress] = useState('')
  const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 })
  const [latDMS, setLatDMS] = useState('')
  const [lngDMS, setLngDMS] = useState('')
  const [shareUrl, setShareUrl] = useState('')
  const markerRef = useRef(null) // Ref for marker instance

  useEffect(() => {
    if (!mapRef.current) return

    // Initialize map
    const map = L.map(mapRef.current).setView([-0.398221, 36.960749], 13)

    // Load and display tile layers on the map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    // Create custom icon for marker
    const customMarkerIcon = L.icon({
      iconUrl: markerIconUrl,
       iconSize:     [38, 95], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    })

    // Function to convert coordinates to address
    const getAddress = (lat, lng) => {
      const apiKey = '373683d91c6d49e38571fffdb2f6782f' // Replace with your API key
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}`

      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          if (data.results.length > 0) {
            setAddress(data.results[0].formatted)
          } else {
            setAddress('Address not found')
          }
        })
        .catch((error) => {
          console.error('Error fetching address:', error)
          setAddress('Error fetching address')
        })
    }

    // Function to convert Decimal Degrees to DMS
    const toDMS = (coordinate, isLng) => {
      const absolute = Math.abs(coordinate)
      const degrees = Math.floor(absolute)
      const minutesNotTruncated = (absolute - degrees) * 60
      const minutes = Math.floor(minutesNotTruncated)
      const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(3)

      const direction =
        coordinate >= 0 ? (isLng ? 'E' : 'N') : isLng ? 'W' : 'S'

      return `${degrees}° ${minutes}' ${seconds}" ${direction}`
    }

    // Function to update the coordinates display
    const updateCoordinatesDisplay = (lat, lng) => {
      setCoordinates({ lat, lng })
      setLatDMS(toDMS(lat, false))
      setLngDMS(toDMS(lng, true))

      const shareUrl = `${window.location.origin}${window.location.pathname}?lat=${lat}&lng=${lng}`
      setShareUrl(shareUrl)
    }

    // Function to place a marker on the map
    const placeMarker = (lat, lng) => {
      if (markerRef.current) {
        map.removeLayer(markerRef.current)
      }
      markerRef.current = L.marker([lat, lng], {
        icon: customMarkerIcon,
      }).addTo(map)
      map.setView([lat, lng], 13)
    }

    // Add click event listener to the map
    map.on('click', function (e) {
      const lat = e.latlng.lat
      const lng = e.latlng.lng

      // Update input fields with the coordinates
      updateCoordinatesDisplay(lat, lng)

      // Get the address for the clicked coordinates
      getAddress(lat, lng)

      // Place a marker on the map
      placeMarker(lat, lng)
    })

    // Function to get URL parameters
    const getUrlParameter = (name) => {
      name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]')
      const regex = new RegExp('[\\?&]' + name + '=([^&#]*)')
      const results = regex.exec(window.location.search)
      return results === null
        ? null
        : decodeURIComponent(results[1].replace(/\+/g, ' '))
    }

    // Check for URL parameters and place marker if they exist
    const latParam = getUrlParameter('lat')
    const lngParam = getUrlParameter('lng')
    if (latParam && lngParam) {
      const lat = parseFloat(latParam)
      const lng = parseFloat(lngParam)

      // Update input fields with the coordinates
      updateCoordinatesDisplay(lat, lng)

      // Get the address for the coordinates
      getAddress(lat, lng)

      // Place a marker on the map
      placeMarker(lat, lng)
    }

    return () => {
      // Clean up map
      if (map) {
        map.remove()
      }
    }
  }, [])

  return (
    <div
      id="container"
      style={{ display: 'flex', flexDirection: 'row-reverse', margin: '20px' }}
    >
      <div id="map" ref={mapRef} style={{ height: '70vh', width: '60%' }}></div>
      <div
        className="coordinates"
        style={{
          width: '40%',
          padding: '20px',
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
        }}
      >
        <label
          htmlFor="address"
          style={{ display: 'block', marginTop: '10px' }}
        >
          Address:
        </label>
        <input
          type="text"
          id="address"
          value={address}
          readOnly
          style={{
            width: '100%',
            padding: '5px',
            marginTop: '5px',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        />

        <div>
          <h2>DD (decimal degrees)</h2>
          <label htmlFor="lat" style={{ display: 'block', marginTop: '10px' }}>
            Latitude:
          </label>
          <input
            type="text"
            id="lat"
            value={coordinates.lat}
            readOnly
            style={{
              width: '100%',
              padding: '5px',
              marginTop: '5px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
          <label htmlFor="lng" style={{ display: 'block', marginTop: '10px' }}>
            Longitude:
          </label>
          <input
            type="text"
            id="lng"
            value={coordinates.lng}
            readOnly
            style={{
              width: '100%',
              padding: '5px',
              marginTop: '5px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
        </div>

        <div>
          <h2>DMS (degrees, minutes, seconds)</h2>
          <label
            htmlFor="lat_dms"
            style={{ display: 'block', marginTop: '10px' }}
          >
            Latitude:
          </label>
          <input
            type="text"
            id="lat_dms"
            value={latDMS}
            readOnly
            style={{
              width: '100%',
              padding: '5px',
              marginTop: '5px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
          <label
            htmlFor="lng_dms"
            style={{ display: 'block', marginTop: '10px' }}
          >
            Longitude:
          </label>
          <input
            type="text"
            id="lng_dms"
            value={lngDMS}
            readOnly
            style={{
              width: '100%',
              padding: '5px',
              marginTop: '5px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
        </div>

        <div className="share-location" style={{ marginTop: '20px' }}>
          <h2>Share my Location</h2>
          <p>
            If you need to share your location with someone, you can simply send
            them the following link:
          </p>
          <input
            type="text"
            id="share_url"
            value={shareUrl}
            readOnly
            style={{
              width: '100%',
              padding: '5px',
              marginTop: '5px',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          />
        </div>
      </div>
      <p>
        Total Visitors: <span id="visitorCount">0</span>
      </p>
    </div>
  )
}

function App() {
  return (
    <div className="App">
      <h1
        style={{
          textAlign: 'center',
          margin: '20px 0',
          fontSize: '2.5em',
          color: '#4A90E2',
        }}
      >
        Coordinates Picker
      </h1>
      <MapComponent />
    </div>
  )
}

export default App
