import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';
import {
  ICommandPalette,
  IToolbarWidgetRegistry,
  InputDialog,
  ReactWidget
} from '@jupyterlab/apputils';
import { IMainMenu, MainMenu } from '@jupyterlab/mainmenu';
import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { ConfigSection } from '@jupyterlab/services';
import { ITranslator, nullTranslator } from '@jupyterlab/translation';

import { Widget } from '@lumino/widgets';
import React from 'react';
import { TourContainer } from './components';
import { CommandIDs, NOTEBOOK_ID, WELCOME_ID } from './constants';
import { addTours } from './defaults';
import { tourIcon } from './icons';
import { TourButton } from './notebookButton';
import { NotebookTourManager } from './notebookTourManager';
import {
  DEFAULTS_PLUGIN_ID,
  INotebookTourManager,
  ITourHandler,
  ITourManager,
  ITourState,
  ITourTracker,
  IUserTourManager,
  NOTEBOOK_PLUGIN_ID,
  NS,
  PLUGIN_ID,
  USER_PLUGIN_ID
} from './tokens';
import { TourHandler } from './tour';
import { TourManager } from './tourManager';
import { UserTourManager } from './userTourManager';
import { PromiseDelegate } from '@lumino/coreutils';

/**
 * Initialization data for the jupyterlab-tour extension.
 */
const corePlugin: JupyterFrontEndPlugin<ITourManager> = {
  id: PLUGIN_ID,
  autoStart: true,
  activate,
  optional: [ICommandPalette, IMainMenu, ITranslator],
  provides: ITourManager
};

function activate(
  app: JupyterFrontEnd,
  palette: ICommandPalette | null,
  menu: MainMenu | null,
  translator: ITranslator | null
): ITourManager {
  const CONFIG_SECTION_NAME = corePlugin.id.replace(/[^\w]/g, '');
  const { commands, serviceManager } = app;

  translator = translator ?? nullTranslator;

  const restoreState = new PromiseDelegate<ITourState[]>();
  const configReady = ConfigSection.create({
    name: CONFIG_SECTION_NAME,
    serverSettings: serviceManager.serverSettings
  }).catch(error => {
    console.error('Failed to fetch state for jupyterlab-tour.', error);
  });
  const tracker: ITourTracker = Object.freeze({
    restored: restoreState.promise,
    save: async (state: ITourState[]) => {
      await restoreState.promise;
      (await configReady)?.update({ state } as any);
    }
  });

  // Create tour manager
  const manager = new TourManager({ helpMenu: menu?.helpMenu, tracker, translator });
  void Promise.all([
    app.restored,
    // Use config instead of state to store independently of the workspace
    // if a tour has been displayed or not.
    configReady
  ])
    .then(async ([_, config]) => {
      restoreState.resolve((config?.data['state'] ?? []) as any);
    })
    .catch(error => {
      console.error('Failed to load tour states.', error);
      restoreState.reject(error);
    });
  const trans = manager.translator;

  commands.addCommand(CommandIDs.launch, {
    label: args => {
      if (args['id']) {
        const tour = manager.tours.get(args['id'] as string) as TourHandler;
        return trans.__(tour.label);
      } else {
        return trans.__('Launch a Tour');
      }
    },
    icon: args =>
      (manager.tours.get(args['id'] as string) as TourHandler)?.icon || tourIcon,
    usage: trans.__(
      'Launch a tour.\nIf no id provided, prompt the user.\nArguments {id: Tour ID}'
    ),
    isEnabled: () => !manager.activeTour,
    execute: async args => {
      let id = args['id'] as string;
      const force = args['force'] === undefined ? true : (args['force'] as boolean);

      if (!id) {
        const answer = await InputDialog.getItem({
          items: Array.from(manager.tours.keys()),
          title: trans.__('Choose a tour')
        });

        if (answer.button.accept && answer.value) {
          id = answer.value;
        } else {
          return;
        }
      }

      await manager.ready;

      manager.launch([id], force);
    }
  });

  commands.addCommand(CommandIDs.addTour, {
    label: trans.__('Add a tour'),
    usage: trans.__(
      'Add a tour and returns it.\nArguments {tour: ITour}\nReturns `null` if a failure occurs.'
    ),
    execute: (args): ITourHandler | null => {
      return manager.addTour(args.tour as any);
    }
  });

  if (palette) {
    palette.addItem({
      category: trans.__('Help'),
      command: CommandIDs.launch
    });
  }

  const tourContainer = ReactWidget.create(
    <TourContainer tourLaunched={manager.tourLaunched} />
  );
  Widget.attach(tourContainer, document.body);

  return manager;
}

/**
 * Optional plugin for user-defined tours stored in the settings registry
 */
const userPlugin: JupyterFrontEndPlugin<IUserTourManager> = {
  id: USER_PLUGIN_ID,
  autoStart: true,
  activate: activateUser,
  requires: [ISettingRegistry, ITourManager],
  optional: [ITranslator],
  provides: IUserTourManager
};

function activateUser(
  app: JupyterFrontEnd,
  settings: ISettingRegistry,
  tourManager: ITourManager
): IUserTourManager {
  const manager = new UserTourManager({
    tourManager,
    getSettings: (): Promise<ISettingRegistry.ISettings> =>
      settings.load(USER_PLUGIN_ID)
  });
  return manager;
}

/**
 * Optional plugin for notebook-defined tours stored in metadata
 */
const notebookPlugin: JupyterFrontEndPlugin<INotebookTourManager> = {
  id: NOTEBOOK_PLUGIN_ID,
  autoStart: true,
  activate: activateNotebook,
  requires: [INotebookTracker, ITourManager],
  optional: [IToolbarWidgetRegistry],
  provides: INotebookTourManager
};

function activateNotebook(
  app: JupyterFrontEnd,
  nbTracker: INotebookTracker,
  tourManager: ITourManager,
  toolbarRegistry: IToolbarWidgetRegistry | null
): INotebookTourManager {
  const manager = new NotebookTourManager({
    tourManager
  });

  nbTracker.widgetAdded.connect((nbTracker, panel) =>
    manager.addNotebook(panel.content)
  );

  toolbarRegistry?.addFactory(
    'Notebook',
    NS,
    (panel: NotebookPanel) => new TourButton(panel.content, manager)
  );

  return manager;
}

/**
 * Optional plugin for the curated default tours and default toast behavior
 */
const defaultsPlugin: JupyterFrontEndPlugin<void> = {
  id: DEFAULTS_PLUGIN_ID,
  autoStart: true,
  activate: activateDefaults,
  requires: [ITourManager],
  optional: [INotebookTracker]
};

function activateDefaults(
  app: JupyterFrontEnd,
  tourManager: ITourManager,
  nbTracker?: INotebookTracker
): void {
  addTours(tourManager, app, nbTracker);

  if (
    nbTracker &&
    (app.name !== 'Jupyter Notebook' ||
      window.location.pathname.match(/\/notebooks\/.+$/))
  ) {
    nbTracker.widgetAdded.connect(() => {
      if (tourManager.tours.has(NOTEBOOK_ID)) {
        tourManager.launch([NOTEBOOK_ID], false);
      }
    });
  }

  Promise.all([app.restored, tourManager.ready]).then(() => {
    if (
      tourManager.tours.has(WELCOME_ID) &&
      (app.name !== 'Jupyter Notebook' ||
        window.location.pathname.match(/\/tree(\/.+)?$/))
    ) {
      // Wait 3s before launching the first tour - to be sure element are loaded
      setTimeout(() => tourManager.launch([WELCOME_ID], false), 3000);
    }
  });
}

export default [corePlugin, userPlugin, notebookPlugin, defaultsPlugin];
