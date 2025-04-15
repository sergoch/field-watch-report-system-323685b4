
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/jpg"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadReportImage(file: File): Promise<string | null> {
  // Validate file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    toast({
      title: "Invalid file type",
      description: "Please upload a JPEG or PNG image.",
      variant: "destructive",
    });
    return null;
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    toast({
      title: "File too large",
      description: "Please upload an image smaller than 5MB.",
      variant: "destructive",
    });
    return null;
  }

  try {
    // First check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Auth error during upload:", authError);
      toast({
        title: "Authentication Error",
        description: "You must be logged in to upload images. Please log in again.",
        variant: "destructive",
      });
      return null;
    }
    
    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    
    console.log("Uploading with authenticated user ID:", user.id);
    console.log("File upload params:", {
      bucket: "report_images", 
      path: `incidents/${fileName}`,
      contentType: file.type
    });
    
    // Upload the file to the correct bucket with public access
    const { error: uploadError, data } = await supabase.storage
      .from('report_images')
      .upload(`incidents/${fileName}`, file, {
        upsert: false, // Don't overwrite existing files
        contentType: file.type // Set the content type explicitly
      });

    if (uploadError) {
      console.error('Upload error details:', uploadError);
      toast({
        title: "Upload Failed",
        description: `Error: ${uploadError.message || "Could not upload image"}`,
        variant: "destructive",
      });
      return null;
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('report_images')
      .getPublicUrl(`incidents/${fileName}`);

    console.log("Upload successful, public URL:", publicUrl);
    return publicUrl;
  } catch (error: any) {
    console.error('Error uploading image:', error);
    toast({
      title: "Upload Error",
      description: error.message || "Failed to upload image. Please try again.",
      variant: "destructive",
    });
    return null;
  }
}
