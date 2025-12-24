import { cn } from '@/lib/utils';

interface ToolBadgeProps {
  tool: string;
  className?: string;
}

export const ToolBadge = ({ tool, className }: ToolBadgeProps) => {
  const getToolClass = (toolName: string) => {
    const toolLower = toolName.toLowerCase();
    if (toolLower.includes('chatgpt')) return 'tool-badge-chatgpt';
    if (toolLower.includes('midjourney')) return 'tool-badge-midjourney';
    if (toolLower.includes('dall') || toolLower.includes('dalle')) return 'tool-badge-dalle';
    if (toolLower.includes('stable')) return 'tool-badge-stable-diffusion';
    if (toolLower.includes('runway') || toolLower.includes('sora')) return 'tool-badge-midjourney';
    return 'tool-badge-chatgpt';
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
      getToolClass(tool),
      className
    )}>
      {tool}
    </span>
  );
};

interface TypeBadgeProps {
  type: string;
  className?: string;
}

export const TypeBadge = ({ type, className }: TypeBadgeProps) => {
  const getTypeClass = (typeName: string) => {
    const typeLower = typeName.toLowerCase();
    switch (typeLower) {
      case 'image':
        return 'type-badge-image';
      case 'text':
        return 'type-badge-text';
      case 'video':
        return 'type-badge-video';
      case 'code':
        return 'type-badge-code';
      default:
        return 'type-badge-image';
    }
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium capitalize',
      getTypeClass(type),
      className
    )}>
      {type}
    </span>
  );
};
