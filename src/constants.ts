import { Props as JoyrideProps } from 'react-joyride';
import { PLUGIN_ID } from './tokens';

/**
 * Command IDs
 */
export namespace CommandIDs {
  export const addTour = `${PLUGIN_ID}:add`;
  export const launch = `${PLUGIN_ID}:launch`;
}

/**
 * Default tour IDs
 */
export const WELCOME_ID = `${PLUGIN_ID}:welcome`;
export const NOTEBOOK_ID = `${PLUGIN_ID}:notebook`;

/**
 * Default tour options
 */
export const TutorialDefaultOptions: Omit<JoyrideProps, 'steps'> = {
  continuous: true,
  locale: {
    back: 'Back',
    close: 'Close',
    last: 'Done',
    next: 'Next',
    skip: 'Skip'
  },
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
