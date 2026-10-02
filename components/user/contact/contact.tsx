import React from "react";
import InquiryForm from "@/components/user/contact/inquiryForm";
import Links from "@/components/user/contact/links";

const GRID_BG: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(rgba(56,189,248,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.06) 1px, transparent 1px)",
  backgroundSize: "40px 40px",
  maskImage: "radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%)",
  WebkitMaskImage:
    "radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%)",
};

const glass = "border border-white/10 bg-white/[0.04] backdrop-blur-md";

const Contact = () => {
  return (
    <div className="relative flex w-full flex-col items-center overflow-hidden bg-[#070d1f]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[44rem]"
        style={GRID_BG}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#38bdf8]/15 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-[40rem] h-96 w-96 rounded-full bg-[#f5a623]/10 blur-[120px]"
      />

      <section className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#f5a623]/30 bg-[#f5a623]/10 px-3 py-1 font-mono text-xs text-[#f5a623]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#f5a623]" />
            CONTACT US
          </span>
          <h1 className="mt-5 font-['Poetsen_One'] text-4xl font-bold leading-[1.1] text-white sm:text-5xl lg:text-[3.4rem]">
            Get in touch
          </h1>
          <p className="mt-5 text-[#8a97bd]">
            Reach out to{" "}
            <strong className="text-white">
              Infinitech Advertising Corporation
            </strong>{" "}
            for inquiries about web and system development solutions.
          </p>
        </div>

        <div className="grid items-stretch gap-8 lg:grid-cols-2">
          {/* Left: links + form */}
          <div className="space-y-6">
            <div className="grid gap-3">
              <Links />
            </div>

            <div
              className={`${glass} relative rounded-2xl p-6 shadow-[0_0_60px_rgba(56,189,248,0.1)] sm:p-8`}
            >
              <span
                aria-hidden
                className="absolute -top-px left-8 h-[2px] w-36 rounded-full bg-gradient-to-r from-transparent via-[#38bdf8] to-transparent opacity-70 shadow-[0_0_14px_rgba(56,189,248,0.9)]"
              />
              <p className="mb-5 font-mono text-xs text-[#38bdf8]">
                send an inquiry
              </p>
              <InquiryForm />
            </div>
          </div>

          {/* Right: map */}
          <div
            className={`${glass} relative flex min-h-[420px] flex-col overflow-hidden rounded-2xl shadow-[0_0_80px_rgba(56,189,248,0.15)]`}
          >
            <iframe
              title="Infinitech Advertising Corporation location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.6855119607444!2d121.01129607577312!3d14.559968178068823!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c9df6c047e17%3A0x12957e8fd785f26f!2sinfinitech%20advertising%20corporation!5e0!3m2!1sen!2sph!4v1742883768973!5m2!1sen!2sph"
              width="100%"
              height="100%"
              className="min-h-[380px] flex-1 border-0"
              style={{ filter: "invert(90%) hue-rotate(180deg) contrast(0.9)" }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
