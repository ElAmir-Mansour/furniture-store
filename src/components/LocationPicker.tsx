'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the map to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), {
    ssr: false,
    loading: () => (
        <div style={{
            height: '100%',
            background: 'var(--color-bg-alt)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <p>Loading map...</p>
        </div>
    ),
});

interface Location {
    lat: number;
    lng: number;
    address?: string;
}

interface LocationPickerProps {
    defaultLocation?: Location;
    onLocationSelect: (location: Location) => void;
    height?: number;
}

// Egypt center (Cairo)
const EGYPT_CENTER = { lat: 30.0444, lng: 31.2357 };

// Major Egyptian cities
const EGYPTIAN_CITIES = [
    { name: 'Cairo', lat: 30.0444, lng: 31.2357 },
    { name: 'Giza', lat: 30.0131, lng: 31.2089 },
    { name: 'Alexandria', lat: 31.2001, lng: 29.9187 },
    { name: 'Nasr City', lat: 30.0511, lng: 31.3656 },
    { name: 'Maadi', lat: 29.9602, lng: 31.2569 },
    { name: 'Heliopolis', lat: 30.0866, lng: 31.3232 },
    { name: '6th October', lat: 29.9285, lng: 30.9188 },
    { name: 'New Cairo', lat: 30.0074, lng: 31.4913 },
];

export default function LocationPicker({
    defaultLocation,
    onLocationSelect,
    height = 350,
}: LocationPickerProps) {
    const [position, setPosition] = useState<Location>(defaultLocation || EGYPT_CENTER);
    const [address, setAddress] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);

    // Reverse geocode
    const reverseGeocode = useCallback(async (lat: number, lng: number) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
                { headers: { 'Accept-Language': 'ar,en' } }
            );
            const data = await res.json();
            if (data?.display_name) {
                setAddress(data.display_name);
                return data.display_name;
            }
        } catch (error) {
            console.error('Geocoding failed:', error);
        }
        return '';
    }, []);

    // Search address
    const searchAddress = useCallback(async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Egypt')}&limit=5`,
                { headers: { 'Accept-Language': 'ar,en' } }
            );
            setSearchResults(await res.json());
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setSearching(false);
        }
    }, [searchQuery]);

    // Handle map click
    const handleMapClick = useCallback(async (lat: number, lng: number) => {
        const newPos = { lat, lng };
        setPosition(newPos);
        const addr = await reverseGeocode(lat, lng);
        onLocationSelect({ ...newPos, address: addr });
    }, [onLocationSelect, reverseGeocode]);

    // Select search result
    const selectResult = (result: any) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        const newPos = { lat, lng, address: result.display_name };
        setPosition(newPos);
        setAddress(result.display_name);
        setSearchResults([]);
        setSearchQuery('');
        onLocationSelect(newPos);
    };

    // Quick city selection
    const selectCity = async (city: typeof EGYPTIAN_CITIES[0]) => {
        const newPos = { lat: city.lat, lng: city.lng };
        setPosition(newPos);
        const addr = await reverseGeocode(city.lat, city.lng);
        onLocationSelect({ ...newPos, address: addr });
    };

    return (
        <div>
            {/* Search Bar */}
            <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <input
                            type="text"
                            className="input"
                            placeholder="Search for an address..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && searchAddress()}
                        />
                        {searchResults.length > 0 && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                background: 'white',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                boxShadow: 'var(--shadow-lg)',
                                zIndex: 1000,
                                maxHeight: 200,
                                overflow: 'auto',
                            }}>
                                {searchResults.map((result, i) => (
                                    <button
                                        key={i}
                                        onClick={() => selectResult(result)}
                                        style={{
                                            width: '100%',
                                            padding: 'var(--spacing-sm) var(--spacing-md)',
                                            border: 'none',
                                            background: 'transparent',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            borderBottom: i < searchResults.length - 1 ? '1px solid var(--color-border)' : 'none',
                                            fontSize: '0.875rem',
                                        }}
                                    >
                                        📍 {result.display_name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button onClick={searchAddress} disabled={searching} className="btn btn-primary">
                        {searching ? '...' : 'Search'}
                    </button>
                </div>
            </div>

            {/* Quick Cities */}
            <div style={{ display: 'flex', gap: 'var(--spacing-xs)', flexWrap: 'wrap', marginBottom: 'var(--spacing-md)' }}>
                {EGYPTIAN_CITIES.map((city) => (
                    <button
                        key={city.name}
                        onClick={() => selectCity(city)}
                        style={{
                            padding: '4px 10px',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--color-bg)',
                            fontSize: '0.7rem',
                            cursor: 'pointer',
                        }}
                    >
                        {city.name}
                    </button>
                ))}
            </div>

            {/* Map */}
            <div style={{ height, borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                <MapComponent position={position} onMapClick={handleMapClick} />
            </div>

            {/* Selected Address */}
            {address && (
                <div style={{
                    marginTop: 'var(--spacing-md)',
                    padding: 'var(--spacing-md)',
                    background: 'linear-gradient(135deg, rgba(193, 167, 130, 0.1), rgba(26, 35, 50, 0.05))',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-secondary)',
                }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>📍 Selected Location:</p>
                    <p style={{ margin: '4px 0 0', fontSize: '0.875rem', fontWeight: 500 }}>{address}</p>
                    <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                        Coordinates: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                    </p>
                </div>
            )}

            <p style={{ marginTop: 'var(--spacing-sm)', fontSize: '0.7rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                💡 Click anywhere on the map to pin your delivery location
            </p>
        </div>
    );
}
