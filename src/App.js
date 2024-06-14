import React, { useState, useEffect, useRef } from 'react'
import L from 'leaflet'
import axios from 'axios'
import './App.css'
// import 'leaflet/dist/leaflet.css' // Ensure Leaflet CSS is imported

function App() {
  const [map, setMap] = useState(null)
  const [marker, setMarker] = useState(null)
  const [lat, setLat] = useState(null)
  const [lng, setLng] = useState(null)
  const [address, setAddress] = useState('')
  const [latDMS, setLatDMS] = useState('')
  const [lngDMS, setLngDMS] = useState('')
  const [shareUrl, setShareUrl] = useState('')

  const mapRef = useRef(null) // Ref for map container element

  useEffect(() => {
    // Initialize map when component mounts
    const initializeMap = () => {
      if (!mapRef.current) return // Ensure map container is available

      const mapInstance = L.map(mapRef.current).setView(
        [-0.398221, 36.960749],
        13
      )

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstance)

      mapInstance.on('click', onMapClick)

      setMap(mapInstance)
    }

    initializeMap() // Initialize map on component mount

    return () => {
      // Clean up map when component unmounts
      if (map) {
        map.remove()
      }
    }
  }, []) // Empty dependency array ensures this runs once on mount

  const onMapClick = (e) => {
    const { lat, lng } = e.latlng

    updateCoordinatesDisplay(lat, lng)
    getAddress(lat, lng)
    placeMarker(lat, lng)
  }

  const updateCoordinatesDisplay = (lat, lng) => {
    setLat(lat)
    setLng(lng)
    setLatDMS(toDMS(lat, false))
    setLngDMS(toDMS(lng, true))

    const currentUrl = window.location.origin + window.location.pathname
    const shareUrl = `${currentUrl}?lat=${lat}&lng=${lng}`
    setShareUrl(shareUrl)
  }

  const getAddress = (lat, lng) => {
    const apiKey = '373683d91c6d49e38571fffdb2f6782f' // Replace with your API key
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}`

    axios
      .get(url)
      .then((response) => {
        if (response.data.results.length > 0) {
          setAddress(response.data.results[0].formatted)
        } else {
          setAddress('Address not found')
        }
      })
      .catch((error) => {
        console.error('Error fetching address:', error)
        setAddress('Error fetching address')
      })
  }

  const placeMarker = (lat, lng) => {
    if (marker) {
      map.removeLayer(marker)
    }
    const newMarker = L.marker([lat, lng]).addTo(map)
    setMarker(newMarker)
    map.setView([lat, lng], 13)
  }

  const toDMS = (coordinate, isLng) => {
    const absolute = Math.abs(coordinate)
    const degrees = Math.floor(absolute)
    const minutesNotTruncated = (absolute - degrees) * 60
    const minutes = Math.floor(minutesNotTruncated)
    const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(3)

    const direction = coordinate >= 0 ? (isLng ? 'E' : 'N') : isLng ? 'W' : 'S'

    return `${degrees}° ${minutes}' ${seconds}" ${direction}`
  }

  useEffect(() => {
    // Check for URL parameters and place marker if they exist
    const urlParams = new URLSearchParams(window.location.search)
    const latParam = parseFloat(urlParams.get('lat'))
    const lngParam = parseFloat(urlParams.get('lng'))

    if (!isNaN(latParam) && !isNaN(lngParam)) {
      updateCoordinatesDisplay(latParam, lngParam)
      getAddress(latParam, lngParam)
      placeMarker(latParam, lngParam)
    }
  }, []) // Empty dependency array ensures this runs once on mount

  return (
    <div className="App">
      <h1>Coordinates Picker</h1>
      <div id="container">
        <div ref={mapRef} id="map"></div>
        <div className="coordinates">
          <label htmlFor="address">Address:</label>
          <input type="text" id="address" value={address} readOnly />

          <div>
            <h2>DD (decimal degrees)</h2>
            <label htmlFor="lat">Latitude:</label>
            <input type="text" id="lat" value={lat} readOnly />
            <label htmlFor="lng">Longitude:</label>
            <input type="text" id="lng" value={lng} readOnly />
          </div>

          <div>
            <h2>DMS (degrees, minutes, seconds)</h2>
            <label htmlFor="lat_dms">Latitude:</label>
            <input type="text" id="lat_dms" value={latDMS} readOnly />
            <label htmlFor="lng_dms">Longitude:</label>
            <input type="text" id="lng_dms" value={lngDMS} readOnly />
          </div>

          <div className="share-location">
            <h2>Share my Location</h2>
            <p>
              If you need to share your location with someone, you can simply
              send them the following link:
            </p>
            <input type="text" id="share_url" value={shareUrl} readOnly />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
