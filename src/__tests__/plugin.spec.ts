import 'jest';
import plugin from '../index';
import { CommandRegistry } from '@lumino/commands';
import { StateDB } from '@jupyterlab/statedb';
import { CommandIDs } from '../constants';
import { ITutorialManager, ITutorial } from 'jupyterlab-tutorial';

const DEFAULT_TOURS_SIZE = 2;

describe('plugin', () => {
  describe('#activate', () => {
    it('it should create add-tour command', () => {
      const app = {
        commands: new CommandRegistry(),
        restored: Promise.resolve()
      };
      const stateDB = new StateDB();
      plugin.activate(app as any, stateDB);

      expect(app.commands.hasCommand(CommandIDs.addTour)).toEqual(true);
    });
  });

  describe('commands', () => {
    describe(`${CommandIDs.addTour}`, () => {
      it('it should add a tour command', async () => {
        const app = {
          commands: new CommandRegistry(),
          restored: Promise.resolve()
        };
        const stateDB = new StateDB();
        const manager = plugin.activate(
          app as any,
          stateDB
        ) as ITutorialManager;
        expect(manager.tutorials.size).toEqual(DEFAULT_TOURS_SIZE);

        const tour = (await app.commands.execute(CommandIDs.addTour, {
          tour: {
            id: 'test-jupyterlab-tour:welcome',
            label: 'Welcome Tour',
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
              }
            ]
          }
        })) as ITutorial;

        expect(manager.tutorials.size).toEqual(DEFAULT_TOURS_SIZE + 1);
        expect(tour).toBeTruthy();
        expect(manager.tutorials.get(tour.id)).toBeTruthy();
      });
    });
  });
});
