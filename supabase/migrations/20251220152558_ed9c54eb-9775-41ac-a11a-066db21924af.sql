
-- Create enums for roles, prompt types, prompt status, tool types, and media types
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'viewer');
CREATE TYPE public.prompt_type AS ENUM ('image', 'text', 'video', 'code');
CREATE TYPE public.prompt_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE public.tool_type AS ENUM ('image', 'text', 'video');
CREATE TYPE public.media_type AS ENUM ('image', 'video');

-- Create profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, role)
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create tools table
CREATE TABLE public.tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type tool_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create tags table
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create prompts table
CREATE TABLE public.prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  prompt_text TEXT NOT NULL,
  type prompt_type NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  tool_id UUID REFERENCES public.tools(id) ON DELETE SET NULL,
  preview_image_path TEXT,
  status prompt_status NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create prompt_tags junction table
CREATE TABLE public.prompt_tags (
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (prompt_id, tag_id)
);

-- Create media_assets table
CREATE TABLE public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE,
  type media_type NOT NULL,
  path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create prompt_likes table
CREATE TABLE public.prompt_likes (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, prompt_id)
);

-- Create prompt_favourites table
CREATE TABLE public.prompt_favourites (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, prompt_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_favourites ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is editor or admin
CREATE OR REPLACE FUNCTION public.is_editor_or_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('editor', 'admin')
  )
$$;

-- Create function to handle new user creation (auto-create profile and assign viewer role)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  
  -- Assign default viewer role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'viewer');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create trigger for prompts updated_at
CREATE TRIGGER update_prompts_updated_at
  BEFORE UPDATE ON public.prompts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());

-- RLS Policies for user_roles (only admins can manage)
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for categories (public read, admin write)
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for tools (public read, admin write)
CREATE POLICY "Anyone can view tools" ON public.tools
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage tools" ON public.tools
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for tags (public read, editors/admins write)
CREATE POLICY "Anyone can view tags" ON public.tags
  FOR SELECT USING (true);

CREATE POLICY "Editors and admins can manage tags" ON public.tags
  FOR ALL TO authenticated USING (public.is_editor_or_admin(auth.uid()));

-- RLS Policies for prompts
CREATE POLICY "Anyone can view published prompts" ON public.prompts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Editors can view own prompts" ON public.prompts
  FOR SELECT TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Admins can view all prompts" ON public.prompts
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Editors can create prompts" ON public.prompts
  FOR INSERT TO authenticated WITH CHECK (public.is_editor_or_admin(auth.uid()) AND created_by = auth.uid());

CREATE POLICY "Editors can update own prompts" ON public.prompts
  FOR UPDATE TO authenticated USING (created_by = auth.uid() AND public.is_editor_or_admin(auth.uid()));

CREATE POLICY "Admins can update all prompts" ON public.prompts
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Editors can delete own prompts" ON public.prompts
  FOR DELETE TO authenticated USING (created_by = auth.uid() AND public.is_editor_or_admin(auth.uid()));

CREATE POLICY "Admins can delete all prompts" ON public.prompts
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for prompt_tags
CREATE POLICY "Anyone can view prompt tags for published prompts" ON public.prompt_tags
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.prompts WHERE id = prompt_id AND status = 'published')
  );

CREATE POLICY "Editors can manage tags for own prompts" ON public.prompt_tags
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.prompts WHERE id = prompt_id AND created_by = auth.uid())
    AND public.is_editor_or_admin(auth.uid())
  );

CREATE POLICY "Admins can manage all prompt tags" ON public.prompt_tags
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for media_assets
CREATE POLICY "Anyone can view media for published prompts" ON public.media_assets
  FOR SELECT USING (
    prompt_id IS NULL OR EXISTS (SELECT 1 FROM public.prompts WHERE id = prompt_id AND status = 'published')
  );

CREATE POLICY "Editors can manage media for own prompts" ON public.media_assets
  FOR ALL TO authenticated USING (
    public.is_editor_or_admin(auth.uid()) AND
    (prompt_id IS NULL OR EXISTS (SELECT 1 FROM public.prompts WHERE id = prompt_id AND created_by = auth.uid()))
  );

CREATE POLICY "Admins can manage all media" ON public.media_assets
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for prompt_likes
CREATE POLICY "Anyone can view like counts" ON public.prompt_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like" ON public.prompt_likes
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove own likes" ON public.prompt_likes
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- RLS Policies for prompt_favourites
CREATE POLICY "Users can view own favourites" ON public.prompt_favourites
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can favourite" ON public.prompt_favourites
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove own favourites" ON public.prompt_favourites
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Insert initial categories
INSERT INTO public.categories (name, slug) VALUES
  ('Products', 'products'),
  ('Ads', 'ads'),
  ('Fantasy', 'fantasy'),
  ('Architecture', 'architecture'),
  ('UI', 'ui'),
  ('Cyberpunk', 'cyberpunk'),
  ('Nature', 'nature'),
  ('Portrait', 'portrait'),
  ('Abstract', 'abstract');

-- Insert initial tools
INSERT INTO public.tools (name, type) VALUES
  ('ChatGPT', 'text'),
  ('Midjourney', 'image'),
  ('DALL·E', 'image'),
  ('Stable Diffusion', 'image'),
  ('Runway', 'video'),
  ('Sora', 'video');
