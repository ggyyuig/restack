import type { SVGProps } from 'react';

export type IconName = 'stack' | 'grid' | 'graph' | 'search' | 'plus' | 'download' | 'upload' |
  'arrow' | 'close' | 'trash' | 'link' | 'clock' | 'check' | 'reset' | 'menu' | 'sparkle' |
  'chevron' | 'minus' | 'external' | 'command' | 'more';

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 18, ...props }: IconProps) {
  const paths: Record<IconName, React.ReactNode> = {
    stack: <><rect x="5" y="5" width="14" height="16" rx="2"/><path d="M8 2h11a2 2 0 0 1 2 2v14M9 10h6M9 14h6"/></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    graph: <><circle cx="5" cy="6" r="2.5"/><circle cx="19" cy="5" r="2.5"/><circle cx="12" cy="19" r="2.5"/><path d="m7.3 7.2 3.4 9.4M16.8 6.5l-3.6 10M7.5 6h9"/></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    download: <><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 15v5h16v-5"/></>,
    upload: <><path d="M12 16V4m0 0 4 4m-4-4L8 8M4 15v5h16v-5"/></>,
    arrow: <><path d="M5 19 19 5M8 5h11v11"/></>,
    close: <path d="m6 6 12 12M18 6 6 18"/>,
    trash: <><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6"/></>,
    link: <><path d="m9 15 6-6M7 17H5a4 4 0 0 1 0-8h4M13 7h6a4 4 0 0 1 0 8h-2"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    reset: <><path d="M4 10a8 8 0 1 1 2 7M4 10V4m0 6h6"/></>,
    menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
    sparkle: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"/></>,
    chevron: <path d="m9 5 7 7-7 7"/>,
    minus: <path d="M5 12h14"/>,
    external: <><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v6H5V6h6"/></>,
    command: <><path d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6Z"/></>,
    more: <><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {paths[name]}
    </svg>
  );
}
