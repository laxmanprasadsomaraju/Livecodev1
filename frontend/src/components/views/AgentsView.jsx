import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function AgentsView() {
  return (
    <div>
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            Agents
          </CardTitle>
          <CardDescription className="text-white/60">
            Specialized AI agents for different tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-white/70">Agents view content goes here...</p>
        </CardContent>
      </Card>
    </div>
  );
}