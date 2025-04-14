
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SidebarContent } from './Sidebar';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 sm:max-w-sm">
            <div className="py-4">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="ml-auto flex items-center space-x-4">
          <div className="hidden md:block">
            <div className="flex items-center gap-2">
              <div className="font-medium">
                {user?.name || 'User'} ({user?.role || 'unknown'})
              </div>
              {user?.role === 'engineer' && (
                <span className="text-xs text-muted-foreground">
                  Region: {user?.regionId ? `#${user.regionId}` : 'Not Assigned'}
                </span>
              )}
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
