import { MainMenu } from '@jupyterlab/mainmenu';
import { IStateDB } from '@jupyterlab/statedb';
import { ISignal, Signal } from '@lumino/signaling';
import { INotification } from 'jupyterlab_toastify';
import { Props } from 'react-joyride';
import { CommandIDs } from './constants';
import { ITourHandler, ITourManager, PLUGIN_ID, TourOptions } from './tokens';
import { TourHandler } from './tour';
import { version } from './version';

const STATE_ID = `${PLUGIN_ID}:state`;

/**
 * Manager state saved in the state database
 */
interface IManagerState {
  /**
   * Set of seen tour IDs
   */
  tutorialsDone: Set<string>;
  /**
   * Tour extension version
   */
  version: string;
}

/**
 * The TourManager is needed to manage creation, removal and launching of Tutorials
 */
export class TourManager implements ITourManager {
  constructor(
    stateDB: IStateDB,
    mainMenu?: MainMenu,
    defaultOptions?: Partial<TourOptions>
  ) {
    this._stateDB = stateDB;
    this._menu = mainMenu;
    this._tutorials = new Map<string, TourHandler>();

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

  get activeTutorial(): ITourHandler | undefined {
    const activeTutorial = this._activeTutorials.filter(tour =>
      tour.isRunning()
    );
    return activeTutorial[0];
  }

  /**
   * Signal emit with the launched tour
   */
  get tutorialLaunched(): ISignal<ITourManager, TourHandler[]> {
    return this._tutorialLaunched;
  }

  get tutorials(): Map<string, ITourHandler> {
    return this._tutorials;
  }

  createTutorial = (
    id: string,
    label: string,
    addToHelpMenu = true
  ): ITourHandler => {
    if (this._tutorials.has(id)) {
      throw new Error(
        `Error creating new tour. TourHandler id's must be unique.\nTutorial with the id: '${id}' already exists.`
      );
    }

    // Create tour and add it to help menu if needed
    const { styles, ...others } = this._defaultOptions;
    const options: Partial<Props> = others;
    options.styles = { options: styles };
    const newTutorial: TourHandler = new TourHandler(id, label, options);
    if (this._menu && addToHelpMenu) {
      this._menu.helpMenu.menu.addItem({
        args: {
          id: newTutorial.id
        },
        command: CommandIDs.launch
      });
    }

    // Add tour to current set
    this._tutorials.set(id, newTutorial);

    const done = (tour: TourHandler): void => {
      this._rememberDoneTutorial(tour.id);
    };
    newTutorial.skipped.connect(done);
    newTutorial.finished.connect(done);

    return newTutorial;
  };

  launch(tutorials: ITourHandler[] | string[], force = true): Promise<void> {
    if (!tutorials || tutorials.length === 0 || this.activeTutorial) {
      return Promise.resolve();
    }
    let tutorialGroup: Array<ITourHandler | undefined>;

    if (typeof tutorials[0] === 'string') {
      tutorialGroup = (tutorials as string[]).map((id: string) =>
        this._tutorials.get(id)
      );
    } else {
      tutorialGroup = tutorials as ITourHandler[];
    }

    let tutorialList = tutorialGroup.filter(
      (tour: ITourHandler | undefined) => tour && tour.hasSteps
    ) as TourHandler[];

    if (!force) {
      tutorialList = tutorialList.filter(
        tour => !this._state.tutorialsDone.has(tour.id)
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

  removeTutorial(t: string | ITourHandler): void {
    if (!t) {
      return;
    }

    let id: string;
    if (typeof t === 'string') {
      id = t;
    } else {
      id = t.id;
    }

    const tour: TourHandler | undefined = this._tutorials.get(id);
    if (!tour) {
      return;
    }
    // Remove tour from the list
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

  private _activeTutorials: TourHandler[] = new Array<TourHandler>();
  private _defaultOptions: Partial<TourOptions>;
  private _menu: MainMenu | undefined;
  private _state: IManagerState = {
    tutorialsDone: new Set<string>(),
    version
  };
  private _stateDB: IStateDB;
  private _tutorials: Map<string, TourHandler>;
  private _tutorialLaunched: Signal<ITourManager, TourHandler[]> = new Signal<
    ITourManager,
    TourHandler[]
  >(this);
}
