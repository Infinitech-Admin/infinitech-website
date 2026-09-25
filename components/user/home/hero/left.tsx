"use client";

import React, { useEffect, useState } from "react";
import { LuArrowRight } from "react-icons/lu";
import { Button } from "@heroui/react";
import { poetsen_one } from "@/config/fonts";
import { useRouter } from "next/navigation";

const eyebrow = ["Web", "Marketing", "Branding", "Content"];

const LINE_1 = "Your Digital Growth";
const LINE_2 = "Partner";
const TYPE_SPEED_MS = 28; // fast — tune this up/down to taste
const PAUSE_BETWEEN_LINES_MS = 150;

// Types LINE_1 fully, pauses briefly, then types LINE_2. Returns how many
// characters of each line are currently visible, plus which line the
// blinking cursor should sit after.
function useTwoLineTypewriter() {
  const [line1Count, setLine1Count] = useState(0);
  const [line2Count, setLine2Count] = useState(0);
  const [activeLine, setActiveLine] = useState<1 | 2>(1);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (activeLine === 1) {
      if (line1Count < LINE_1.length) {
        timeout = setTimeout(() => setLine1Count((c) => c + 1), TYPE_SPEED_MS);
      } else {
        timeout = setTimeout(() => setActiveLine(2), PAUSE_BETWEEN_LINES_MS);
      }
    } else {
      if (line2Count < LINE_2.length) {
        timeout = setTimeout(() => setLine2Count((c) => c + 1), TYPE_SPEED_MS);
      } else {
        setDone(true);
      }
    }

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLine, line1Count, line2Count]);

  return {
    line1: LINE_1.slice(0, line1Count),
    line2: LINE_2.slice(0, line2Count),
    activeLine,
    done,
  };
}

const Left = () => {
  const router = useRouter();
  const { line1, line2, activeLine, done } = useTwoLineTypewriter();

  return (
    <div className="relative space-y-6 z-10">
      <div className="space-y-4">
        <p className="text-accent-light text-sm font-semibold tracking-widest uppercase">
          {eyebrow.join(" · ")}
        </p>

        {/* Reserve full height/width up front via an invisible copy of the
            final text, so the typewriter animation doesn't cause layout
            shift while it types. */}
        <h1
          className={`relative text-5xl sm:text-7xl font-bold leading-tight ${poetsen_one.className}`}
        >
          <span className="invisible block" aria-hidden="true">
            {LINE_1}
            <br />
            {LINE_2}
          </span>

          <span className="absolute inset-0">
            <span className="text-gray-100">
              {line1}
              {activeLine === 1 && (
                <span className="typewriter-cursor bg-gray-100" />
              )}
            </span>
            <br />
            <span className="glow-text" style={{ color: "#22d3ee" }}>
              {line2}
              {(activeLine === 2 || done) && (
                <span
                  className="typewriter-cursor"
                  style={{ backgroundColor: "#22d3ee" }}
                />
              )}
            </span>
          </span>
        </h1>

        <p className="text-lg text-gray-300 max-w-xl">
          We create modern websites, strategic marketing, strong branding, and
          engaging content — all designed to help your business grow.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 pt-2">
        <Button
          size="lg"
          variant="solid"
          className="glow-btn-primary font-semibold transition"
          style={{ backgroundColor: "#22d3ee", color: "#0d1b3e" }}
          endContent={<LuArrowRight size={18} />}
          onPress={() => router.push("/contact")}
        >
          Get a Free Consultation
        </Button>

        <Button
          size="lg"
          variant="bordered"
          className="glow-btn-secondary font-medium transition"
          style={{ borderColor: "#22d3ee", color: "#67e8f9" }}
          onPress={() => router.push("/solutions")}
        >
          View Our Work
        </Button>
      </div>

      <style jsx>{`
        .glow-text {
          text-shadow:
            0 0 8px rgba(34, 211, 238, 0.8),
            0 0 20px rgba(34, 211, 238, 0.55),
            0 0 40px rgba(34, 211, 238, 0.4),
            0 0 70px rgba(34, 211, 238, 0.25);
          animation: pulseGlow 3s ease-in-out infinite;
        }

        @keyframes pulseGlow {
          0%,
          100% {
            text-shadow:
              0 0 8px rgba(34, 211, 238, 0.8),
              0 0 20px rgba(34, 211, 238, 0.55),
              0 0 40px rgba(34, 211, 238, 0.4),
              0 0 70px rgba(34, 211, 238, 0.25);
          }
          50% {
            text-shadow:
              0 0 12px rgba(34, 211, 238, 1),
              0 0 28px rgba(34, 211, 238, 0.7),
              0 0 55px rgba(34, 211, 238, 0.5),
              0 0 90px rgba(34, 211, 238, 0.3);
          }
        }

        .typewriter-cursor {
          display: inline-block;
          width: 0.06em;
          height: 0.85em;
          margin-left: 4px;
          vertical-align: -0.1em;
          animation: blinkCursor 0.8s step-end infinite;
        }

        @keyframes blinkCursor {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
      `}</style>

      {/* Global styles — required because these classnames are passed as
          props to HeroUI's <Button>, which renders its own DOM internally.
          Scoped `<style jsx>` only attaches to elements written directly in
          THIS component's JSX, so it can never reach into a child library
          component's rendered output. `jsx global` skips that scoping. */}
      <style jsx global>{`
        .glow-btn-primary {
          box-shadow:
            0 0 15px rgba(34, 211, 238, 0.7),
            0 0 35px rgba(34, 211, 238, 0.45),
            0 0 60px rgba(34, 211, 238, 0.25);
          animation: pulseBtnPrimary 3s ease-in-out infinite;
        }

        .glow-btn-primary:hover {
          background-color: #67e8f9 !important;
        }

        @keyframes pulseBtnPrimary {
          0%,
          100% {
            box-shadow:
              0 0 15px rgba(34, 211, 238, 0.7),
              0 0 35px rgba(34, 211, 238, 0.45),
              0 0 60px rgba(34, 211, 238, 0.25);
          }
          50% {
            box-shadow:
              0 0 22px rgba(34, 211, 238, 0.9),
              0 0 50px rgba(34, 211, 238, 0.6),
              0 0 80px rgba(34, 211, 238, 0.35);
          }
        }

        .glow-btn-secondary {
          box-shadow:
            0 0 10px rgba(34, 211, 238, 0.35),
            0 0 22px rgba(34, 211, 238, 0.2);
          transition: box-shadow 0.3s ease;
        }

        .glow-btn-secondary:hover {
          box-shadow:
            0 0 14px rgba(34, 211, 238, 0.55),
            0 0 32px rgba(34, 211, 238, 0.35);
          background-color: rgba(34, 211, 238, 0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default Left;
