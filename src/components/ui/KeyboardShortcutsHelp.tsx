'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Keyboard, X } from 'lucide-react';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { key: 'Space', description: 'Play/Pause video' },
  { key: 'F', description: 'Toggle fullscreen' },
  { key: 'M', description: 'Toggle mute' },
  { key: '←', description: 'Rewind 10 seconds' },
  { key: '→', description: 'Forward 10 seconds' },
  { key: '↑', description: 'Increase volume' },
  { key: '↓', description: 'Decrease volume' },
  { key: '0-9', description: 'Jump to 0-90% of video' },
];

export default function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{shortcut.description}</span>
                <Badge variant="secondary" className="font-mono">
                  {shortcut.key}
                </Badge>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Shortcuts are disabled when typing in text fields.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
