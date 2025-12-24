import { IKContext } from 'imagekitio-react';
import { supabase } from '@/integrations/supabase/client';

const IMAGEKIT_URL_ENDPOINT = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/johndoetechguy';
const IMAGEKIT_PUBLIC_KEY = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || 'public_vnA2u5x/Vq4+6gAXUYGT+/yb/SQ=';

// Default preview image for prompts without an image
export const DEFAULT_PREVIEW_IMAGE = 'https://ik.imagekit.io/johndoetechguy/cinematic.png';

// Authenticator function for ImageKit uploads
const authenticator = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('imagekit-auth');
    
    if (error) {
      console.error('ImageKit auth error:', error);
      throw new Error('Failed to authenticate with ImageKit');
    }
    
    return {
      signature: data.signature,
      expire: data.expire,
      token: data.token,
    };
  } catch (err) {
    console.error('ImageKit authenticator error:', err);
    throw err;
  }
};

interface ImageKitProviderProps {
  children: React.ReactNode;
}

export const ImageKitProvider = ({ children }: ImageKitProviderProps) => {
  return (
    <IKContext
      urlEndpoint={IMAGEKIT_URL_ENDPOINT}
      publicKey={IMAGEKIT_PUBLIC_KEY}
      authenticator={authenticator}
    >
      {children}
    </IKContext>
  );
};

export const getImageKitUrl = (path?: string | null) => {
  if (!path) return DEFAULT_PREVIEW_IMAGE;
  if (path.startsWith('http')) return path;
  return `${IMAGEKIT_URL_ENDPOINT}${path.startsWith('/') ? '' : '/'}${path}`;
};
