import Left from "./left";
import Right from "./right";

const Hero = () => {
  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: "#0f1a3d" }}
    >
      <div className="container mx-auto w-full pt-5 flex-grow px-4 relative">
        <div className="flex flex-col py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center justify-between gap-8">
            {/* Map only behind the left column */}
            <div className="relative">
              <div
                className="absolute inset-0 bg-cover bg-left opacity-60 mix-blend-screen pointer-events-none"
                style={{ backgroundImage: "url('/images/map.png')" }}
              />
              <Left />
            </div>
            <Right />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
