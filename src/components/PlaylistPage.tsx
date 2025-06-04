import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { getYouTubeVideoId } from '../utils/youtube';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ListMusic, Video as VideoIcon } from 'lucide-react'; // Renamed imported Video to VideoIcon

interface PlaylistVideo { // Renamed interface from Video to PlaylistVideo
  id: string;
  title: string;
  url: string;
}

function PlaylistPage() {
  const [videos, setVideos] = useState<PlaylistVideo[]>([]); // Use PlaylistVideo interface
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Function to fetch videos
    const fetchVideos = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('youtube_videos')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching videos:', error);
        setError('Failed to load playlist.');
        setLoading(false);
        return;
      }

      setVideos(data || []);
      setLoading(false);
    };

    // Initial fetch
    fetchVideos();

    // Set up real-time subscription
    const subscription = supabase
      .channel('public:youtube_videos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'youtube_videos' }, payload => {
        console.log('Change received!', payload);
        // Re-fetch videos on any change to keep the list updated
        fetchVideos();
      })
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  const handleVideoSelect = (url: string) => {
    const videoId = getYouTubeVideoId(url);
    setSelectedVideoId(videoId);
  };

  return (
    <div className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Video Player Section */}
      <div className="md:col-span-2">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><VideoIcon className="size-5" /> Video Player</CardTitle> {/* Use VideoIcon */}
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center p-0">
            {loading ? (
              <p className="text-muted-foreground">Loading playlist...</p>
            ) : error ? (
               <Alert variant="destructive" className="m-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : selectedVideoId ? (
              <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 Aspect Ratio */ }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  src={`https://www.youtube.com/embed/${selectedVideoId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            ) : videos.length > 0 ? (
              <p className="text-muted-foreground">Select a video from the playlist.</p>
            ) : (
              <p className="text-muted-foreground">No videos in the playlist yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Playlist Section */}
      <div className="md:col-span-1">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ListMusic className="size-5" /> Playlist</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-y-auto">
            {loading ? (
              <p className="text-muted-foreground">Loading playlist...</p>
            ) : error ? (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : videos.length > 0 ? (
              <ul className="space-y-2">
                {videos.map((video) => (
                  <li key={video.id}>
                    <Button
                      variant="ghost"
                      className="w-full text-left justify-start truncate text-lg font-bold"
                      onClick={() => handleVideoSelect(video.url)}
                    >
                      {video.title}
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No videos in the playlist yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default PlaylistPage;
