import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/supabase.js';
import { env, isLiveSupabaseAvailable } from '../config/env.js';

// In-Memory store for uploaded document buffers if local mode
const localBufferStore = new Map();

/**
 * Calculate SHA-256 hash of a file buffer
 */
export function calculateDocumentHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Store document securely in private Supabase Storage or local secure memory buffer
 */
export async function storeDocument({ buffer, originalname, mimetype, userId }) {
  const hash = calculateDocumentHash(buffer);
  const ext = originalname.split('.').pop() || 'pdf';
  const sanitizedFilename = originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `${userId}/${uuidv4()}_${sanitizedFilename}`;

  if (isLiveSupabaseAvailable && supabase) {
    const { data, error } = await supabase.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: mimetype,
        upsert: false,
      });

    if (error) {
      console.error('[DocuSense Storage Error]:', error.message);
      throw new Error(`Failed to store document in private storage: ${error.message}`);
    }

    return {
      storagePath: data.path,
      documentHash: hash,
      fileSize: buffer.length,
    };
  }

  // Fallback memory storage
  localBufferStore.set(storagePath, {
    buffer,
    mimetype,
    originalname,
  });

  return {
    storagePath,
    documentHash: hash,
    fileSize: buffer.length,
  };
}

/**
 * Retrieve document buffer or generate signed preview URL
 */
export async function getDocumentAccess({ storagePath, expiresIn = 3600 }) {
  if (isLiveSupabaseAvailable && supabase) {
    const { data, error } = await supabase.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .createSignedUrl(storagePath, expiresIn);

    if (error) {
      throw new Error(`Failed to generate signed document URL: ${error.message}`);
    }

    return {
      signedUrl: data.signedUrl,
      isDirectStream: false,
    };
  }

  // For local mode, access will stream through backend document endpoint
  return {
    signedUrl: null,
    isDirectStream: true,
  };
}

/**
 * Get raw file buffer for internal processing or streaming
 */
export async function getDocumentBuffer(storagePath) {
  if (isLiveSupabaseAvailable && supabase) {
    const { data, error } = await supabase.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .download(storagePath);

    if (error) throw error;
    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  const stored = localBufferStore.get(storagePath);
  return stored ? stored.buffer : null;
}
