// Waitlist helper functions
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Check if an email is on the waitlist and has been invited
 */
export async function isEmailInvited(email: string): Promise<boolean> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase
      .from('waitlist')
      .select('invited')
      .eq('email', email.toLowerCase())
      .eq('invited', true)
      .single();

    if (error || !data) {
      return false;
    }

    return data.invited === true;
  } catch (error) {
    console.error('Error checking waitlist invite status:', error);
    return false;
  }
}

/**
 * Check if an email is on the waitlist (invited or not)
 */
export async function isEmailOnWaitlist(email: string): Promise<boolean> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase
      .from('waitlist')
      .select('email')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !data) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking waitlist status:', error);
    return false;
  }
}

/**
 * Mark a waitlist user as invited
 */
export async function inviteWaitlistUser(email: string): Promise<boolean> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { error } = await supabase
      .from('waitlist')
      .update({
        invited: true,
        invited_at: new Date().toISOString(),
      })
      .eq('email', email.toLowerCase());

    if (error) {
      console.error('Error inviting user:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error inviting user:', error);
    return false;
  }
}
