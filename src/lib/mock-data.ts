import type { 
  User, Group, GroupMember, Title, Recommendation, Rating, Badge, ActivityItem, 
  LeaderboardEntry, WatchlistItem, TasteScore, GroupComment, 
  UserPreferences, RecommendationImpact, TasteMatchBreakdown 
} from './types';

// ── USERS ────────────────────────────────────────────────────────────────────

export const mockUsers: User[] = [
  { 
    id: 'user-1', username: 'aniket', displayName: 'Aniket', avatarUrl: '', 
    bio: 'Movies with meaning. Stories that stick. Always the rec.', 
    tasteArchetype: 'Emotional Damage Dealer', 
    tasteScore: 86,
    reputationLabel: 'Great Taste',
    favoriteGenres: ['Drama', 'Thriller', 'Sci-fi'],
    favoriteMoods: ['Intense', 'Mind-bending', 'Slow Burn'],
    profileVisibility: 'public',
    createdAt: '2024-01-15T10:00:00Z' 
  },
  { 
    id: 'user-2', username: 'maya', displayName: 'Maya', avatarUrl: '', 
    bio: 'Known for slow burns and suspiciously good thrillers.', 
    tasteArchetype: 'Plot Twist Addict', 
    tasteScore: 86,
    reputationLabel: 'Great Taste',
    favoriteGenres: ['Mystery', 'Thriller', 'Drama'],
    favoriteMoods: ['Dark', 'Intense', 'Slow Burn'],
    profileVisibility: 'public',
    createdAt: '2024-01-16T10:00:00Z' 
  },
  { 
    id: 'user-3', username: 'josh', displayName: 'Josh', avatarUrl: '', 
    bio: 'Prestige TV or nothing.', 
    tasteArchetype: 'Prestige TV Snob', 
    tasteScore: 78,
    reputationLabel: 'Trusted Taste',
    favoriteGenres: ['Drama', 'Crime'],
    favoriteMoods: ['Dark', 'Prestige'],
    profileVisibility: 'public',
    createdAt: '2024-01-17T10:00:00Z' 
  },
  { 
    id: 'user-4', username: 'priya', displayName: 'Priya', avatarUrl: '', 
    bio: 'Comfort watch queen. Judge me.', 
    tasteArchetype: 'Comfort Watch Expert', 
    tasteScore: 68,
    reputationLabel: 'Trusted Enough',
    favoriteGenres: ['Comedy', 'Romance'],
    favoriteMoods: ['Comfort Watch', 'Feel-good'],
    profileVisibility: 'public',
    createdAt: '2024-01-18T10:00:00Z' 
  },
  { id: 'user-5', username: 'kabir', displayName: 'Kabir', avatarUrl: '', bio: 'Horror nights. No regrets.', tasteArchetype: 'Horror Sicko', tasteScore: 55, reputationLabel: 'Mixed Taste', profileVisibility: 'public', createdAt: '2024-01-19T10:00:00Z' },
  { id: 'user-6', username: 'sam', displayName: 'Sam', avatarUrl: '', bio: 'Anime and slow burns. The perfect combo.', tasteArchetype: 'Anime Evangelist', tasteScore: 72, reputationLabel: 'Trusted Enough', profileVisibility: 'public', createdAt: '2024-01-20T10:00:00Z' },
  { id: 'user-7', username: 'rhea', displayName: 'Rhea', avatarUrl: '', bio: 'Sharp, smart cinema only.', tasteArchetype: 'Thriller Dealer', tasteScore: 78, reputationLabel: 'Trusted Taste', profileVisibility: 'public', createdAt: '2024-01-21T10:00:00Z' },
  { id: 'user-8', username: 'dev', displayName: 'Dev', avatarUrl: '', bio: 'Documentary goblin. Proud of it.', tasteArchetype: 'Documentary Deep Diver', tasteScore: 65, reputationLabel: 'Mixed Taste', profileVisibility: 'public', createdAt: '2024-01-22T10:00:00Z' },
  { id: 'user-9', username: 'riley', displayName: 'Riley', avatarUrl: '', bio: 'Franchise defender. Unapologetically.', tasteArchetype: 'Franchise Defender', tasteScore: 60, reputationLabel: 'Mixed Taste', profileVisibility: 'public', createdAt: '2024-01-23T10:00:00Z' },
];

export const currentUser = mockUsers[0];

// ── USER CONNECTIONS (CREW) ──────────────────────────────────────────────────

export const mockUserConnections: UserConnection[] = [
  { id: 'conn-1', userId: 'user-1', connectedUserId: 'user-2', status: 'connected', createdAt: '2024-02-15T10:00:00Z', updatedAt: '2024-02-15T10:00:00Z' },
  { id: 'conn-2', userId: 'user-1', connectedUserId: 'user-3', status: 'connected', createdAt: '2024-02-16T10:00:00Z', updatedAt: '2024-02-16T10:00:00Z' },
  { id: 'conn-3', userId: 'user-1', connectedUserId: 'user-7', status: 'connected', createdAt: '2024-02-17T10:00:00Z', updatedAt: '2024-02-17T10:00:00Z' },
  { id: 'conn-4', userId: 'user-2', connectedUserId: 'user-1', status: 'connected', createdAt: '2024-02-15T10:00:00Z', updatedAt: '2024-02-15T10:00:00Z' },
];

// ── USER PREFERENCES ──────────────────────────────────────────────────────────

export const mockUserPreferences: UserPreferences[] = [
  {
    userId: 'user-1', // Aniket
    genres: ['Drama', 'Thriller', 'Sci-fi'],
    moods: ['Intense', 'Mind-bending', 'Slow Burn', 'Emotional'],
    formats: ['Movie', 'Series'],
    languages: ['English', 'Korean', 'Japanese'],
    platforms: ['Netflix', 'MUBI', 'Apple TV'],
  },
  {
    userId: 'user-2', // Maya
    genres: ['Mystery', 'Thriller', 'Drama'],
    moods: ['Dark', 'Intense', 'Slow Burn'],
    formats: ['Movie', 'Mini Series'],
    languages: ['English', 'Global Cinema'],
    platforms: ['Prime Video', 'MUBI'],
  },
];

// ── TITLES ────────────────────────────────────────────────────────────────────

export const mockTitles: Title[] = [
  { 
    id: 'title-1', 
    title: 'The Bear', 
    type: 'series', 
    posterGradient: 1, 
    posterUrl: 'https://picsum.photos/seed/title-1/400/600', 
    backdropUrl: 'https://picsum.photos/seed/title-1-bg/800/500', 
    releaseYear: 2022, 
    genres: ['Drama', 'Comedy'], 
    overview: 'A young chef from fine dining returns to run his family\'s sandwich shop. Chaos ensues.', 
    externalRating: 8.6, 
    runtime: '30m', 
    format: 'Series', 
    platforms: ['JioHotstar'],
    platformAvailability: [
      { platformName: 'JioHotstar', logoUrl: null, url: 'https://www.jiohotstar.com' },
      { platformName: 'Hulu', logoUrl: null, url: 'https://www.hulu.com' }
    ],
    directorOrCreatorProfile: {
      id: 'creator-1',
      name: 'Christopher Storer',
      role: 'Creator',
      profileImageUrl: 'https://picsum.photos/seed/storer/200/200'
    },
    cast: [
      { id: 'actor-1', name: 'Jeremy Allen White', characterName: 'Carmen "Carmy" Berzatto', profileImageUrl: 'https://picsum.photos/seed/jeremy/200/200', order: 1 },
      { id: 'actor-2', name: 'Ayo Edebiri', characterName: 'Sydney Adamu', profileImageUrl: 'https://picsum.photos/seed/ayo/200/200', order: 2 },
      { id: 'actor-3', name: 'Ebon Moss-Bachrach', characterName: 'Richard "Richie" Jerimovich', profileImageUrl: 'https://picsum.photos/seed/ebon/200/200', order: 3 },
      { id: 'actor-4', name: 'Abby Elliott', characterName: 'Natalie "Sugar" Berzatto', profileImageUrl: 'https://picsum.photos/seed/abby/200/200', order: 4 },
      { id: 'actor-5', name: 'Matty Matheson', characterName: 'Neil Fak', profileImageUrl: 'https://picsum.photos/seed/matty/200/200', order: 5 }
    ]
  },
  { 
    id: 'title-2', 
    title: 'Severance', 
    type: 'series', 
    posterGradient: 6, 
    posterUrl: 'https://picsum.photos/seed/title-2/400/600', 
    backdropUrl: 'https://picsum.photos/seed/title-2-bg/800/500', 
    releaseYear: 2022, 
    genres: ['Drama', 'Mystery', 'Sci-fi'], 
    overview: 'Office workers have their memories surgically divided between work and personal lives.', 
    externalRating: 8.7, 
    runtime: '50m', 
    format: 'Series', 
    platforms: ['Apple TV'],
    platformAvailability: [
      { platformName: 'Apple TV+', logoUrl: null, url: 'https://tv.apple.com' }
    ],
    directorOrCreatorProfile: {
      id: 'creator-2',
      name: 'Dan Erickson',
      role: 'Creator',
      profileImageUrl: 'https://picsum.photos/seed/erickson/200/200'
    },
    cast: [
      { id: 'actor-6', name: 'Adam Scott', characterName: 'Mark Scout', profileImageUrl: 'https://picsum.photos/seed/adam/200/200', order: 1 },
      { id: 'actor-7', name: 'Zach Cherry', characterName: 'Dylan George', profileImageUrl: 'https://picsum.photos/seed/zach/200/200', order: 2 },
      { id: 'actor-8', name: 'Britt Lower', characterName: 'Helly R.', profileImageUrl: 'https://picsum.photos/seed/britt/200/200', order: 3 },
      { id: 'actor-9', name: 'Patricia Arquette', characterName: 'Harmony Cobel', profileImageUrl: 'https://picsum.photos/seed/patricia/200/200', order: 4 },
      { id: 'actor-10', name: 'John Turturro', characterName: 'Irving Bailiff', profileImageUrl: 'https://picsum.photos/seed/john/200/200', order: 5 }
    ]
  },
  { 
    id: 'title-3', 
    title: 'Past Lives', 
    type: 'movie', 
    posterGradient: 8, 
    posterUrl: 'https://picsum.photos/seed/title-3/400/600', 
    backdropUrl: 'https://picsum.photos/seed/title-3-bg/800/500', 
    releaseYear: 2023, 
    genres: ['Drama', 'Romance'], 
    overview: 'Two childhood friends separated by emigration are reunited 24 years later.', 
    externalRating: 7.8, 
    runtime: '1h 46m', 
    format: 'Movie', 
    platforms: ['MUBI'],
    platformAvailability: [
      { platformName: 'MUBI', logoUrl: null, url: 'https://mubi.com' },
      { platformName: 'Apple TV', logoUrl: null, url: 'https://tv.apple.com' }
    ],
    directorOrCreatorProfile: {
      id: 'dir-1',
      name: 'Celine Song',
      role: 'Director',
      profileImageUrl: 'https://picsum.photos/seed/celine/200/200'
    },
    cast: [
      { id: 'actor-11', name: 'Greta Lee', characterName: 'Nora Moon', profileImageUrl: 'https://picsum.photos/seed/greta/200/200', order: 1 },
      { id: 'actor-12', name: 'Teo Yoo', characterName: 'Hae Sung', profileImageUrl: 'https://picsum.photos/seed/teo/200/200', order: 2 },
      { id: 'actor-13', name: 'John Magaro', characterName: 'Arthur', profileImageUrl: 'https://picsum.photos/seed/magaro/200/200', order: 3 }
    ]
  },
  { 
    id: 'title-4', 
    title: 'Dune: Part Two', 
    type: 'movie', 
    posterGradient: 4, 
    posterUrl: 'https://picsum.photos/seed/title-4/400/600', 
    backdropUrl: 'https://picsum.photos/seed/title-4-bg/800/500', 
    releaseYear: 2024, 
    genres: ['Sci-fi', 'Drama'], 
    overview: 'Paul Atreides unites with the Fremen to seek revenge against the conspirators.', 
    externalRating: 8.5, 
    runtime: '2h 46m', 
    format: 'Movie', 
    platforms: ['Netflix'],
    platformAvailability: [
      { platformName: 'Netflix', logoUrl: null, url: 'https://netflix.com' },
      { platformName: 'Prime Video', logoUrl: null, url: 'https://primevideo.com' }
    ],
    directorOrCreatorProfile: {
      id: 'dir-2',
      name: 'Denis Villeneuve',
      role: 'Director',
      profileImageUrl: 'https://picsum.photos/seed/denis/200/200'
    },
    cast: [
      { id: 'actor-14', name: 'Timothée Chalamet', characterName: 'Paul Atreides', profileImageUrl: 'https://picsum.photos/seed/timmy/200/200', order: 1 },
      { id: 'actor-15', name: 'Zendaya', characterName: 'Chani', profileImageUrl: 'https://picsum.photos/seed/zendaya/200/200', order: 2 },
      { id: 'actor-16', name: 'Rebecca Ferguson', characterName: 'Lady Jessica', profileImageUrl: 'https://picsum.photos/seed/rebecca/200/200', order: 3 },
      { id: 'actor-17', name: 'Austin Butler', characterName: 'Feyd-Rautha Harkonnen', profileImageUrl: 'https://picsum.photos/seed/austin/200/200', order: 4 },
      { id: 'actor-18', name: 'Florence Pugh', characterName: 'Princess Irulan', profileImageUrl: 'https://picsum.photos/seed/pugh/200/200', order: 5 }
    ]
  },
  { 
    id: 'title-5', 
    title: 'The Social Network', 
    type: 'movie', 
    posterGradient: 9, 
    posterUrl: 'https://picsum.photos/seed/title-5/400/600', 
    backdropUrl: 'https://picsum.photos/seed/title-5-bg/800/500', 
    releaseYear: 2010, 
    genres: ['Drama'], 
    overview: 'The founding of Facebook and the lawsuits that followed.', 
    externalRating: 7.8, 
    runtime: '2h', 
    format: 'Movie', 
    platforms: ['Netflix'],
    platformAvailability: [
      { platformName: 'Netflix', logoUrl: null, url: 'https://netflix.com' }
    ],
    directorOrCreatorProfile: {
      id: 'dir-3',
      name: 'David Fincher',
      role: 'Director',
      profileImageUrl: 'https://picsum.photos/seed/fincher/200/200'
    },
    cast: [
      { id: 'actor-19', name: 'Jesse Eisenberg', characterName: 'Mark Zuckerberg', profileImageUrl: 'https://picsum.photos/seed/jesse/200/200', order: 1 },
      { id: 'actor-20', name: 'Andrew Garfield', characterName: 'Eduardo Saverin', profileImageUrl: 'https://picsum.photos/seed/andrew/200/200', order: 2 },
      { id: 'actor-21', name: 'Justin Timberlake', characterName: 'Sean Parker', profileImageUrl: 'https://picsum.photos/seed/justin/200/200', order: 3 },
      { id: 'actor-22', name: 'Armie Hammer', characterName: 'Cameron / Tyler Winklevoss', profileImageUrl: 'https://picsum.photos/seed/armie/200/200', order: 4 }
    ]
  },
  { 
    id: 'title-6', 
    title: 'Parasite', 
    type: 'movie', 
    posterGradient: 7, 
    posterUrl: 'https://picsum.photos/seed/title-6/400/600', 
    backdropUrl: 'https://picsum.photos/seed/title-6-bg/800/500', 
    releaseYear: 2019, 
    genres: ['Comedy', 'Drama', 'Thriller'], 
    overview: 'Greed and class discrimination threaten the symbiotic relationship between two families.', 
    externalRating: 8.5, 
    runtime: '2h 12m', 
    format: 'Movie', 
    platforms: ['MUBI'],
    platformAvailability: [
      { platformName: 'MUBI', logoUrl: null, url: 'https://mubi.com' }
    ],
    directorOrCreatorProfile: {
      id: 'dir-4',
      name: 'Bong Joon-ho',
      role: 'Director',
      profileImageUrl: 'https://picsum.photos/seed/bong/200/200'
    },
    cast: [
      { id: 'actor-23', name: 'Song Kang-ho', characterName: 'Kim Ki-taek', profileImageUrl: 'https://picsum.photos/seed/song/200/200', order: 1 },
      { id: 'actor-24', name: 'Lee Sun-kyun', characterName: 'Park Dong-ik', profileImageUrl: 'https://picsum.photos/seed/sunkyun/200/200', order: 2 },
      { id: 'actor-25', name: 'Cho Yeo-jeong', characterName: 'Choi Yeon-gyo', profileImageUrl: 'https://picsum.photos/seed/yeojeong/200/200', order: 3 }
    ]
  },
  { 
    id: 'title-7', 
    title: 'Succession', 
    type: 'series', 
    posterGradient: 5, 
    posterUrl: 'https://picsum.photos/seed/title-7/400/600', 
    backdropUrl: 'https://picsum.photos/seed/title-7-bg/800/500', 
    releaseYear: 2018, 
    genres: ['Drama'], 
    overview: 'The Roy family controls the biggest media company in the world. Until they don\'t.', 
    externalRating: 8.8, 
    runtime: '1h', 
    format: 'Series', 
    platforms: ['Prime Video'],
    platformAvailability: [
      { platformName: 'Prime Video', logoUrl: null, url: 'https://primevideo.com' },
      { platformName: 'JioHotstar', logoUrl: null, url: 'https://jiocinema.com' }
    ],
    directorOrCreatorProfile: {
      id: 'creator-3',
      name: 'Jesse Armstrong',
      role: 'Creator',
      profileImageUrl: 'https://picsum.photos/seed/armstrong/200/200'
    },
    cast: [
      { id: 'actor-26', name: 'Brian Cox', characterName: 'Logan Roy', profileImageUrl: 'https://picsum.photos/seed/brian/200/200', order: 1 },
      { id: 'actor-27', name: 'Jeremy Strong', characterName: 'Kendall Roy', profileImageUrl: 'https://picsum.photos/seed/kendall/200/200', order: 2 },
      { id: 'actor-28', name: 'Sarah Snook', characterName: 'Siobhan "Shiv" Roy', profileImageUrl: 'https://picsum.photos/seed/sarah/200/200', order: 3 },
      { id: 'actor-29', name: 'Kieran Culkin', characterName: 'Roman Roy', profileImageUrl: 'https://picsum.photos/seed/kieran/200/200', order: 4 }
    ]
  },
  { 
    id: 'title-8', 
    title: 'Interstellar', 
    type: 'movie', 
    posterGradient: 3, 
    posterUrl: 'https://picsum.photos/seed/title-8/400/600', 
    backdropUrl: 'https://picsum.photos/seed/title-8-bg/800/500', 
    releaseYear: 2014, 
    genres: ['Sci-fi', 'Drama'], 
    overview: 'A team of explorers travel through a wormhole in space to save humanity.', 
    externalRating: 8.6, 
    runtime: '2h 49m', 
    format: 'Movie', 
    platforms: ['Netflix'],
    platformAvailability: [
      { platformName: 'Netflix', logoUrl: null, url: 'https://netflix.com' },
      { platformName: 'JioHotstar', logoUrl: null, url: 'https://netflix.com' }
    ],
    directorOrCreatorProfile: {
      id: 'dir-5',
      name: 'Christopher Nolan',
      role: 'Director',
      profileImageUrl: 'https://picsum.photos/seed/nolan/200/200'
    },
    cast: [
      { id: 'actor-30', name: 'Matthew McConaughey', characterName: 'Cooper', profileImageUrl: 'https://picsum.photos/seed/matthew/200/200', order: 1 },
      { id: 'actor-31', name: 'Anne Hathaway', characterName: 'Amelia Brand', profileImageUrl: 'https://picsum.photos/seed/anne/200/200', order: 2 },
      { id: 'actor-32', name: 'Jessica Chastain', characterName: 'Murphy Cooper', profileImageUrl: 'https://picsum.photos/seed/jessicac/200/200', order: 3 }
    ]
  },
  { 
    id: 'title-9', 
    title: 'Fleabag', 
    type: 'series', 
    posterGradient: 2, 
    posterUrl: 'https://picsum.photos/seed/title-9/400/600', 
    backdropUrl: 'https://picsum.photos/seed/title-9-bg/800/500', 
    releaseYear: 2016, 
    genres: ['Comedy', 'Drama'], 
    overview: 'A dry-witted woman navigates grief and love in London with devastating honesty.', 
    externalRating: 8.7, 
    runtime: '25m', 
    format: 'Mini Series', 
    platforms: ['Prime Video'],
    platformAvailability: [
      { platformName: 'Prime Video', logoUrl: null, url: 'https://primevideo.com' }
    ],
    directorOrCreatorProfile: {
      id: 'creator-4',
      name: 'Phoebe Waller-Bridge',
      role: 'Creator',
      profileImageUrl: 'https://picsum.photos/seed/phoebe/200/200'
    },
    cast: [
      { id: 'actor-33', name: 'Phoebe Waller-Bridge', characterName: 'Fleabag', profileImageUrl: 'https://picsum.photos/seed/phoebe/200/200', order: 1 },
      { id: 'actor-34', name: 'Sian Clifford', characterName: 'Claire', profileImageUrl: 'https://picsum.photos/seed/sian/200/200', order: 2 },
      { id: 'actor-35', name: 'Andrew Scott', characterName: 'The Priest', profileImageUrl: 'https://picsum.photos/seed/andrewscott/200/200', order: 3 }
    ]
  },
  { 
    id: 'title-10', 
    title: 'The Shawshank Redemption', 
    type: 'movie', 
    posterGradient: 10, 
    posterUrl: 'https://picsum.photos/seed/title-10/400/600', 
    backdropUrl: 'https://picsum.photos/seed/title-10-bg/800/500', 
    releaseYear: 1994, 
    genres: ['Drama'], 
    overview: 'Two imprisoned men bond over years, finding solace and redemption.', 
    externalRating: 9.3, 
    runtime: '2h 22m', 
    format: 'Movie', 
    platforms: ['Netflix'],
    platformAvailability: [
      { platformName: 'Netflix', logoUrl: null, url: 'https://netflix.com' }
    ],
    directorOrCreatorProfile: {
      id: 'dir-6',
      name: 'Frank Darabont',
      role: 'Director',
      profileImageUrl: 'https://picsum.photos/seed/darabont/200/200'
    },
    cast: [
      { id: 'actor-36', name: 'Tim Robbins', characterName: 'Andy Dufresne', profileImageUrl: 'https://picsum.photos/seed/tim/200/200', order: 1 },
      { id: 'actor-37', name: 'Morgan Freeman', characterName: 'Ellis Boyd "Red" Redding', profileImageUrl: 'https://picsum.photos/seed/morgan/200/200', order: 2 }
    ]
  },
  // Default values for remaining titles to avoid crashes
  ...[11, 12, 13, 14, 15, 16, 17].map(i => ({
    id: `title-${i}`,
    title: `Mock Title ${i}`,
    type: 'movie' as const,
    posterGradient: i % 10 + 1,
    releaseYear: 2024,
    genres: ['Drama'],
    overview: 'Mock overview for testing.',
    externalRating: 7.5,
    format: 'Movie' as const,
    cast: [],
    directorOrCreatorProfile: { id: `dir-${i}`, name: 'Mock Director', role: 'Director' as const }
  }))
];

// ── GROUPS ─────────────────────────────────────────────────────────────────────

export const mockGroups: Group[] = [
  { id: 'group-1', name: 'Film Chaos Club', vibe: 'Movie Chaos', description: 'We watch at night. We rec what\'s real.', privacy: 'private', inviteCode: 'CHAOS24', createdBy: 'user-1', createdAt: '2024-02-01T10:00:00Z', avatarGradient: 3, coverImage: 'https://picsum.photos/seed/group-1-bg/800/400' },
  { id: 'group-2', name: 'Sunday Watchlist', vibe: 'Comfort Watch Club', description: 'Weekend comfort picks only. No judgement. (Lots of judgement.)', privacy: 'public', inviteCode: 'SUNDAY24', createdBy: 'user-3', createdAt: '2024-02-05T10:00:00Z', avatarGradient: 6, coverImage: 'https://picsum.photos/seed/group-2-bg/800/400' },
  { id: 'group-3', name: 'Bad Taste Anonymous', vibe: 'Anything Goes', description: 'No judgment. Actually, lots of judgment.', privacy: 'private', inviteCode: 'BADTASTE', createdBy: 'user-2', createdAt: '2024-02-10T10:00:00Z', avatarGradient: 8, coverImage: 'https://picsum.photos/seed/group-3-bg/800/400' },
  { id: 'group-4', name: 'Slow Burn Club', vibe: 'Slow Burn Crew', description: 'If it doesn\'t simmer, we don\'t watch it.', privacy: 'public', inviteCode: 'SLOWBRN', createdBy: 'user-7', createdAt: '2024-02-15T10:00:00Z', avatarGradient: 2, coverImage: 'https://picsum.photos/seed/group-4-bg/800/400' },
  { id: 'group-5', name: 'Sci-Fi Heads', vibe: 'Sci-Fi Heads', description: 'From Kubrick to Villeneuve. Space is the vibe.', privacy: 'public', inviteCode: 'SCIFI24', createdBy: 'user-6', createdAt: '2024-02-18T10:00:00Z', avatarGradient: 5, coverImage: 'https://picsum.photos/seed/group-5-bg/800/400' },
  { id: 'group-6', name: 'Hidden Gems', vibe: 'Prestige Drama', description: 'Films nobody talks about but everybody should watch.', privacy: 'public', inviteCode: 'HIDDGEM', createdBy: 'user-8', createdAt: '2024-02-20T10:00:00Z', avatarGradient: 7, coverImage: 'https://picsum.photos/seed/group-6-bg/800/400' },
];

export const mockGroupMembers: GroupMember[] = [
  { id: 'gm-1', groupId: 'group-1', userId: 'user-1', role: 'owner', joinedAt: '2024-02-01T10:00:00Z' },
  { id: 'gm-2', groupId: 'group-1', userId: 'user-2', role: 'member', joinedAt: '2024-02-01T12:00:00Z' },
  { id: 'gm-3', groupId: 'group-1', userId: 'user-3', role: 'member', joinedAt: '2024-02-02T10:00:00Z' },
  { id: 'gm-4', groupId: 'group-1', userId: 'user-5', role: 'member', joinedAt: '2024-02-03T10:00:00Z' },
  { id: 'gm-5', groupId: 'group-2', userId: 'user-1', role: 'member', joinedAt: '2024-02-05T12:00:00Z' },
  { id: 'gm-6', groupId: 'group-2', userId: 'user-3', role: 'owner', joinedAt: '2024-02-05T10:00:00Z' },
  { id: 'gm-7', groupId: 'group-2', userId: 'user-4', role: 'member', joinedAt: '2024-02-06T10:00:00Z' },
  { id: 'gm-8', groupId: 'group-2', userId: 'user-8', role: 'member', joinedAt: '2024-02-07T10:00:00Z' },
  { id: 'gm-9', groupId: 'group-3', userId: 'user-1', role: 'member', joinedAt: '2024-02-10T12:00:00Z' },
  { id: 'gm-10', groupId: 'group-3', userId: 'user-2', role: 'owner', joinedAt: '2024-02-10T10:00:00Z' },
  { id: 'gm-11', groupId: 'group-3', userId: 'user-5', role: 'member', joinedAt: '2024-02-11T10:00:00Z' },
  { id: 'gm-12', groupId: 'group-4', userId: 'user-7', role: 'owner', joinedAt: '2024-02-15T10:00:00Z' },
  { id: 'gm-13', groupId: 'group-4', userId: 'user-2', role: 'member', joinedAt: '2024-02-16T10:00:00Z' },
  { id: 'gm-14', groupId: 'group-5', userId: 'user-6', role: 'owner', joinedAt: '2024-02-18T10:00:00Z' },
  { id: 'gm-15', groupId: 'group-5', userId: 'user-9', role: 'member', joinedAt: '2024-02-19T10:00:00Z' },
];

// ── RECOMMENDATIONS ─────────────────────────────────────────────────────────

export const mockRecommendations: Recommendation[] = [
  // --- Sent BY user-1 (Aniket) ---
  { id: 'rec-3', titleId: 'title-6', groupId: 'group-1', recommendedBy: 'user-1', recommendedToUserIds: ['user-3'], recommendedToGroup: false, reason: 'Trust me, this is your exact vibe. The class commentary will personally attack you.', confidenceScore: 95, moodTags: ['Mind-bending', 'Intense'], tasteMatchScore: 95, primaryStamp: 'Certified Good Call', verdictState: 'verdict_given', createdAt: '2024-02-20T10:00:00Z' },
  { id: 'rec-6', titleId: 'title-7', groupId: 'group-1', recommendedBy: 'user-1', recommendedToUserIds: [], recommendedToGroup: true, reason: 'If you haven\'t watched this yet, your taste card is revoked.', confidenceScore: 97, moodTags: ['Intense', 'Slow Burn'], tasteMatchScore: 97, primaryStamp: 'Crew Pick', verdictState: 'verdict_given', createdAt: '2024-03-18T10:00:00Z' },
  { id: 'rec-8', titleId: 'title-5', groupId: 'group-3', recommendedBy: 'user-1', recommendedToUserIds: ['user-7'], recommendedToGroup: false, reason: 'Sharp, smart, and painfully relevant. You\'ll recognise everyone in it.', confidenceScore: 90, moodTags: ['Intense'], tasteMatchScore: 90, primaryStamp: 'Worth It', verdictState: 'verdict_given', createdAt: '2024-03-01T10:00:00Z' },
  { id: 'rec-10', titleId: 'title-3', groupId: 'group-4', recommendedBy: 'user-1', recommendedToUserIds: ['user-2'], recommendedToGroup: false, reason: 'You love emotional weight and bittersweet endings. This is peak.', confidenceScore: 88, moodTags: ['Emotional', 'Slow Burn'], tasteMatchScore: 91, primaryStamp: 'Worth It', verdictState: 'verdict_given', createdAt: '2024-03-08T10:00:00Z' },
  { id: 'rec-11', titleId: 'title-8', groupId: 'group-5', recommendedBy: 'user-1', recommendedToUserIds: ['user-6', 'user-9'], recommendedToGroup: false, reason: 'Nolan at his most emotional. You need to see this on a big screen.', confidenceScore: 92, moodTags: ['Emotional', 'Mind-bending'], tasteMatchScore: 88, primaryStamp: 'Certified Good Call', verdictState: 'verdict_given', createdAt: '2024-02-28T10:00:00Z' },
  { id: 'rec-12', titleId: 'title-1', groupId: 'group-2', recommendedBy: 'user-1', recommendedToUserIds: ['user-4'], recommendedToGroup: false, reason: 'The energy of this show is unmatched. Season 2 is insane.', confidenceScore: 85, moodTags: ['Intense', 'Comfort Watch'], tasteMatchScore: 82, verdictState: 'verdict_pending', createdAt: '2024-03-20T10:00:00Z' },
  { id: 'rec-13', titleId: 'title-13', groupId: 'group-1', recommendedBy: 'user-1', recommendedToUserIds: ['user-3', 'user-5'], recommendedToGroup: false, reason: 'Six episodes. One truth. No filler.', confidenceScore: 91, moodTags: ['Slow Burn', 'Intense'], tasteMatchScore: 89, verdictState: 'verdict_pending', createdAt: '2024-03-22T10:00:00Z' },
  { id: 'rec-14', titleId: 'title-15', groupId: 'group-3', recommendedBy: 'user-1', recommendedToUserIds: ['user-2'], recommendedToGroup: false, reason: 'Crime + style + tension. This is your lane.', confidenceScore: 78, moodTags: ['Intense', 'Dark'], tasteMatchScore: 76, primaryStamp: 'Risky But Worth It', verdictState: 'verdict_given', createdAt: '2024-03-05T10:00:00Z' },
  { id: 'rec-15', titleId: 'title-9', groupId: 'group-2', recommendedBy: 'user-1', recommendedToUserIds: ['user-8'], recommendedToGroup: false, reason: 'Emotionally devastating. In the best way possible.', confidenceScore: 82, moodTags: ['Funny', 'Emotional'], tasteMatchScore: 80, verdictState: 'verdict_pending', createdAt: '2024-03-24T10:00:00Z' },
  { id: 'rec-16', titleId: 'title-16', groupId: 'group-4', recommendedBy: 'user-1', recommendedToUserIds: ['user-7'], recommendedToGroup: false, reason: 'Quiet, beautiful, and deeply human. Trust.', confidenceScore: 75, moodTags: ['Slow Burn', 'Emotional'], tasteMatchScore: 72, primaryStamp: 'Not For Everyone', verdictState: 'verdict_given', createdAt: '2024-02-15T10:00:00Z' },
  { id: 'rec-17', titleId: 'title-17', groupId: 'group-1', recommendedBy: 'user-1', recommendedToUserIds: ['user-5'], recommendedToGroup: false, reason: 'Ralph Fiennes cooking in this one. Peak political thriller.', confidenceScore: 86, moodTags: ['Intense', 'Slow Burn'], tasteMatchScore: 84, verdictState: 'verdict_pending', createdAt: '2024-03-25T10:00:00Z' },
  { id: 'rec-1', titleId: 'title-11', groupId: 'group-1', recommendedBy: 'user-2', recommendedToUserIds: ['user-1'], recommendedToGroup: false, reason: 'You love thoughtful mysteries with emotional weight and a sense of place.', confidenceScore: 92, moodTags: ['Emotional', 'Slow Burn'], tasteMatchScore: 92, primaryStamp: 'Worth It', verdictState: 'verdict_pending', createdAt: '2024-03-15T14:00:00Z' },
  { id: 'rec-2', titleId: 'title-2', groupId: 'group-1', recommendedBy: 'user-3', recommendedToUserIds: ['user-1'], recommendedToGroup: false, reason: 'Your brain needs this. The corporate dystopia is chef\'s kiss.', confidenceScore: 88, moodTags: ['Mind-bending', 'Slow Burn'], tasteMatchScore: 88, primaryStamp: 'Worth It', verdictState: 'verdict_pending', createdAt: '2024-03-10T10:00:00Z' },
  { id: 'rec-4', titleId: 'title-4', groupId: 'group-2', recommendedBy: 'user-4', recommendedToUserIds: ['user-1', 'user-2', 'user-3'], recommendedToGroup: true, reason: 'Big scale. Bigger emotions. Worth the runtime.', confidenceScore: 85, moodTags: ['Intense', 'Emotional'], tasteMatchScore: 85, primaryStamp: 'Crew Pick', verdictState: 'verdict_given', createdAt: '2024-02-25T10:00:00Z' },
  { id: 'rec-5', titleId: 'title-9', groupId: 'group-3', recommendedBy: 'user-2', recommendedToUserIds: ['user-1'], recommendedToGroup: false, reason: 'Fleabag is literally you in a show. Don\'t fight it.', confidenceScore: 78, moodTags: ['Funny', 'Emotional', 'Comfort Watch'], tasteMatchScore: 78, primaryStamp: 'Worth It', verdictState: 'verdict_pending', createdAt: '2024-03-12T10:00:00Z' },
  { id: 'rec-18', titleId: 'title-14', groupId: 'group-1', recommendedBy: 'user-7', recommendedToUserIds: ['user-1'], recommendedToGroup: false, reason: 'Romantic in a way that\'ll wreck you. The airport scene is art.', confidenceScore: 80, moodTags: ['Emotional', 'Slow Burn'], tasteMatchScore: 79, verdictState: 'verdict_pending', createdAt: '2024-03-26T10:00:00Z' },
  { id: 'rec-20', titleId: 'title-11', groupId: 'group-1', recommendedBy: 'user-3', recommendedToUserIds: ['user-1'], recommendedToGroup: false, reason: 'The cinematography alone makes this worth it. I know you love these rainy thriller vibes.', confidenceScore: 85, moodTags: ['Intense', 'Dark'], tasteMatchScore: 67, verdictState: 'verdict_pending', createdAt: '2024-03-27T10:00:00Z' },
  { id: 'rec-19', titleId: 'title-10', groupId: 'group-2', recommendedBy: 'user-4', recommendedToUserIds: ['user-1'], recommendedToGroup: false, reason: 'A classic for a reason. You\'ve probably seen it but rewatch.', confidenceScore: 96, moodTags: ['Emotional', 'Feel-good'], tasteMatchScore: 90, primaryStamp: 'Certified Good Call', verdictState: 'verdict_given', createdAt: '2024-02-18T10:00:00Z' },
  { id: 'rec-7', titleId: 'title-12', groupId: 'group-1', recommendedBy: 'user-3', recommendedToUserIds: ['user-2'], recommendedToGroup: false, reason: 'Tense, smart, and visually stunning. Your exact sci-fi mood.', confidenceScore: 82, moodTags: ['Intense', 'Mind-bending'], tasteMatchScore: 82, primaryStamp: 'Risky But Worth It', verdictState: 'verdict_pending', createdAt: '2024-03-08T10:00:00Z' },
];

// ── RATINGS ──────────────────────────────────────────────────────────────────

export const mockRatings: Rating[] = [
  // Ratings given BY user-1
  { id: 'rating-2', recommendationId: 'rec-4', ratedBy: 'user-1', contentRating: 4, recommendationResult: 'Nailed it', stamp: 'Crew Pick', comment: 'Worth every second of the runtime.', createdAt: '2024-03-10T10:00:00Z' },
  { id: 'rating-4', recommendationId: 'rec-19', ratedBy: 'user-1', contentRating: 5, recommendationResult: 'Nailed it', stamp: 'Certified Good Call', comment: 'A masterpiece. Rewatched and it hit harder.', createdAt: '2024-02-22T10:00:00Z' },
  // Ratings given BY others on user-1's recs
  { id: 'rating-1', recommendationId: 'rec-3', ratedBy: 'user-3', contentRating: 5, recommendationResult: 'Nailed it', stamp: 'Certified Good Call', comment: 'Okay you actually cooked. The twist destroyed me.', createdAt: '2024-03-05T10:00:00Z' },
  { id: 'rating-3', recommendationId: 'rec-6', ratedBy: 'user-2', contentRating: 5, recommendationResult: 'Nailed it', stamp: 'Crew Pick', comment: 'You were right. My taste card was at risk.', createdAt: '2024-03-22T10:00:00Z' },
  { id: 'rating-5', recommendationId: 'rec-8', ratedBy: 'user-7', contentRating: 4, recommendationResult: 'Pretty close', stamp: 'Worth It', comment: 'Good but I saw the Zuckerberg thing coming.', createdAt: '2024-03-12T10:00:00Z' },
  { id: 'rating-6', recommendationId: 'rec-10', ratedBy: 'user-2', contentRating: 4, recommendationResult: 'Nailed it', stamp: 'Worth It', comment: 'Cried for 20 minutes. You knew I would.', createdAt: '2024-03-15T10:00:00Z' },
  { id: 'rating-7', recommendationId: 'rec-11', ratedBy: 'user-6', contentRating: 5, recommendationResult: 'Nailed it', stamp: 'Certified Good Call', comment: 'The docking scene. Enough said.', createdAt: '2024-03-10T10:00:00Z' },
  { id: 'rating-8', recommendationId: 'rec-14', ratedBy: 'user-2', contentRating: 3, recommendationResult: 'Pretty close', stamp: 'Risky But Worth It', comment: 'Stylish but the plot lost me in ep 3.', createdAt: '2024-03-18T10:00:00Z' },
  { id: 'rating-9', recommendationId: 'rec-16', ratedBy: 'user-7', contentRating: 3, recommendationResult: 'Not for me', stamp: 'Not For Everyone', comment: 'Beautiful cinematography but nothing happens.', createdAt: '2024-02-25T10:00:00Z' },
  { id: 'rating-10', recommendationId: 'rec-11', ratedBy: 'user-9', contentRating: 4, recommendationResult: 'Pretty close', stamp: 'Worth It', comment: 'Almost perfect. McConaughey carried.', createdAt: '2024-03-14T10:00:00Z' },
];

// ── RECOMMENDATION IMPACTS ────────────────────────────────────────────────────

export const mockRecommendationImpacts: RecommendationImpact[] = [
  { id: 'imp-1', recommendationId: 'rec-3', recommenderId: 'user-1', receiverId: 'user-3', groupId: 'group-1', contentRating: 5, contentRatingScore: 100, recommendationResult: 'Nailed it', recommendationResultScore: 100, impactScore: 100, stamp: 'Certified Good Call', createdAt: '2024-03-05T10:00:00Z' },
  { id: 'imp-2', recommendationId: 'rec-6', recommenderId: 'user-1', receiverId: 'user-2', groupId: 'group-1', contentRating: 5, contentRatingScore: 100, recommendationResult: 'Nailed it', recommendationResultScore: 100, impactScore: 100, stamp: 'Crew Pick', createdAt: '2024-03-22T10:00:00Z' },
  { id: 'imp-3', recommendationId: 'rec-8', recommenderId: 'user-1', receiverId: 'user-7', groupId: 'group-3', contentRating: 4, contentRatingScore: 80, recommendationResult: 'Pretty close', recommendationResultScore: 70, impactScore: 72, stamp: 'Worth It', createdAt: '2024-03-12T10:00:00Z' },
  { id: 'imp-4', recommendationId: 'rec-10', recommenderId: 'user-1', receiverId: 'user-2', groupId: 'group-4', contentRating: 4, contentRatingScore: 80, recommendationResult: 'Nailed it', recommendationResultScore: 100, impactScore: 96, stamp: 'Worth It', createdAt: '2024-03-15T10:00:00Z' },
  { id: 'imp-5', recommendationId: 'rec-16', recommenderId: 'user-1', receiverId: 'user-7', groupId: 'group-4', contentRating: 3, contentRatingScore: 60, recommendationResult: 'Not for me', recommendationResultScore: 30, impactScore: 36, stamp: 'Not For Everyone', createdAt: '2024-02-25T10:00:00Z' },
];

// ── BADGES ───────────────────────────────────────────────────────────────────

export const mockBadges: Badge[] = [
  { id: 'badge-1', userId: 'user-1', badgeType: 'First Stamp', category: 'achievement', earnedAt: '2024-02-20T10:00:00Z' },
  { id: 'badge-2', userId: 'user-1', badgeType: 'Trusted Taste', category: 'achievement', earnedAt: '2024-03-10T10:00:00Z' },
  { id: 'badge-3', userId: 'user-1', badgeType: 'Top Recommender', category: 'achievement', earnedAt: '2024-03-12T10:00:00Z' },
  { id: 'badge-6', userId: 'user-1', badgeType: 'Crew Player', category: 'group', groupId: 'group-1', earnedAt: '2024-03-14T10:00:00Z' },
  { id: 'badge-7', userId: 'user-1', badgeType: 'Good Taste', category: 'achievement', earnedAt: '2024-03-16T10:00:00Z' },
  { id: 'badge-8', userId: 'user-1', badgeType: 'Consistent Picker', category: 'achievement', earnedAt: '2024-03-18T10:00:00Z' },
  { id: 'badge-9', userId: 'user-1', badgeType: 'Hidden Gem Finder', category: 'achievement', earnedAt: '2024-03-20T10:00:00Z' },
  // Other users
  { id: 'badge-10', userId: 'user-2', badgeType: 'Trusted Taste', category: 'achievement', earnedAt: '2024-03-08T10:00:00Z' },
  { id: 'badge-11', userId: 'user-3', badgeType: 'First Stamp', category: 'achievement', earnedAt: '2024-03-05T10:00:00Z' },
  { id: 'badge-12', userId: 'user-5', badgeType: 'Consistent Picker', category: 'achievement', earnedAt: '2024-03-15T10:00:00Z' },
];

// ── WATCHLIST ─────────────────────────────────────────────────────────────────

export const mockWatchlist: WatchlistItem[] = [
  {
    id: 'wl-1',
    userId: 'user-1',
    titleId: 'title-1', // Dune
    addedFromRecommendationId: 'rec-1',
    recommendedBy: 'user-2',
    addedBy: 'recommendation',
    listIds: ['list-1'],
    verdictState: 'verdict_pending',
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-01T10:00:00Z',
  },
  {
    id: 'wl-2',
    userId: 'user-1',
    titleId: 'title-2', // Interstellar
    addedBy: 'self',
    listIds: ['list-2'],
    verdictState: 'none',
    createdAt: '2024-03-02T10:00:00Z',
    updatedAt: '2024-03-02T10:00:00Z',
  },
  {
    id: 'wl-3',
    userId: 'user-1',
    titleId: 'title-3', // Past Lives
    addedFromRecommendationId: 'rec-10',
    recommendedBy: 'user-1',
    addedBy: 'recommendation',
    listIds: [],
    verdictState: 'verdict_given',
    stamp: 'Certified Good Call',
    createdAt: '2024-03-03T10:00:00Z',
    updatedAt: '2024-03-03T10:00:00Z',
  }
];

export const mockWatchlistLists: WatchlistList[] = [
  {
    id: 'list-1',
    userId: 'user-1',
    name: 'Weekend Watch',
    description: 'Bangers for the Saturday night vibe.',
    privacy: 'private',
    coverStyle: 'collage',
    titleIds: ['title-1', 'title-4', 'title-7'],
    createdAt: '2024-03-01T09:00:00Z',
    updatedAt: '2024-03-01T09:00:00Z',
  },
  {
    id: 'list-2',
    userId: 'user-1',
    name: 'Slow Burns',
    description: 'Patience required. Payoff guaranteed.',
    privacy: 'shared',
    coverStyle: 'poster_stack',
    titleIds: ['title-2', 'title-5', 'title-10'],
    createdAt: '2024-03-02T09:00:00Z',
    updatedAt: '2024-03-02T09:00:00Z',
  },
  {
    id: 'list-3',
    userId: 'user-1',
    name: 'Maya\'s Recs',
    description: 'The chaotic stuff she sends me.',
    privacy: 'private',
    coverStyle: 'gradient',
    titleIds: ['title-3', 'title-6'],
    createdAt: '2024-03-03T09:00:00Z',
    updatedAt: '2024-03-03T09:00:00Z',
  }
];

// ── ACTIVITY ──────────────────────────────────────────────────────────────────

export const mockActivity: ActivityItem[] = [
  { id: 'act-1', type: 'recommendation_sent', userId: 'user-2', targetUserId: 'user-1', titleId: 'title-11', groupId: 'group-1', recommendationId: 'rec-1', message: 'Maya recommended The Long Harbor to you', createdAt: '2024-03-15T14:00:00Z' },
  { id: 'act-2', type: 'recommendation_rated', userId: 'user-3', targetUserId: 'user-1', titleId: 'title-6', recommendationId: 'rec-3', message: 'Josh rated your rec — Certified Good Call', createdAt: '2024-03-14T10:00:00Z' },
  { id: 'act-3', type: 'taste_score_changed', userId: 'user-1', message: 'Your Taste Score is now 92%', createdAt: '2024-03-13T10:00:00Z' },
  { id: 'act-4', type: 'badge_earned', userId: 'user-1', message: 'You earned the Trusted Taste badge', createdAt: '2024-03-12T10:00:00Z' },
  { id: 'act-5', type: 'added_to_watchlist', userId: 'user-3', titleId: 'title-4', message: 'Josh added Dune: Part Two to watchlist', createdAt: '2024-03-12T08:00:00Z' },
  { id: 'act-6', type: 'recommendation_sent', userId: 'user-3', targetUserId: 'user-1', titleId: 'title-2', groupId: 'group-1', recommendationId: 'rec-2', message: 'Josh recommended Severance — 88% taste match', createdAt: '2024-03-10T10:00:00Z' },
  { id: 'act-7', type: 'recommendation_sent', userId: 'user-4', targetUserId: 'user-1', titleId: 'title-4', groupId: 'group-2', message: 'Priya recommended Dune: Part Two to the group', createdAt: '2024-03-09T10:00:00Z' },
  { id: 'act-8', type: 'review_posted', userId: 'user-2', titleId: 'title-9', message: 'Maya reviewed Fleabag — ★★★★★', createdAt: '2024-03-08T10:00:00Z' },
];

// ── LEADERBOARD ───────────────────────────────────────────────────────────────

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, user: mockUsers[0], tasteScore: 92, badge: 'Trusted Taste', label: 'Great Taste' },
  { rank: 2, user: mockUsers[1], tasteScore: 85, badge: 'Trusted Taste', label: 'Great Taste' },
  { rank: 3, user: mockUsers[6], tasteScore: 78, badge: 'First Stamp', label: 'Trusted Enough' },
  { rank: 4, user: mockUsers[5], tasteScore: 72, badge: 'Trusted Taste', label: 'Trusted Enough' },
  { rank: 5, user: mockUsers[3], tasteScore: 68, badge: 'First Stamp', label: 'Trusted Enough' },
  { rank: 6, user: mockUsers[4], tasteScore: 55, badge: 'Consistent Picker', label: 'Mixed Taste' },
];

// ── TASTE SCORE ───────────────────────────────────────────────────────────────

export const mockTasteScore: TasteScore = {
  score: 86,
  label: 'Great Taste',
  totalRecommendationsSent: 12,
  totalRecommendationsRated: 8,
  responseRate: 67,
  averageImpactScore: 86,
  mostTrustedBy: 'Maya',
  recentTrend: 'up',
  calculatedAt: '2024-03-20T10:00:00Z',
};

// ── HELPERS ───────────────────────────────────────────────────────────────────

export function getUserById(id: string) { return mockUsers.find(u => u.id === id); }
export function getTitleById(id: string) { return mockTitles.find(t => t.id === id); }
export function getGroupById(id: string) { return mockGroups.find(g => g.id === id); }

export function getGroupMembers(groupId: string): User[] {
  const ids = mockGroupMembers.filter(gm => gm.groupId === groupId).map(gm => gm.userId);
  return mockUsers.filter(u => ids.includes(u.id));
}

export function getGroupRecommendations(groupId: string) {
  return mockRecommendations.filter(r => r.groupId === groupId);
}

export function getUserRecommendations(userId: string) {
  return mockRecommendations.filter(r => r.recommendedToUserIds?.includes(userId) || r.recommendedBy === userId);
}

export function getPendingForUser(userId: string) {
  return mockRecommendations.filter(r =>
    r.recommendedToUserIds?.includes(userId) && r.verdictState === 'verdict_pending'
  );
}

export function getRatingForRecommendation(recId: string) {
  return mockRatings.find(r => r.recommendationId === recId);
}

export function getUserBadges(userId: string) {
  return mockBadges.filter(b => b.userId === userId);
}

// ── GROUP-SPECIFIC VERDICTS (Parasite in Film Chaos Club) ────────────────────
// These simulate multiple group members rating the same title within a group context

export const mockGroupVerdicts: Rating[] = [
  { id: 'gv-1', recommendationId: 'rec-3', ratedBy: 'user-3', contentRating: 5, recommendationResult: 'Nailed it', stamp: 'Certified Good Call', comment: 'Okay you actually cooked. The twist destroyed me.', createdAt: '2024-03-05T10:00:00Z' },
  { id: 'gv-2', recommendationId: 'rec-3', ratedBy: 'user-2', contentRating: 5, recommendationResult: 'Nailed it', stamp: 'Crew Pick', comment: 'This is peak cinema. The basement scene? Unhinged.', createdAt: '2024-03-06T14:00:00Z' },
  { id: 'gv-3', recommendationId: 'rec-3', ratedBy: 'user-5', contentRating: 4, recommendationResult: 'Pretty close', stamp: 'Worth It', comment: 'Great movie but I guessed the twist early. Still worth it.', createdAt: '2024-03-07T09:30:00Z' },
  { id: 'gv-4', recommendationId: 'rec-3', ratedBy: 'user-7', contentRating: 5, recommendationResult: 'Nailed it', stamp: 'Certified Good Call', comment: 'Masterpiece. The social commentary is surgically precise.', createdAt: '2024-03-08T20:00:00Z' },
  { id: 'gv-5', recommendationId: 'rec-3', ratedBy: 'user-4', contentRating: 3, recommendationResult: 'Not for me', stamp: 'Not For Everyone', comment: 'Too dark for me. I get why people love it though.', createdAt: '2024-03-09T16:00:00Z' },
  { id: 'gv-6', recommendationId: 'rec-3', ratedBy: 'user-8', contentRating: 4, recommendationResult: 'Pretty close', stamp: 'Risky But Worth It', comment: 'Emotionally exhausting but in the best way. Good rec.', createdAt: '2024-03-10T11:00:00Z' },
];

// ── GROUP COMMENTS (Crew Discussion) ─────────────────────────────────────────

export const mockGroupComments: GroupComment[] = [
  { id: 'gc-1', groupId: 'group-1', titleId: 'title-6', userId: 'user-1', comment: 'Told you all. This one hits different when you watch it knowing nothing.', createdAt: '2024-03-04T22:00:00Z' },
  { id: 'gc-2', groupId: 'group-1', titleId: 'title-6', userId: 'user-3', comment: 'The peach scene. I cannot get it out of my head.', createdAt: '2024-03-05T11:00:00Z' },
  { id: 'gc-3', groupId: 'group-1', titleId: 'title-6', userId: 'user-2', comment: 'Just finished. I need to sit in silence for 20 minutes.', createdAt: '2024-03-06T15:00:00Z' },
  { id: 'gc-4', groupId: 'group-1', titleId: 'title-6', userId: 'user-5', comment: 'Bong Joon-ho doesn\'t miss. The framing in every shot is insane.', createdAt: '2024-03-07T10:00:00Z' },
  { id: 'gc-5', groupId: 'group-1', titleId: 'title-6', userId: 'user-7', comment: 'This is why I trust Aniket\'s recs. Absolute cinema.', createdAt: '2024-03-08T21:00:00Z' },
  { id: 'gc-6', groupId: 'group-1', titleId: 'title-6', userId: 'user-4', comment: 'I watched it. It was too intense for me but I respect the craft.', createdAt: '2024-03-09T17:00:00Z' },
];

export const ALL_GENRES = [
  'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-fi',
  'Thriller', 'Anime',
];
