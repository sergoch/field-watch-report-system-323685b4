
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

/**
 * Uploads an image to the report_images storage bucket
 * @param file The file to upload
 * @returns The URL of the uploaded image or null if upload failed
 */
export async function uploadReportImage(file: File): Promise<string | null> {
  try {
    // Generate a unique file name to avoid collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;
    
    console.log('Uploading file:', filePath);
    
    // Upload to report_images bucket
    const { data, error } = await supabase.storage
      .from('report_images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('report_images')
      .getPublicUrl(filePath);
    
    console.log('Upload successful. Public URL:', publicUrl);
    
    return publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
}

/**
 * Uploads an image to the storage bucket and returns the URL
 * @param file The file to upload
 * @param bucket The bucket to upload to, defaults to 'report_images'
 * @returns The URL of the uploaded image or null if upload failed
 */
export async function uploadImage(
  file: File,
  bucket: string = 'report_images'
): Promise<string | null> {
  try {
    // Generate a unique file name to avoid collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;
    
    console.log(`Uploading file to ${bucket}:`, filePath);
    
    // Upload to specified bucket
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error(`Error uploading image to ${bucket}:`, error);
      throw error;
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    console.log('Upload successful. Public URL:', publicUrl);
    
    return publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
}
