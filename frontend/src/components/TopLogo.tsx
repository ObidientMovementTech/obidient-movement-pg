import OptimizedImage from './OptimizedImage';

const TopLogo = () => {
  return (
    <a href="/">
      {/* Light mode logo */}
      <OptimizedImage
        src="/obidientLogoGreen.svg"
        alt="Obidient Movement Logo"
        className="w-48 block dark:hidden"
        width={192}
        height={64}
        loading="eager"
      />

      {/* Dark mode logo */}
      <OptimizedImage
        src="/obidientLogo.svg"
        alt="Obidient Movement Logo"
        className="w-48 hidden dark:block"
        width={192}
        height={64}
        loading="eager"
      />
    </a>
  );
};

type Props = {
  className: string;
};
export const CardLogo = ({ className }: Props) => {
  return (
    <img
      src="/logo-black.png"
      alt="Obidient Movement Logo"
      className={className}
    />
  );
};

export const WebIcon = ({ className }: Props) => {
  return (
    <>
      {/* Light mode web icon */}
      <img
        src="/web_globe_dark.svg"
        alt="Web Icon"
        className={`${className} block`}
      />
    </>
  );
}

export const MailIcon = ({ className }: Props) => {
  return (
    <>
      {/* Light mode mail icon */}
      <img
        src="/mail_icon_dark.svg"
        alt="Mail Icon"
        className={`${className} block`}
      />
    </>
  );
}


export default TopLogo;
