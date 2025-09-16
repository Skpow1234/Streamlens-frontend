'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface SessionTimeoutWarningProps {
  isOpen: boolean;
  onClose: () => void;
  remainingTime: number; // in seconds
}

export default function SessionTimeoutWarning({
  isOpen,
  onClose,
  remainingTime
}: SessionTimeoutWarningProps): JSX.Element {
  const { user, signOut } = useAuth();
  const { showSystemStatus } = useNotifications();
  const [timeLeft, setTimeLeft] = useState(remainingTime);
  const [isExtending, setIsExtending] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setTimeLeft(remainingTime);

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Session expired
          clearInterval(interval);
          onClose();
          signOut();
          showSystemStatus('Your session has expired. Please sign in again.', 'warning');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, remainingTime, onClose, signOut, showSystemStatus]);

  const handleExtendSession = async () => {
    setIsExtending(true);
    try {
      // Here you would typically refresh the token
      // For now, we'll simulate a successful extension
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Reset the timer
      setTimeLeft(remainingTime);
      onClose();
      showSystemStatus('Session extended successfully', 'success');
      toast.success('Session extended! You can continue working.');
    } catch (error) {
      showSystemStatus('Failed to extend session. Please try again.', 'error');
    } finally {
      setIsExtending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (timeLeft / remainingTime) * 100;

  if (!isOpen) return <></>;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            Session Expiring Soon
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-mono font-bold text-amber-600 mb-2">
              {formatTime(timeLeft)}
            </div>
            <p className="text-sm text-muted-foreground">
              Your session will expire in {timeLeft} seconds
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Time remaining</span>
              <span>{formatTime(timeLeft)}</span>
            </div>
            <Progress
              value={progressPercentage}
              className="h-2"
            />
          </div>

          <div className="bg-amber-50 p-3 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Save your work!</strong> Any unsaved changes will be lost when your session expires.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isExtending}
            >
              <Clock className="h-4 w-4 mr-2" />
              Continue Working
            </Button>
            <Button
              onClick={handleExtendSession}
              className="flex-1"
              disabled={isExtending}
            >
              {isExtending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Extending...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Extend Session
                </>
              )}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Auto-logout in {timeLeft} seconds
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
