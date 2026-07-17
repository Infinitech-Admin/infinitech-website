"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Solutions from "@/components/user/solutions/solutions";
import Services from "@/components/user/services/services";

type Tab = "services" | "solutions";

const Page = () => {
  const [activeTab, setActiveTab] = useState<Tab>("services");
  return (
    <div className=" pt-20 md:pt-24 min-h-screen bg-gradient-to-br from-slate-900 via-blue-700 to-slate-900">
      {/* Header */}
      <section className="max-w-3xl mx-auto text-center mb-12 px-6">
        <h1 className="text-4xl md:text-5xl text-accent font-bold tracking-tight mb-4 uppercase">
          Services & Solutions
        </h1>
        <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
          From Websites and Mobile Apps to SEO, Multimedia, Social Media, and
          JuanTap—We Power Your Digital Growth.
        </p>
      </section>

      {/* Tabs */}
      <div className="flex gap-8 mb-10 justify-center">
        {["services", "solutions"].map((tab) => (
          <Button
            key={tab}
            onClick={() => setActiveTab(tab as Tab)}
            variant="ghost"
            className={`relative text-lg font-semibold tracking-wide transition-colors p-5 bg-transparent hover:bg-transparent focus:bg-transparent
              ${activeTab === tab ? "text-white" : "text-slate-400 hover:text-slate-200"}`}
          >
            <span className="flex flex-col items-center">
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && (
                <span className="mt-1 h-0.5 w-full bg-gradient-to-r from-blue-400 to-blue-900 transition-all" />
              )}
            </span>
          </Button>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {activeTab === "services" && <Services />}
        {activeTab === "solutions" && <Solutions />}
      </div>
    </div>
  );
};

export default Page;

// "use client";
// import React, { useState } from "react";
// import { Button } from "@/components/ui/button";

// type Tab = "website-solutions" | "marketing-research" | "branding";

// const tabs: { key: Tab; label: string }[] = [
//   { key: "website-solutions", label: "Website Solutions" },
//   { key: "marketing-research", label: "Marketing Research" },
//   { key: "branding", label: "Branding" },
// ];

// type ExampleSite = {
//   name: string;
//   url: string;
//   image?: string;
// };

// type Tier = {
//   name: string;
//   description: string;
//   examples: ExampleSite[];
// };

// // Placeholder tier content -- fill in your real example websites per tier
// const websiteSolutionTiers: Tier[] = [
//   {
//     name: "Standard",
//     description: "A clean, professional site to establish your presence.",
//     examples: [
//       // { name: "Example Site 1", url: "https://example.com", image: "/examples/standard-1.jpg" },
//     ],
//   },
//   {
//     name: "Premium",
//     description: "More pages and features for growing businesses.",
//     examples: [
//       // { name: "Example Site 1", url: "https://example.com", image: "/examples/premium-1.jpg" },
//     ],
//   },
//   {
//     name: "Business",
//     description: "A full-featured site with custom functionality.",
//     examples: [
//       // { name: "Example Site 1", url: "https://example.com", image: "/examples/business-1.jpg" },
//     ],
//   },
//   {
//     name: "Commerce",
//     description: "A complete online store, built to sell.",
//     examples: [
//       // { name: "Example Site 1", url: "https://example.com", image: "/examples/commerce-1.jpg" },
//     ],
//   },
// ];

// const WebsiteSolutionsTiers = () => (
//   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-6">
//     {websiteSolutionTiers.map((tier) => (
//       <div
//         key={tier.name}
//         className="flex flex-col rounded-2xl p-6 border border-white/10 bg-white/5"
//       >
//         <h3 className="text-xl font-bold text-white mb-1">{tier.name}</h3>
//         <p className="text-sm text-slate-300 mb-5">{tier.description}</p>

//         <div className="flex flex-col gap-3 flex-1">
//           {tier.examples.length === 0 ? (
//             <p className="text-sm text-slate-500 italic">
//               Example websites coming soon.
//             </p>
//           ) : (
//             tier.examples.map((site) => (
//               <a
//                 key={site.url}
//                 href={site.url}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="block rounded-lg overflow-hidden border border-white/10 hover:border-accent transition-colors"
//               >
//                 {site.image && (
//                   // eslint-disable-next-line @next/next/no-img-element
//                   <img
//                     src={site.image}
//                     alt={site.name}
//                     className="w-full h-28 object-cover"
//                   />
//                 )}
//                 <span className="block px-3 py-2 text-sm text-slate-200">
//                   {site.name}
//                 </span>
//               </a>
//             ))
//           )}
//         </div>
//       </div>
//     ))}
//   </div>
// );

// // Placeholder -- fill in your Marketing Research content/component
// const MarketingResearch = () => (
//   <div className="max-w-3xl mx-auto text-center text-slate-300 px-6">
//     <p>Marketing research content goes here.</p>
//   </div>
// );

// // Placeholder -- fill in your Branding content/component
// const Branding = () => (
//   <div className="max-w-3xl mx-auto text-center text-slate-300 px-6">
//     <p>Branding content goes here.</p>
//   </div>
// );

// const Page = () => {
//   const [activeTab, setActiveTab] = useState<Tab>("website-solutions");
//   return (
//     <div className=" pt-20 md:pt-24 min-h-screen bg-gradient-to-br from-slate-900 via-blue-700 to-slate-900">
//       {/* Header */}
//       <section className="max-w-3xl mx-auto text-center mb-12 px-6">
//         <h1 className="text-4xl md:text-5xl text-accent font-bold tracking-tight mb-4 uppercase">
//           Services & Solutions
//         </h1>
//         <p className="text-lg md:text-xl text-slate-300 leading-relaxed">
//           From Websites and Mobile Apps to SEO, Multimedia, Social Media, and
//           JuanTap—We Power Your Digital Growth.
//         </p>
//       </section>

//       {/* Tabs */}
//       <div className="flex gap-8 mb-10 justify-center flex-wrap">
//         {tabs.map(({ key, label }) => (
//           <Button
//             key={key}
//             onClick={() => setActiveTab(key)}
//             variant="ghost"
//             className={`relative text-lg font-semibold tracking-wide transition-colors p-5 bg-transparent hover:bg-transparent focus:bg-transparent
//               ${activeTab === key ? "text-white" : "text-slate-400 hover:text-slate-200"}`}
//           >
//             <span className="flex flex-col items-center">
//               {label}
//               {activeTab === key && (
//                 <span className="mt-1 h-0.5 w-full bg-gradient-to-r from-blue-400 to-blue-900 transition-all" />
//               )}
//             </span>
//           </Button>
//         ))}
//       </div>

//       {/* Content */}
//       <div className="relative z-10 pb-16">
//         {activeTab === "website-solutions" && <WebsiteSolutionsTiers />}
//         {activeTab === "marketing-research" && <MarketingResearch />}
//         {activeTab === "branding" && <Branding />}
//       </div>
//     </div>
//   );
// };

// export default Page;
