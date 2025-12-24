import { IKUpload } from 'imagekitio-react';
import { useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { getImageKitUrl, DEFAULT_PREVIEW_IMAGE } from './ImageKitProvider';
import { toast } from 'sonner';

const IMAGEKIT_URL_ENDPOINT = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/johndoetechguy';
const IMAGEKIT_PUBLIC_KEY = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || 'public_vnA2u5x/Vq4+6gAXUYGT+/yb/SQ=';

const authenticator = async () => {
  const { data, error } = await supabase.functions.invoke('imagekit-auth');

  if (error) {
    console.error('ImageKit auth invoke error:', error);
    throw new Error('Failed to authenticate with ImageKit');
  }

  return {
    signature: data.signature,
    expire: data.expire,
    token: data.token,
  };
};

interface UploadResult {
  filePath: string;
  url: string;
}

interface ImageKitUploadProps {
  onUploadSuccess: (path: string) => void;
  currentPath?: string;
  userId?: string;
  className?: string;
}

export const ImageKitUpload = ({
  onUploadSuccess,
  currentPath,
  userId,
  className,
}: ImageKitUploadProps) => {
  const uploadRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentPath ? getImageKitUrl(currentPath) : '');

  // Create user-specific folder path
  const folder = userId ? `/users/${userId}/prompts` : '/prompts';

  const handleUploadStart = () => {
    setIsUploading(true);
  };

  const handleUploadSuccess = (res: UploadResult) => {
    setIsUploading(false);
    setPreviewUrl(res.url);
    onUploadSuccess(res.filePath);
    toast.success('Image uploaded successfully!');
  };

  const handleUploadError = (err: any) => {
    setIsUploading(false);
    toast.error('Failed to upload image: ' + (err?.message || 'Unknown error'));
  };

  const handleRemove = () => {
    setPreviewUrl('');
    onUploadSuccess('');
  };

  const triggerUpload = () => {
    uploadRef.current?.click();
  };

  return (
    <div className={className}>
      {/* Hidden upload input */}
      <IKUpload
        ref={uploadRef}
        folder={folder}
        publicKey={IMAGEKIT_PUBLIC_KEY}
        urlEndpoint={IMAGEKIT_URL_ENDPOINT}
        authenticator={authenticator}
        onUploadStart={handleUploadStart}
        onSuccess={handleUploadSuccess}
        onError={handleUploadError}
        accept="image/*,video/*"
        style={{ display: 'none' }}
      />

      {/* Preview or Upload Area */}
      {previewUrl ? (
        <div className="relative rounded-xl overflow-hidden border border-border/50 bg-card">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full aspect-video object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="absolute bottom-2 right-2"
            onClick={triggerUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Change'
            )}
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={triggerUpload}
          disabled={isUploading}
          className="w-full rounded-xl border border-dashed border-border/50 bg-secondary/30 aspect-video flex flex-col items-center justify-center hover:border-primary/50 hover:bg-secondary/50 transition-colors cursor-pointer relative overflow-hidden"
        >
          {/* Default image as background */}
          <img 
            src={DEFAULT_PREVIEW_IMAGE} 
            alt="Default preview" 
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="relative z-10 flex flex-col items-center">
            {isUploading ? (
              <>
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-2" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <ImagePlus className="w-10 h-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload image</p>
                <p className="text-xs text-muted-foreground/70 mt-1">PNG, JPG, WEBP, MP4</p>
              </>
            )}
          </div>
        </button>
      )}
    </div>
  );
};
