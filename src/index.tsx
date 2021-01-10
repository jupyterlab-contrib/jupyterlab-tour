import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { ICommandPalette, InputDialog } from '@jupyterlab/apputils';
import { IMainMenu, MainMenu } from '@jupyterlab/mainmenu';
import { INotebookTracker } from '@jupyterlab/notebook';
import { IStateDB } from '@jupyterlab/statedb';
import React from 'react';
import ReactDOM from 'react-dom';
import { TourContainer } from './components';
import { CommandIDs, JP_STYLE, NOTEBOOK_ID, WELCOME_ID } from './constants';
import { addTours } from './defaults';
import { ITourHandler, ITourManager, PLUGIN_ID, StyleOptions } from './tokens';
import { TourHandler } from './tour';
import { TourManager } from './tourManager';
import { addJSONTour } from './utils';

/**
 * Initialization data for the jupyterlab-tour extension.
 */
const extension: JupyterFrontEndPlugin<ITourManager> = {
  id: `${PLUGIN_ID}:plugin`,
  autoStart: true,
  activate,
  requires: [IStateDB],
  optional: [ICommandPalette, IMainMenu, INotebookTracker],
  provides: ITourManager
};

function activate(
  app: JupyterFrontEnd,
  stateDB: IStateDB,
  palette?: ICommandPalette,
  menu?: MainMenu,
  nbTracker?: INotebookTracker
): ITourManager {
  const { commands } = app;

  // Create tour manager
  const manager = new TourManager(stateDB, menu, {
    locale: {
      back: 'Back',
      close: 'Close',
      last: 'Done',
      next: 'Next',
      skip: 'Skip'
    },
    styles: JP_STYLE as StyleOptions
  });

  commands.addCommand(CommandIDs.launch, {
    label: args => {
      if (args['id']) {
        const tour = manager.tutorials.get(args['id'] as string) as TourHandler;
        return tour.label;
      } else {
        return 'Launch a Tour';
      }
    },
    usage:
      'Launch a tour.\nIf no id provided, prompt the user.\nArguments {id: Tour ID}',
    isEnabled: () => !manager.activeTutorial,
    execute: async args => {
      let id = args['id'] as string;
      const force =
        args['force'] === undefined ? true : (args['force'] as boolean);

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

      manager.launch([id], force);
    }
  });

  commands.addCommand(CommandIDs.addTour, {
    label: 'Add a tour',
    usage:
      'Add a tour and returns it.\nArguments {tour: ITour}\nReturns `null` if a failure occurs.',
    execute: (args): ITourHandler | null => {
      return addJSONTour(manager, args.tour as any);
    }
  });

  if (palette) {
    palette.addItem({
      category: 'Help',
      command: CommandIDs.launch
    });
  }

  addTours(manager, app, nbTracker);

  const node = document.createElement('div');
  document.body.appendChild(node);
  ReactDOM.render(
    <TourContainer tourLaunched={manager.tutorialLaunched} />,
    node
  );

  if (nbTracker) {
    nbTracker.widgetAdded.connect(() => {
      if (manager.tutorials.has(NOTEBOOK_ID)) {
        manager.launch([NOTEBOOK_ID], false);
      }
    });
  }

  app.restored.then(() => {
    if (manager.tutorials.has(WELCOME_ID)) {
      // Wait 3s before launching the first tour - to be sure element are loaded
      setTimeout(() => manager.launch([WELCOME_ID], false), 3000);
    }
  });

  return manager;
}

export default extension;
