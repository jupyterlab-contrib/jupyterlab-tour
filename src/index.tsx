import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { IMainMenu, MainMenu } from '@jupyterlab/mainmenu';
import { ITutorialManager } from 'jupyterlab-tutorial';
import React from 'react';
import ReactDOM from 'react-dom';
import { TourContainer } from './components';
import { addTutorials } from './tutorial';
import { TutorialManager } from './tutorialManager';

/**
 * Initialization data for the jupyterlab-tour extension.
 */
const extension: JupyterFrontEndPlugin<ITutorialManager> = {
  id: 'jupyterlab-tour',
  autoStart: true,
  activate,
  requires: [IMainMenu],
  provides: ITutorialManager
};

function activate(app: JupyterFrontEnd, menu: MainMenu): ITutorialManager {
  // Create tutorial manager
  const tutorialManager = new TutorialManager(app, menu, {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    styles: {
      arrowColor: 'var(--jp-layout-color1)',
      backgroundColor: 'var(--jp-layout-color1)',
      overlayColor: 'var(--jp-dialog-background)',
      primaryColor: 'var(--jp-brand-color1)',
      spotlightShadow: 'var(--jp-elevation-z6)',
      textColor: 'var(--jp-ui-font-color1)'
    }
  });

  addTutorials(tutorialManager);

  const node = document.createElement('div');
  document.body.appendChild(node);
  ReactDOM.render(
    <TourContainer tutorialLaunched={tutorialManager.tutorialLaunched} />,
    node
  );

  app.restored.then(() => {
    // Wait 3s before launching the first tour - to be sure element are loaded
    setTimeout(() => tutorialManager.launch('jupyterlab-tour:welcome'), 3000);
  });

  return tutorialManager;
}

export default extension;
