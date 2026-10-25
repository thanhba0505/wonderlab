'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, ArrowRight } from 'lucide-react';

interface SimulationBridgeCardProps {
  slug: string;
  title: string;
  description: string;
  badge?: string;
}

export function SimulationBridgeCard({
  slug,
  title,
  description,
  badge = 'Phòng Thí nghiệm Tương tác',
}: SimulationBridgeCardProps) {
  return (
    <Card className="my-6 border-slate-300/85 bg-blue-50/40 hover:bg-blue-50/70 border-l-4 border-l-blue-600 transition-colors shadow-xs">
      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="cyan" className="text-xs">
              <FlaskConical className="h-3 w-3 mr-1 text-blue-600" />
              {badge}
            </Badge>
          </div>
          <h4 className="font-heading text-base font-bold text-slate-900">{title}</h4>
          <p className="text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
            {description}
          </p>
        </div>

        <Link href={`/simulations/${slug}`} className="shrink-0">
          <Button
            size="sm"
            className="shadow-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3.5"
          >
            Thực hành ngay
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
