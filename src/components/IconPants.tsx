import type { SVGProps } from 'react';

export default function IconPants({ size = 18, ...p }: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <path d="M5 3 L19 3 L19 12 L15 22 L13 22 L12 13 L11 22 L9 22 L5 12 Z" />
      <line x1={5} y1={12} x2={19} y2={12} />
    </svg>
  );
}
