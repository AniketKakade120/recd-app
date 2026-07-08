import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://recd.club';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  let titleRoutes: MetadataRoute.Sitemap = [];
  let profileRoutes: MetadataRoute.Sitemap = [];

  if (supabase) {
    // Fetch up to 1000 titles and profiles for the sitemap
    // (In production with larger datasets, this would be paginated or use sitemap indexes)
    const { data: titles } = await supabase.from('titles').select('id, updated_at').limit(1000);
    const { data: users } = await supabase.from('users').select('username, updated_at').limit(1000);

    if (titles) {
      titleRoutes = titles.map((title) => ({
        url: `${BASE_URL}/title/${title.id}`,
        lastModified: title.updated_at ? new Date(title.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }

    if (users) {
      profileRoutes = users.map((user) => ({
        url: `${BASE_URL}/profile/${user.username}`,
        lastModified: user.updated_at ? new Date(user.updated_at) : new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
      }));
    }
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/explore`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/groups`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  return [...staticRoutes, ...titleRoutes, ...profileRoutes];
}
