import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { usePrompt } from '@/hooks/usePrompts';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { ToolBadge, TypeBadge } from '@/components/PromptBadges';
import { LikeButton } from '@/components/LikeButton';
import { FavouriteButton } from '@/components/FavouriteButton';
import { Button } from '@/components/ui/button';
import { getImageKitUrl, DEFAULT_PREVIEW_IMAGE } from '@/components/ImageKitProvider';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Calendar, 
  Tag,
  Layers,
  Sparkles,
  Loader2,
  ImageIcon
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const PromptDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isEditor } = useAuth();
  const [copied, setCopied] = useState(false);

  const { data: prompt, isLoading, error } = usePrompt(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!prompt || error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Prompt not found</h1>
          <p className="text-muted-foreground mb-8">The prompt you're looking for doesn't exist.</p>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Gallery
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt.prompt_text);
      setCopied(true);
      toast.success('Prompt copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy prompt');
    }
  };

  const handleDuplicate = () => {
    // Navigate to create page with prompt data pre-filled
    navigate('/create', { state: { duplicateFrom: prompt } });
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  const previewImage = prompt.preview_image_path 
    ? getImageKitUrl(prompt.preview_image_path) 
    : DEFAULT_PREVIEW_IMAGE;

  const tags = prompt.prompt_tags?.map(pt => pt.tags?.name).filter(Boolean) || [];

  return (
    <>
      <Helmet>
        <title>{prompt.title} - Prompt Portal</title>
        <meta name="description" content={prompt.description || prompt.title} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="container py-8">
          {/* Back Button */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Gallery
          </Link>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Preview Image */}
            <div className="space-y-4 animate-slide-up">
              <div className="rounded-2xl overflow-hidden border border-border/50 bg-card shadow-card">
                <img
                  src={previewImage}
                  alt={prompt.title}
                  className="w-full aspect-[4/3] object-cover"
                />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
              {/* Title & Description */}
              <div className="space-y-3">
                <h1 className="text-3xl font-bold">{prompt.title}</h1>
                {prompt.description && (
                  <p className="text-lg text-muted-foreground">{prompt.description}</p>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-3">
                {prompt.tools && (
                  <ToolBadge tool={prompt.tools.name} className="text-sm px-3 py-1.5" />
                )}
                <TypeBadge type={prompt.type} className="text-sm px-3 py-1.5" />
              </div>

              {/* Like & Favourite */}
              <div className="flex items-center gap-2">
                <LikeButton promptId={prompt.id} variant="outline" />
                <FavouriteButton promptId={prompt.id} variant="outline" />
              </div>

              {/* Prompt Text */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Prompt</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyPrompt}
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-primary" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <div className="relative">
                  <pre className="p-4 rounded-xl bg-secondary/50 border border-border/50 text-sm text-foreground whitespace-pre-wrap font-mono overflow-x-auto">
                    {prompt.prompt_text}
                  </pre>
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-card border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                    <Layers className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p className="text-sm font-medium">{prompt.categories?.name || 'Uncategorized'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-sm font-medium">{formatDate(prompt.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Tags</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 rounded-lg bg-secondary/50 text-sm text-secondary-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button onClick={handleCopyPrompt} className="flex-1 gap-2">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Prompt'}
                </Button>
                {isEditor && (
                  <Button variant="outline" onClick={handleDuplicate} className="flex-1 gap-2">
                    <Sparkles className="w-4 h-4" />
                    Duplicate & Edit
                  </Button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default PromptDetail;
