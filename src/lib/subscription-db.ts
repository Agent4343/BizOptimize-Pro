// Database-backed subscription management

import { supabase } from './supabase';

export async function getUserSubscriptions(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (error) {
    console.error('Error fetching subscriptions:', error);
    return [];
  }

  return data || [];
}

export async function hasModuleAccess(userId: string, moduleId: string): Promise<boolean> {
  // Check subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('module_id', moduleId)
    .eq('status', 'active')
    .single();

  if (subscription) {
    return true;
  }

  // Check active demo
  const { data: demo } = await supabase
    .from('demos')
    .select('*')
    .eq('user_id', userId)
    .eq('module_id', moduleId)
    .gt('expires_at', new Date().toISOString())
    .single();

  return !!demo;
}

export async function startDemo(userId: string, moduleId: string) {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutes

  const { data, error } = await supabase
    .from('demos')
    .insert({
      user_id: userId,
      module_id: moduleId,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating demo:', error);
    return null;
  }

  return data;
}

export async function getDemoTimeRemaining(userId: string, moduleId: string): Promise<number> {
  const { data: demo } = await supabase
    .from('demos')
    .select('expires_at')
    .eq('user_id', userId)
    .eq('module_id', moduleId)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (!demo) {
    return 0;
  }

  const expiresAt = new Date(demo.expires_at);
  const now = new Date();
  const remaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
  return remaining;
}

