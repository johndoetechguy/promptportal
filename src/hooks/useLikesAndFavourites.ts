import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Check if user has liked a prompt
export const useHasLiked = (promptId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['has-liked', promptId, user?.id],
    queryFn: async () => {
      if (!user || !promptId) return false;

      const { data, error } = await supabase
        .from('prompt_likes')
        .select('user_id')
        .eq('prompt_id', promptId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!promptId,
  });
};

// Get like count for a prompt
export const useLikeCount = (promptId?: string) => {
  return useQuery({
    queryKey: ['like-count', promptId],
    queryFn: async () => {
      if (!promptId) return 0;

      const { count, error } = await supabase
        .from('prompt_likes')
        .select('*', { count: 'exact', head: true })
        .eq('prompt_id', promptId);

      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!promptId,
  });
};

// Toggle like
export const useToggleLike = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ promptId, isLiked }: { promptId: string; isLiked: boolean }) => {
      if (!user) throw new Error('Must be logged in to like');

      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('prompt_likes')
          .delete()
          .eq('prompt_id', promptId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('prompt_likes')
          .insert({ prompt_id: promptId, user_id: user.id });

        if (error) throw error;
      }
    },
    onSuccess: (_, { promptId }) => {
      queryClient.invalidateQueries({ queryKey: ['has-liked', promptId] });
      queryClient.invalidateQueries({ queryKey: ['like-count', promptId] });
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      queryClient.invalidateQueries({ queryKey: ['liked-prompts'] });
    },
  });
};

// Check if user has favourited a prompt
export const useHasFavourited = (promptId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['has-favourited', promptId, user?.id],
    queryFn: async () => {
      if (!user || !promptId) return false;

      const { data, error } = await supabase
        .from('prompt_favourites')
        .select('user_id')
        .eq('prompt_id', promptId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!promptId,
  });
};

// Toggle favourite
export const useToggleFavourite = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ promptId, isFavourited }: { promptId: string; isFavourited: boolean }) => {
      if (!user) throw new Error('Must be logged in to favourite');

      if (isFavourited) {
        // Remove favourite
        const { error } = await supabase
          .from('prompt_favourites')
          .delete()
          .eq('prompt_id', promptId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Add favourite
        const { error } = await supabase
          .from('prompt_favourites')
          .insert({ prompt_id: promptId, user_id: user.id });

        if (error) throw error;
      }
    },
    onSuccess: (_, { promptId }) => {
      queryClient.invalidateQueries({ queryKey: ['has-favourited', promptId] });
      queryClient.invalidateQueries({ queryKey: ['favourite-prompts'] });
    },
  });
};

// Get user's favourite prompts
export const useFavouritePrompts = (userId?: string) => {
  return useQuery({
    queryKey: ['favourite-prompts', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('prompt_favourites')
        .select(`
          prompt_id,
          prompts(
            *,
            categories(*),
            tools(*),
            prompt_tags(tags(*)),
            prompt_likes(user_id)
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return data.map(d => d.prompts).filter(Boolean);
    },
    enabled: !!userId,
  });
};

// Get user's liked prompts
export const useLikedPrompts = (userId?: string) => {
  return useQuery({
    queryKey: ['liked-prompts', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('prompt_likes')
        .select(`
          prompt_id,
          prompts(
            *,
            categories(*),
            tools(*),
            prompt_tags(tags(*)),
            prompt_likes(user_id)
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return data.map(d => d.prompts).filter(Boolean);
    },
    enabled: !!userId,
  });
};
