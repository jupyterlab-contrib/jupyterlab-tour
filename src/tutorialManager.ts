import { MainMenu } from '@jupyterlab/mainmenu';
import { IStateDB } from '@jupyterlab/statedb';
import { ISignal, Signal } from '@lumino/signaling';
import { INotification } from 'jupyterlab_toastify';
import { Props } from 'react-joyride';
import {
  ITutorial,
  ITutorialManager,
  PLUGIN_ID,
  TutorialOptions
} from './tokens';
import { Tutorial } from './tutorial';
import { version } from './version';

const STATE_ID = `${PLUGIN_ID}:state`;

/**
 * Manager state saved in the state database
 */
interface IManagerState {
  /**
   * Set of seen tutorial IDs
   */
  tutorialsDone: Set<string>;
  /**
   * Tour extension version
   */
  version: string;
}

/**
 * The TutorialManager is needed to manage creation, removal and launching of Tutorials
 */
export class TutorialManager implements ITutorialManager {
  constructor(
    stateDB: IStateDB,
    mainMenu?: MainMenu,
    defaultOptions?: Partial<TutorialOptions>
  ) {
    this._stateDB = stateDB;
    this._menu = mainMenu;
    this._tutorials = new Map<string, Tutorial>();

    this._defaultOptions = defaultOptions || {};

    this._stateDB.fetch(STATE_ID).then(value => {
      if (value) {
        const savedState = (value as any) as IManagerState;
        if (savedState.version !== version) {
          this._state.tutorialsDone = new Set<string>();
          this._stateDB.save(STATE_ID, {
            version,
            tutorialsDone: []
          });
        } else {
          this._state.tutorialsDone = new Set<string>([
            ...savedState.tutorialsDone
          ]);
        }
      }
    });
  }

  get activeTutorial(): ITutorial {
    const activeTutorial = this._activeTutorials.filter(tutorial =>
      tutorial.isRunning()
    );
    return activeTutorial[0];
  }

  /**
   * Signal emit with the launched tutorial
   */
  get tutorialLaunched(): ISignal<ITutorialManager, Tutorial[]> {
    return this._tutorialLaunched;
  }

  get tutorials(): Map<string, ITutorial> {
    return this._tutorials;
  }

  createTutorial = (
    id: string,
    label: string,
    addToHelpMenu = true
  ): ITutorial => {
    if (this._tutorials.has(id)) {
      throw new Error(
        `Error creating new tutorial. Tutorial id's must be unique.\nTutorial with the id: '${id}' already exists.`
      );
    }

    // Create tutorial and add it to help menu if needed
    const { styles, ...others } = this._defaultOptions;
    const options: Partial<Props> = others;
    options.styles = { options: styles };
    const newTutorial: Tutorial = new Tutorial(id, label, options);
    if (this._menu && addToHelpMenu) {
      newTutorial.addTutorialToMenu(this._menu.helpMenu.menu);
    }

    // Add tutorial to current set
    this._tutorials.set(id, newTutorial);

    const done = (tutorial: Tutorial): void => {
      this._rememberDoneTutorial(tutorial.id);
    };
    newTutorial.skipped.connect(done);
    newTutorial.finished.connect(done);

    return newTutorial;
  };

  launchConditionally(
    tutorials: ITutorial[] | string[],
    force = true
  ): Promise<void> {
    if (!tutorials || tutorials.length === 0 || this.activeTutorial) {
      return Promise.resolve();
    }
    let tutorialGroup: Array<ITutorial | undefined>;

    if (typeof tutorials[0] === 'string') {
      tutorialGroup = (tutorials as string[]).map((id: string) =>
        this._tutorials.get(id)
      );
    } else {
      tutorialGroup = tutorials as ITutorial[];
    }

    let tutorialList = tutorialGroup.filter(
      (tutorial: ITutorial | undefined) => tutorial && tutorial.hasSteps
    ) as Tutorial[];

    if (!force) {
      tutorialList = tutorialList.filter(
        tutorial => !this._state.tutorialsDone.has(tutorial.id)
      );
    }

    const startTours = (): void => {
      this._activeTutorials = tutorialList;
      this._tutorialLaunched.emit(tutorialList);
    };

    if (tutorialList.length > 0) {
      if (force) {
        startTours();
      } else {
        INotification.info(`Try the ${tutorialList[0].label}.`, {
          autoClose: 10000,
          buttons: [
            {
              label: 'Start now',
              callback: startTours
            },
            {
              label: "Don't show me again",
              callback: (): void => {
                tutorialList.forEach(tour =>
                  this._rememberDoneTutorial(tour.id)
                );
              }
            }
          ]
        });
      }
    }

    return Promise.resolve();
  }

  async launch(...tutorials: ITutorial[]): Promise<void>;
  async launch(...tutorialIDs: string[]): Promise<void>;
  async launch(...tutorials: ITutorial[] | string[]): Promise<void> {
    this.launchConditionally(tutorials);
  }

  removeTutorial(tutorial: ITutorial): void;
  removeTutorial(tutorialID: string): void;
  removeTutorial(t: string | ITutorial): void {
    if (!t) {
      return;
    }

    let id: string;
    if (typeof t === 'string') {
      id = t;
    } else {
      id = t.id;
    }

    const tutorial: Tutorial | undefined = this._tutorials.get(id);
    if (!tutorial) {
      return;
    }
    // Remove tutorial from the list
    this._tutorials.delete(id);
    this._forgetDoneTutorial(id);
  }

  private _forgetDoneTutorial = (id: string): void => {
    this._state.tutorialsDone.delete(id);
    this._stateDB.save(STATE_ID, {
      tutorialsDone: [...this._state.tutorialsDone],
      version
    });
  };

  private _rememberDoneTutorial = (id: string): void => {
    this._state.tutorialsDone.add(id);
    this._stateDB.save(STATE_ID, {
      tutorialsDone: [...this._state.tutorialsDone],
      version
    });
  };

  private _activeTutorials: Tutorial[] = new Array<Tutorial>();
  private _defaultOptions: Partial<TutorialOptions>;
  private _menu: MainMenu | undefined;
  private _state: IManagerState = {
    tutorialsDone: new Set<string>(),
    version
  };
  private _stateDB: IStateDB;
  private _tutorials: Map<string, Tutorial>;
  private _tutorialLaunched: Signal<ITutorialManager, Tutorial[]> = new Signal<
    ITutorialManager,
    Tutorial[]
  >(this);
}
