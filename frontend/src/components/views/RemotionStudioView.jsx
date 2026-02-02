import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Video } from 'lucide-react';

export default function RemotionStudioView() {
  return (
    <div>
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-pink-400" />
            Remotion Studio
          </CardTitle>
          <CardDescription className="text-white/60">
            AI-powered video code generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-white/70">Remotion Studio content goes here...</p>
        </CardContent>
      </Card>
    </div>
  );
}