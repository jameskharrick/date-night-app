import { PLATFORM_CLASS_MAP } from '../utils/constants';

export default function PlatformBadge({ name }) {
  const className = PLATFORM_CLASS_MAP[name] || 'bg-slate-600 text-slate-100';

  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${className}`}>
      {name}
    </span>
  );
}
