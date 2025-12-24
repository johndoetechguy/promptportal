import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Prompt = Database['public']['Tables']['prompts']['Row'];
type PromptInsert = Database['public']['Tables']['prompts']['Insert'];
type PromptUpdate = Database['public']['Tables']['prompts']['Update'];
type Category = Database['public']['Tables']['categories']['Row'];
type Tool = Database['public']['Tables']['tools']['Row'];
type Tag = Database['public']['Tables']['tags']['Row'];

type PromptVisibility = Database['public']['Enums']['prompt_visibility'];

export interface PromptWithRelations extends Prompt {
  categories: Category | null;
  tools: Tool | null;
  prompt_tags: { tags: Tag | null }[];
  prompt_likes: { user_id: string }[];
  visibility: PromptVisibility;
  _count?: {
    likes: number;
  };
}

// Fetch all published prompts
export const usePrompts = (filters?: {
  categoryId?: string;
  toolId?: string;
  type?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['prompts', filters],
    queryFn: async () => {
      let query = supabase
        .from('prompts')
        .select(`
          *,
          categories(*),
          tools(*),
          prompt_tags(tags(*)),
          prompt_likes(user_id)
        `)
        .eq('status', 'published')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false });

      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }

      if (filters?.toolId) {
        query = query.eq('tool_id', filters.toolId);
      }

      if (filters?.type) {
        query = query.eq('type', filters.type as Database['public']['Enums']['prompt_type']);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as PromptWithRelations[];
    },
  });
};

// Fetch user's prompts (for profile page)
export const useUserPrompts = (userId?: string) => {
  return useQuery({
    queryKey: ['user-prompts', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('prompts')
        .select(`
          *,
          categories(*),
          tools(*),
          prompt_tags(tags(*)),
          prompt_likes(user_id)
        `)
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PromptWithRelations[];
    },
    enabled: !!userId,
  });
};

// Fetch a single prompt by ID
export const usePrompt = (id?: string) => {
  return useQuery({
    queryKey: ['prompt', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('prompts')
        .select(`
          *,
          categories(*),
          tools(*),
          prompt_tags(tags(*)),
          prompt_likes(user_id)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as PromptWithRelations | null;
    },
    enabled: !!id,
  });
};

// Create a new prompt
export const useCreatePrompt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PromptInsert & { tagIds?: string[] }) => {
      const { tagIds, ...promptData } = data;

      const { data: prompt, error } = await supabase
        .from('prompts')
        .insert(promptData)
        .select()
        .single();

      if (error) throw error;

      // Add tags if provided
      if (tagIds && tagIds.length > 0) {
        const tagRelations = tagIds.map(tagId => ({
          prompt_id: prompt.id,
          tag_id: tagId,
        }));

        await supabase.from('prompt_tags').insert(tagRelations);
      }

      return prompt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      queryClient.invalidateQueries({ queryKey: ['user-prompts'] });
    },
  });
};

// Update a prompt
export const useUpdatePrompt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data, tagIds }: { id: string; data: PromptUpdate; tagIds?: string[] }) => {
      const { error } = await supabase
        .from('prompts')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      // Update tags if provided
      if (tagIds !== undefined) {
        // Remove existing tags
        await supabase.from('prompt_tags').delete().eq('prompt_id', id);

        // Add new tags
        if (tagIds.length > 0) {
          const tagRelations = tagIds.map(tagId => ({
            prompt_id: id,
            tag_id: tagId,
          }));
          await supabase.from('prompt_tags').insert(tagRelations);
        }
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      queryClient.invalidateQueries({ queryKey: ['prompt', id] });
      queryClient.invalidateQueries({ queryKey: ['user-prompts'] });
    },
  });
};

// Delete a prompt
export const useDeletePrompt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('prompts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
      queryClient.invalidateQueries({ queryKey: ['user-prompts'] });
    },
  });
};

// Fetch categories
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    },
  });
};

// Fetch tools
export const useTools = () => {
  return useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    },
  });
};

// Fetch tags
export const useTags = () => {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    },
  });
};

// Create a new tag
export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const slug = name.toLowerCase().replace(/\s+/g, '-');

      const { data, error } = await supabase
        .from('tags')
        .insert({ name, slug })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
};
