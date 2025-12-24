import PromptCard from './PromptCard';
import type { PromptWithRelations } from '@/hooks/usePrompts';

// Support both database types and legacy mock types
interface LegacyPrompt {
  id: string;
  title: string;
  [key: string]: any;
}

interface PromptGridProps {
  prompts: (PromptWithRelations | LegacyPrompt)[];
  emptyMessage?: string;
}

const PromptGrid = ({ prompts, emptyMessage = "No prompts found" }: PromptGridProps) => {
  if (prompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <span className="text-2xl">🔍</span>
        </div>
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {prompts.map((prompt, index) => (
        <PromptCard key={prompt.id} prompt={prompt as any} index={index} />
      ))}
    </div>
  );
};

export default PromptGrid;
