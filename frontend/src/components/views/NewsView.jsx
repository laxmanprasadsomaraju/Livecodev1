import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Newspaper } from 'lucide-react';

export default function NewsView() {
  return (
    <div>
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-yellow-400" />
            News
          </CardTitle>
          <CardDescription className="text-white/60">
            AI-powered tech news aggregation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-white/70">News feed content goes here...</p>
        </CardContent>
      </Card>
    </div>
  );
}