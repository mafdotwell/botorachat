
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

const Header = ({ className }: HeaderProps) => {
  return (
    <header className={cn(
      "border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20 flex-shrink-0",
      className
    )}>
      <div className="flex items-center justify-center px-4 py-3">
        <Link to="/" className="flex items-center space-x-3">
          <img 
            src="/lovable-uploads/968a6fad-b2c2-479b-ab85-0fa7f903d03b.png" 
            alt="Botora Logo" 
            className="w-8 h-8 rounded-lg"
          />
          <span className="text-xl font-bold text-foreground">Botora</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
