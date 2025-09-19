"use client";

import React, { useEffect, useState } from "react";
import GoogleMap from "./GoogleMap";

interface GoogleMapsWrapperProps {
  coordinates: [number, number];
  address: string;
  eventName: string;
}

const GoogleMapsWrapper: React.FC<GoogleMapsWrapperProps> = ({
  coordinates,
  address,
  eventName,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    // Check if API key is provided
    const apiKey = process.env.NEXT_PUBLIC_MAP_API;
    console.log("Google Maps API Key:", apiKey ? "Present" : "Missing");
    console.log("API Key value:", apiKey);

    if (!apiKey || apiKey === "YOUR_GOOGLE_MAPS_API_KEY") {
      console.log("Google Maps API key not configured");
      setLoadError(true);
      return;
    }

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Load Google Maps script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    console.log("Loading Google Maps script:", script.src);

    script.onload = () => {
      console.log("Google Maps script loaded successfully");
      setIsLoaded(true);
    };

    script.onerror = () => {
      console.log("Failed to load Google Maps script");
      setLoadError(true);
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup script if component unmounts
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  if (loadError) {
    return (
      <div className='h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-gray-500 dark:text-gray-400 mb-2'>
            Google Maps not available
          </p>
          <p className='text-sm text-gray-400 mb-2'>
            Please add your Google Maps API key to .env.local:
          </p>
          <code className='text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded'>
            NEXT_PUBLIC_MAP_API=your_api_key_here
          </code>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className='h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2'></div>
          <p className='text-gray-500 dark:text-gray-400'>Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='h-64 w-full'>
      <GoogleMap
        coordinates={coordinates}
        address={address}
        eventName={eventName}
      />
    </div>
  );
};

export default GoogleMapsWrapper;
