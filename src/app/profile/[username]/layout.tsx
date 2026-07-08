import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';

type Props = {
  params: Promise<{ username: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createClient();

  if (!supabase) {
    return {
      title: 'Profile Not Found | Rec\'d Club',
    };
  }

  // Fetch user data from Supabase
  const { data: user } = await supabase
    .from('users')
    .select('display_name, bio, taste_archetype')
    .ilike('username', username)
    .single();

  if (!user) {
    return {
      title: 'Profile Not Found | Rec\'d Club',
    };
  }

  const pageTitle = `${user.display_name || username} (@${username}) - Rec'd Club`;
  const description = user.bio 
    ? `"${user.bio}" - See ${user.display_name}'s taste profile, verdicts, and recommendations on Rec'd Club.`
    : `See ${user.display_name || username}'s taste profile, verdicts, and recommendations on Rec'd Club.`;

  return {
    title: pageTitle,
    description,
    openGraph: {
      title: pageTitle,
      description,
      // Since users might not have a public avatar image URL easily available in the DB table at this point
      // we'll rely on the default app mockup for now.
    },
    twitter: {
      card: 'summary',
      title: pageTitle,
      description,
    },
  };
}

export default function ProfileLayout({ children }: Props) {
  return <>{children}</>;
}
