import React from 'react';
import { SIGNAL_CONFIG, SignalType } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function SignalBadge({ 
  type, 
  size = 'md',
  className
}: { 
  type: SignalType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const config = SIGNAL_CONFIG[type];

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0 h-4',
    md: 'text-xs px-2 py-0.5',
    lg: 'text-sm px-3 py-1'
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge 
            variant="outline" 
            className={cn(
              "font-medium tracking-wide whitespace-nowrap",
              config.bgColor, 
              config.color, 
              config.borderColor,
              sizeClasses[size],
              className
            )}
          >
            <config.icon className="mr-1.5 w-3 h-3 opacity-80" />
            {config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-slate-900 border-slate-700 text-slate-200">
          <p className="text-sm">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
