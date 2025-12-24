import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useHasLiked, useLikeCount, useToggleLike } from '@/hooks/useLikesAndFavourites';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LikeButtonProps {
  promptId: string;
  showCount?: boolean;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const LikeButton = ({
  promptId,
  showCount = true,
  variant = 'ghost',
  size = 'sm',
  className,
}: LikeButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: hasLiked } = useHasLiked(promptId);
  const { data: likeCount } = useLikeCount(promptId);
  const toggleLike = useToggleLike();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please sign in to like prompts');
      navigate('/auth');
      return;
    }

    toggleLike.mutate({ promptId, isLiked: !!hasLiked });
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={toggleLike.isPending}
      className={cn(
        'gap-1.5',
        hasLiked && 'text-red-500 hover:text-red-600',
        className
      )}
    >
      <Heart
        className={cn(
          'w-4 h-4 transition-all',
          hasLiked && 'fill-current'
        )}
      />
      {showCount && <span>{likeCount ?? 0}</span>}
    </Button>
  );
};
