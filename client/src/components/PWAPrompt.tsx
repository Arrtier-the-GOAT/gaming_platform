import { useState, useEffect } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';
import { Download, Wifi, WifiOff, X } from 'lucide-react';
import { toast } from 'sonner';

export function PWAPrompt() {
  const { installPrompt, isOnline, installApp } = usePWA();
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showOfflineNotice, setShowOfflineNotice] = useState(!isOnline);

  useEffect(() => {
    if (installPrompt) {
      setShowInstallPrompt(true);
    }
  }, [installPrompt]);

  useEffect(() => {
    setShowOfflineNotice(!isOnline);
    if (!isOnline) {
      toast.info('You are offline - using cached data');
    } else {
      toast.success('Back online!');
    }
  }, [isOnline]);

  const handleInstall = async () => {
    try {
      await installApp();
      setShowInstallPrompt(false);
      toast.success('Gaming Hub installed! You can now access it from your home screen.');
    } catch (error) {
      console.error('Installation failed:', error);
      toast.error('Installation failed. Please try again.');
    }
  };

  return (
    <>
      {/* Install Prompt */}
      {showInstallPrompt && installPrompt && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg p-4 z-50 animate-in slide-in-from-bottom-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold">Install Gaming Hub</h3>
                <p className="text-sm text-blue-100 mt-1">
                  Install our app on your device for quick access and offline play!
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="flex-shrink-0 text-blue-100 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleInstall}
              size="sm"
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              Install
            </Button>
            <Button
              onClick={() => setShowInstallPrompt(false)}
              size="sm"
              variant="outline"
              className="border-blue-300 text-white hover:bg-blue-700"
            >
              Later
            </Button>
          </div>
        </div>
      )}

      {/* Offline Indicator */}
      {showOfflineNotice && !isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white px-4 py-2 flex items-center justify-center gap-2 z-40 animate-in slide-in-from-top-2">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">
            You are offline - using cached data. Some features may be limited.
          </span>
        </div>
      )}

      {/* Online Indicator (brief) */}
      {isOnline && showOfflineNotice && (
        <div className="fixed top-0 left-0 right-0 bg-green-500 text-white px-4 py-2 flex items-center justify-center gap-2 z-40 animate-in slide-in-from-top-2">
          <Wifi className="w-4 h-4" />
          <span className="text-sm font-medium">Back online!</span>
        </div>
      )}
    </>
  );
}

