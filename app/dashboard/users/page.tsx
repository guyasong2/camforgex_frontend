'use client';

import { useState, useEffect, useRef } from 'react';

export default function PromotersDashboard() {
  const [activeTab, setActiveTab] = useState('discover');
  const [userType, setUserType] = useState('promoter');
  const [showAvatar, setShowAvatar] = useState(false);
  const [avatarSpeaking, setAvatarSpeaking] = useState(false);
  const [avatarSize, setAvatarSize] = useState('medium');
  const [currentSignContent, setCurrentSignContent] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const avatarContainerRef = useRef(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // WebSign API simulation
  const webSignAPI = {
    initialize: (container, config = {}) => {
      return {
        speak: (text) => {
          setAvatarSpeaking(true);
          setCurrentSignContent(text);
          const duration = Math.max(2000, text.length * 100);
          setTimeout(() => {
            setAvatarSpeaking(false);
            setCurrentSignContent('');
          }, duration);
        },
        stop: () => {
          setAvatarSpeaking(false);
          setCurrentSignContent('');
        },
        setSize: (size) => {
          setAvatarSize(size);
        },
        setLanguage: (language) => {
          console.log('Setting sign language to:', language);
        }
      };
    },
    destroy: () => {
      setAvatarSpeaking(false);
      setCurrentSignContent('');
    }
  };

  const avatarRef = useRef(null);

  // Initialize WebSign avatar
  useEffect(() => {
    if (showAvatar && avatarContainerRef.current) {
      avatarRef.current = webSignAPI.initialize(avatarContainerRef.current, {
        size: avatarSize,
        language: 'ASL',
        backgroundColor: 'transparent'
      });
    }

    return () => {
      if (avatarRef.current) {
        webSignAPI.destroy();
      }
    };
  }, [showAvatar]);

  // Update avatar size when changed
  useEffect(() => {
    if (avatarRef.current && showAvatar) {
      avatarRef.current.setSize(avatarSize);
    }
  }, [avatarSize, showAvatar]);

  // Sign language functions
  const signContent = {
    welcome: () => {
      const message = userType === 'dj' 
        ? "Welcome to your DJ dashboard. Discover music, join challenges, and manage your events."
        : "Welcome to your promoter dashboard. Discover artists, create events, and promote music.";
      avatarRef.current?.speak(message);
    },
    
    sectionTitle: (title) => {
      avatarRef.current?.speak(`Now viewing: ${title}`);
    },
    
    songInfo: (song) => {
      const message = `Song: ${song.title} by ${song.artist}. Duration: ${song.duration}. ${song.downloads} downloads.`;
      avatarRef.current?.speak(message);
    },
    
    artistInfo: (artist) => {
      const message = `Artist: ${artist.name}. Genre: ${artist.genre}. ${artist.followers} followers. ${artist.tracks} tracks available.`;
      avatarRef.current?.speak(message);
    },
    
    challengeInfo: (challenge) => {
      const message = `Challenge: ${challenge.title} by ${challenge.artist}. Prize: ${challenge.prize}. ${challenge.participants} participants. Deadline: ${challenge.deadline}.`;
      avatarRef.current?.speak(message);
    },
    
    eventInfo: (event) => {
      const message = `Event: ${event.title}. Date: ${event.date}. Venue: ${event.venue}. ${event.attendees} attendees expected.`;
      avatarRef.current?.speak(message);
    },
    
    navigation: (tabName) => {
      avatarRef.current?.speak(`Navigating to ${tabName} section`);
    }
  };

  // Enhanced tab change handler
  const handleTabChange = (tabKey, tabLabel) => {
    setActiveTab(tabKey);
    setShowMobileMenu(false);
    if (showAvatar && avatarRef.current) {
      signContent.navigation(tabLabel);
    }
  };

  // Data arrays (same as before)
  const promoterStats = [
    { label: 'Songs Downloaded', value: '24', icon: '📥' },
    { label: 'Artists Following', value: '18', icon: '👥' },
    { label: 'Events Created', value: '6', icon: '🎪' },
    { label: 'Revenue Generated', value: '$2.4K', icon: '💰' },
  ];

  const djStats = [
    { label: 'Mixes Created', value: '12', icon: '🎚️' },
    { label: 'Events Played', value: '8', icon: '🎪' },
    { label: 'Total Plays', value: '24.5K', icon: '🎧' },
    { label: 'Fan Base', value: '4.2K', icon: '👥' },
  ];

  const stats = userType === 'dj' ? djStats : promoterStats;

  const featuredArtists = [
    { 
      name: 'SynthWave Pro', 
      genre: 'Electronic', 
      followers: '12.4K', 
      tracks: 24,
      platforms: ['spotify', 'youtube', 'tiktok'],
      rate: '$500-800',
      availability: 'Available',
      image: '/images/artists/artist1.jpg',
      spotifyUrl: 'https://spotify.com/artist/synthwave-pro',
      youtubeUrl: 'https://youtube.com/c/synthwave-pro',
      tiktokUrl: 'https://tiktok.com/@synthwave-pro'
    },
    // ... other artists
  ];

  const trendingSongs = [
    {
      id: 1,
      title: 'Neon Dreams',
      artist: 'SynthWave Pro',
      duration: '3:45',
      downloads: '2.4K',
      bpm: 128,
      key: 'C Minor',
      platform: 'spotify',
      downloadUrl: '/music/neon-dreams.mp3',
      spotifyUrl: 'https://spotify.com/track/neon-dreams',
      youtubeUrl: 'https://youtube.com/watch?v=neon-dreams',
      tiktokUrl: 'https://tiktok.com/music/neon-dreams'
    },
    // ... other songs
  ];

  const activeEvents = [
    {
      id: 1,
      title: 'Summer Festival 2024',
      date: '2024-07-15',
      venue: 'Central Park',
      attendees: '5,000',
      status: 'Upcoming',
      revenue: '$24,500',
      artists: ['SynthWave Pro', 'Bass Master']
    },
    // ... other events
  ];

  const activeChallenges = [
    {
      id: 1,
      title: 'Best Remix Challenge',
      artist: 'SynthWave Pro',
      prize: '$500 + Feature',
      participants: '342',
      deadline: '3 days left',
      tracks: 15,
      type: 'production'
    },
    // ... other challenges
  ];

  const userLibrary = [
    {
      id: 1,
      title: 'My Workout Mix',
      type: 'playlist',
      items: 24,
      lastPlayed: '2 hours ago',
      duration: '1h 24m'
    },
    // ... other library items
  ];

  const djMixes = [
    {
      id: 1,
      title: 'Summer Vibes Mix 2024',
      duration: '1:15:22',
      plays: '24.5K',
      likes: '2.4K',
      date: '2024-05-15',
      bpm: 125,
      genre: 'House'
    },
    // ... other mixes
  ];

  // Event handlers (same as before)
  const handleDownload = (song) => {
    console.log(`Downloading: ${song.title}`);
    alert(`Downloading ${song.title} by ${song.artist}`);
    if (showAvatar && avatarRef.current) {
      signContent.songInfo(song);
    }
  };

  const handleStream = (song, platform) => {
    console.log(`Streaming ${song.title} on ${platform}`);
    let url;
    switch (platform) {
      case 'spotify': url = song.spotifyUrl; break;
      case 'youtube': url = song.youtubeUrl; break;
      case 'tiktok': url = song.tiktokUrl; break;
      default: url = '#';
    }
    window.open(url, '_blank');
    if (showAvatar && avatarRef.current) {
      avatarRef.current.speak(`Opening ${song.title} on ${platform}`);
    }
  };

  const handleArtistStream = (artist, platform) => {
    console.log(`Opening ${artist.name} on ${platform}`);
    let url;
    switch (platform) {
      case 'spotify': url = artist.spotifyUrl; break;
      case 'youtube': url = artist.youtubeUrl; break;
      case 'tiktok': url = artist.tiktokUrl; break;
      default: url = '#';
    }
    window.open(url, '_blank');
    if (showAvatar && avatarRef.current) {
      avatarRef.current.speak(`Opening ${artist.name} on ${platform}`);
    }
  };

  const shareOnPlatform = (content, platform) => {
    const shareUrls = {
      youtube: `https://www.youtube.com/share?url=${encodeURIComponent(content.url)}&title=${encodeURIComponent(content.title)}`,
      tiktok: `https://www.tiktok.com/share?url=${encodeURIComponent(content.url)}`,
      spotify: `https://open.spotify.com/share?url=${encodeURIComponent(content.url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(content.title)}&url=${encodeURIComponent(content.url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(content.url)}`
    };

    const url = shareUrls[platform];
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
    if (showAvatar && avatarRef.current) {
      avatarRef.current.speak(`Sharing ${content.title} on ${platform}`);
    }
  };

  const joinChallenge = (challenge) => {
    console.log(`Joining challenge: ${challenge.title}`);
    alert(`You've joined the ${challenge.title}! Good luck!`);
    if (showAvatar && avatarRef.current) {
      signContent.challengeInfo(challenge);
    }
  };

  const createEvent = () => {
    alert('Opening event creation form...');
    if (showAvatar && avatarRef.current) {
      avatarRef.current.speak('Opening event creation form');
    }
  };

  const createMix = () => {
    alert('Opening mix creation studio...');
    if (showAvatar && avatarRef.current) {
      avatarRef.current.speak('Opening mix creation studio');
    }
  };

  // Avatar control functions
  const toggleAvatar = () => {
    setShowAvatar(!showAvatar);
    if (!showAvatar) {
      setTimeout(() => {
        if (avatarRef.current) {
          signContent.welcome();
        }
      }, 1000);
    }
  };

  const stopAvatar = () => {
    if (avatarRef.current) {
      avatarRef.current.stop();
    }
  };

  const changeAvatarSize = (size) => {
    setAvatarSize(size);
  };

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  // Render different content based on active tab
  const renderTabContent = () => {
    useEffect(() => {
      if (showAvatar && avatarRef.current) {
        const sectionTitles = {
          discover: 'Discover amazing music and trending songs',
          artists: 'Featured artists and musicians',
          challenges: 'Music challenges and competitions',
          events: userType === 'dj' ? 'My gigs and events' : 'Event management',
          library: userType === 'dj' ? 'My mixes and sets' : 'Music library'
        };
        signContent.sectionTitle(sectionTitles[activeTab]);
      }
    }, [activeTab, showAvatar]);

    switch (activeTab) {
      case 'discover':
        return (
          <div className="xl:col-span-2 space-y-6 lg:space-y-8">
            {/* Trending Songs - Mobile Optimized */}
            <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl p-4 lg:p-6 border border-purple-900/50">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-white">
                  {userType === 'dj' ? 'Trending Tracks for Sets' : 'Trending Songs'}
                </h2>
                <div className="flex gap-2 self-end sm:self-auto">
                  <button className="px-3 py-1 bg-gray-800/50 rounded-lg text-gray-300 hover:bg-gray-700/50 transition-colors text-sm border border-gray-700/50">
                    Filter
                  </button>
                  <button className="px-3 py-1 bg-gray-800/50 rounded-lg text-gray-300 hover:bg-gray-700/50 transition-colors text-sm border border-gray-700/50">
                    Sort
                  </button>
                </div>
              </div>
              <div className="space-y-3 lg:space-y-4">
                {trendingSongs.map((song) => (
                  <div 
                    key={song.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-teal-600/50 transition-all duration-200 group gap-4 sm:gap-0"
                    onMouseEnter={() => showAvatar && avatarRef.current && signContent.songInfo(song)}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-teal-700 to-purple-900 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                        <span className="text-white text-sm lg:text-lg">🎵</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate text-sm lg:text-base">{song.title}</p>
                        <p className="text-gray-400 text-xs lg:text-sm truncate">{song.artist}</p>
                        <div className="flex items-center gap-2 lg:gap-4 mt-1 flex-wrap">
                          <span className="text-gray-500 text-xs">{song.duration}</span>
                          {userType === 'dj' && (
                            <>
                              <span className="text-purple-400 text-xs">♫ {song.bpm} BPM</span>
                              <span className="text-teal-400 text-xs">🎹 {song.key}</span>
                            </>
                          )}
                          <span className="text-teal-400 text-xs">📥 {song.downloads}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 lg:gap-3 self-end sm:self-auto">
                      {/* Share Dropdown - Hidden on mobile */}
                      {!isMobile && (
                        <div className="relative group">
                          <button className="p-2 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors">
                            📤
                          </button>
                          <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 rounded-xl shadow-lg border border-gray-700/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                            <div className="p-2">
                              <p className="text-white text-sm font-medium px-3 py-2 border-b border-gray-700/50">Share on:</p>
                              <div className="grid grid-cols-2 gap-1 p-2">
                                <button 
                                  onClick={() => shareOnPlatform({ title: song.title, url: song.youtubeUrl }, 'youtube')}
                                  className="p-2 rounded-lg hover:bg-red-500/20 transition-colors text-sm text-white flex items-center gap-2"
                                >
                                  <span>YouTube</span>
                                </button>
                                <button 
                                  onClick={() => shareOnPlatform({ title: song.title, url: song.tiktokUrl }, 'tiktok')}
                                  className="p-2 rounded-lg hover:bg-black/20 transition-colors text-sm text-white flex items-center gap-2"
                                >
                                  <span>TikTok</span>
                                </button>
                                <button 
                                  onClick={() => shareOnPlatform({ title: song.title, url: song.spotifyUrl }, 'spotify')}
                                  className="p-2 rounded-lg hover:bg-green-500/20 transition-colors text-sm text-white flex items-center gap-2"
                                >
                                  <span>Spotify</span>
                                </button>
                                <button 
                                  onClick={() => shareOnPlatform({ title: `Check out ${song.title} by ${song.artist}`, url: song.spotifyUrl }, 'twitter')}
                                  className="p-2 rounded-lg hover:bg-blue-500/20 transition-colors text-sm text-white flex items-center gap-2"
                                >
                                  <span>Twitter</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => handleStream(song, song.platform)}
                        className="p-2 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors"
                        title={`Stream on ${song.platform}`}
                      >
                        {song.platform === 'spotify' && '🎵'}
                        {song.platform === 'youtube' && '📺'}
                        {song.platform === 'tiktok' && '🎶'}
                      </button>
                      
                      {userType === 'dj' ? (
                        <button className="px-3 py-2 lg:px-4 lg:py-2 bg-gradient-to-r from-purple-600 to-teal-700 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-sm">
                          <span>Add to Set</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDownload(song)}
                          className="px-3 py-2 lg:px-4 lg:py-2 bg-gradient-to-r from-teal-600 to-purple-700 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-sm"
                        >
                          <span>Download</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Challenges & Events - Mobile Stacked */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Challenges */}
              <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl p-4 lg:p-6 border border-teal-700/50">
                <h2 className="text-xl lg:text-2xl font-bold text-white mb-4 lg:mb-6">Active Challenges</h2>
                <div className="space-y-3 lg:space-y-4">
                  {activeChallenges.slice(0, 2).map((challenge) => (
                    <div 
                      key={challenge.id} 
                      className="bg-gradient-to-br from-purple-900/50 to-teal-700/50 rounded-xl p-4 lg:p-5 border border-purple-600/30 hover:border-teal-500/50 transition-all duration-200"
                      onMouseEnter={() => showAvatar && avatarRef.current && signContent.challengeInfo(challenge)}
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                        <h3 className="text-white font-semibold text-base lg:text-lg">{challenge.title}</h3>
                        <span className="px-2 py-1 bg-gradient-to-r from-teal-600 to-purple-700 text-white rounded text-xs border border-teal-500/30 self-start">
                          {challenge.deadline}
                        </span>
                      </div>
                      
                      <p className="text-gray-300 text-sm mb-3">by {challenge.artist}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Prize:</span>
                          <span className="bg-gradient-to-r from-teal-400 to-purple-400 bg-clip-text text-transparent font-medium">{challenge.prize}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Participants:</span>
                          <span className="text-white">{challenge.participants}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => joinChallenge(challenge)}
                        className="w-full py-2 bg-gradient-to-r from-teal-600 to-purple-700 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 text-sm lg:text-base"
                      >
                        Join Challenge
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl p-4 lg:p-6 border border-purple-900/50">
                <h2 className="text-xl lg:text-2xl font-bold text-white mb-4 lg:mb-6">
                  {userType === 'dj' ? 'My Gigs' : 'Upcoming Events'}
                </h2>
                <div className="space-y-3 lg:space-y-4">
                  {activeEvents.slice(0, 2).map((event) => (
                    <div 
                      key={event.id} 
                      className="bg-gradient-to-br from-teal-700/50 to-purple-900/50 rounded-xl p-4 lg:p-5 border border-teal-600/30 hover:border-purple-500/50 transition-all duration-200"
                      onMouseEnter={() => showAvatar && avatarRef.current && signContent.eventInfo(event)}
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                        <h3 className="text-white font-semibold text-base lg:text-lg">{event.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs border ${
                          event.status === 'Upcoming' ? 'bg-gradient-to-r from-teal-600 to-purple-700 text-white border-teal-500/30' :
                          event.status === 'Confirmed' ? 'bg-gradient-to-r from-green-600 to-teal-700 text-white border-green-500/30' :
                          'bg-gradient-to-r from-blue-600 to-purple-700 text-white border-blue-500/30'
                        } self-start`}>
                          {event.status}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Date:</span>
                          <span className="text-white">{event.date}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Venue:</span>
                          <span className="text-white">{event.venue}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Attendees:</span>
                          <span className="text-teal-400">{event.attendees}</span>
                        </div>
                      </div>
                      
                      <button className="w-full py-2 bg-gradient-to-r from-purple-600 to-teal-700 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 text-sm lg:text-base">
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'artists':
        return (
          <div className="xl:col-span-3 space-y-6 lg:space-y-8">
            <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl p-4 lg:p-6 border border-purple-900/50">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-white">Featured Artists</h2>
                <div className="flex gap-2 self-end sm:self-auto">
                  <button className="px-3 py-1 bg-gray-800/50 rounded-lg text-gray-300 hover:bg-gray-700/50 transition-colors text-sm border border-gray-700/50">
                    All Genres
                  </button>
                  <button className="px-3 py-1 bg-gray-800/50 rounded-lg text-gray-300 hover:bg-gray-700/50 transition-colors text-sm border border-gray-700/50">
                    Sort
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {featuredArtists.map((artist, index) => (
                  <div 
                    key={index} 
                    className="p-4 lg:p-6 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-teal-600/50 transition-all duration-200 group"
                    onMouseEnter={() => showAvatar && avatarRef.current && signContent.artistInfo(artist)}
                  >
                    <div className="flex flex-col items-center text-center mb-4">
                      <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-teal-700 to-purple-900 rounded-full flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                        <span className="text-white text-xl lg:text-2xl">👤</span>
                      </div>
                      <h3 className="text-white font-semibold text-lg lg:text-xl">{artist.name}</h3>
                      <p className="text-gray-400 text-sm">{artist.genre}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          artist.availability === 'Available' 
                            ? 'bg-gradient-to-r from-green-600 to-teal-700 text-white border border-green-500/30'
                            : 'bg-gradient-to-r from-red-600 to-purple-700 text-white border border-red-500/30'
                        }`}>
                          {artist.availability}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm mb-4 gap-2">
                      <div className="text-center flex-1">
                        <span className="text-gray-400 block text-xs">Followers</span>
                        <span className="text-white font-semibold text-sm">{artist.followers}</span>
                      </div>
                      <div className="text-center flex-1">
                        <span className="text-gray-400 block text-xs">Rate</span>
                        <span className="bg-gradient-to-r from-teal-400 to-purple-400 bg-clip-text text-transparent font-semibold text-sm">{artist.rate}</span>
                      </div>
                      <div className="text-center flex-1">
                        <span className="text-gray-400 block text-xs">Tracks</span>
                        <span className="text-white font-semibold text-sm">{artist.tracks}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-center gap-1 lg:gap-2">
                        {artist.platforms.map((platform, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleArtistStream(artist, platform)}
                            className="p-1 lg:p-2 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors transform hover:scale-110"
                            title={`Stream ${artist.name} on ${platform}`}
                          >
                            {platform === 'spotify' && '🎵'}
                            {platform === 'youtube' && '📺'}
                            {platform === 'tiktok' && '🎶'}
                          </button>
                        ))}
                        
                        {/* Share Button - Hidden on mobile */}
                        {!isMobile && (
                          <div className="relative group">
                            <button className="p-1 lg:p-2 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors">
                              📤
                            </button>
                            <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 rounded-xl shadow-lg border border-gray-700/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                              <div className="p-2">
                                <p className="text-white text-sm font-medium px-3 py-2 border-b border-gray-700/50">Share Artist:</p>
                                <div className="grid grid-cols-2 gap-1 p-2">
                                  <button 
                                    onClick={() => shareOnPlatform({ title: artist.name, url: artist.youtubeUrl }, 'youtube')}
                                    className="p-2 rounded-lg hover:bg-red-500/20 transition-colors text-sm text-white"
                                  >
                                    YouTube
                                  </button>
                                  <button 
                                    onClick={() => shareOnPlatform({ title: artist.name, url: artist.tiktokUrl }, 'tiktok')}
                                    className="p-2 rounded-lg hover:bg-black/20 transition-colors text-sm text-white"
                                  >
                                    TikTok
                                  </button>
                                  <button 
                                    onClick={() => shareOnPlatform({ title: artist.name, url: artist.spotifyUrl }, 'spotify')}
                                    className="p-2 rounded-lg hover:bg-green-500/20 transition-colors text-sm text-white"
                                  >
                                    Spotify
                                  </button>
                                  <button 
                                    onClick={() => shareOnPlatform({ title: `Check out ${artist.name}`, url: artist.spotifyUrl }, 'twitter')}
                                    className="p-2 rounded-lg hover:bg-blue-500/20 transition-colors text-sm text-white"
                                  >
                                    Twitter
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <button className="flex-1 py-2 bg-teal-600/20 text-teal-400 rounded-lg text-sm border border-teal-500/30 hover:bg-teal-500/30 transition-colors">
                          {userType === 'dj' ? 'Collaborate' : 'Follow'}
                        </button>
                        {userType === 'promoter' && (
                          <button className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-teal-700 text-white rounded-lg text-sm hover:shadow-lg transition-all duration-200">
                            Book
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      // Other tabs follow similar responsive patterns...
      case 'challenges':
        return (
          <div className="xl:col-span-3 space-y-6 lg:space-y-8">
            <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl p-4 lg:p-6 border border-teal-700/50">
              <h2 className="text-xl lg:text-2xl font-bold text-white mb-4 lg:mb-6">All Challenges</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                {activeChallenges.map((challenge) => (
                  <div 
                    key={challenge.id} 
                    className="bg-gradient-to-br from-purple-900/50 to-teal-700/50 rounded-xl p-4 lg:p-6 border border-purple-600/30 hover:border-teal-500/50 transition-all duration-200"
                    onMouseEnter={() => showAvatar && avatarRef.current && signContent.challengeInfo(challenge)}
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-4">
                      <h3 className="text-white font-semibold text-lg lg:text-xl">{challenge.title}</h3>
                      <span className="px-2 lg:px-3 py-1 bg-gradient-to-r from-teal-600 to-purple-700 text-white rounded-full text-xs lg:text-sm border border-teal-500/30 self-start">
                        {challenge.deadline}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 text-sm lg:text-lg mb-4">by {challenge.artist}</p>
                    
                    <div className="space-y-2 lg:space-y-3 mb-4 lg:mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Prize:</span>
                        <span className="bg-gradient-to-r from-teal-400 to-purple-400 bg-clip-text text-transparent font-semibold">
                          {challenge.prize}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Participants:</span>
                        <span className="text-white font-semibold">{challenge.participants}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Submissions:</span>
                        <span className="text-white font-semibold">{challenge.tracks} tracks</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 lg:space-y-3">
                      <button
                        onClick={() => joinChallenge(challenge)}
                        className="w-full py-2 lg:py-3 bg-gradient-to-r from-teal-600 to-purple-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200 text-sm lg:text-base"
                      >
                        Join Challenge
                      </button>
                      <button className="w-full py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-gray-300 rounded-lg border border-gray-600/50 hover:border-teal-500/50 transition-colors text-sm">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Challenge Statistics - Mobile Responsive */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-6">
              <div className="bg-gradient-to-br from-purple-900/50 to-gray-900/50 rounded-xl p-4 lg:p-6 border border-purple-600/30">
                <div className="text-center">
                  <div className="text-xl lg:text-2xl mb-2">📈</div>
                  <p className="text-gray-400 text-xs lg:text-sm mb-1">Active Challenges</p>
                  <p className="text-lg lg:text-xl font-bold bg-gradient-to-r from-teal-400 to-purple-400 bg-clip-text text-transparent">12</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-900/50 to-teal-700/50 rounded-xl p-4 lg:p-6 border border-teal-600/30">
                <div className="text-center">
                  <div className="text-xl lg:text-2xl mb-2">🏆</div>
                  <p className="text-gray-400 text-xs lg:text-sm mb-1">Challenges Joined</p>
                  <p className="text-lg lg:text-xl font-bold bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">6</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-teal-700/50 to-purple-900/50 rounded-xl p-4 lg:p-6 border border-purple-600/30">
                <div className="text-center">
                  <div className="text-xl lg:text-2xl mb-2">🎵</div>
                  <p className="text-gray-400 text-xs lg:text-sm mb-1">Submissions</p>
                  <p className="text-lg lg:text-xl font-bold bg-gradient-to-r from-teal-400 to-purple-400 bg-clip-text text-transparent">8</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-900/50 to-teal-700/50 rounded-xl p-4 lg:p-6 border border-teal-600/30">
                <div className="text-center">
                  <div className="text-xl lg:text-2xl mb-2">⭐</div>
                  <p className="text-gray-400 text-xs lg:text-sm mb-1">Wins</p>
                  <p className="text-lg lg:text-xl font-bold bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">2</p>
                </div>
              </div>
            </div>

            {/* Featured User Challenge - Mobile Responsive */}
            <div className="bg-gradient-to-r from-purple-900 to-teal-700 rounded-2xl p-6 lg:p-8 text-white">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-6">
                <div className="flex-1">
                  <h2 className="text-2xl lg:text-3xl font-bold mb-2">🎵 Featured Challenge</h2>
                  <p className="text-white/80 text-sm lg:text-lg">Community Choice Awards - Vote for the best tracks and win exclusive prizes</p>
                </div>
                <span className="px-3 lg:px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium border border-white/30 self-start lg:self-auto">
                  🔥 Popular
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6">
                <div className="text-center">
                  <p className="text-white/60 text-sm">Total Participants</p>
                  <p className="text-xl lg:text-2xl font-bold">2,843</p>
                </div>
                <div className="text-center">
                  <p className="text-white/60 text-sm">Days Remaining</p>
                  <p className="text-xl lg:text-2xl font-bold">7</p>
                </div>
                <div className="text-center">
                  <p className="text-white/60 text-sm">Prize Pool</p>
                  <p className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-teal-400 to-purple-400 bg-clip-text text-transparent">$2,500</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                <button className="px-6 lg:px-8 py-3 bg-white text-gray-900 rounded-lg font-bold hover:bg-gray-100 transition-all duration-200 text-sm lg:text-base">
                  Join Now
                </button>
                <button className="px-6 lg:px-8 py-3 bg-white/20 backdrop-blur-md text-white rounded-lg font-semibold border border-white/30 hover:bg-white/30 transition-all duration-200 text-sm lg:text-base">
                  View Submissions
                </button>
              </div>
            </div>

            {/* Challenge Categories - Mobile Responsive */}
            <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl p-4 lg:p-6 border border-purple-900/50">
              <h3 className="text-lg lg:text-xl font-bold text-white mb-4">Challenge Categories</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
                <button className="p-3 lg:p-4 rounded-xl bg-gradient-to-br from-purple-900/50 to-gray-900/50 border border-purple-600/30 hover:border-teal-500/50 transition-all duration-200 text-center">
                  <div className="text-xl lg:text-2xl mb-2">🎤</div>
                  <p className="text-white font-medium text-sm lg:text-base">Vocal</p>
                </button>
                
                <button className="p-3 lg:p-4 rounded-xl bg-gradient-to-br from-gray-900/50 to-teal-700/50 border border-teal-600/30 hover:border-purple-500/50 transition-all duration-200 text-center">
                  <div className="text-xl lg:text-2xl mb-2">🎹</div>
                  <p className="text-white font-medium text-sm lg:text-base">Instrumental</p>
                </button>
                
                <button className="p-3 lg:p-4 rounded-xl bg-gradient-to-br from-teal-700/50 to-purple-900/50 border border-purple-600/30 hover:border-teal-500/50 transition-all duration-200 text-center">
                  <div className="text-xl lg:text-2xl mb-2">🎧</div>
                  <p className="text-white font-medium text-sm lg:text-base">Mixing</p>
                </button>
                
                <button className="p-3 lg:p-4 rounded-xl bg-gradient-to-br from-purple-900/50 to-teal-700/50 border border-teal-600/30 hover:border-purple-500/50 transition-all duration-200 text-center">
                  <div className="text-xl lg:text-2xl mb-2">🎵</div>
                  <p className="text-white font-medium text-sm lg:text-base">Production</p>
                </button>
              </div>
            </div>
          </div>
        );

      // Events and Library tabs would follow similar patterns...
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setShowMobileMenu(false)}
        >
          <div 
            className="fixed top-0 right-0 h-full w-80 bg-gray-900/95 backdrop-blur-md border-l border-purple-900/50 transform transition-transform duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-white">Menu</h2>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              {/* Mobile Navigation */}
              <div className="space-y-4">
                {[
                  { key: 'discover', label: 'Discover', icon: '🔍' },
                  { key: 'artists', label: 'Artists', icon: '👥' },
                  { key: 'challenges', label: 'Challenges', icon: '🏆' },
                  { key: 'events', label: userType === 'dj' ? 'My Gigs' : 'Events', icon: '🎪' },
                  { key: 'library', label: userType === 'dj' ? 'My Mixes' : 'Library', icon: '📚' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => handleTabChange(tab.key, tab.label)}
                    className={`w-full text-left p-4 rounded-xl font-medium transition-colors duration-200 flex items-center gap-3 ${
                      activeTab === tab.key
                        ? 'bg-gradient-to-r from-teal-600 to-purple-700 text-white'
                        : 'bg-gray-800/50 text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Mobile User Controls */}
              <div className="mt-8 pt-8 border-t border-gray-700/50">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700 flex-1">
                    <button
                      onClick={() => setUserType('promoter')}
                      className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        userType === 'promoter'
                          ? 'bg-gradient-to-r from-teal-600 to-purple-700 text-white shadow-lg'
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      🎪
                    </button>
                    <button
                      onClick={() => setUserType('dj')}
                      className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        userType === 'dj'
                          ? 'bg-gradient-to-r from-purple-600 to-teal-700 text-white shadow-lg'
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      🎧
                    </button>
                  </div>
                  
                  <button
                    onClick={toggleAvatar}
                    className={`p-3 rounded-lg border transition-all duration-200 ${
                      showAvatar
                        ? 'bg-gradient-to-r from-teal-600 to-purple-700 text-white border-teal-500/50'
                        : 'bg-gray-800/50 text-gray-400 border-gray-700/50 hover:border-teal-500/50'
                    }`}
                  >
                    {showAvatar ? '👁️' : '🧏'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs - Responsive */}
      <div className="bg-gray-900/80 backdrop-blur-md border-b border-purple-900/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center">
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-3 text-gray-400 hover:text-white transition-colors"
            >
              ☰
            </button>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex space-x-8 mt-25">
              {[
                { key: 'discover', label: 'Discover', icon: '🔍' },
                { key: 'artists', label: 'Artists', icon: '👥' },
                { key: 'challenges', label: 'Challenges', icon: '🏆' },
                { key: 'events', label: userType === 'dj' ? 'My Gigs' : 'Events', icon: '🎪' },
                { key: 'library', label: userType === 'dj' ? 'My Mixes' : 'Library', icon: '📚' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key, tab.label)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center gap-2 ${
                    activeTab === tab.key
                      ? 'border-teal-500 text-teal-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* User Type Toggle & Avatar Controls */}
            <div className="flex items-center gap-3 lg:gap-4 mt-25">
              {/* Avatar Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleAvatar}
                  className={`p-2 lg:p-2 rounded-lg border transition-all duration-200 ${
                    showAvatar
                      ? 'bg-gradient-to-r from-teal-600 to-purple-700 text-white border-teal-500/50'
                      : 'bg-gray-800/50 text-gray-400 border-gray-700/50 hover:border-teal-500/50'
                  }`}
                  title="Toggle Sign Language Avatar"
                >
                  {showAvatar ? '👁️' : '🧏'}
                </button>
                
                {showAvatar && !isMobile && (
                  <div className="hidden lg:flex items-center gap-1">
                    <button
                      onClick={stopAvatar}
                      disabled={!avatarSpeaking}
                      className={`p-1 rounded ${
                        avatarSpeaking 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' 
                          : 'bg-gray-800/50 text-gray-500 border border-gray-700/50'
                      } transition-colors`}
                      title="Stop Signing"
                    >
                      ⏹️
                    </button>
                    
                    <select
                      value={avatarSize}
                      onChange={(e) => changeAvatarSize(e.target.value)}
                      className="bg-gray-800/50 text-gray-300 text-xs rounded border border-gray-700/50 px-2 py-1 focus:outline-none focus:border-teal-500/50"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                )}
              </div>

              {/* User Type Toggle - Hidden on mobile (moved to menu) */}
              <div className="hidden lg:flex bg-gray-800 rounded-lg p-1 border border-gray-700">
                <button
                  onClick={() => setUserType('promoter')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    userType === 'promoter'
                      ? 'bg-gradient-to-r from-teal-600 to-purple-700 text-white shadow-lg'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  🎪 Promoter
                </button>
                <button
                  onClick={() => setUserType('dj')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    userType === 'dj'
                      ? 'bg-gradient-to-r from-purple-600 to-teal-700 text-white shadow-lg'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  🎧 DJ
                </button>
              </div>
              
              {/* User Profile */}
              <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-purple-700 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                P
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
        {/* Welcome Section - Mobile Responsive */}
        <div className="bg-gradient-to-r from-purple-900 to-teal-700 rounded-2xl p-6 lg:p-8 text-white mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
            <div className="flex-1">
              <h1 className="text-2xl lg:text-4xl font-bold mb-2">
                {userType === 'dj' ? 'Welcome, DJ Master 🎧' : 'Welcome, Music Promoter 🎪'}
              </h1>
              <p className="text-white/80 text-sm lg:text-lg">
                {userType === 'dj' 
                  ? 'Manage your mixes, discover new tracks, and book your next gig'
                  : 'Discover artists, create events, and promote amazing music'
                }
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-sm">Account Type</p>
              <p className="text-lg lg:text-xl font-bold bg-gradient-to-r from-teal-400 to-purple-400 bg-clip-text text-transparent">
                {userType === 'dj' ? 'Professional DJ' : 'Event Promoter'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid - Mobile Responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-gray-900/80 backdrop-blur-md rounded-xl p-4 lg:p-6 border border-teal-700/50 hover:border-purple-500/50 transition-colors group"
              onMouseEnter={() => showAvatar && avatarRef.current && avatarRef.current.speak(`${stat.label}: ${stat.value}`)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs lg:text-sm">{stat.label}</p>
                  <p className="text-lg lg:text-2xl font-bold text-white mt-1 group-hover:scale-105 transition-transform">
                    {stat.value}
                  </p>
                </div>
                <span className="text-xl lg:text-3xl group-hover:scale-110 transition-transform">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {renderTabContent()}
          
          {/* Sidebar - Hidden on mobile when not on discover tab */}
          {activeTab === 'discover' && !isMobile && (
            <div className="space-y-6 lg:space-y-8">
              {/* Quick Actions */}
              <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl p-4 lg:p-6 border border-teal-700/50">
                <h3 className="text-lg lg:text-xl font-bold text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  {userType === 'dj' ? (
                    <>
                      <button 
                        className="p-3 rounded-xl bg-gradient-to-r from-purple-900 to-teal-700 text-white font-semibold hover:shadow-lg transition-all duration-200 border border-purple-600/30 text-center text-sm"
                        onMouseEnter={() => showAvatar && avatarRef.current && avatarRef.current.speak("Create new mix")}
                      >
                        🎚️ Create Mix
                      </button>
                      <button 
                        className="p-3 rounded-xl bg-gradient-to-r from-teal-700 to-purple-900 text-white font-semibold hover:shadow-lg transition-all duration-200 border border-teal-600/30 text-center text-sm"
                        onMouseEnter={() => showAvatar && avatarRef.current && avatarRef.current.speak("Find gigs and events")}
                      >
                        🎪 Find Gigs
                      </button>
                      <button 
                        className="p-3 rounded-xl bg-gradient-to-r from-purple-900 via-teal-700 to-purple-900 text-white font-semibold hover:shadow-lg transition-all duration-200 border border-purple-600/30 text-center text-sm"
                        onMouseEnter={() => showAvatar && avatarRef.current && avatarRef.current.speak("Collaborate with artists")}
                      >
                        👥 Collaborate
                      </button>
                      <button 
                        className="p-3 rounded-xl bg-gradient-to-r from-teal-700 via-purple-900 to-teal-700 text-white font-semibold hover:shadow-lg transition-all duration-200 border border-teal-600/30 text-center text-sm"
                        onMouseEnter={() => showAvatar && avatarRef.current && avatarRef.current.speak("View analytics and insights")}
                      >
                        📊 Analytics
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        className="p-3 rounded-xl bg-gradient-to-r from-purple-900 to-teal-700 text-white font-semibold hover:shadow-lg transition-all duration-200 border border-purple-600/30 text-center text-sm"
                        onMouseEnter={() => showAvatar && avatarRef.current && avatarRef.current.speak("Create new event")}
                      >
                        🎪 Create Event
                      </button>
                      <button 
                        className="p-3 rounded-xl bg-gradient-to-r from-teal-700 to-purple-900 text-white font-semibold hover:shadow-lg transition-all duration-200 border border-teal-600/30 text-center text-sm"
                        onMouseEnter={() => showAvatar && avatarRef.current && avatarRef.current.speak("Book artists for events")}
                      >
                        👥 Book Artist
                      </button>
                      <button 
                        className="p-3 rounded-xl bg-gradient-to-r from-purple-900 via-teal-700 to-purple-900 text-white font-semibold hover:shadow-lg transition-all duration-200 border border-purple-600/30 text-center text-sm"
                        onMouseEnter={() => showAvatar && avatarRef.current && avatarRef.current.speak("Promote events and music")}
                      >
                        📢 Promote
                      </button>
                      <button 
                        className="p-3 rounded-xl bg-gradient-to-r from-teal-700 via-purple-900 to-teal-700 text-white font-semibold hover:shadow-lg transition-all duration-200 border border-teal-600/30 text-center text-sm"
                        onMouseEnter={() => showAvatar && avatarRef.current && avatarRef.current.speak("View reports and analytics")}
                      >
                        📊 Reports
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Featured Artists */}
              <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl p-4 lg:p-6 border border-purple-900/50">
                <h3 className="text-lg lg:text-xl font-bold text-white mb-4">Featured Artists</h3>
                <div className="space-y-4">
                  {featuredArtists.slice(0, 3).map((artist, index) => (
                    <div 
                      key={index} 
                      className="p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-teal-600/50 transition-all duration-200 group"
                      onMouseEnter={() => showAvatar && avatarRef.current && signContent.artistInfo(artist)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-700 to-purple-900 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                          <span className="text-white">👤</span>
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">{artist.name}</h4>
                          <p className="text-gray-400 text-sm">{artist.genre}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {artist.platforms.map((platform, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleArtistStream(artist, platform)}
                            className="flex-1 p-2 bg-gray-700/50 rounded-lg text-xs hover:bg-gray-600/50 transition-colors text-center"
                            title={`Stream on ${platform}`}
                          >
                            {platform === 'spotify' && '🎵 Spotify'}
                            {platform === 'youtube' && '📺 YouTube'}
                            {platform === 'tiktok' && '🎶 TikTok'}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform Stats */}
              <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl p-4 lg:p-6 border border-purple-900/50">
                <h3 className="text-lg lg:text-xl font-bold text-white mb-4">Platform Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <span className="text-white text-sm">YouTube</span>
                    <span className="text-red-400 font-semibold">1.2M views</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <span className="text-white text-sm">Spotify</span>
                    <span className="text-green-400 font-semibold">845K plays</span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <span className="text-white text-sm">TikTok</span>
                    <span className="text-blue-400 font-semibold">2.1M uses</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* WebSign Avatar Container - Mobile Responsive */}
      {showAvatar && (
        <div className={`fixed z-50 ${
          isMobile ? 'bottom-4 right-4' : 'bottom-6 right-6'
        }`}>
          <div 
            ref={avatarContainerRef}
            className={`
              bg-gray-800/90 backdrop-blur-md rounded-2xl border-2 border-teal-500/50 shadow-2xl
              ${avatarSize === 'small' ? (isMobile ? 'w-32 h-48' : 'w-48 h-64') : 
                avatarSize === 'medium' ? (isMobile ? 'w-40 h-56' : 'w-64 h-80') : 
                (isMobile ? 'w-48 h-64' : 'w-80 h-96')}
              transition-all duration-300 overflow-hidden
            `}
          >
            {/* Avatar visualization placeholder */}
            <div className="w-full h-full flex flex-col items-center justify-center p-3 lg:p-4">
              <div className={`${
                isMobile ? 'w-16 h-16' : 'w-24 h-24'
              } bg-gradient-to-br from-teal-500 to-purple-600 rounded-full flex items-center justify-center mb-3 lg:mb-4`}>
                <span className={`text-white ${
                  isMobile ? 'text-xl' : 'text-2xl'
                }`}>🧏</span>
              </div>
              <div className="text-center">
                <p className={`text-white font-semibold ${
                  isMobile ? 'text-xs mb-1' : 'text-sm mb-2'
                }`}>Sign Language Avatar</p>
                {avatarSpeaking ? (
                  <div className="flex items-center justify-center space-x-1">
                    <div className={`${
                      isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'
                    } bg-teal-400 rounded-full animate-pulse`}></div>
                    <div className={`${
                      isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'
                    } bg-teal-400 rounded-full animate-pulse`} style={{animationDelay: '0.2s'}}></div>
                    <div className={`${
                      isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'
                    } bg-teal-400 rounded-full animate-pulse`} style={{animationDelay: '0.4s'}}></div>
                    <span className={`text-teal-400 ${
                      isMobile ? 'text-xs ml-1' : 'text-xs ml-2'
                    }`}>Signing...</span>
                  </div>
                ) : (
                  <p className={`text-gray-400 ${
                    isMobile ? 'text-xs' : 'text-xs'
                  }`}>Ready to sign</p>
                )}
                {currentSignContent && (
                  <p className={`text-gray-300 ${
                    isMobile ? 'text-xs mt-1' : 'text-xs mt-2'
                  } max-w-full break-words`}>
                    "{currentSignContent}"
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Avatar status indicator */}
          <div className={`absolute ${
            isMobile ? '-top-1 -right-1' : '-top-2 -right-2'
          }`}>
            <div className={`${
              isMobile ? 'w-3 h-3' : 'w-4 h-4'
            } rounded-full border-2 border-white ${
              avatarSpeaking ? 'bg-teal-400 animate-pulse' : 'bg-gray-400'
            }`}></div>
          </div>
        </div>
      )}
    </div>
  );
}