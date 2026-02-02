import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

export default function LearningView() {
  return (
    <div>
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            Learning
          </CardTitle>
          <CardDescription className="text-white/60">
            AI-powered code learning and mentoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-white/70">Learning view content goes here...</p>
        </CardContent>
      </Card>
    </div>
  );
}
