import { Props as JoyrideProps } from 'react-joyride';
import { NS } from './tokens';

/**
 * Command IDs
 */
export namespace CommandIDs {
  export const addTour = `${NS}:add`;
  export const launch = `${NS}:launch`;
}

/**
 * Default tour IDs
 */
export const WELCOME_ID = `${NS}:welcome`;
export const NOTEBOOK_ID = `${NS}:notebook`;

/**
 * Default tour options
 */
export const TutorialDefaultOptions: Omit<JoyrideProps, 'steps'> = {
  continuous: true,
  showProgress: true,
  showSkipButton: true,
  styles: {
    options: {
      arrowColor: 'var(--jp-layout-color1)',
      backgroundColor: 'var(--jp-layout-color1)',
      beaconSize: 36,
      overlayColor: 'var(--jp-dialog-background)',
      primaryColor: 'var(--jp-brand-color1)',
      spotlightShadow: 'var(--jp-elevation-z6)',
      textColor: 'var(--jp-ui-font-color1)',
      zIndex: 100
    }
  }
};
