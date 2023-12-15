import { useEffect } from "react";

export const useFrame = (cb: () => unknown) => {
  useEffect(() => {
    let looping = true;
    const loop = () => {
      if (!looping) return;
      cb();
      requestAnimationFrame(loop);
    };
    loop();
    return () => {
      looping = false;
    };
  }, [cb]);
};
