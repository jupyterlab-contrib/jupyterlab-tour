import { StyleOptions } from 'jupyterlab-tutorial';
import { Props as JoyrideProps } from 'react-joyride';
import { ITutorial } from './interfaces';

export namespace CommandIDs {
  export const launch = 'jupyterlab-tutorial:launch';
}

export const JP_STYLE: Partial<StyleOptions> = {
  arrowColor: 'var(--jp-layout-color1)',
  backgroundColor: 'var(--jp-layout-color1)',
  overlayColor: 'var(--jp-dialog-background)',
  primaryColor: 'var(--jp-brand-color1)',
  spotlightShadow: 'var(--jp-elevation-z6)',
  textColor: 'var(--jp-ui-font-color1)'
};

export const WELCOME_ID = 'jupyterlab-tour:welcome';

export const tutorials: Array<ITutorial> = [
  {
    id: WELCOME_ID,
    label: 'Welcome Tour',
    hasHelpEntry: true,
    steps: [
      {
        content:
          'The following tutorial will point out some of the main UI components within JupyterLab.',
        placement: 'center',
        target: '#jp-main-dock-panel',
        title: 'Welcome to Jupyter Lab!'
      },
      {
        content:
          'This is the main content area where notebooks and other content can be viewed and edited.',
        placement: 'left-end',
        target: '#jp-main-dock-panel',
        title: 'Main Content'
      },
      {
        content: 'This is the top menu bar where you can access several menus.',
        placement: 'bottom',
        target: '#jp-MainMenu',
        title: 'Top Menu Options'
      },
      {
        content:
          'This is the left side menu bar where you can switch between functional panels.',
        placement: 'right',
        target: '.jp-SideBar.jp-mod-left',
        title: 'Left Side Bar'
      }
    ]
  },
  {
    id: 'jupyterlab-tour:welcome2',
    label: 'Welcome2 Tour-',
    hasHelpEntry: true,
    steps: [
      {
        content:
          'The following tutorial point out some of the main UI components within JupyterLab.',
        placement: 'center',
        target: '#jp-main-dock-panel',
        title: 'Welcome pto Jupyter Lab!'
      },
      {
        content:
          'This is the main content area where notebooks and other content can be viewed and edited.',
        placement: 'left-end',
        target: '#jp-main-dock-panel',
        title: 'Main Content'
      },
      {
        content: 'This is the top menu bar where you can access several menus.',
        placement: 'bottom',
        target: '#jp-MainMenu',
        title: 'Top Menu Options'
      },
      {
        content:
          'This is the left side menu bar where you can switch between functional panels.',
        placement: 'right',
        target: '.jp-SideBar.jp-mod-left',
        title: 'Left Side Bar'
      }
    ]
  }
];

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
