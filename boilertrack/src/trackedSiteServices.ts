// THIS FILE CREATES FUNCTIONS TO TALK TO SUPABASE AND HANDLE THE CLIENTS TRACKED WEBSITES


import {supabase} from './supabaseClient';


export interface TrackedSite {
    id: string;
    user_id: string;
    url: string;
    domain: string;
    title: string | null;
    favicon_url: string | null;
    created_at: string;
    last_visited: string;
    visit_count: number;
    is_active: boolean;
}

export const trackedSitesService = {
    // Helper to extract domain from URL
    extractDomain(url: string): string | null {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname;
        } catch {
            return null;
        }
    },

    // Add or update a tracked site
    async addTrackedSite(
        url: string,
        title: string | null = null,
        faviconUrl: string | null = null
    ): Promise<{ data: TrackedSite | null; isNew: boolean }> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('User not authenticated');
            }

            const domain = this.extractDomain(url);

            // Check if site already exists for this user
            const { data: existing, error: fetchError } = await supabase
                .from('tracked_sites')
                .select('id, visit_count')
                .eq('user_id', user.id)
                .eq('url', url)
                .maybeSingle();

            if (fetchError) {
                console.error('Error checking existing site:', fetchError);
                throw fetchError;
            }

            if (existing) {
                // Update existing site (increment visit count)
                const { data, error } = await supabase
                    .from('tracked_sites')
                    .update({
                        visit_count: existing.visit_count + 1,
                        last_visited: new Date().toISOString(),
                        is_active: true
                    })
                    .eq('id', existing.id)
                    .select()
                    .single();

                if (error) throw error;
                return { data, isNew: false };
            }

            // Insert new tracked site
            const { data, error } = await supabase
                .from('tracked_sites')
                .insert({
                    user_id: user.id,
                    url,
                    domain,
                    title,
                    favicon_url: faviconUrl
                })
                .select()
                .single();

            if (error) throw error;
            return { data, isNew: true };
        } catch (error) {
            console.error('Error adding tracked site:', error);
            throw error;
        }
    },

    // Get all tracked sites for current user
    async getTrackedSites(): Promise<TrackedSite[]> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('User not authenticated');
            }

            const { data, error } = await supabase
                .from('tracked_sites')
                .select('*')
                .eq('user_id', user.id)
                .eq('is_active', true)
                .order('last_visited', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting tracked sites:', error);
            throw error;
        }
    },

    // Check if current site is tracked
    async isSiteTracked(url: string): Promise<boolean> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return false;

            const { data, error } = await supabase
                .from('tracked_sites')
                .select('id')
                .eq('user_id', user.id)
                .eq('url', url)
                .eq('is_active', true)
                .maybeSingle();

            if (error && error.code !== 'PGRST116') {
                console.error('Error checking if site is tracked:', error);
                return false;
            }

            return !!data;
        } catch (error) {
            console.error('Error checking if site is tracked:', error);
            return false;
        }
    },

    // Remove a tracked site (soft delete)
    async removeTrackedSite(url: string): Promise<void> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('User not authenticated');
            }

            const { error } = await supabase
                .from('tracked_sites')
                .update({ is_active: false })
                .eq('user_id', user.id)
                .eq('url', url);

            if (error) throw error;
        } catch (error) {
            console.error('Error removing tracked site:', error);
            throw error;
        }
    },

    // Get most visited sites
    async getMostVisitedSites(limit: number = 10): Promise<TrackedSite[]> {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('User not authenticated');
            }

            const { data, error } = await supabase
                .from('tracked_sites')
                .select('*')
                .eq('user_id', user.id)
                .eq('is_active', true)
                .order('visit_count', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting most visited sites:', error);
            throw error;
        }
    }
};

export class trackedSiteServices {
}