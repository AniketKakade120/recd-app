import type { User, Group, GroupMember, Title, Recommendation, Rating, Badge, ActivityItem, LeaderboardEntry, WatchlistItem, TasteScore, GroupComment } from './types';

// ── USERS ────────────────────────────────────────────────────────────────────

export const mockUsers: User[] = [
  { id: 'user-1', username: 'aniket', displayName: 'Aniket', avatarUrl: '', bio: 'Movies with meaning. Stories that stick. Always the rec.', tasteArchetype: 'Emotional Damage Dealer', createdAt: '2024-01-15T10:00:00Z' },
  { id: 'user-2', username: 'maya', displayName: 'Maya', avatarUrl: '', bio: 'Known for slow burns and suspiciously good thrillers.', tasteArchetype: 'Plot Twist Addict', createdAt: '2024-01-16T10:00:00Z' },
  { id: 'user-3', username: 'josh', displayName: 'Josh', avatarUrl: '', bio: 'Prestige TV or nothing.', tasteArchetype: 'Prestige TV Snob', createdAt: '2024-01-17T10:00:00Z' },
  { id: 'user-4', username: 'priya', displayName: 'Priya', avatarUrl: '', bio: 'Comfort watch queen. Judge me.', tasteArchetype: 'Comfort Watch Specialist', createdAt: '2024-01-18T10:00:00Z' },
  { id: 'user-5', username: 'kabir', displayName: 'Kabir', avatarUrl: '', bio: 'Horror nights. No regrets.', tasteArchetype: 'Horror Sicko', createdAt: '2024-01-19T10:00:00Z' },
  { id: 'user-6', username: 'sam', displayName: 'Sam', avatarUrl: '', bio: 'Anime and slow burns. The perfect combo.', tasteArchetype: 'Anime Evangelist', createdAt: '2024-01-20T10:00:00Z' },
  { id: 'user-7', username: 'rhea', displayName: 'Rhea', avatarUrl: '', bio: 'Sharp, smart cinema only.', tasteArchetype: 'Thriller Merchant', createdAt: '2024-01-21T10:00:00Z' },
  { id: 'user-8', username: 'dev', displayName: 'Dev', avatarUrl: '', bio: 'Documentary goblin. Proud of it.', tasteArchetype: 'Documentary Goblin', createdAt: '2024-01-22T10:00:00Z' },
  { id: 'user-9', username: 'riley', displayName: 'Riley', avatarUrl: '', bio: 'Franchise defender. Unapologetically.', tasteArchetype: 'Franchise Defender', createdAt: '2024-01-23T10:00:00Z' },
];

export const currentUser = mockUsers[0];

// ── TITLES ────────────────────────────────────────────────────────────────────

export const mockTitles: Title[] = [
  { id: 'title-1', title: 'The Bear', type: 'series', posterGradient: 1, posterUrl: 'https://picsum.photos/seed/title-1/400/600', backdropUrl: 'https://picsum.photos/seed/title-1-bg/800/500', releaseYear: 2022, genres: ['Drama', 'Comedy'], overview: 'A young chef from fine dining returns to run his family\'s sandwich shop. Chaos ensues.', externalRating: 8.6, runtime: '30m', format: 'Series', platforms: ['Disney+'] },
  { id: 'title-2', title: 'Severance', type: 'series', posterGradient: 6, posterUrl: 'https://picsum.photos/seed/title-2/400/600', backdropUrl: 'https://picsum.photos/seed/title-2-bg/800/500', releaseYear: 2022, genres: ['Drama', 'Mystery', 'Sci-fi'], overview: 'Office workers have their memories surgically divided between work and personal lives.', externalRating: 8.7, runtime: '50m', format: 'Series', platforms: ['Apple TV'] },
  { id: 'title-3', title: 'Past Lives', type: 'movie', posterGradient: 8, posterUrl: 'https://picsum.photos/seed/title-3/400/600', backdropUrl: 'https://picsum.photos/seed/title-3-bg/800/500', releaseYear: 2023, genres: ['Drama', 'Romance'], overview: 'Two childhood friends separated by emigration are reunited 24 years later.', externalRating: 7.8, runtime: '1h 46m', format: 'Movie', platforms: ['MUBI'] },
  { id: 'title-4', title: 'Dune: Part Two', type: 'movie', posterGradient: 4, posterUrl: 'https://picsum.photos/seed/title-4/400/600', backdropUrl: 'https://picsum.photos/seed/title-4-bg/800/500', releaseYear: 2024, genres: ['Sci-fi', 'Drama'], overview: 'Paul Atreides unites with the Fremen to seek revenge against the conspirators.', externalRating: 8.5, runtime: '2h 46m', format: 'Movie', platforms: ['Netflix'] },
  { id: 'title-5', title: 'The Social Network', type: 'movie', posterGradient: 9, posterUrl: 'https://picsum.photos/seed/title-5/400/600', backdropUrl: 'https://picsum.photos/seed/title-5-bg/800/500', releaseYear: 2010, genres: ['Drama'], overview: 'The founding of Facebook and the lawsuits that followed.', externalRating: 7.8, runtime: '2h', format: 'Movie', platforms: ['Netflix'] },
  { id: 'title-6', title: 'Parasite', type: 'movie', posterGradient: 7, posterUrl: 'https://picsum.photos/seed/title-6/400/600', backdropUrl: 'https://picsum.photos/seed/title-6-bg/800/500', releaseYear: 2019, genres: ['Comedy', 'Drama', 'Thriller'], overview: 'Greed and class discrimination threaten the symbiotic relationship between two families.', externalRating: 8.5, runtime: '2h 12m', format: 'Movie', platforms: ['MUBI'] },
  { id: 'title-7', title: 'Succession', type: 'series', posterGradient: 5, posterUrl: 'https://picsum.photos/seed/title-7/400/600', backdropUrl: 'https://picsum.photos/seed/title-7-bg/800/500', releaseYear: 2018, genres: ['Drama'], overview: 'The Roy family controls the biggest media company in the world. Until they don\'t.', externalRating: 8.8, runtime: '1h', format: 'Series', platforms: ['Prime Video'] },
  { id: 'title-8', title: 'Interstellar', type: 'movie', posterGradient: 3, posterUrl: 'https://picsum.photos/seed/title-8/400/600', backdropUrl: 'https://picsum.photos/seed/title-8-bg/800/500', releaseYear: 2014, genres: ['Sci-fi', 'Drama'], overview: 'A team of explorers travel through a wormhole in space to save humanity.', externalRating: 8.6, runtime: '2h 49m', format: 'Movie', platforms: ['Netflix'] },
  { id: 'title-9', title: 'Fleabag', type: 'series', posterGradient: 2, posterUrl: 'https://picsum.photos/seed/title-9/400/600', backdropUrl: 'https://picsum.photos/seed/title-9-bg/800/500', releaseYear: 2016, genres: ['Comedy', 'Drama'], overview: 'A dry-witted woman navigates grief and love in London with devastating honesty.', externalRating: 8.7, runtime: '25m', format: 'Limited series', platforms: ['Prime Video'] },
  { id: 'title-10', title: 'The Shawshank Redemption', type: 'movie', posterGradient: 10, posterUrl: 'https://picsum.photos/seed/title-10/400/600', backdropUrl: 'https://picsum.photos/seed/title-10-bg/800/500', releaseYear: 1994, genres: ['Drama'], overview: 'Two imprisoned men bond over years, finding solace and redemption.', externalRating: 9.3, runtime: '2h 22m', format: 'Movie', platforms: ['Netflix'] },
  // Original mock titles
  { id: 'title-11', title: 'The Long Harbor', type: 'movie', posterGradient: 1, posterUrl: 'https://picsum.photos/seed/title-11/400/600', backdropUrl: 'https://picsum.photos/seed/title-11-bg/800/500', releaseYear: 2024, genres: ['Drama', 'Thriller'], overview: 'A detective returns to his coastal hometown to solve a disappearance that mirrors his own past.', externalRating: 7.9, runtime: '2h 4m', format: 'Movie' },
  { id: 'title-12', title: 'Echoes Below', type: 'series', posterGradient: 6, posterUrl: 'https://picsum.photos/seed/title-12/400/600', backdropUrl: 'https://picsum.photos/seed/title-12-bg/800/500', releaseYear: 2024, genres: ['Sci-fi', 'Thriller'], overview: 'A signal from deep space fractures a remote research team\'s reality.', externalRating: 8.1, runtime: '45m', format: 'Series' },
  { id: 'title-13', title: 'The Glasshouse', type: 'limited_series', posterGradient: 3, posterUrl: 'https://picsum.photos/seed/title-13/400/600', backdropUrl: 'https://picsum.photos/seed/title-13-bg/800/500', releaseYear: 2023, genres: ['Drama', 'Crime'], overview: 'A reclusive architect is implicated in a series of disappearances. Six episodes. One truth.', externalRating: 8.3, runtime: '55m', format: 'Limited series' },
  { id: 'title-14', title: 'After the Lights', type: 'movie', posterGradient: 5, posterUrl: 'https://picsum.photos/seed/title-14/400/600', backdropUrl: 'https://picsum.photos/seed/title-14-bg/800/500', releaseYear: 2023, genres: ['Drama', 'Romance'], overview: 'Two strangers meet on the last flight out of a shutting-down city and fall into each other\'s orbits.', externalRating: 7.6, runtime: '1h 52m', format: 'Movie' },
  { id: 'title-15', title: 'Babylon City', type: 'series', posterGradient: 8, posterUrl: 'https://picsum.photos/seed/title-15/400/600', backdropUrl: 'https://picsum.photos/seed/title-15-bg/800/500', releaseYear: 2024, genres: ['Crime', 'Thriller'], overview: 'A former fixer navigates the criminal underworld of a sprawling megacity.', externalRating: 8.2, runtime: '1h', format: 'Series' },
  { id: 'title-16', title: 'The Quiet Hours', type: 'movie', posterGradient: 2, posterUrl: 'https://picsum.photos/seed/title-16/400/600', backdropUrl: 'https://picsum.photos/seed/title-16-bg/800/500', releaseYear: 2023, genres: ['Drama'], overview: 'A portrait of three strangers who share one apartment building across a single night.', externalRating: 7.4, runtime: '1h 38m', format: 'Movie' },
  { id: 'title-17', title: 'Conclave', type: 'movie', posterGradient: 9, posterUrl: 'https://picsum.photos/seed/title-17/400/600', backdropUrl: 'https://picsum.photos/seed/title-17-bg/800/500', releaseYear: 2024, genres: ['Drama', 'Thriller'], overview: 'The election of a new pope reveals secrets that could fracture the Church.', externalRating: 7.4, runtime: '2h', format: 'Movie', platforms: ['Prime Video'] },
];

// ── GROUPS ─────────────────────────────────────────────────────────────────────

export const mockGroups: Group[] = [
  { id: 'group-1', name: 'Film Chaos Club', vibe: 'Movie chaos', description: 'We watch at night. We rec what\'s real.', privacy: 'private', inviteCode: 'CHAOS24', createdBy: 'user-1', createdAt: '2024-02-01T10:00:00Z', avatarGradient: 3, coverImage: 'https://picsum.photos/seed/group-1-bg/800/400' },
  { id: 'group-2', name: 'Sunday Watchlist', vibe: 'Comfort watch club', description: 'Weekend comfort picks only. No judgement. (Lots of judgement.)', privacy: 'public', inviteCode: 'SUNDAY24', createdBy: 'user-3', createdAt: '2024-02-05T10:00:00Z', avatarGradient: 6, coverImage: 'https://picsum.photos/seed/group-2-bg/800/400' },
  { id: 'group-3', name: 'Bad Taste Anonymous', vibe: 'Anything goes', description: 'No judgment. Actually, lots of judgment.', privacy: 'private', inviteCode: 'BADTASTE', createdBy: 'user-2', createdAt: '2024-02-10T10:00:00Z', avatarGradient: 8, coverImage: 'https://picsum.photos/seed/group-3-bg/800/400' },
  { id: 'group-4', name: 'Slow Burn Club', vibe: 'Slow burn crew', description: 'If it doesn\'t simmer, we don\'t watch it.', privacy: 'public', inviteCode: 'SLOWBRN', createdBy: 'user-7', createdAt: '2024-02-15T10:00:00Z', avatarGradient: 2, coverImage: 'https://picsum.photos/seed/group-4-bg/800/400' },
  { id: 'group-5', name: 'Sci-Fi Heads', vibe: 'Sci-fi heads', description: 'From Kubrick to Villeneuve. Space is the vibe.', privacy: 'public', inviteCode: 'SCIFI24', createdBy: 'user-6', createdAt: '2024-02-18T10:00:00Z', avatarGradient: 5, coverImage: 'https://picsum.photos/seed/group-5-bg/800/400' },
  { id: 'group-6', name: 'Hidden Gems', vibe: 'Prestige drama', description: 'The films nobody talks about but everybody should watch.', privacy: 'public', inviteCode: 'HIDDGEM', createdBy: 'user-8', createdAt: '2024-02-20T10:00:00Z', avatarGradient: 7, coverImage: 'https://picsum.photos/seed/group-6-bg/800/400' },
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
  { id: 'rec-3', titleId: 'title-6', groupId: 'group-1', recommendedBy: 'user-1', recommendedToUserIds: ['user-3'], recommendedToGroup: false, reason: 'Trust me, this is your exact vibe. The class commentary will personally attack you.', confidenceScore: 95, moodTags: ['Mind-bending', 'Intense'], tasteMatchScore: 95, primaryStamp: 'Certified Good Call', status: 'rated', createdAt: '2024-02-20T10:00:00Z' },
  { id: 'rec-6', titleId: 'title-7', groupId: 'group-1', recommendedBy: 'user-1', recommendedToUserIds: [], recommendedToGroup: true, reason: 'If you haven\'t watched this yet, your taste card is revoked.', confidenceScore: 97, moodTags: ['Intense', 'Slow burn'], tasteMatchScore: 97, primaryStamp: 'Crew Pick', status: 'rated', createdAt: '2024-03-18T10:00:00Z' },
  { id: 'rec-8', titleId: 'title-5', groupId: 'group-3', recommendedBy: 'user-1', recommendedToUserIds: ['user-7'], recommendedToGroup: false, reason: 'Sharp, smart, and painfully relevant. You\'ll recognise everyone in it.', confidenceScore: 90, moodTags: ['Intense'], tasteMatchScore: 90, primaryStamp: 'Worth It', status: 'rated', createdAt: '2024-03-01T10:00:00Z' },
  { id: 'rec-10', titleId: 'title-3', groupId: 'group-4', recommendedBy: 'user-1', recommendedToUserIds: ['user-2'], recommendedToGroup: false, reason: 'You love emotional weight and bittersweet endings. This is peak.', confidenceScore: 88, moodTags: ['Emotional', 'Slow burn'], tasteMatchScore: 91, primaryStamp: 'Worth It', status: 'rated', createdAt: '2024-03-08T10:00:00Z' },
  { id: 'rec-11', titleId: 'title-8', groupId: 'group-5', recommendedBy: 'user-1', recommendedToUserIds: ['user-6', 'user-9'], recommendedToGroup: false, reason: 'Nolan at his most emotional. You need to see this on a big screen.', confidenceScore: 92, moodTags: ['Emotional', 'Mind-bending'], tasteMatchScore: 88, primaryStamp: 'Certified Good Call', status: 'rated', createdAt: '2024-02-28T10:00:00Z' },
  { id: 'rec-12', titleId: 'title-1', groupId: 'group-2', recommendedBy: 'user-1', recommendedToUserIds: ['user-4'], recommendedToGroup: false, reason: 'The energy of this show is unmatched. Season 2 is insane.', confidenceScore: 85, moodTags: ['Intense', 'Comfort watch'], tasteMatchScore: 82, status: 'watching', createdAt: '2024-03-20T10:00:00Z' },
  { id: 'rec-13', titleId: 'title-13', groupId: 'group-1', recommendedBy: 'user-1', recommendedToUserIds: ['user-3', 'user-5'], recommendedToGroup: false, reason: 'Six episodes. One truth. No filler.', confidenceScore: 91, moodTags: ['Slow burn', 'Intense'], tasteMatchScore: 89, status: 'pending', createdAt: '2024-03-22T10:00:00Z' },
  { id: 'rec-14', titleId: 'title-15', groupId: 'group-3', recommendedBy: 'user-1', recommendedToUserIds: ['user-2'], recommendedToGroup: false, reason: 'Crime + style + tension. This is your lane.', confidenceScore: 78, moodTags: ['Intense', 'Dark'], tasteMatchScore: 76, primaryStamp: 'Risky But Worth It', status: 'rated', createdAt: '2024-03-05T10:00:00Z' },
  { id: 'rec-15', titleId: 'title-9', groupId: 'group-2', recommendedBy: 'user-1', recommendedToUserIds: ['user-8'], recommendedToGroup: false, reason: 'Emotionally devastating. In the best way possible.', confidenceScore: 82, moodTags: ['Funny', 'Emotional'], tasteMatchScore: 80, status: 'accepted', createdAt: '2024-03-24T10:00:00Z' },
  { id: 'rec-16', titleId: 'title-16', groupId: 'group-4', recommendedBy: 'user-1', recommendedToUserIds: ['user-7'], recommendedToGroup: false, reason: 'Quiet, beautiful, and deeply human. Trust.', confidenceScore: 75, moodTags: ['Slow burn', 'Emotional'], tasteMatchScore: 72, primaryStamp: 'Not For Everyone', status: 'rated', createdAt: '2024-02-15T10:00:00Z' },
  { id: 'rec-17', titleId: 'title-17', groupId: 'group-1', recommendedBy: 'user-1', recommendedToUserIds: ['user-5'], recommendedToGroup: false, reason: 'Ralph Fiennes cooking in this one. Peak political thriller.', confidenceScore: 86, moodTags: ['Intense', 'Slow burn'], tasteMatchScore: 84, status: 'pending', createdAt: '2024-03-25T10:00:00Z' },
  // --- Sent TO user-1 (Aniket) ---
  { id: 'rec-1', titleId: 'title-11', groupId: 'group-1', recommendedBy: 'user-2', recommendedToUserIds: ['user-1'], recommendedToGroup: false, reason: 'You love thoughtful mysteries with emotional weight and a sense of place.', confidenceScore: 92, moodTags: ['Emotional', 'Slow burn'], tasteMatchScore: 92, primaryStamp: 'Worth It', status: 'pending', createdAt: '2024-03-15T14:00:00Z' },
  { id: 'rec-2', titleId: 'title-2', groupId: 'group-1', recommendedBy: 'user-3', recommendedToUserIds: ['user-1'], recommendedToGroup: false, reason: 'Your brain needs this. The corporate dystopia is chef\'s kiss.', confidenceScore: 88, moodTags: ['Mind-bending', 'Slow burn'], tasteMatchScore: 88, primaryStamp: 'Worth It', status: 'watching', createdAt: '2024-03-10T10:00:00Z' },
  { id: 'rec-4', titleId: 'title-4', groupId: 'group-2', recommendedBy: 'user-4', recommendedToUserIds: ['user-1', 'user-2', 'user-3'], recommendedToGroup: true, reason: 'Big scale. Bigger emotions. Worth the runtime.', confidenceScore: 85, moodTags: ['Intense', 'Emotional'], tasteMatchScore: 85, primaryStamp: 'Crew Pick', status: 'rated', createdAt: '2024-02-25T10:00:00Z' },
  { id: 'rec-5', titleId: 'title-9', groupId: 'group-3', recommendedBy: 'user-2', recommendedToUserIds: ['user-1'], recommendedToGroup: false, reason: 'Fleabag is literally you in a show. Don\'t fight it.', confidenceScore: 78, moodTags: ['Funny', 'Emotional', 'Comfort watch'], tasteMatchScore: 78, primaryStamp: 'Worth It', status: 'accepted', createdAt: '2024-03-12T10:00:00Z' },
  { id: 'rec-18', titleId: 'title-14', groupId: 'group-1', recommendedBy: 'user-7', recommendedToUserIds: ['user-1'], recommendedToGroup: false, reason: 'Romantic in a way that\'ll wreck you. The airport scene is art.', confidenceScore: 80, moodTags: ['Emotional', 'Slow burn'], tasteMatchScore: 79, status: 'pending', createdAt: '2024-03-26T10:00:00Z' },
  { id: 'rec-19', titleId: 'title-10', groupId: 'group-2', recommendedBy: 'user-4', recommendedToUserIds: ['user-1'], recommendedToGroup: false, reason: 'A classic for a reason. You\'ve probably seen it but rewatch.', confidenceScore: 96, moodTags: ['Emotional', 'Inspiring'], tasteMatchScore: 90, primaryStamp: 'Certified Good Call', status: 'rated', createdAt: '2024-02-18T10:00:00Z' },
  // --- Between others ---
  { id: 'rec-7', titleId: 'title-12', groupId: 'group-1', recommendedBy: 'user-3', recommendedToUserIds: ['user-2'], recommendedToGroup: false, reason: 'Tense, smart, and visually stunning. Your exact sci-fi mood.', confidenceScore: 82, moodTags: ['Intense', 'Mind-bending'], tasteMatchScore: 82, primaryStamp: 'Risky But Worth It', status: 'watched', createdAt: '2024-03-08T10:00:00Z' },
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
  { id: 'wl-1', userId: 'user-1', titleId: 'title-4', addedFromRecommendationId: 'rec-4', recommendedBy: 'user-4', priority: 'high', status: 'recommended', stamp: 'Crew Pick', createdAt: '2024-03-15T10:00:00Z' },
  { id: 'wl-2', userId: 'user-1', titleId: 'title-3', recommendedBy: 'user-2', priority: 'medium', status: 'saved', stamp: 'Worth It', createdAt: '2024-03-14T10:00:00Z' },
  { id: 'wl-3', userId: 'user-1', titleId: 'title-5', priority: 'low', status: 'saved', createdAt: '2024-03-13T10:00:00Z' },
  { id: 'wl-4', userId: 'user-1', titleId: 'title-13', recommendedBy: 'user-7', priority: 'medium', status: 'recommended', stamp: 'Worth It', createdAt: '2024-03-12T10:00:00Z' },
  { id: 'wl-5', userId: 'user-1', titleId: 'title-11', recommendedBy: 'user-2', priority: 'high', status: 'recommended', createdAt: '2024-03-11T10:00:00Z' },
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
  score: 92,
  totalSent: 12,
  totalRated: 8,
  avgAccuracy: 4.5,
  goodCallPct: 96,
  mostTrustedBy: 'Maya',
  bestCategories: ['Drama', 'Thriller'],
  recentTrend: 'up',
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
    r.recommendedToUserIds?.includes(userId) && (r.status === 'pending' || r.status === 'accepted')
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
