import { Plans } from "@/types/user";

export const plans: Plans = {
  website: {
    starter: [
      {
        name: "Starter Package",
        description: ["Up to 5 pages", "Domain", "Hosting", "Maintenance"],
        price: 36000,
        monthly: 3000,
      },
    ],
    professional: [
      {
        name: "Professional Package",
        description: [
          "Everything in Starter, plus:",
          "SEO",
          "Blog",
          "Analytics",
          "Basic e-commerce",
        ],
        price: 60000,
        monthly: 5000,
      },
    ],
    premium: [
      {
        name: "Premium Package",
        description: [
          "Everything in Professional, plus:",
          "Full e-commerce",
          "Multilingual",
          "Advanced SEO",
          "Priority support",
        ],
        price: 120000,
        monthly: 10000,
      },
    ],
  },

  mobile: {
    starter: [
      {
        name: "Starter App",
        description: [
          "Mobile App Development (basic)",
          "UI/UX Design",
          "User Registration & Login",
          "Push Notifications",
          "App Maintenance & Updates",
        ],
        price: 228000,
        monthly: 19000,
      },
    ],
    business: [
      {
        name: "Business App",
        description: [
          "Everything in Starter, plus:",
          "In-App Messaging & Chat",
          "Payment Integration (GCash, cards)",
          "Social Media Integration",
          "App Store Optimization (ASO)",
          "Analytics & Reports",
        ],
        price: 360000,
        monthly: 30000,
      },
    ],
    premium: [
      {
        name: "Premium App",
        description: [
          "Everything in Business, plus:",
          "E-commerce Functions (cart, orders)",
          "GPS & Maps Integration",
          "Camera & Media Access",
          "Loyalty Programs & Rewards",
          "Email & SMS Integration",
        ],
        price: 552000,
        monthly: 46000,
      },
    ],
    enterprise: [
      {
        name: "Enterprise App",
        description: [
          "Everything in Premium, plus:",
          "Cross-Platform (Android + iOS)",
          "Website-to-App Conversion",
          "Admin Dashboard (manage users, content)",
          "Augmented Reality (AR)",
          "Internet of Things (IoT)",
          "Offline Mode",
        ],
        price: 924000,
        monthly: 77000,
      },
    ],
  },

  juantap: {
    basic: [
      {
        name: "Basic Card",
        description: [
          "Name & Job Title",
          "Company Name & Logo",
          "Profile Photo / Banner",
          "Contact Number (Click-to-Call)",
          "Email (Click-to-Email)",
          "Website Link",
          "QR Code",
        ],
        price: 888, // Metal price
      },
      {
        name: "Basic Card PVC",
        description: [
          "Name & Job Title",
          "Company Name & Logo",
          "Profile Photo / Banner",
          "Contact Number (Click-to-Call)",
          "Email (Click-to-Email)",
          "Website Link",
          "QR Code",
        ],
        price: 588, // PVC price
      },
    ],
    social: [
      {
        name: "Social Pro Metal",
        description: [
          "Everything in Basic, plus:",
          "Facebook, Instagram, LinkedIn, TikTok, YouTube",
          "Google Maps Location",
          "Save Contact Button",
          "Custom Card Design (logo, colors, theme)",
        ],
        price: 1188,
      },
      {
        name: "Social Pro PVC",
        description: [
          "Everything in Basic, plus:",
          "Facebook, Instagram, LinkedIn, TikTok, YouTube",
          "Google Maps Location",
          "Save Contact Button",
          "Custom Card Design (logo, colors, theme)",
        ],
        price: 888,
      },
    ],
    business: [
      {
        name: "Business Pro Metal",
        description: [
          "Everything in Social Pro, plus:",
          "File Sharing (PDF, Brochure, Price List)",
          "Calendar Booking Link",
          "Multiple Profiles (Business / Personal)",
          "Online Dashboard (update anytime)",
        ],
        price: 1488,
      },
      {
        name: "Business Pro PVC",
        description: [
          "Everything in Social Pro, plus:",
          "File Sharing (PDF, Brochure, Price List)",
          "Calendar Booking Link",
          "Multiple Profiles (Business / Personal)",
          "Online Dashboard (update anytime)",
        ],
        price: 1188,
      },
    ],
    enterprise: [
      {
        name: "Enterprise Teams Metal",
        description: [
          "Everything in Business Pro, plus:",
          "Company Branding for Teams (bulk setup for staff)",
          "Analytics & Tracking (taps, views)",
          "Unlimited Updates (reusable card)",
        ],
        price: 7104,
      },
      {
        name: "Enterprise Teams PVC",
        description: [
          "Everything in Business Pro, plus:",
          "Company Branding for Teams (bulk setup for staff)",
          "Analytics & Tracking (taps, views)",
          "Unlimited Updates (reusable card)",
        ],
        price: 4704,
      },
    ],
  },

  photography: {
    packages: [
      {
        name: "Basic Shoot",
        description: [
          "Product Photography (up to 10 items) OR Corporate Headshots (up to 5 pax)",
          "Simple Outdoor/Studio Setup",
          "Light Editing & Retouch",
        ],
        price: 3500,
      },
      {
        name: "Pro Shoot",
        description: [
          "Event Coverage (3 hrs) OR Lifestyle Photography",
          "Corporate / Team Photos (up to 15 pax)",
          "Drone Shots (add-on if outdoor)",
          "Basic Props & Styling",
          "Edited Photos (20–30)",
        ],
        price: 7500,
      },
      {
        name: "Social Media Package",
        description: [
          "1 Short Promo Video (30–60s) optimized for TikTok/FB/IG",
          "10 Edited Product / Lifestyle Photos",
          "Scriptwriting / Concept Assist",
          "Background Music + Light Effects",
        ],
        price: 9999,
      },
      {
        name: "Corporate Package",
        description: [
          "Corporate Profile Video (2–3 mins)",
          "On-Site Interviews (staff/clients)",
          "Voice-over Recording",
          "Scriptwriting & Storyboarding",
          "Event Coverage (up to 4 hrs)",
          "Edited Highlight Reel + 50 Edited Photos",
        ],
        price: 19999,
      },
      {
        name: "Full Event Coverage",
        description: [
          "Full Event Photography (5 hrs)",
          "Event Videography (5 hrs)",
          "Drone / Aerial Coverage",
          "Highlight Video (3–5 mins) + 100 Edited Photos",
          "Raw Files Provided",
        ],
        price: 29999,
      },
    ],
  },
  multimedia: {
    packages: [
      {
        name: "Basic Edit",
        description: [
          "Video Editing (simple cuts, sequencing, transitions) OR Photo Editing (basic retouch & color fix, up to 10 photos)",
          "Background Music (royalty-free)",
          "Export in 1 format (MP4 or JPG)",
        ],
        price: 3000,
      },
      {
        name: "Social Media Ready",
        description: [
          "1 Edited Promotional Video (up to 60s) with transitions, subtitles & music",
          "15 Edited Photos (high-res + optimized for web/IG/FB)",
          "Basic Motion Graphics (titles/lower thirds)",
          "Export in multiple formats (social media-ready)",
        ],
        price: 7500,
      },
      {
        name: "Business Package",
        description: [
          "1 Full-Length Video (1–3 mins) with color grading & sound design",
          "Subtitles & Captions",
          "Motion Graphics (logo reveal, animated text)",
          "30 Edited Photos (with creative edits)",
          "Web + Print Optimized Versions",
        ],
        price: 14999,
      },
      {
        name: "Corporate Package",
        description: [
          "Full-Length Promotional Video (up to 5 mins)",
          "Social Media Cutdowns (15s, 30s, 60s)",
          "Voice-over Sync (if provided)",
          "Advanced Photo Retouching (50 photos)",
          "Branding Overlays / Custom Graphics",
          "Raw Files (upon request)",
        ],
        price: 24999,
      },
    ],
  },
  social: {
    packages: [
      {
        name: "Starter",
        description: [
          "Account Setup (FB + IG)",
          "Profile & Cover Branding",
          "8 Posts / Month (Graphics or Photos)",
          "2 Short Videos / Reels per Month",
          "Basic Captions & Hashtags",
          "Monthly Report (Insights + Recommendations)",
        ],
        price: 144000, // Total for 1 year
        monthly: 12000,
      },
      {
        name: "Growth",
        description: [
          "Everything in Starter",
          "12–15 Posts / Month (mix of Graphics, Photos, Videos)",
          "4 Short Videos / Reels",
          "Content Calendar (1 month in advance)",
          "Community Engagement (reply to comments & messages)",
          "Cross-Posting to FB, IG, TikTok",
          "Boosting Setup (ad budget separate)",
          "Monthly Growth Report",
        ],
        price: 240000, // Total for 1 year
        monthly: 20000,
      },
      {
        name: "Premium",
        description: [
          "Everything in Growth",
          "20–25 Posts / Month",
          "8 Short Videos / Reels",
          "Ad Management (setup, targeting, monitoring – budget separate)",
          "Influencer / Collaboration Coordination",
          "Weekly Engagement Report",
          "Crisis Management (negative comments, PR handling)",
          "Email Marketing Integration (1 newsletter / month)",
        ],
        price: 420000, // Total for 1 year
        monthly: 35000,
      },
      {
        name: "Corporate",
        description: [
          "Full Account Management (FB, IG, TikTok, LinkedIn)",
          "30+ Posts / Month (customized mix)",
          "12 Short Videos / Reels",
          "Full Ad Management (budget separate, with monthly ad reports)",
          "Community Growth (active engagement, follower growth strategies)",
          "Blog Writing + Website Content Integration",
          "Crisis Management (24/7 handling)",
          "Weekly Strategy Meetings",
          "Dedicated Account Manager",
        ],
        price: 600000, // Total for 1 year
        monthly: 50000,
      },
    ],
  },
};
