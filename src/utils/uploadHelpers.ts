
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

/**
 * Upload an image file to Supabase storage
 * @param file The file to upload
 * @param bucket The storage bucket name
 * @param folder Optional folder path within the bucket
 * @returns The URL of the uploaded file or null if the upload failed
 */
export async function uploadImage(
  file: File, 
  bucket: string = 'report_images', 
  folder: string = ''
): Promise<string | null> {
  try {
    // Create a unique file name with the original extension
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    
    // Create the path (with folder if provided)
    const filePath = folder 
      ? `${folder}/${fileName}` 
      : fileName;
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

/**
 * Upload a report image to Supabase storage
 * @param file The image file to upload
 * @returns The URL of the uploaded file or null if the upload failed
 */
export async function uploadReportImage(file: File): Promise<string | null> {
  return uploadImage(file, 'report_images');
}

/**
 * Delete an image from Supabase storage
 * @param url The public URL of the image to delete
 * @param bucket The storage bucket name
 * @returns True if the deletion was successful, false otherwise
 */
export async function deleteImage(
  url: string,
  bucket: string = 'report_images'
): Promise<boolean> {
  try {
    // Extract the filename from the URL
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
    // Delete the file
    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
}
