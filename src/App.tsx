import { useState } from 'react'; // Keep useState import
import PlaylistPage from './components/PlaylistPage';
import AdminPage from './components/AdminPage';
import { Button } from "@/components/ui/button";
import { cn } from './lib/utils';
import './index.css'; // Ensure Tailwind CSS is imported

function App() {
  // State to manage the current page view ('playlist' or 'admin')
  const [currentPage, setCurrentPage] = useState<'playlist' | 'admin'>('playlist');

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      {/* Navigation */}
      <header className="bg-card text-card-foreground shadow-sm py-4">
        <div className="container mx-auto flex justify-between items-center px-4">
          <h1 className="text-2xl font-bold">YouTube Playlist App</h1>
          <nav className="flex gap-4">
            <Button
              variant="ghost"
              onClick={() => setCurrentPage('playlist')}
              className={cn(currentPage === 'playlist' && 'bg-accent text-accent-foreground')}
            >
              Playlist
            </Button>
            <Button
              variant="ghost"
              onClick={() => setCurrentPage('admin')}
              className={cn(currentPage === 'admin' && 'bg-accent text-accent-foreground')}
            >
              Admin
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="py-6">
        {currentPage === 'playlist' ? <PlaylistPage /> : <AdminPage />}
      </main>

      {/* Footer (Optional) */}
      <footer className="bg-card text-card-foreground text-center py-4 mt-8">
        <div className="container mx-auto px-4">
          <p className="text-sm text-muted-foreground">&copy; 2024 YouTube Playlist App</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
