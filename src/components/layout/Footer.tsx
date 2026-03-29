import { Link } from "react-router-dom";
import { Activity, Heart } from "lucide-react";
import { getSupportEmail } from "@/lib/site";

const Footer = () => {
  const supportEmail = getSupportEmail();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-8 md:py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Activity className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">
                Medi<span className="text-primary">Brief</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-md">
              Empowering individuals with AI-driven health insights. Use MediBrief to analyze symptoms,
              understand reports, access first-aid guidance, and manage your health journey.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Features</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/symptoms" className="hover:text-primary transition-colors">
                  Symptom Analysis
                </Link>
              </li>
              <li>
                <Link to="/upload" className="hover:text-primary transition-colors">
                  Report Upload
                </Link>
              </li>
              <li>
                <Link to="/chatbot" className="hover:text-primary transition-colors">
                  AI Chatbot
                </Link>
              </li>
              <li>
                <Link to="/learn" className="hover:text-primary transition-colors">
                  Disease Library
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/medical-disclaimer" className="hover:text-primary transition-colors">
                  Medical Disclaimer
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              {supportEmail ? (
                <li className="text-xs">{supportEmail}</li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Copyright {new Date().getFullYear()} MediBrief. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Made with <Heart className="h-4 w-4 text-destructive fill-destructive" /> for better health
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
