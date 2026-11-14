"use client";

import { useEffect, useRef, useState } from "react";

// GitHub-Universe-style background: an invisible grid of cells that light up with
// a colored tile as the cursor passes over them, then fade out. Fills its parent
// (which must be position:relative); sits behind content (z-0).
const COLORS = ["#7c6cff", "#a78bfa", "#f472b6", "#fbbf24", "#34d399", "#38bdf8"];
const CELL = 46; // px

export function TileGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const [grid, setGrid] = useState<{ cols: number; colors: string[] }>({ cols: 0, colors: [] });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const compute = () => {
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      const cols = Math.ceil(width / CELL);
      const rows = Math.ceil(height / CELL);
      const n = cols * rows;
      setGrid({
        cols,
        colors: Array.from({ length: n }, () => COLORS[(Math.random() * COLORS.length) | 0]),
      });
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="tgrid"
      style={{
        gridTemplateColumns: `repeat(${grid.cols || 1}, 1fr)`,
        gridAutoRows: `${CELL}px`,
      }}
    >
      {grid.colors.map((c, i) => (
        <span key={i} className="tgrid-cell" style={{ ["--c" as string]: c } as React.CSSProperties} />
      ))}
    </div>
  );
}
