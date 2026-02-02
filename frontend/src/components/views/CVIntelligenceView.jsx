import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function CVIntelligenceView() {
  return (
    <div>
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-400" />
            CV Intelligence
          </CardTitle>
          <CardDescription className="text-white/60">
            AI-powered CV optimization and interview prep
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-white/70">CV Intelligence view content goes here...</p>
        </CardContent>
      </Card>
    </div>
  );
}