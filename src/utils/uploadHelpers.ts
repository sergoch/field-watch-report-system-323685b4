
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';

export async function uploadReportImage(file: File): Promise<string | null> {
  try {
    // Verify authentication
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user) {
      console.error('Authentication error during file upload:', authError);
      toast({
        title: "Authentication Error",
        description: "You must be logged in to upload files. Please log in again.",
        variant: "destructive"
      });
      return null;
    }

    // Validate file
    if (!file || !(file instanceof File)) {
      console.error('Invalid file provided to uploadReportImage');
      return null;
    }

    // Generate a unique filename with uuid
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${auth.user.id}/${fileName}`;

    console.log(`Uploading file to report_images/${filePath}`);

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('report_images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Could not upload image. Please try again.",
        variant: "destructive"
      });
      return null;
    }
    
    console.log('File uploaded successfully:', data.path);
    
    // Get the public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('report_images')
      .getPublicUrl(data.path);
      
    console.log('Public URL:', urlData.publicUrl);
    
    return urlData.publicUrl;
  } catch (error: any) {
    console.error('Exception in uploadReportImage:', error);
    toast({
      title: "Upload Error",
      description: error.message || "An unexpected error occurred during upload.",
      variant: "destructive"
    });
    return null;
  }
}
