import { Link } from 'react-router-dom';
import { ToolBadge, TypeBadge } from './PromptBadges';
import { ImageIcon } from 'lucide-react';
import { LikeButton } from './LikeButton';
import { FavouriteButton } from './FavouriteButton';
import { getImageKitUrl, DEFAULT_PREVIEW_IMAGE } from './ImageKitProvider';
import type { PromptWithRelations } from '@/hooks/usePrompts';

// Local asset imports for default prompts
const localImages: Record<string, string> = Object.fromEntries(
  Object.entries(import.meta.glob('@/assets/prompts/*.{jpg,jpeg,png,webp}', { eager: true, as: 'url' }))
    .map(([path, url]) => [path.split('/').pop(), url])
);

// For backwards compatibility with mock data
interface LegacyPrompt {
  id: string;
  title: string;
  description?: string;
  promptText?: string;
  prompt_text?: string;
  promptType?: string;
  type?: string;
  category?: string;
  categories?: { name: string } | null;
  tool?: string;
  tools?: { name: string } | null;
  tags?: string[];
  prompt_tags?: { tags: { name: string } | null }[];
  previewImage?: string;
  preview_image_path?: string | null;
  prompt_likes?: { user_id: string }[];
}

interface PromptCardProps {
  prompt: PromptWithRelations | LegacyPrompt;
  index?: number;
}

const PromptCard = ({ prompt, index = 0 }: PromptCardProps) => {
  // Normalize data to handle both database and mock data formats
  const title = prompt.title;
  const promptText = 'prompt_text' in prompt ? prompt.prompt_text : (prompt as any).promptText;
  const promptType = 'type' in prompt ? prompt.type : (prompt as any).promptType;
  const category = prompt.categories?.name || (prompt as any).category;
  const tool = prompt.tools?.name || (prompt as any).tool;
  const getPreviewImage = () => {
    const path = 'preview_image_path' in prompt ? prompt.preview_image_path : null;
    if (path) {
      // Check if it's a local asset path (starts with /prompts/)
      if (path.startsWith('/prompts/')) {
        const filename = path.split('/').pop();
        return filename ? localImages[filename] : DEFAULT_PREVIEW_IMAGE;
      }
      return getImageKitUrl(path);
    }
    // Fallback to legacy format or default image
    return (prompt as any).previewImage || DEFAULT_PREVIEW_IMAGE;
  };
  const previewImage = getPreviewImage();
  const likeCount = prompt.prompt_likes?.length || 0;

  return (
    <Link to={`/prompt/${prompt.id}`}>
      <article 
        className="group bg-card rounded-xl border border-border/50 overflow-hidden transition-all duration-300 hover:border-border hover:shadow-card-hover hover:-translate-y-1 card-shine animate-fade-in"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {/* Preview Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          {previewImage ? (
            <img
              src={previewImage}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
            </div>
          )}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Like and Favourite buttons on hover */}
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <FavouriteButton promptId={prompt.id} size="icon" variant="outline" />
            <LikeButton promptId={prompt.id} showCount={false} size="icon" variant="outline" />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h3 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {title}
          </h3>

          {/* Tool Badge */}
          {tool && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">App</span>
              <ToolBadge tool={tool} />
            </div>
          )}

          {/* Prompt Preview */}
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Prompt</span>
            <p className="text-sm text-secondary-foreground line-clamp-3">
              {promptText}
            </p>
          </div>

          {/* Type indicator and likes */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-1 text-muted-foreground">
              <ImageIcon className="w-3.5 h-3.5" />
              <span className="text-xs capitalize">{promptType}</span>
            </div>
            <div className="flex items-center gap-2">
              {likeCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {likeCount} ❤️
                </span>
              )}
              {promptType && <TypeBadge type={promptType} />}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default PromptCard;
