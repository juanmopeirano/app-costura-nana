import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size = 18): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
});

export const IconPlus = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <line x1={12} y1={5} x2={12} y2={19} />
    <line x1={5} y1={12} x2={19} y2={12} />
  </svg>
);

export const IconArrowLeft = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export const IconArrowRight = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <polyline points="9 6 15 12 9 18" />
  </svg>
);

export const IconDownload = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1={12} y1={15} x2={12} y2={3} />
  </svg>
);

export const IconEdit = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

export const IconTrash = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export const IconCamera = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx={12} cy={13} r={4} />
  </svg>
);

export const IconRuler = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M2 16 L16 2 L22 8 L8 22 Z" />
    <line x1={7} y1={11} x2={9} y2={13} />
    <line x1={11} y1={7} x2={13} y2={9} />
    <line x1={13} y1={13} x2={15} y2={15} />
    <line x1={9} y1={17} x2={11} y2={19} />
  </svg>
);

export const IconDress = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M9 3 L8 6 L5 22 L19 22 L16 6 L15 3 Z" />
    <path d="M9 3 L12 5 L15 3" />
  </svg>
);

export const IconShirt = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M5 6 L2 9 L4 12 L6 11 L6 21 L18 21 L18 11 L20 12 L22 9 L19 6 L14 3 L10 3 Z" />
    <path d="M10 3 C10 5 14 5 14 3" />
  </svg>
);

export const IconSkirt = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M8 3 L16 3 L20 21 L4 21 Z" />
    <line x1={8} y1={3} x2={16} y2={3} />
  </svg>
);

export const IconScissors = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <circle cx={6} cy={6} r={3} />
    <circle cx={6} cy={18} r={3} />
    <line x1={20} y1={4} x2={8.12} y2={15.88} />
    <line x1={14.47} y1={14.48} x2={20} y2={20} />
    <line x1={8.12} y1={8.12} x2={12} y2={12} />
  </svg>
);

export const IconHome = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M3 12 L12 3 L21 12" />
    <path d="M5 10 V21 H19 V10" />
  </svg>
);

export const IconArchive = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <rect x={3} y={4} width={18} height={4} rx={1} />
    <path d="M5 8 V20 H19 V8" />
    <line x1={10} y1={12} x2={14} y2={12} />
  </svg>
);

export const IconCheck = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const IconClose = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <line x1={18} y1={6} x2={6} y2={18} />
    <line x1={6} y1={6} x2={18} y2={18} />
  </svg>
);

export const IconInfo = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <circle cx={12} cy={12} r={10} />
    <line x1={12} y1={16} x2={12} y2={12} />
    <line x1={12} y1={8} x2={12.01} y2={8} />
  </svg>
);
