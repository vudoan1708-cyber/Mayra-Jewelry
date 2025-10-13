import type { CSSProperties } from "react";

export default function Grid({ children, style }: { children: React.ReactNode, style?: CSSProperties }) {
  return (
    <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 m-6 mt-0 list-none" style={style}>
      {children}
    </div>
  );
}
