
import React, { useRef, useEffect, useState } from 'react';
import { ScanLine, X, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useHealthStore } from '@/store/healthStore';
import { useIsMobile } from '@/hooks/use-mobile';

interface BarcodeScannerProps {
  onScanResult: (barcode: string) => void;
}

const DEMO_NUTRITION = [
  { label: 'Calories', value: '95 kcal' },
  { label: 'Carbs', value: '25 g' },
  { label: 'Fiber', value: '4 g' },
  { label: 'Sugars', value: '19 g' },
  { label: 'Protein', value: '0.5 g' },
  { label: 'Fat', value: '0.3 g' },
  { label: 'Vitamin C', value: '14% DV' },
];

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScanResult }) => {
  const { toast } = useToast();
  const { geminiTier } = useHealthStore();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoStatus, setDemoStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);
  const controls = useRef<any>(null);

  // Define stopScanning function using function declaration so it's hoisted
  function stopScanning() {
    setDemoStatus('idle');
    if (controls.current) {
      controls.current.stop();
      controls.current = null;
    }
    
    if (codeReader.current) {
      codeReader.current.reset();
      codeReader.current = null;
    }
    
    setIsScanning(false);
    setError(null);
  }

  // Cleanup effect
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopScanning();
    };
  }, []);

  // Only show on mobile and pro tier
  if (!isMobile || geminiTier !== 'pro') {
    return null;
  }

  // Internal function that actually attaches the camera
  const startScanning = async () => {
    // Fallback: if no barcode detected within 10 s, trigger demo code so UX is evident
    const fallbackTimer = setTimeout(() => {
      if (!isScanning) return; // stopped already
      console.warn('Demo fallback triggered – no barcode detected in time');
      onScanResult('DEMO_BARCODE');
      stopScanning();
      setIsOpen(false);
    }, 10000);

    if (!videoRef.current) return;

    try {
      setError(null);
      setIsScanning(true);

      // Create a new code reader
      codeReader.current = new BrowserMultiFormatReader();

      // Get video devices
      const videoInputDevices = await codeReader.current.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        throw new Error('No camera devices found');
      }

      // Prefer the rear-facing (environment) camera when possible
      let selectedDeviceId: string | undefined;
      if (videoInputDevices.length > 1) {
        // Try to find a device whose label hints it is the back/rear camera
        const rearCam = videoInputDevices.find((d) => /back|rear|environment/i.test(d.label));
        selectedDeviceId = rearCam ? rearCam.deviceId : undefined;
      }
      // Fallbacks
      if (!selectedDeviceId) {
        // On many phones the last device is the rear camera, so prefer that if multiple
        selectedDeviceId = videoInputDevices[videoInputDevices.length - 1]?.deviceId || videoInputDevices[0].deviceId;
      }

      // Start decoding from the video element
      controls.current = await codeReader.current.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        (result, error) => {
          if (result) {
            clearTimeout(fallbackTimer);
            const barcodeText = result.getText();
            console.log('Barcode scanned:', barcodeText);
            
            onScanResult(barcodeText);
            
            toast({
              title: "Barcode Scanned",
              description: `Found barcode: ${barcodeText}`,
              variant: "default",
            });
            
            stopScanning();
            setIsOpen(false);
          }
          
          if (error && error.name !== 'NotFoundException') {
            console.error('Scanning error:', error);
          }
        }
      );
    } catch (err) {
      console.error('Error starting barcode scanner:', err);
      setError(err instanceof Error ? err.message : 'Failed to start camera');
      setIsScanning(false);
      
      toast({
        title: "Camera Error",
        description: "Failed to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const handleOpenDialog = () => {
    setIsOpen(true);
    // Do NOT start scanning immediately – wait for explicit user action
  };

  const handleDemoClick = () => {
    // Stop camera if running
    stopScanning();
    // Show skeleton
    setDemoStatus('loading');
    setTimeout(() => {
      setDemoStatus('done');
    }, 2000);
  };

  const handleCloseDialog = () => {
    stopScanning();
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleOpenDialog}
        className="h-10 w-10 rounded-full hover:bg-accent"
        title="ScanBar"
      >
        <ScanLine className="h-5 w-5" />
      </Button>

      <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
        {/* Increase default rounding on the dialog itself */}
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>ScanBar</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Content area */}
            <div className="relative aspect-square bg-muted rounded-xl overflow-hidden flex items-center justify-center p-4">
              {/* Loading skeleton */}
              {demoStatus === 'loading' && (
                <div className="w-full space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-4 bg-muted-foreground/20 rounded animate-pulse" />
                  ))}
                </div>
              )}

              {/* Demo nutrition animation */}
              {demoStatus === 'done' && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                  className="relative w-full max-w-xs mx-auto rounded-xl p-5 shadow-lg bg-gradient-to-br from-indigo-50 via-purple-50 to-white overflow-y-auto max-h-64"
                >
                  {/* dotted texture overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                      backgroundImage: 'radial-gradient(#c4b5fd 1px, transparent 1px)',
                      backgroundSize: '8px 8px',
                    }}
                  />

                  {/* content */}
                  <div className="relative space-y-3">
                    {DEMO_NUTRITION.map(({ label, value }) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.35, delay: 0.1 }}
                        className="flex justify-between text-sm backdrop-blur-sm"
                      >
                        <span className="font-semibold text-primary/90">{label}</span>
                        <span className="text-muted-foreground">{value}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}


              {/* Camera view / placeholder */}
              {demoStatus === 'idle' && (
                isScanning ? (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      playsInline
                      muted
                    />
                    {/* Scanner overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div
                        className="border-2 border-dashed border-primary rounded-md animate-pulse"
                        style={{ width: '70%', height: '28%', boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)' }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Camera className="h-12 w-12 mb-2" />
                    <p className="text-sm">Camera not active</p>
                  </div>
                )
              )}
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="text-sm text-muted-foreground text-center">
              {demoStatus === 'idle'
                ? 'Position the barcode within the frame to scan'
                : demoStatus === 'loading'
                ? 'Loading nutrition info...'
                : ''}
            </div>

            <div className="flex gap-2">
              {demoStatus === 'idle' && (
                <>
                  <Button
                    className="flex-1"
                    disabled={isScanning}
                    onClick={() => {
                      if (isScanning) return;
                      setIsScanning(true);
                      setTimeout(() => {
                        startScanning();
                      }, 200);
                    }}
                  >
                    {isScanning ? 'Scanning...' : 'Start Scanning'}
                  </Button>

                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={handleDemoClick}
                    disabled={demoStatus === 'loading'}
                  >
                    Demo Nutrition
                  </Button>

                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleCloseDialog}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BarcodeScanner;
