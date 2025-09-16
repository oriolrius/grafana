import { css, cx } from '@emotion/css';
import { FC } from 'react';

import { colorManipulator } from '@grafana/data';
import { useTheme2 } from '@grafana/ui';

export interface BrandComponentProps {
  className?: string;
  children?: JSX.Element | JSX.Element[];
}

export const LoginLogo: FC<BrandComponentProps & { logo?: string }> = ({ className, logo }) => {
  return <img className={className} src="public/img/custom/comforsa_logo.svg" alt="Comforsa" />;
};

const LoginBackground: FC<BrandComponentProps> = ({ className, children }) => {
  const theme = useTheme2();

  const background = css({
    '&:before': {
      content: '""',
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: 0,
      top: 0,
      background: theme.isDark 
        ? 'linear-gradient(135deg, #1a1a1a 0%, #2a1a1a 50%, #3a1a1a 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f8f8f8 25%, #ffebeb 50%, #ffe0e0 75%, #ffd0d0 100%)',
      opacity: 1,
      transition: 'opacity 3s ease-in-out',
    },
    '&:after': {
      content: '""',
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: 0,
      top: 0,
      background: theme.isDark
        ? 'radial-gradient(circle at 20% 80%, rgba(255, 100, 100, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 150, 150, 0.05) 0%, transparent 50%)'
        : 'radial-gradient(circle at 20% 80%, rgba(255, 0, 0, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 100, 100, 0.05) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
      opacity: 1,
    },
  });

  return <div className={cx(background, className)}>{children}</div>;
};

const MenuLogo: FC<BrandComponentProps> = ({ className }) => {
  return <img className={className} src="public/img/custom/comforsa_logo.svg" alt="Comforsa" />;
};

const LoginBoxBackground = () => {
  const theme = useTheme2();
  return css({
    background: colorManipulator.alpha(theme.colors.background.primary, 0.7),
    backgroundSize: 'cover',
  });
};

export class Branding {
  static LoginLogo = LoginLogo;
  static LoginBackground = LoginBackground;
  static MenuLogo = MenuLogo;
  static LoginBoxBackground = LoginBoxBackground;
  static AppTitle = 'Comforsa Webforms';
  static LoginTitle = 'Comforsa Webforms';
  static HideEdition = false;
  static GetLoginSubTitle = (): null | string => {
    return null;
  };
}
