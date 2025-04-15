import mapboxgl from 'mapbox-gl';

// Initialize Mapbox with the access token from environment variables
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

// Export the configured mapboxgl instance
export { mapboxgl }; 