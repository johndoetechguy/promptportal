import { Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useHasFavourited, useToggleFavourite } from '@/hooks/useLikesAndFavourites';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface FavouriteButtonProps {
  promptId: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const FavouriteButton = ({
  promptId,
  variant = 'ghost',
  size = 'sm',
  className,
}: FavouriteButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: hasFavourited } = useHasFavourited(promptId);
  const toggleFavourite = useToggleFavourite();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please sign in to save prompts');
      navigate('/auth');
      return;
    }

    toggleFavourite.mutate({ promptId, isFavourited: !!hasFavourited });
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={toggleFavourite.isPending}
      className={cn(
        hasFavourited && 'text-primary hover:text-primary',
        className
      )}
    >
      <Bookmark
        className={cn(
          'w-4 h-4 transition-all',
          hasFavourited && 'fill-current'
        )}
      />
    </Button>
  );
};
