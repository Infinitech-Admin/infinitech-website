import Left from "./left";
import Right from "./right";

const Hero = () => {
  return (
    <section
      className="relative w-full overflow-x-hidden"
      style={{ backgroundColor: "#0f1a3d" }}
    >
      <div className="container mx-auto w-full max-w-full pt-5 px-4 relative">
        <div className="flex flex-col py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-8">
            {/* min-w-0 lets this track shrink below its content's natural width */}
            <div className="relative min-w-0">
              <div
                className="absolute inset-0 bg-cover bg-left opacity-60 mix-blend-screen pointer-events-none"
                style={{ backgroundImage: "url('/images/map.png')" }}
              />
              <Left />
            </div>
            <div className="min-w-0">
              <Right />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
