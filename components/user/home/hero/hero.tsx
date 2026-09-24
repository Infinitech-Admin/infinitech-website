import Left from "./left";
import Right from "./right";
import { LuCode, LuMegaphone, LuPenTool, LuPlay } from "react-icons/lu";

const features = [
  {
    icon: LuCode,
    title: "Modern Web Development",
    desc: "Fast, secure, and scalable web solutions.",
  },
  {
    icon: LuMegaphone,
    title: "Digital Marketing",
    desc: "Reach the right audience, get real results.",
  },
  {
    icon: LuPenTool,
    title: "Branding & Design",
    desc: "Memorable brands that make an impact.",
  },
  {
    icon: LuPlay,
    title: "Content & Social Media",
    desc: "Creative content that connects and converts.",
  },
];

const Hero = () => {
  return (
    <section
      className="relative w-full overflow-x-hidden"
      style={{ backgroundColor: "#0f1a3d" }}
    >
      <div className="container mx-auto w-full max-w-full pt-5 px-4 relative">
        <div className="flex flex-col py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-8">
            <div className="relative min-w-0">
              <Left />
            </div>
            <div className="min-w-0">
              <Right />
            </div>
          </div>

          {/* Full-width feature strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-12 mt-4 border-t border-white/10">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start gap-3">
                <feature.icon
                  className="text-accent-light shrink-0 mt-1"
                  size={22}
                />
                <div>
                  <div className="text-sm font-semibold text-gray-100">
                    {feature.title}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {feature.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
