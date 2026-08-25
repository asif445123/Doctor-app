"use client";

import { useEffect, useRef } from "react";

export default function AdBanner() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || container.dataset.loaded) return;
    container.dataset.loaded = "true";

    // atOptions must exist on window before invoke.js runs
    window.atOptions = {
      key: "78d585b569a8c5dad462ee8796d524ae",
      format: "iframe",
      height: 50,
      width: 320,
      params: {},
    };

    const script = document.createElement("script");
    script.src = "https://indefinitelynutmegbile.com/78d585b569a8c5dad462ee8796d524ae/invoke.js";
    script.async = true;
    container.appendChild(script);
  }, []);

  return (
    <div className="fixed bottom-0 left-1/2 z-40 -translate-x-1/2 bg-white/90 pb-1 pt-1 shadow-[0_-1px_4px_rgba(0,0,0,0.06)]">
      <div ref={containerRef} style={{ width: 320, height: 50 }} />
    </div>
  );
}
