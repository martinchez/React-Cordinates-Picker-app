import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

function App() {
  const mapRef = useRef(null) // Ref for map container element
  const map = useRef(null) // Ref for Leaflet map instance

  useEffect(() => {
    if (!mapRef.current) return

    // Initialize map
    map.current = L.map(mapRef.current).setView([51.505, -0.09], 13)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map.current)

    return () => {
      // Clean up map
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  return (
    <div className="App">
      <div ref={mapRef} style={{ height: '400px' }}></div>
    </div>
  )
}

export default App
