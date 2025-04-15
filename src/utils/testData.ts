
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Create a test engineer account
 */
export async function createTestEngineer(username: string, password: string, fullName: string) {
  try {
    // First check if the engineer already exists
    const { data: existingEngineer } = await supabase
      .from('engineers')
      .select('id')
      .eq('username', username)
      .single();

    if (existingEngineer) {
      console.log('Engineer already exists:', existingEngineer);
      return existingEngineer.id;
    }

    // Create the engineer
    const { data: engineer, error } = await supabase
      .from('engineers')
      .insert({
        username: username,
        password_hash: password, // In a real app, this would be hashed
        full_name: fullName,
        email: `${username}@amradzi-engineer.com`
      })
      .select()
      .single();

    if (error) throw error;

    // Sign up the engineer in auth.users
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: engineer.email,
      password: password,
      options: {
        data: {
          engineer_id: engineer.id,
          name: fullName,
          role: 'engineer'
        }
      }
    });

    if (authError) {
      console.warn('Could not create auth user for engineer:', authError);
    }

    toast({
      title: "Test Engineer Created",
      description: `Engineer ${username} was created successfully`
    });

    return engineer.id;
  } catch (error: any) {
    console.error('Error creating engineer:', error);
    toast({
      title: "Error Creating Engineer",
      description: error.message,
      variant: "destructive"
    });
    return null;
  }
}

/**
 * Assign an engineer to regions
 */
export async function assignEngineerToRegions(engineerId: string, regionIds: string[]) {
  try {
    const assignments = regionIds.map(regionId => ({
      engineer_id: engineerId,
      region_id: regionId
    }));

    const { error } = await supabase
      .from('engineer_regions')
      .insert(assignments);

    if (error) throw error;

    toast({
      title: "Regions Assigned",
      description: `Engineer assigned to ${regionIds.length} regions`
    });

    return true;
  } catch (error: any) {
    console.error('Error assigning engineer to regions:', error);
    toast({
      title: "Error Assigning Regions",
      description: error.message,
      variant: "destructive"
    });
    return false;
  }
}
