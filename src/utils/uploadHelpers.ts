
import { supabase } from "@/integrations/supabase/client";

// Upload report image to Supabase storage
export async function uploadReportImage(file: File): Promise<string | null> {
  try {
    // Get authenticated user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData.user) {
      console.error('Auth error when uploading image:', authError);
      return null;
    }
    
    const userId = authData.user.id;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;
    
    // Upload to report_images bucket
    const { error: uploadError } = await supabase.storage
      .from('report_images')
      .upload(filePath, file);
    
    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }
    
    // Get the public URL
    const { data } = supabase.storage
      .from('report_images')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  } catch (err) {
    console.error('Exception when uploading image:', err);
    return null;
  }
}

// Generate a file name
export function generateFileName(prefix: string = ''): string {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}${timestamp}_${random}`;
}

// Get file extension from file object
export function getFileExtension(file: File): string {
  return file.name.split('.').pop() || '';
}
