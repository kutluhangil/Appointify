import { Link } from "react-router-dom";
import { CalendarClock } from "lucide-react";

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-4">
    <CalendarClock className="h-10 w-10 text-muted-foreground" />
    <div className="text-center">
      <h1 className="text-[64px] font-bold leading-none text-foreground">404</h1>
      <p className="text-[16px] text-muted-foreground mt-2 mb-6">Bu sayfa bulunamadı</p>
      <Link to="/" className="text-[13px] text-foreground underline hover:text-foreground/80">
        Ana sayfaya dön
      </Link>
    </div>
  </div>
);

export default NotFound;
