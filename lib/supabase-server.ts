import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdminClient: ReturnType<typeof createClient> | null = null;

export const PRODUCT_IMAGE_BUCKET = process.env.SUPABASE_STORAGE_PRODUCTS_BUCKET ?? 'product-images';

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseServiceKey);
}

export function getSupabaseAdmin() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase storage is not configured. Please define SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  if (!supabaseAdminClient) {
    supabaseAdminClient = createClient(supabaseUrl!, supabaseServiceKey!, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseAdminClient;
}

export async function ensureProductBucketExists() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase storage is not configured.');
  }

  const client = getSupabaseAdmin();
  const bucket = PRODUCT_IMAGE_BUCKET;

  const { data, error } = await client.storage.getBucket(bucket);

  if (error && error.message.includes('not found')) {
    const { error: createError } = await client.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5MB per image
    });

    if (createError) {
      throw createError;
    }

    return;
  }

  if (error) {
    throw error;
  }

  if (!data?.public) {
    // ensure bucket is public for direct image access
    await client.storage.updateBucket(bucket, { public: true });
  }
}
