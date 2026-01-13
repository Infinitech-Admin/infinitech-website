"use client"

const Services = () => {
  const services = [
    {
      title: "WEBSITE DEVELOPMENT",
      subtitle: "Crafting Custom Websites Tailored to Your Needs",
      description: `We create visually stunning and highly functional websites that capture attention, convey your brand's message, and give you a competitive edge. Share your vision with us, and we'll take care of the rest.`,
      image: "web-dev.svg",
      categories: [
        {
          id: 1,
          name: "Hotel Management",
          description: "Websites designed for hotels, resorts, and hospitality businesses with booking and management features.",
        },
        {
          id: 2,
          name: "Corporate Website",
          description: "Professional websites for companies to showcase services, portfolios, and corporate identity.",
        },
        {
          id: 3,
          name: "Manpower Platform",
          description: "Platforms for recruitment, staffing, and workforce management with user-friendly interfaces.",
        },
        {
          id: 4,
          name: "Real Estate",
          description: "Property listing and management websites tailored for real estate agencies and brokers.",
        },
        {
          id: 5,
          name: "E-Commerce",
          description: "Online stores with secure payment gateways, product catalogs, and shopping cart functionality.",
        },
        {
          id: 6,
          name: "Booking System",
          description: "Websites with integrated booking and scheduling systems for services and events.",
        },
        {
          id: 7,
          name: "Property Specialist",
          description: "Specialized sites for property consultants and agencies to highlight expertise and listings.",
        },
      ],
    },
    {
      title: "SEARCH ENGINE OPTIMIZATION",
      subtitle: "Boost Your Online Visibility with SEO",
      description: `Our SEO strategies help improve your website's search engine rankings, driving more organic traffic and increasing your online presence. Let us optimize your site and ensure it reaches the right audience.`,
      image: "seo.svg",
      categories: [
        {
          id: 1,
          name: "On-Page SEO",
          description: "Optimizing content, meta tags, and site structure for better rankings.",
        },
        { id: 2, name: "Off-Page SEO", description: "Building backlinks and authority through external strategies." },
        { id: 3, name: "Local SEO", description: "Improving visibility for businesses in local search results." },
      ],
    },
    {
      title: "GRAPHIC DESIGN",
      subtitle: "Bringing Your Brand to Life with Stunning Designs",
      description: `Our creative team designs visually appealing graphics that reflect your brand identity, making a lasting impression on your audience. From logos to promotional materials, we've got you covered.`,
      image: "design.svg",
      categories: [
        { id: 1, name: "Logo Design", description: "Unique logos that capture your brand identity." },
        { id: 2, name: "Marketing Collateral", description: "Brochures, flyers, and promotional materials." },
        { id: 3, name: "Digital Assets", description: "Social media graphics, banners, and ads." },
      ],
    },
    {
      title: "SOCIAL MEDIA MARKETING",
      subtitle: "Maximize Engagement Through Social Media",
      description: `We develop and manage engaging social media campaigns that build brand awareness, increase customer engagement, and drive business growth. Let us help you connect with your audience effectively.`,
      image: "marketing.svg",
      categories: [
        { id: 1, name: "Campaign Strategy", description: "Tailored strategies to maximize reach and engagement." },
        { id: 2, name: "Content Creation", description: "Engaging posts, videos, and graphics for social platforms." },
        { id: 3, name: "Analytics & Reporting", description: "Tracking performance and optimizing campaigns." },
      ],
    },
    {
      title: "PHOTOGRAPHY & VIDEOGRAPHY",
      subtitle: "Capturing Moments That Tell Your Story",
      description: `Our professional photography and videography services bring your brand to life through compelling visual content. From product shoots to promotional videos, we create stunning media that resonates with your audience and elevates your brand presence.`,
      image: "photo_video.png",
      categories: [
        {
          id: 1,
          name: "Wedding",
          description: "Capturing the beauty and emotions of weddings with timeless, cinematic imagery.",
        },
        {
          id: 2,
          name: "Portrait",
          description: "Professional portraits that highlight personality, style, and character.",
        },
        {
          id: 3,
          name: "Event",
          description: "Coverage of corporate, social, and private events with storytelling visuals.",
        },
        {
          id: 4,
          name: "Product",
          description: "High-quality product photography for e-commerce, catalogs, and marketing campaigns.",
        },
        {
          id: 5,
          name: "Commercial & Branding",
          description: "Visuals that strengthen brand identity and support marketing strategies.",
        },
        {
          id: 6,
          name: "Headshots",
          description: "Clean, professional headshots for business, LinkedIn, and personal branding.",
        },
      ],
    },
    {
      title: "JUANTAP DIGITAL BUSINESS CARD",
      subtitle: "Modern Networking Made Simple",
      description: `Transform the way you network with JuanTap, our innovative digital business card solution. Share your contact information instantly with a single tap, making connections effortless and eco-friendly. Stand out in the digital age while keeping all your professional details accessible anytime, anywhere.`,
      image: "juantap.png",
      categories: [
        {
          id: 1,
          name: "Personal Profiles",
          description: "Digital cards for individuals to share contact info instantly.",
        },
        { id: 2, name: "Corporate Teams", description: "Centralized business card solutions for organizations." },
        { id: 3, name: "Custom Branding", description: "Tailored designs to match your brand identity." },
      ],
    },
  ]

  return (
    <div className="mx-4 flex flex-col justify-center items-center">
      <section className="container mx-auto px-4 lg:px-8 mb-12 bg-white">
        <div className="flex flex-col justify-center items-center">
          <div className="xl:py-8">
            <div className="flex flex-col justify-center items-center">
              {services.map((service, serviceIndex) => (
                <div key={`${service.title}-${serviceIndex}`} className="w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 mb-8">
                    <div className={serviceIndex % 2 === 0 ? "md:order-2" : "md:order-1"}>
                      <img className="w-full h-[28rem] object-contain" alt={service.title} src={`/images/services/${service.image}`} />
                    </div>

                    <div className={serviceIndex % 2 === 0 ? "md:order-1" : "md:order-2"}>
                      <div className="max-w-lg">
                        <span className="text-xl text-accent font-bold">{service.title}</span>
                        <h1 className="text-3xl text-primary font-bold mt-2 font-['Poetsen_One']">{service.subtitle}</h1>
                        <p className="text-lg text-gray-600 mt-4">{service.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Category cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                    {service.categories.map((category, catIndex) => (
                      <div
                        key={`service-${serviceIndex}-category-${category.id ?? catIndex}`}
                        className={`rounded-lg p-4 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:shadow-blue-400/50
                      ${
                        catIndex % 2 === 0
                          ? "bg-gradient-to-r from-slate-50 via-primary/20 to-accent/10 hover:to-primary/50"
                          : "bg-gradient-to-r from-accent/10 via-accent/30 to-primary/10 hover:to-primary/50"
                      }`}
                      >
                        <h3 className="text-primary font-bold text-lg">{category.name}</h3>
                        <p className="text-gray-600 text-base mt-2">{category.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Services
