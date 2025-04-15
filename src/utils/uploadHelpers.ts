
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
    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    
    // Upload the file
    const { error: uploadError, data } = await supabase.storage
      .from('report_images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('report_images')
      .getPublicUrl(fileName);

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
