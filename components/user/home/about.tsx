"use client";

import React from "react";
import { poetsen_one } from "@/config/fonts";
import {
  LuArrowRight,
  LuTarget,
  LuEye,
  LuHeartHandshake,
  LuSparkles,
  LuUsers,
  LuShieldCheck,
  LuGlobe,
  LuMonitorSmartphone,
  LuShoppingCart,
  LuServer,
} from "react-icons/lu";
import { Image, Button, Card, CardBody } from "@heroui/react";
import { useRouter } from "next/navigation";

/* -------------------------------------------------------------------- */
/*  Hero / "Who is Infinitech" section                                  */
/* -------------------------------------------------------------------- */

const AboutHero = () => {
  const router = useRouter();

  return (
    <section>
      <div className="container mx-auto px-4 pt-12 2xl:py-12">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-center">
          <div className="px-0 md:px-4 flex justify-center">
            <div className="w-full bg-gray-50 overflow-hidden rounded-tr-[150px] rounded-bl-[150px] border-b-8 border-b-primary border-l-8 border-l-accent border-t-8 border-t-primary border-r-8 border-r-accent shadow-lg">
              <Image
                alt="The Infinitech Advertising Corporation team in a meeting room"
                src="/about.jpg"
                className="w-full h-auto object-contain"
                radius="none"
              />
            </div>
          </div>

          <div className="space-y-6">
            <h1
              className={`text-4xl sm:text-6xl text-primary ${poetsen_one.className}`}
            >
              Who is Infinitech Advertising Corporation?
            </h1>
            <div className="space-y-4">
              <p className="text-base md:text-lg">
                At <strong>Infinitech Advertising Company</strong>, our mission
                is to help businesses thrive by providing top-notch digital
                solutions that boost growth, streamline operations, and enhance
                user satisfaction.
              </p>
              <p className="text-base md:text-lg">
                We are committed to customer satisfaction, offering a guarantee
                of unique web design and high-quality work. Our responsibility
                is to build the right growth system through web & mob app
                development ,content strategy, high-quality content, analytical
                report and continuous optimization.
              </p>
              <p className="text-base md:text-lg">
                Through our innovative solutions, we ensure our clients achieve
                their goals and experience exceptional service.
              </p>
            </div>

            <div>
              <Button
                endContent={<LuArrowRight />}
                size="lg"
                className="bg-primary text-gray-100"
                onPress={() => router.push("/contact")}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------- */
/*  Mission & Vision                                                    */
/* -------------------------------------------------------------------- */

const MissionVision = () => {
  const items = [
    {
      icon: <LuTarget className="text-2xl" />,
      title: "Our Mission",
      body: "To empower businesses of every size with reliable, well-crafted digital solutions that make growth simpler, not harder.",
    },
    {
      icon: <LuEye className="text-2xl" />,
      title: "Our Vision",
      body: "To be the digital partner companies trust first, known for dependable delivery and genuine care for every client's outcome.",
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => (
            <Card key={item.title} className="shadow-md" radius="lg">
              <CardBody className="p-8 space-y-4">
                <div className="w-14 h-14 rounded-tr-2xl rounded-bl-2xl bg-primary text-white flex items-center justify-center">
                  {item.icon}
                </div>
                <h3
                  className={`text-2xl text-primary ${poetsen_one.className}`}
                >
                  {item.title}
                </h3>
                <p className="text-base md:text-lg text-gray-600">
                  {item.body}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------- */
/*  Core Values                                                         */
/* -------------------------------------------------------------------- */

const CoreValues = () => {
  const values = [
    {
      icon: <LuShieldCheck />,
      title: "Quality First",
      body: "Every project is held to a standard of craftsmanship we'd be proud to put our name on.",
    },
    {
      icon: <LuHeartHandshake />,
      title: "Client Partnership",
      body: "We work alongside our clients, not just for them, so every solution actually fits their goals.",
    },
    {
      icon: <LuSparkles />,
      title: "Innovation",
      body: "We stay ahead of digital trends so our clients don't have to.",
    },
    {
      icon: <LuUsers />,
      title: "Collaboration",
      body: "Great outcomes come from great teamwork, internally and with the people we serve.",
    },
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2
            className={`text-3xl sm:text-4xl text-primary ${poetsen_one.className}`}
          >
            What Drives Us
          </h2>
          <p className="text-base md:text-lg text-gray-600">
            The principles behind every solution we deliver.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value) => (
            <div
              key={value.title}
              className="text-center space-y-3 p-6 rounded-tr-3xl rounded-bl-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-accent/10 text-accent flex items-center justify-center text-xl">
                {value.icon}
              </div>
              <h4 className="text-lg font-semibold text-primary">
                {value.title}
              </h4>
              <p className="text-sm text-gray-600">{value.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------- */
/*  Services overview                                                   */
/* -------------------------------------------------------------------- */

const ServicesOverview = () => {
  const services = [
    {
      icon: <LuGlobe />,
      title: "Website Design & Development",
      body: "Custom, responsive websites built to convert visitors into customers.",
    },
    {
      icon: <LuMonitorSmartphone />,
      title: "Mobile App Development",
      body: "Native and cross-platform apps that keep your users engaged on the go.",
    },
    {
      icon: <LuShoppingCart />,
      title: "Ecommerce Solutions",
      body: "Storefronts and platforms built to sell, scale, and stay easy to manage.",
    },
    {
      icon: <LuServer />,
      title: "IT Outsourcing",
      body: "Dependable technical support and staffing so your team can focus on the business.",
    },
  ];

  // return (
  //   <section className="py-16 bg-primary">
  //     <div className="container mx-auto px-4">
  //       <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
  //         <h2
  //           className={`text-3xl sm:text-4xl text-white ${poetsen_one.className}`}
  //         >
  //           What We Do
  //         </h2>
  //         <p className="text-base md:text-lg text-gray-200">
  //           Four areas of expertise, one dedicated team.
  //         </p>
  //       </div>

  //       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  //         {services.map((service) => (
  //           <div
  //             key={service.title}
  //             className="bg-white rounded-tr-3xl rounded-bl-3xl p-6 space-y-3 shadow-lg"
  //           >
  //             <div className="w-12 h-12 rounded-tr-xl rounded-bl-xl bg-accent text-white flex items-center justify-center text-xl">
  //               {service.icon}
  //             </div>
  //             <h4 className="text-lg font-semibold text-primary">
  //               {service.title}
  //             </h4>
  //             <p className="text-sm text-gray-600">{service.body}</p>
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   </section>
  // );
};

/* -------------------------------------------------------------------- */
/*  Stats bar                                                           */
/* -------------------------------------------------------------------- */

const StatsBar = () => {
  const stats = [
    { number: "100+", label: "Projects Delivered" },
    { number: "50+", label: "Happy Clients" },
    { number: "10+", label: "Team Specialists" },
    { number: "4", label: "Core Services" },
  ];

  return (
    <section className="py-14">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-1">
              <div
                className={`text-4xl sm:text-5xl text-accent ${poetsen_one.className}`}
              >
                {stat.number}
              </div>
              <div className="text-sm md:text-base text-gray-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------- */
/*  Closing CTA                                                         */
/* -------------------------------------------------------------------- */

const AboutCTA = () => {
  const router = useRouter();

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="bg-gray-50 rounded-tr-[80px] rounded-bl-[80px] border-b-8 border-b-primary border-l-8 border-l-accent border-t-8 border-t-primary border-r-8 border-r-accent px-6 py-12 md:px-16 text-center space-y-6 shadow-lg">
          <h2
            className={`text-3xl sm:text-4xl text-primary ${poetsen_one.className}`}
          >
            Ready to Grow With Us?
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Let&apos;s talk about your project and how Infinitech Advertising
            Corporation can help you get there.
          </p>
          <Button
            endContent={<LuArrowRight />}
            size="lg"
            className="bg-primary text-gray-100"
            onPress={() => router.push("/contact")}
          >
            Get In Touch
          </Button>
        </div>
      </div>
    </section>
  );
};

/* -------------------------------------------------------------------- */
/*  Page                                                                 */
/* -------------------------------------------------------------------- */

const AboutPage = () => {
  return (
    <main>
      <AboutHero />
      {/* <MissionVision />
      <CoreValues /> */}
      {/* <ServicesOverview /> */}
      {/* <StatsBar /> */}
      {/* <AboutCTA /> */}
    </main>
  );
};

export default AboutPage;
