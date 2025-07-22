
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onSidebarToggle: () => void;
  className?: string;
}

const Header = ({ onSidebarToggle, className }: HeaderProps) => {
  return (
    <header className={cn(
      "border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20 flex-shrink-0",
      className
    )}>
      <div className="flex items-center justify-between px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onSidebarToggle}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <Link to="/" className="flex items-center space-x-3">
          <img 
            src="/lovable-uploads/968a6fad-b2c2-479b-ab85-0fa7f903d03b.png" 
            alt="Botora Logo" 
            className="w-8 h-8 rounded-lg"
          />
          <span className="text-xl font-bold text-foreground">Botora</span>
        </Link>

        <div className="w-10" /> {/* Spacer for centering */}
      </div>
    </header>
  );
};

export default Header;
