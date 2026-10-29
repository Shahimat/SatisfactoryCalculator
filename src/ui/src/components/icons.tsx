const PATHS = {
  bolt: 'M13 2 4 14h7l-1 8 9-12h-7z',
  plus: 'M12 5v14M5 12h14',
  close: 'M6 6l12 12M18 6 6 18',
  copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
  chevronDown: 'm6 9 6 6 6-6',
  chevronRight: 'm9 6 6 6-6 6',
  arrowRight: 'M5 12h14m-6-6 6 6-6 6',
  arrowUp: 'M12 19V5m-6 6 6-6 6 6',
  arrowDown: 'M12 5v14m-6-6 6 6 6-6',
  alert: 'M12 3 2 21h20zM12 10v5m0 3v.01',
  chain: 'm12 3 9 4.5-9 4.5-9-4.5zM3 12l9 4.5 9-4.5M3 16.5 12 21l9-4.5',
  factory: 'M3 21V10l6 4V10l6 4V4h6v17zM3 21h18',
  external: 'M14 4h6v6m0-6-9 9M18 14v6H4V6h6',
  gauge: 'M4 16a8 8 0 1 1 16 0M12 16l4-5',
  somersloop:
    'M12 4a8 8 0 1 0 0 16 8 8 0 1 0 0-16zM4.5 10.5c3 2.5 12 2.5 15 0M6 17c2-5 10-5 12 0',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 1 0 0-14zm9 16-4-4',
  sliders: 'M4 6h10m4 0h2M4 12h4m4 0h8M4 18h12m4 0h0M14 4v4M8 10v4M16 16v4',
  trash: 'M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3',
  check: 'm5 12 5 5 9-10',
  target:
    'M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18zm0 5a4 4 0 1 0 0 8 4 4 0 1 0 0-8z',
  lock: 'M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4',
  grip: 'M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01',
} as const;

export type IconName = keyof typeof PATHS;

export const Icon = ({
  name,
  size = 18,
  color = 'currentColor',
}: {
  name: IconName;
  size?: number;
  color?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d={PATHS[name]} />
  </svg>
);
