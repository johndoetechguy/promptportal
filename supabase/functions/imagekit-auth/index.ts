import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const privateKey = Deno.env.get('IMAGEKIT_PRIVATE_KEY');
    
    if (!privateKey) {
      console.error('IMAGEKIT_PRIVATE_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'ImageKit private key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate token, signature and expire time
    const token = crypto.randomUUID();
    const expire = Math.floor(Date.now() / 1000) + 2400; // 40 minutes from now
    
    // Create signature: HMAC-SHA1 of (token + expire) with private key
    const stringToSign = token + expire.toString();
    const hmac = createHmac('sha1', privateKey);
    hmac.update(stringToSign);
    const signature = hmac.digest('hex');

    console.log('Generated ImageKit auth params successfully');

    return new Response(
      JSON.stringify({
        token,
        expire,
        signature,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error generating ImageKit auth:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate authentication parameters' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
