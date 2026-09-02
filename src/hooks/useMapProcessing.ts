import { useState, useCallback } from 'react';
import { MapLayer } from '../types/map';

export const useMapProcessing = (initialSource?: any) => {
  const [selectedSource, setSelectedSource] = useState<any>(initialSource);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeLayer, setActiveLayer] = useState<MapLayer>('Tactical');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [is3DMode, setIs3DMode] = useState<boolean>(true);
  const [walkthroughActive, setWalkthroughActive] = useState<boolean>(false);

  const processImage = useCallback((source: any, durationMs: number = 1000) => {
    setSelectedSource(source);
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
    }, durationMs);
  }, []);

  const toggleWalkthrough = useCallback(() => {
    setWalkthroughActive((prev) => !prev);
  }, []);

  const zoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 2.0));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.8));
  }, []);

  return {
    selectedSource,
    setSelectedSource,
    isProcessing,
    processImage,
    activeLayer,
    setActiveLayer,
    zoomLevel,
    setZoomLevel,
    zoomIn,
    zoomOut,
    is3DMode,
    setIs3DMode,
    walkthroughActive,
    toggleWalkthrough,
  };
};

export default useMapProcessing;
