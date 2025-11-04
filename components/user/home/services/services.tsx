"use client";

import React from "react";

const Services = () => {
  const services = [
    {
      title: "WEBSITE DEVELOPMENT",
      subtitle: "Crafting Custom Websites Tailored to Your Needs",
      description: `We create visually stunning and highly functional websites that capture attention, convey your brand's message, and give you a competitive edge. Share your vision with us, and we'll take care of the rest.`,
      image: "web-dev.svg",
    },
    {
      title: "SEARCH ENGINE OPTIMIZATION",
      subtitle: "Boost Your Online Visibility with SEO",
      description: `Our SEO strategies help improve your website's search engine rankings, driving more organic traffic and increasing your online presence. Let us optimize your site and ensure it reaches the right audience.`,
      image: "seo.svg",
    },
    {
      title: "GRAPHIC DESIGN",
      subtitle: "Bringing Your Brand to Life with Stunning Designs",
      description: `Our creative team designs visually appealing graphics that reflect your brand identity, making a lasting impression on your audience. From logos to promotional materials, we've got you covered.`,
      image: "design.svg",
    },
    {
      title: "SOCIAL MEDIA MARKETING",
      subtitle: "Maximize Engagement Through Social Media",
      description: `We develop and manage engaging social media campaigns that build brand awareness, increase customer engagement, and drive business growth. Let us help you connect with your audience effectively.`,
      image: "marketing.svg",
    },
    {
      title: "PHOTOGRAPHY & VIDEOGRAPHY",
      subtitle: "Capturing Moments That Tell Your Story",
      description: `Our professional photography and videography services bring your brand to life through compelling visual content. From product shoots to promotional videos, we create stunning media that resonates with your audience and elevates your brand presence.`,
      image: "photo_video.png"
    },
    {
      title: "JUANTAP DIGITAL BUSINESS CARD",
      subtitle: "Modern Networking Made Simple",
      description: `Transform the way you network with JuanTap, our innovative digital business card solution. Share your contact information instantly with a single tap, making connections effortless and eco-friendly. Stand out in the digital age while keeping all your professional details accessible anytime, anywhere.`,
      image: "juantap.png"
    },
  ];

  return (
    <section className="container mx-auto lg:py-24 px-4 pb-12 md:pb-0">
      <div className="flex flex-col justify-center items-center">
        <div className="flex justify-between">
          <div className="max-w-xl text-center">
            <h1 className="text-4xl text-orange-500 font-bold">OUR SERVICES</h1>
            <h1 className="text-3xl text-blue-600 font-['Poetsen_One']">
              Building Innovative Digital Solutions for Your Business
            </h1>
          </div>
        </div>

        <div className="xl:py-8">
          <div className="flex flex-col justify-center items-center">
            {services.map((service, index) => (
              <div
                key={service.title}
                className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 mb-8"
              >
                <div className={index % 2 === 0 ? "md:order-2" : "md:order-1"}>
                  <img
                    className="w-full h-[28rem] object-contain"
                    alt={service.title}
                    src={`/images/services/${service.image}`}
                  />
                </div>

                <div
                  className={index % 2 === 0 ? "md:order-1" : "md:order-2"}
                >
                  <div className="max-w-lg">
                    <span className="text-xl text-orange-500 font-bold">
                      {service.title}
                    </span>
                    <h1 className="text-3xl text-blue-950 font-bold mt-2 font-['Poetsen_One']">
                      {service.subtitle}
                    </h1>
                    <p className="text-lg text-gray-600 mt-4">
                      {service.description}
                    </p>
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

export default Services;
