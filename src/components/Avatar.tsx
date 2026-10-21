import { cn } from '../lib/utils';
import { AVATAR_COLORS } from '../lib/constants';

interface AvatarProps {
  name: string;
  initials: string;
  colorClass?: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

const SIZE_CLASSES = {
  xs: 'w-5 h-5 text-[9px]',
  sm: 'w-7 h-7 text-[11px]',
  md: 'w-9 h-9 text-sm',
};

export function Avatar({ name, initials, colorClass, size = 'sm', className }: AvatarProps) {
  return (
    <div
      title={name}
      className={cn(
        'rounded-lg border font-bold flex items-center justify-center flex-shrink-0',
        SIZE_CLASSES[size],
        colorClass ?? AVATAR_COLORS[0],
        className,
      )}
    >
      {initials}
    </div>
  );
}

interface AvatarGroupProps {
  userIds: string[];
  users: { id: string; name: string; avatar: string }[];
  avatarColorOf: (id: string) => string;
  max?: number;
}

export function AvatarGroup({ userIds, users, avatarColorOf, max = 3 }: AvatarGroupProps) {
  const resolved = users.filter((u) => userIds.includes(u.id));
  const shown    = resolved.slice(0, max);
  const extra    = resolved.length - max;

  if (resolved.length === 0) {
    return <span className="text-[10px] text-zinc-500 italic">Unassigned</span>;
  }

  return (
    <div className="flex -space-x-1.5 overflow-hidden">
      {shown.map((u) => (
        <Avatar
          key={u.id}
          name={u.name}
          initials={u.avatar}
          colorClass={avatarColorOf(u.id)}
          size="xs"
          className="ring-1 ring-zinc-950"
        />
      ))}
      {extra > 0 && (
        <div className="w-5 h-5 rounded-lg bg-zinc-800 border border-zinc-700 text-[9px] font-bold text-zinc-300 flex items-center justify-center ring-1 ring-zinc-950">
          +{extra}
        </div>
      )}
    </div>
  );
}
