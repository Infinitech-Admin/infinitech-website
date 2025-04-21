"use client";

import { useEffect } from "react";

const Error = ({ error, reset }: { error: Error; reset: () => void }) => {
  useEffect(() => {
    /* eslint-disable no-console */
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col text-center my-7">
      <h2 className="text-xl font-bold">Something went wrong!</h2>
      <button className="text-xl font-semibold" onClick={reset}>
        Try again
      </button>
    </div>
  );
};

export default Error;
