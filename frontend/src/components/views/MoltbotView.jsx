import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export default function MoltbotView() {
  return (
    <div>
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-red-400" />
            Moltbot
          </CardTitle>
          <CardDescription className="text-white/60">
            Conversational AI coding assistant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-white/70">Moltbot chat view content goes here...</p>
        </CardContent>
      </Card>
    </div>
  );
}