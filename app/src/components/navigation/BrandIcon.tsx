type BrandIconProps = {
  size?: number
  className?: string
}

export function BrandIcon({ size = 24, className }: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect width="28" height="28" rx="7" className="fill-primary" />
      <path
        d="M16 5L9 16h7l-4 7 12-13h-7l3-5z"
        className="fill-primary-foreground"
      />
    </svg>
  )
}
