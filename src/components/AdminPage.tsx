import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Lock, PlusCircle, Trash2, ListMusic } from 'lucide-react'; // Added ListMusic here

interface Video {
  id: string;
  title: string;
  url: string;
}

function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [addingVideo, setAddingVideo] = useState(false);
  const [addVideoError, setAddVideoError] = useState<string | null>(null);
  const [addVideoSuccess, setAddVideoSuccess] = useState<string | null>(null);

  const [removingVideoId, setRemovingVideoId] = useState<string | null>(null);
  const [removeVideoError, setRemoveVideoError] = useState<string | null>(null);

  // Password check (client-side as requested)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'mochie') {
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError('Incorrect password. Try again.');
    }
  };

  // Fetch videos for the admin list
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchVideos = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('youtube_videos')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching videos for admin:', error);
        setError('Failed to load videos for management.');
        setLoading(false);
        return;
      }

      setVideos(data || []);
      setLoading(false);
    };

    // Initial fetch
    fetchVideos();

    // Set up real-time subscription for admin list
    const subscription = supabase
      .channel('public:youtube_videos_admin') // Use a different channel name if needed, or the same
      .on('postgres_changes', { event: '*', schema: 'public', table: 'youtube_videos' }, payload => {
        console.log('Admin change received!', payload);
        // Re-fetch videos on any change
        fetchVideos();
      })
      .subscribe();

    // Cleanup subscription on component unmount or when not authenticated
    return () => {
      subscription.unsubscribe();
    };
  }, [isAuthenticated]); // Re-run effect when authentication status changes

  // Handle adding a new video
  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingVideo(true);
    setAddVideoError(null);
    setAddVideoSuccess(null);

    if (!newVideoTitle || !newVideoUrl) {
      setAddVideoError('Title and URL are required.');
      setAddingVideo(false);
      return;
    }

    const { data, error } = await supabase
      .from('youtube_videos')
      .insert([{ title: newVideoTitle, url: newVideoUrl }]);

    if (error) {
      console.error('Error adding video:', error);
      setAddVideoError('Failed to add video.');
    } else {
      setAddVideoSuccess('Video added successfully!');
      setNewVideoTitle('');
      setNewVideoUrl('');
      // Real-time subscription will update the list
    }
    setAddingVideo(false);
  };

  // Handle removing a video
  const handleRemoveVideo = async (videoId: string) => {
    setRemovingVideoId(videoId);
    setRemoveVideoError(null);

    const { error } = await supabase
      .from('youtube_videos')
      .delete()
      .eq('id', videoId);

    if (error) {
      console.error('Error removing video:', error);
      setRemoveVideoError('Failed to remove video.');
    } else {
      // Real-time subscription will update the list
    }
    setRemovingVideoId(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-[calc(100vh-8rem)]">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Lock className="size-5" /> Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="grid gap-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="text-muted-foreground text-sm mt-1">Hint: Who is my favorite pet?</p>
              </div>
              {authError && (
                <Alert variant="destructive">
                  <AlertTitle>Login Failed</AlertTitle>
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full">Login</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Add Video Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><PlusCircle className="size-5" /> Add New Video</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddVideo} className="grid gap-4">
            <div>
              <Label htmlFor="title">Video Title</Label>
              <Input
                id="title"
                placeholder="Enter video title"
                value={newVideoTitle}
                onChange={(e) => setNewVideoTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="url">YouTube URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="Enter YouTube URL"
                value={newVideoUrl}
                onChange={(e) => setNewVideoUrl(e.target.value)}
                required
              />
            </div>
            {addVideoError && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{addVideoError}</AlertDescription>
              </Alert>
            )}
             {addVideoSuccess && (
              <Alert>
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{addVideoSuccess}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={addingVideo}>
              {addingVideo && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Video
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Manage Videos Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ListMusic className="size-5" /> Manage Videos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading videos...</p>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : videos.length > 0 ? (
            <ul className="space-y-2">
              {videos.map((video) => (
                <li key={video.id} className="flex items-center justify-between gap-2">
                  <span className="truncate flex-grow">{video.title}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveVideo(video.id)}
                    disabled={removingVideoId === video.id}
                  >
                     {removingVideoId === video.id ? (
                       <Loader2 className="h-4 w-4 animate-spin" />
                     ) : (
                       <Trash2 className="size-4" />
                     )}
                    <span className="sr-only">Remove {video.title}</span>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No videos in the playlist yet.</p>
          )}
           {removeVideoError && (
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{removeVideoError}</AlertDescription>
              </Alert>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminPage;
