import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import PromptGrid from '@/components/PromptGrid';
import { useUserPrompts } from '@/hooks/usePrompts';
import { useFavouritePrompts, useLikedPrompts } from '@/hooks/useLikesAndFavourites';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  Bookmark,
  FileText,
  LogOut,
  Loader2,
} from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, roles, isLoading, isEditor, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState(isEditor ? 'created' : 'favourites');

  const { data: userPrompts, isLoading: promptsLoading } = useUserPrompts(user?.id);
  const { data: favouritePrompts, isLoading: favouritesLoading } = useFavouritePrompts(user?.id);
  const { data: likedPrompts, isLoading: likesLoading } = useLikedPrompts(user?.id);

  // Redirect if not logged in
  if (!isLoading && !user) {
    navigate('/auth');
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const initials = profile?.name
    ? profile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <>
      <Helmet>
        <title>Profile - Prompt Portal</title>
        <meta name="description" content="View and manage your profile, prompts, and favourites" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="container py-8 space-y-8">
          {/* Profile Header */}
          <section className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 animate-fade-in">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <Avatar className="w-20 h-20 md:w-24 md:h-24">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-bold">
                    {profile?.name || 'User'}
                  </h1>
                  {roles.map((role) => (
                    <Badge
                      key={role}
                      variant={role === 'admin' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {role}
                    </Badge>
                  ))}
                </div>
                <p className="text-muted-foreground">{profile?.email || user?.email}</p>
                
                <div className="flex flex-wrap gap-4 pt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {userPrompts?.length || 0} prompts
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {likedPrompts?.length || 0} liked
                  </span>
                  <span className="flex items-center gap-1">
                    <Bookmark className="w-4 h-4" />
                    {favouritePrompts?.length || 0} saved
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </section>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-secondary/50">
              {isEditor && (
                <TabsTrigger value="created" className="gap-2">
                  <FileText className="w-4 h-4" />
                  My Prompts
                </TabsTrigger>
              )}
              <TabsTrigger value="favourites" className="gap-2">
                <Bookmark className="w-4 h-4" />
                Saved
              </TabsTrigger>
              <TabsTrigger value="liked" className="gap-2">
                <Heart className="w-4 h-4" />
                Liked
              </TabsTrigger>
            </TabsList>

            {isEditor && (
              <TabsContent value="created" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">My Prompts</h2>
                  <Link to="/create">
                    <Button size="sm">Create New</Button>
                  </Link>
                </div>
                {promptsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <PromptGrid
                    prompts={(userPrompts || []) as any}
                    emptyMessage="You haven't created any prompts yet."
                  />
                )}
              </TabsContent>
            )}

            <TabsContent value="favourites" className="space-y-6">
              <h2 className="text-xl font-semibold">Saved Prompts</h2>
              {favouritesLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <PromptGrid
                  prompts={(favouritePrompts || []) as any}
                  emptyMessage="You haven't saved any prompts yet. Browse the gallery and click the bookmark icon to save prompts."
                />
              )}
            </TabsContent>

            <TabsContent value="liked" className="space-y-6">
              <h2 className="text-xl font-semibold">Liked Prompts</h2>
              {likesLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <PromptGrid
                  prompts={(likedPrompts || []) as any}
                  emptyMessage="You haven't liked any prompts yet."
                />
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
};

export default Profile;
