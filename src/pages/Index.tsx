import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import CategoryFilter from '@/components/CategoryFilter';
import PromptGrid from '@/components/PromptGrid';
import { usePrompts, useCategories, useTools } from '@/hooks/usePrompts';
import { Sparkles, Filter, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTool, setActiveTool] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: tools, isLoading: toolsLoading } = useTools();

  // Build filters for query
  const filters = useMemo(() => {
    const f: { categoryId?: string; toolId?: string; search?: string } = {};
    
    if (activeCategory !== 'All' && categories) {
      const cat = categories.find(c => c.name === activeCategory);
      if (cat) f.categoryId = cat.id;
    }
    
    if (activeTool !== 'All' && tools) {
      const tool = tools.find(t => t.name === activeTool);
      if (tool) f.toolId = tool.id;
    }
    
    if (searchQuery) {
      f.search = searchQuery;
    }
    
    return f;
  }, [activeCategory, activeTool, searchQuery, categories, tools]);

  const { data: prompts, isLoading: promptsLoading } = usePrompts(filters);

  // Build category list for filter
  const categoryList = useMemo(() => {
    const list = ['All'];
    if (categories) {
      list.push(...categories.map(c => c.name));
    }
    return list;
  }, [categories]);

  // Build tool list for filter
  const toolList = useMemo(() => {
    const list = ['All'];
    if (tools) {
      list.push(...tools.map(t => t.name));
    }
    return list;
  }, [tools]);

  const isLoading = promptsLoading || categoriesLoading || toolsLoading;

  return (
    <>
      <Helmet>
        <title>Prompt Portal - AI Prompt Management Platform</title>
        <meta name="description" content="Discover, create, and manage AI prompts for ChatGPT, Midjourney, DALL·E, and Stable Diffusion. Your go-to platform for prompt engineering." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header onSearch={setSearchQuery} />

        <main className="container py-8 space-y-8">
          {/* Hero Section */}
          <section className="text-center py-8 space-y-4 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Discover AI Prompts</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Find the Perfect <span className="gradient-text">Prompt</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Browse our curated collection of AI prompts for image generation, text creation, and more.
              Copy, customize, and create stunning results.
            </p>
          </section>

          {/* Filters */}
          <section className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CategoryFilter 
                categories={categoryList}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
              
              <div className="flex items-center gap-3">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={activeTool} onValueChange={setActiveTool}>
                  <SelectTrigger className="w-[160px] bg-secondary/50 border-border/50">
                    <SelectValue placeholder="Select tool" />
                  </SelectTrigger>
                  <SelectContent>
                    {toolList.map((tool) => (
                      <SelectItem key={tool} value={tool}>
                        {tool}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing <span className="text-foreground font-medium">{prompts?.length || 0}</span> prompts
            </p>
          </div>

          {/* Prompt Grid */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <PromptGrid 
              prompts={(prompts || []) as any}
              emptyMessage="No prompts found. Try adjusting your filters or create the first prompt!"
            />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-border/50 py-8 mt-16">
          <div className="container text-center text-sm text-muted-foreground">
            <p>© 2024 Prompt Portal. Crafted with ✨ for AI creators.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;
