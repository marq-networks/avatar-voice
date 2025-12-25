import logoImage from '@/assets/b50a1f14c33063011f99a0056a557c8da11ecf21.png';

interface MarqLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MarqLogo({ size = 'md', className = '' }: MarqLogoProps) {
  const sizes = {
    sm: { height: '32px', width: 'auto' },
    md: { height: '48px', width: 'auto' },
    lg: { height: '64px', width: 'auto' }
  };

  return (
    <img 
      src={logoImage} 
      alt="marQ Networks - Simply Quintessential" 
      style={sizes[size]}
      className={`${className}`}
    />
  );
}