import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCategories, useTools, useTags, useCreatePrompt, useCreateTag } from '@/hooks/usePrompts';
import { ImageKitUpload } from '@/components/ImageKitUpload';
import type { Database } from '@/integrations/supabase/types';
import type { PromptWithRelations } from '@/hooks/usePrompts';

type PromptType = Database['public']['Enums']['prompt_type'];
type PromptStatus = Database['public']['Enums']['prompt_status'];
type PromptVisibility = Database['public']['Enums']['prompt_visibility'];

const promptTypes: { value: PromptType; label: string }[] = [
  { value: 'image', label: 'Image' },
  { value: 'text', label: 'Text' },
  { value: 'video', label: 'Video' },
  { value: 'code', label: 'Code' },
];

const promptStatuses: { value: PromptStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
];

const visibilityOptions: { value: PromptVisibility; label: string; description: string }[] = [
  { value: 'public', label: 'Public', description: 'Visible to everyone' },
  { value: 'private', label: 'Private', description: 'Only visible to you' },
];

const CreatePrompt = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const duplicateFrom = location.state?.duplicateFrom as PromptWithRelations | undefined;

  const { data: categories } = useCategories();
  const { data: tools } = useTools();
  const { data: existingTags } = useTags();
  const createPrompt = useCreatePrompt();
  const createTag = useCreateTag();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    promptText: '',
    type: 'image' as PromptType,
    categoryId: '',
    toolId: '',
    status: 'published' as PromptStatus,
    visibility: 'public' as PromptVisibility,
    previewImagePath: '',
  });
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect non-authenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('You must be logged in to create prompts');
      navigate('/auth');
    }
  }, [authLoading, user, navigate]);

  // Pre-fill form if duplicating
  useEffect(() => {
    if (duplicateFrom) {
      setFormData({
        title: `${duplicateFrom.title} (Copy)`,
        description: duplicateFrom.description || '',
        promptText: duplicateFrom.prompt_text,
        type: duplicateFrom.type,
        categoryId: duplicateFrom.category_id || '',
        toolId: duplicateFrom.tool_id || '',
        status: 'draft',
        visibility: duplicateFrom.visibility || 'private',
        previewImagePath: duplicateFrom.preview_image_path || '',
      });
      
      // Set tags from duplicated prompt
      const tagIds = duplicateFrom.prompt_tags
        ?.map(pt => pt.tags?.id)
        .filter((id): id is string => !!id) || [];
      setSelectedTagIds(tagIds);
    }
  }, [duplicateFrom]);

  // Set default category and tool when loaded
  useEffect(() => {
    if (categories?.length && !formData.categoryId && !duplicateFrom) {
      setFormData(prev => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [categories, formData.categoryId, duplicateFrom]);

  useEffect(() => {
    if (tools?.length && !formData.toolId && !duplicateFrom) {
      setFormData(prev => ({ ...prev, toolId: tools[0].id }));
    }
  }, [tools, formData.toolId, duplicateFrom]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTag = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      
      // Check if tag already exists
      const existingTag = existingTags?.find(
        t => t.name.toLowerCase() === tagInput.trim().toLowerCase()
      );
      
      if (existingTag) {
        if (!selectedTagIds.includes(existingTag.id)) {
          setSelectedTagIds(prev => [...prev, existingTag.id]);
        }
      } else {
        // Create new tag
        try {
          const newTag = await createTag.mutateAsync(tagInput.trim());
          setSelectedTagIds(prev => [...prev, newTag.id]);
        } catch (error) {
          toast.error('Failed to create tag');
        }
      }
      
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagId: string) => {
    setSelectedTagIds(prev => prev.filter(id => id !== tagId));
  };

  const handleImageUpload = (path: string) => {
    setFormData(prev => ({ ...prev, previewImagePath: path }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to create prompts');
      return;
    }

    // Validate required fields
    if (!formData.title.trim() || !formData.promptText.trim()) {
      toast.error('Please fill in the required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      await createPrompt.mutateAsync({
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        prompt_text: formData.promptText.trim(),
        type: formData.type,
        category_id: formData.categoryId || null,
        tool_id: formData.toolId || null,
        status: formData.status,
        visibility: formData.visibility,
        preview_image_path: formData.previewImagePath || null,
        created_by: user.id,
        tagIds: selectedTagIds,
      });

      toast.success('Prompt created successfully!');
      navigate('/');
    } catch (error: any) {
      console.error('Error creating prompt:', error);
      toast.error(error.message || 'Failed to create prompt');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get tag names for display
  const selectedTagNames = selectedTagIds
    .map(id => existingTags?.find(t => t.id === id)?.name)
    .filter(Boolean);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Create Prompt - Prompt Portal</title>
        <meta name="description" content="Create a new AI prompt for your collection" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="container py-8 max-w-3xl">
          {/* Back Button */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Gallery
          </Link>

          <div className="space-y-8 animate-fade-in">
            <div>
              <h1 className="text-3xl font-bold">
                {duplicateFrom ? 'Duplicate Prompt' : 'Create New Prompt'}
              </h1>
              <p className="text-muted-foreground mt-2">
                Fill in the details below to create your prompt
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter a descriptive title"
                  className="bg-secondary/50 border-border/50"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of your prompt"
                  className="bg-secondary/50 border-border/50"
                />
              </div>

              {/* Prompt Text */}
              <div className="space-y-2">
                <Label htmlFor="promptText">Prompt Text *</Label>
                <Textarea
                  id="promptText"
                  name="promptText"
                  value={formData.promptText}
                  onChange={handleInputChange}
                  placeholder="Enter your full prompt text here..."
                  className="min-h-[150px] bg-secondary/50 border-border/50 font-mono text-sm"
                />
              </div>

              {/* Type, Category, Tool, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleSelectChange('type', value)}
                  >
                    <SelectTrigger className="bg-secondary/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {promptTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => handleSelectChange('categoryId', value)}
                  >
                    <SelectTrigger className="bg-secondary/50 border-border/50">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tool</Label>
                  <Select
                    value={formData.toolId}
                    onValueChange={(value) => handleSelectChange('toolId', value)}
                  >
                    <SelectTrigger className="bg-secondary/50 border-border/50">
                      <SelectValue placeholder="Select tool" />
                    </SelectTrigger>
                    <SelectContent>
                      {tools?.map((tool) => (
                        <SelectItem key={tool.id} value={tool.id}>
                          {tool.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange('status', value)}
                  >
                    <SelectTrigger className="bg-secondary/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {promptStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Visibility</Label>
                  <Select
                    value={formData.visibility}
                    onValueChange={(value) => handleSelectChange('visibility', value)}
                  >
                    <SelectTrigger className="bg-secondary/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {visibilityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Type a tag and press Enter"
                  className="bg-secondary/50 border-border/50"
                />
                {selectedTagNames.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTagIds.map((tagId) => {
                      const tag = existingTags?.find(t => t.id === tagId);
                      if (!tag) return null;
                      return (
                        <span
                          key={tagId}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary/15 text-primary text-sm"
                        >
                          {tag.name}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tagId)}
                            className="hover:text-primary-foreground transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Preview Image */}
              <div className="space-y-2">
                <Label>Preview Image</Label>
                <ImageKitUpload
                  onUploadSuccess={handleImageUpload}
                  currentPath={formData.previewImagePath}
                  userId={user?.id}
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 gap-2" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isSubmitting ? 'Saving...' : 'Save Prompt'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/')}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  );
};

export default CreatePrompt;
