const TopLogo = () => {
  return (
    <a href="/">
      {/* Light mode logo */}
      <img
        src="/obidientLogoGreen.svg"
        alt="The People's Opposition Logo"
        className="w-48 block dark:hidden"
      />

      {/* Dark mode logo */}
      <img
        src="/obidientLogo.svg"
        alt="The People's Opposition Logo"
        className="w-48 hidden dark:block"
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
      alt="The People's Opposition Logo"
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
