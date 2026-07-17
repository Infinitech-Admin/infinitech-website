"use client";

export default function ReviewPlatforms() {
  const platforms = [
    {
      name: "Trustpilot",
      logo: "/images/trust-pilot.png",
      rating: 4.5,
      count: "7,584+",
      color: "#00B67A",
    },
    {
      name: "Clutch",
      logo: "/images/clutch.png",
      rating: 5,
      count: "1,500+",
      color: "#FF3D2E",
    },
  ];

  const renderStars = (rating: number, color: string) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill={
            star <= Math.floor(rating)
              ? color
              : star - 0.5 === rating
                ? `url(#half-${color.replace("#", "")})`
                : "#e5e7eb"
          }
        >
          <defs>
            <linearGradient id={`half-${color.replace("#", "")}`}>
              <stop offset="50%" stopColor={color} />
              <stop offset="50%" stopColor="#e5e7eb" />
            </linearGradient>
          </defs>
          <path d="M8 1l1.85 3.75 4.15.6-3 2.93.71 4.13L8 10.25l-3.71 1.95.71-4.13L2 5.35l4.15-.6z" />
        </svg>
      ))}
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {platforms.map((p) => (
        <div
          key={p.name}
          className="flex items-center gap-4 bg-gray-50 rounded-2xl px-5 py-4 border border-gray-100"
        >
          <img src={p.logo} alt={p.name} className="w-7 h-7 object-contain" />
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              Review on
            </p>
            <p className="font-semibold text-gray-800 text-sm">{p.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {renderStars(p.rating, p.color)}
              <span className="text-xs text-gray-400">{p.count} reviews</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
