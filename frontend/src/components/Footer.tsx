import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="glass-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="ICST" className="h-12 w-12 neon-glow" />
              <div>
                <h3 className="text-lg font-bold text-primary">ICST Issue Portal</h3>
                <p className="text-xs text-muted-foreground">Community Voice</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              ঝামেলা গোপন নয়—এখন সবই ওপেন! রিপোর্ট করো, সবাই জানুক, সবাই মিলেই সমাধান টানুক।
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/issues" className="text-muted-foreground hover:text-primary transition-colors">Browse Issues</Link></li>
              <li><Link to="/submit" className="text-muted-foreground hover:text-primary transition-colors">Submit Issue</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin size={16} className="text-primary mt-1 flex-shrink-0" />
                <span>ICST-3900-Sadar Upazila,Feni</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone size={16} className="text-primary flex-shrink-0" />
                <span>+880 1673-442353</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail size={16} className="text-primary flex-shrink-0" />
                <span>icst69016@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-lg font-semibold text-foreground mb-4">Follow Us</h4>
            <div className="flex gap-3">
              <a 
                href="https://www.facebook.com/icst69016/" 
                className="p-3 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-all neon-border"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="#" 
                className="p-3 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-all neon-border"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="#" 
                className="p-3 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-all neon-border"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} ICST Issue Portal. All rights reserved. | Developed By 
            <a 
              href="https://web.facebook.com/md.rifat.389562" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary hover:underline ml-1"
            >
              Jobayer Hossain
            </a>
          </p>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
