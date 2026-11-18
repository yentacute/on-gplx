import { ICONS, type IconName } from '../lib/icons';

export const Icon = ({ name, size = 20, className = '' }: { name: IconName; size?: number; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
    dangerouslySetInnerHTML={{ __html: ICONS[name] }}
  />
);
