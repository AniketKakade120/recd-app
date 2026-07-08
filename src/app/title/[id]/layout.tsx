import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  if (!supabase) {
    return {
      title: 'Title Not Found | Rec\'d Club',
    };
  }

  // Fetch title data from Supabase
  const { data: title } = await supabase
    .from('titles')
    .select('title, overview, poster_url, release_year')
    .eq('id', id)
    .single();

  if (!title) {
    return {
      title: 'Title Not Found | Rec\'d Club',
    };
  }

  const pageTitle = `${title.title} ${title.release_year ? `(${title.release_year})` : ''} - Rec'd Club`;
  const description = title.overview || `See what the crew is saying about ${title.title} on Rec'd Club.`;
  const ogImage = title.poster_url || '/desktop_mockup.png';

  return {
    title: pageTitle,
    description,
    openGraph: {
      title: pageTitle,
      description,
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
      images: [ogImage],
    },
  };
}

export default function TitleLayout({ children }: Props) {
  return <>{children}</>;
}
