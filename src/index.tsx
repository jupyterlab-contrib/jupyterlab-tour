import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { InputDialog, ICommandPalette } from '@jupyterlab/apputils';
import { IMainMenu, MainMenu } from '@jupyterlab/mainmenu';
import { ITutorialManager } from 'jupyterlab-tutorial';
import React from 'react';
import ReactDOM from 'react-dom';
import { TourContainer } from './components';
import { CommandIDs, JP_STYLE, WELCOME_ID } from './constants';
import { addTutorials, Tutorial } from './tutorial';
import { TutorialManager } from './tutorialManager';

/**
 * Initialization data for the jupyterlab-tour extension.
 */
const extension: JupyterFrontEndPlugin<ITutorialManager> = {
  id: 'jupyterlab-tour',
  autoStart: true,
  activate,
  requires: [],
  optional: [ICommandPalette, IMainMenu],
  provides: ITutorialManager
};

function activate(
  app: JupyterFrontEnd,
  palette?: ICommandPalette,
  menu?: MainMenu
): ITutorialManager {
  const { commands } = app;

  // Create tutorial manager
  const manager = new TutorialManager(menu, {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    styles: JP_STYLE
  });

  commands.addCommand(CommandIDs.launch, {
    label: args => {
      if (args['id']) {
        const tour = manager.tutorials.get(args['id'] as string) as Tutorial;
        return tour.label;
      } else {
        return 'Launch a Tour';
      }
    },
    usage:
      'Launch a tour.\nIf no id provided, prompt the user.\nArguments {id: Tour ID}',
    execute: async args => {
      let id = args['id'] as string;

      if (!id) {
        const answer = await InputDialog.getItem({
          items: Array.from(manager.tutorials.keys()),
          title: 'Choose a tour'
        });

        if (answer.button.accept) {
          id = answer.value;
        } else {
          return;
        }
      }

      manager.launch(id);
    }
  });

  if (palette) {
    palette.addItem({
      category: 'Help',
      command: CommandIDs.launch
    });
  }

  addTutorials(manager);

  const node = document.createElement('div');
  document.body.appendChild(node);
  ReactDOM.render(
    <TourContainer tutorialLaunched={manager.tutorialLaunched} />,
    node
  );

  app.restored.then(() => {
    if (manager.tutorials.has(WELCOME_ID)) {
      // Wait 3s before launching the first tour - to be sure element are loaded
      setTimeout(() => manager.launch(WELCOME_ID), 3000);
    }
  });

  return manager;
}

export default extension;
