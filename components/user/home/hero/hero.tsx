import Cards from "./cards";
import Left from "./left";
import Right from "./right";

const Hero = () => {
  return (
    <section
      className="bg-right bg-cover"
      style={{
        backgroundImage: "url('/images/rainbow.svg')",
      }}
    >
      <div className="container mx-auto w-full pt-5 flex-grow px-4">
        <div className="flex flex-col py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center justify-between gap-8">
            <Left />
            <Right />
          </div>
        </div>
        <Cards />
      </div>
    </section>
  );
};

export default Hero;
