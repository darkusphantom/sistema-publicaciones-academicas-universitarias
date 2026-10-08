import type { User } from "@/lib/types";
import { cn } from "@/lib/cn";

type AvatarProps = {
  user: Pick<User, "givenName" | "familyName" | "avatarUrl">;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

export function Avatar({ user, size = "md", className }: AvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-xl",
    xl: "w-20 h-20 text-2xl",
  };

  const hasPhoto = Boolean(user.avatarUrl);
  const initials = `${user.givenName[0] || ""}${user.familyName[0] || ""}`.toUpperCase();

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden bg-surface-muted text-[var(--primary)] font-medium",
        sizeClasses[size],
        className
      )}
    >
      <span aria-hidden="true">{initials}</span>
      {hasPhoto && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.avatarUrl!}
          alt=""
          className="absolute inset-0 w-full h-full object-cover bg-surface-muted"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      )}
    </div>
  );
}
