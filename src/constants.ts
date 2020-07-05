import { StyleOptions } from 'jupyterlab-tutorial';
import { Props as JoyrideProps } from 'react-joyride';

export const PLUGIN_ID = 'jupyterlab-tour';

export namespace CommandIDs {
  export const launch = `${PLUGIN_ID}:launch`;
}

export const JP_STYLE: Partial<StyleOptions> = {
  arrowColor: 'var(--jp-layout-color1)',
  backgroundColor: 'var(--jp-layout-color1)',
  overlayColor: 'var(--jp-dialog-background)',
  primaryColor: 'var(--jp-brand-color1)',
  spotlightShadow: 'var(--jp-elevation-z6)',
  textColor: 'var(--jp-ui-font-color1)'
};

export const WELCOME_ID = `${PLUGIN_ID}:welcome`;

export const TutorialDefaultOptions: Partial<JoyrideProps> = {
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
      spotlightShadow: '0 0 15px rgba(0, 0, 0, 0.5)',
      textColor: '#333',
      zIndex: 100
    }
  }
};
