import { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Download, RotateCw, Maximize2, Minimize2 } from 'lucide-react';

interface EC8AFormModalProps {
  imageUrl: string;
  pollingUnitName: string;
  onClose: () => void;
}

/**
 * EC8A Form Image Modal with Zoom and Pan Controls
 * Optimized for performance with transform-based zoom
 */
export default function EC8AFormModal({ imageUrl, pollingUnitName, onClose }: EC8AFormModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Handle zoom
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 0.5));
  const handleResetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  // Handle rotation
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  // Handle fullscreen
  const handleFullscreen = () => {
    if (!isFullscreen && containerRef.current) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle download
  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `EC8A_${pollingUnitName.replace(/\s+/g, '_')}_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image');
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(5, prev + delta)));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
        case '_':
          handleZoomOut();
          break;
        case '0':
          handleResetZoom();
          break;
        case 'r':
        case 'R':
          handleRotate();
          break;
        case 'f':
        case 'F':
          handleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Header Controls */}
      <div className="bg-gray-900 bg-opacity-90 backdrop-blur-sm border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-white font-semibold text-lg">EC8A Form</h3>
          <span className="text-gray-400 text-sm">•</span>
          <span className="text-gray-300 text-sm">{pollingUnitName}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <button
            onClick={handleZoomOut}
            className="p-2 text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-5 h-5" />
          </button>

          <span className="text-white text-sm min-w-[60px] text-center">
            {(zoom * 100).toFixed(0)}%
          </span>

          <button
            onClick={handleZoomIn}
            className="p-2 text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-5 h-5" />
          </button>

          {/* Rotate */}
          <button
            onClick={handleRotate}
            className="p-2 text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="Rotate (R)"
          >
            <RotateCw className="w-5 h-5" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={handleFullscreen}
            className="p-2 text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="Fullscreen (F)"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-2 text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Image Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
          </div>
        )}

        <div className="w-full h-full flex items-center justify-center p-4">
          <img
            ref={imageRef}
            src={imageUrl}
            alt={`EC8A Form - ${pollingUnitName}`}
            className="max-w-full max-h-full object-contain select-none"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.2s ease-out',
              imageRendering: zoom > 2 ? 'crisp-edges' : 'auto'
            }}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              alert('Failed to load image');
            }}
            draggable={false}
          />
        </div>
      </div>

      {/* Footer Hints */}
      <div className="bg-gray-900 bg-opacity-90 backdrop-blur-sm border-t border-gray-700 px-4 py-2">
        <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
          <span>Scroll to zoom</span>
          <span>•</span>
          <span>Drag to pan</span>
          <span>•</span>
          <span>Press R to rotate</span>
          <span>•</span>
          <span>Press F for fullscreen</span>
          <span>•</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}
