import { MainMenu } from '@jupyterlab/mainmenu';
import { IStateDB } from '@jupyterlab/statedb';
import { ISignal, Signal } from '@lumino/signaling';
import { INotification } from 'jupyterlab_toastify';
import { Props as JoyrideProps } from 'react-joyride';
import { CommandIDs } from './constants';
import { ITourHandler, ITourManager, PLUGIN_ID } from './tokens';
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
  toursDone: Set<string>;
  /**
   * Tour extension version
   */
  version: string;
}

/**
 * The TourManager is needed to manage creation, removal and launching of Tutorials
 */
export class TourManager implements ITourManager {
  constructor(stateDB: IStateDB, mainMenu?: MainMenu) {
    this._stateDB = stateDB;
    this._menu = mainMenu;
    this._tours = new Map<string, TourHandler>();

    this._stateDB.fetch(STATE_ID).then(value => {
      if (value) {
        const savedState = (value as any) as IManagerState;
        if (savedState.version !== version) {
          this._state.toursDone = new Set<string>();
          this._stateDB.save(STATE_ID, {
            version,
            toursDone: []
          });
        } else {
          this._state.toursDone = new Set<string>([...savedState.toursDone]);
        }
      }
    });
  }

  /**
   * The currently active tour. undefined if no tour is currently running.
   */
  get activeTour(): ITourHandler | undefined {
    const activeTour = this._activeTours.filter(tour => tour.isRunning());
    return activeTour[0];
  }

  /**
   * Whether the tour manager is disposed.
   */
  get isDisposed(): boolean {
    return this._isDisposed;
  }

  /**
   * Signal emit with the launched tour
   */
  get tourLaunched(): ISignal<ITourManager, TourHandler[]> {
    return this._tourLaunched;
  }

  /**
   * A key/value map of the tours that the tour manager contains.
   * Key: ID of the tour, value: tour object.
   */
  get tours(): Map<string, ITourHandler> {
    return this._tours;
  }

  /**
   * Creates an interactive TourHandler object that can be customized and run by the TourManager.
   * @param id The id used to track the tour.
   * @param label The label to use for the tour. If added to help menu, this would be the button text.
   * @param addToHelpMenu If true, the tour will be added as a button on the help menu. Default = True.
   * @param options Tour options
   *
   * @returns The tour created
   */
  createTour = (
    id: string,
    label: string,
    addToHelpMenu = true,
    options: Omit<JoyrideProps, 'steps'> = {}
  ): ITourHandler => {
    if (this._tours.has(id)) {
      throw new Error(
        `Error creating new tour. TourHandler id's must be unique.\nTutorial with the id: '${id}' already exists.`
      );
    }

    // Create tour and add it to help menu if needed
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
    this._tours.set(id, newTutorial);

    const done = (tour: TourHandler): void => {
      this._rememberDoneTour(tour.id);
    };
    newTutorial.skipped.connect(done);
    newTutorial.finished.connect(done);

    return newTutorial;
  };

  /**
   * Dispose the tour manager.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this._isDisposed = true;
    Signal.clearData(this);
  }

  /**
   * Launches a tour or series of tours one after another in order of the array provided.
   * If the array is empty or no tours have steps, this will be a no-op.
   *
   * @param tours An array of tours or tutorialIDs to launch.
   * @param force Force the tour execution
   */
  launch(tours: ITourHandler[] | string[], force = true): Promise<void> {
    if (!tours || tours.length === 0 || this.activeTour) {
      return Promise.resolve();
    }
    let tourGroup: Array<ITourHandler | undefined>;

    if (typeof tours[0] === 'string') {
      tourGroup = (tours as string[]).map((id: string) => this._tours.get(id));
    } else {
      tourGroup = tours as ITourHandler[];
    }

    let tourList = tourGroup.filter(
      (tour: ITourHandler | undefined) => tour && tour.hasSteps
    ) as TourHandler[];

    if (!force) {
      tourList = tourList.filter(tour => !this._state.toursDone.has(tour.id));
    }

    const startTours = (): void => {
      this._activeTours = tourList;
      this._tourLaunched.emit(tourList);
    };

    if (tourList.length > 0) {
      if (force) {
        startTours();
      } else {
        INotification.info(`Try the ${tourList[0].label}.`, {
          autoClose: 10000,
          buttons: [
            {
              label: 'Start now',
              callback: startTours
            },
            {
              label: "Don't show me again",
              callback: (): void => {
                tourList.forEach(tour => this._rememberDoneTour(tour.id));
              }
            }
          ]
        });
      }
    }

    return Promise.resolve();
  }

  /**
   * Removes the tour and its associated command from the application.
   *
   * @param tour The TourHandler object or the id of the tour object to remove
   */
  removeTour(t: string | ITourHandler): void {
    if (!t) {
      return;
    }

    let id: string;
    if (typeof t === 'string') {
      id = t;
    } else {
      id = t.id;
    }

    const tour: TourHandler | undefined = this._tours.get(id);
    if (!tour) {
      return;
    }
    tour.dispose();
    // Remove tour from the list
    this._tours.delete(id);
    this._forgetDoneTour(id);
  }

  private _forgetDoneTour = (id: string): void => {
    this._state.toursDone.delete(id);
    this._stateDB.save(STATE_ID, {
      toursDone: [...this._state.toursDone],
      version
    });
  };

  private _rememberDoneTour = (id: string): void => {
    this._state.toursDone.add(id);
    this._stateDB.save(STATE_ID, {
      toursDone: [...this._state.toursDone],
      version
    });
  };

  private _activeTours: TourHandler[] = new Array<TourHandler>();
  private _isDisposed = false;
  private _menu: MainMenu | undefined;
  private _state: IManagerState = {
    toursDone: new Set<string>(),
    version
  };
  private _stateDB: IStateDB;
  private _tours: Map<string, TourHandler>;
  private _tourLaunched: Signal<ITourManager, TourHandler[]> = new Signal<
    ITourManager,
    TourHandler[]
  >(this);
}
