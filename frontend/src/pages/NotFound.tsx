import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">আরে না! পেজ খুঁজে পাওয়া যায়নি</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          হোমে ফিরে যান
        </a>
      </div>
    </div>
  );
};

export default NotFound;
