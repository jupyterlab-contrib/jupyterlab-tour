import { ISignal, Signal } from '@lumino/signaling';
import { Notification } from '@jupyterlab/apputils';
import {
  ITranslator,
  TranslationBundle,
  nullTranslator
} from '@jupyterlab/translation';
import { IDisposableMenuItem, LabIcon, RankedMenu } from '@jupyterlab/ui-components';
import { Locale } from 'react-joyride';

import { CommandIDs } from './constants';
import {
  ITour,
  ITourHandler,
  ITourManager,
  ITourManagerOptions,
  ITourState,
  ITourTracker
} from './tokens';
import { TourHandler } from './tour';
import { PromiseDelegate } from '@lumino/coreutils';

/**
 * The TourManager is needed to manage creation, removal and launching of Tutorials
 */
export class TourManager implements ITourManager {
  constructor(options: ITourManagerOptions = {}) {
    this._menu = options.helpMenu;
    this._tours = new Map<string, TourHandler>();
    this._tracker = options.tracker ?? null;
    this._translator = options.translator ?? nullTranslator;
    this._trans = this._translator.load('jupyterlab_tour');

    this._locale = {
      back: this._trans.__('Back'),
      close: this._trans.__('Close'),
      last: this._trans.__('Done'),
      next: this._trans.__('Next'),
      open: this._trans.__('Open'),
      skip: this._trans.__('Skip')
    };

    const initialize = new PromiseDelegate<void>();
    this._ready = initialize.promise;
    if (this._tracker) {
      this._tracker.restored
        .then(state => {
          this._state = state;
        })
        .finally(() => {
          // Resolve in any case so the extension works
          initialize.resolve();
        });
    } else {
      initialize.resolve();
    }
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
   * Promise that resolves when the manager state is restored.
   */
  get ready(): Promise<void> {
    return this._ready;
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
   * Extension translation bundle
   */
  get translator(): TranslationBundle {
    return this._trans;
  }

  /**
   * Creates an interactive TourHandler object that can be customized and run by the TourManager.
   * @param tour The tour to be created.
   *
   * @returns The tour created
   *
   * #### Notes
   * Tour title and steps content will go through a translation bundle if they are strings.
   */
  addTour(tour: ITour): ITourHandler | null {
    try {
      let trans = this._trans;
      if (tour.translation) {
        trans = this._translator.load(tour.translation);
      }

      const handler = this.createTour({
        id: tour.id,
        label: trans.__(tour.label),
        hasHelpEntry: tour.hasHelpEntry === false ? false : true,
        options: tour.options,
        icon: tour.icon ? LabIcon.resolve({ icon: tour.icon }) : undefined,
        version: tour.version
      });

      tour.steps.forEach(step => {
        const translatedStep = { ...step };
        if (typeof translatedStep.title === 'string') {
          translatedStep.title = trans.__(translatedStep.title);
        }
        if (typeof translatedStep.content === 'string') {
          translatedStep.content = trans.__(translatedStep.content);
        }
        handler.addStep(translatedStep);
      });

      return handler;
    } catch (error) {
      console.error(
        this._trans.__("Fail to add tour '%1' (%2)", tour.label, tour.id),
        error
      );
      return null;
    }
  }

  /**
   * Creates an interactive TourHandler object that can be customized and run by the TourManager.
   * @param id The id used to track the tour.
   * @param label The label to use for the tour. If added to help menu, this would be the button text.
   * @param addToHelpMenu If true, the tour will be added as a button on the help menu. Default = True.
   * @param options Tour options
   *
   * @returns The tour created
   *
   * #### Notes
   * The tour label will not be translated.
   */
  createTour = (
    args: Omit<ITour, 'icon' | 'steps'> & { icon?: LabIcon }
  ): ITourHandler => {
    const { id, label } = args;
    const addToHelpMenu = args.hasHelpEntry ?? true;
    const options = args.options ?? {};
    const icon = args.icon ?? null;
    const version = args.version ?? 0;

    if (this._tours.has(id)) {
      throw new Error(
        this._trans.__(
          "Error creating new tour. TourHandler id's must be unique.\nTutorial with the id: '%1' already exists.",
          id
        )
      );
    }

    // Set translation for common buttons.
    if (!options.locale) {
      options.locale = this._locale;
    }

    // Create tour and add it to help menu if needed
    const newTutorial: TourHandler = new TourHandler(id, label, options, icon, version);
    if (this._menu && addToHelpMenu) {
      const options = {
        args: {
          id: newTutorial.id
        },
        command: CommandIDs.launch
      };
      const menuItem = this._menu.addItem(options);
      this._menuItems.set(newTutorial.id, menuItem);
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
  async launch(tours: ITourHandler[] | string[], force = true): Promise<void> {
    if (!tours || tours.length === 0 || this.activeTour) {
      return Promise.resolve();
    }
    await this.ready;
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
      tourList = tourList.filter(tour =>
        tour.version >= 0
          ? this._state.findIndex(t => t.id === tour.id && t.version === tour.version) <
            0
          : !this._state.map(s => s.id).includes(tour.id)
      );
    }

    const startTours = (): void => {
      this._activeTours = tourList;
      this._tourLaunched.emit(tourList);
    };

    if (tourList.length > 0) {
      if (force) {
        startTours();
      } else {
        Notification.info(this._trans.__('Try the %1.', tourList[0].label), {
          autoClose: 10000,
          actions: [
            {
              label: this._trans.__('Start now'),
              callback: startTours
            },
            {
              label: this._trans.__("Don't show me again"),
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
    // Remove tour from menu
    if (this._menu && this._menuItems.has(id)) {
      const item = this._menuItems.get(id);
      if (item) {
        try {
          item.dispose();
        } catch (err) {
          // @ts-expect-error JupyterLab 3 syntax
          this._menu.helpMenu.menu.removeItem(item);
        }
      }
      this._menuItems.delete(id);
    }
    tour.dispose();
    // Remove tour from the list
    this._tours.delete(id);
    this._forgetDoneTour(id);
  }

  /**
   * Order a list of tours by label, if possible, falling back to unique id
   */
  sortTours(tours: ITour[]): ITour[] {
    const sortedTours = [...tours];
    sortedTours.sort(this._compareTours);
    return sortedTours;
  }

  private _forgetDoneTour = (id: string): void => {
    const stateIdx = this._state.findIndex(t => t.id === id);
    if (stateIdx >= 0) {
      this._state = this._state.splice(stateIdx, 1);
      this._tracker?.save(this._state);
    }
  };

  private _rememberDoneTour = (id: string): void => {
    const stateIdx = this._state.findIndex(t => t.id === id);
    if (stateIdx >= 0) {
      this._state[stateIdx].version = this.tours.get(id)!.version ?? -1;
    } else {
      this._state.push({
        id,
        version: this.tours.get(id)!.version ?? -1
      });
    }
    this._tracker?.save(this._state);
  };

  /**
   * Helper to sort user tours by label, if possible, falling back to unique id
   */
  private _compareTours(a: ITour, b: ITour): number {
    let transA = this.translator;
    if (a.translation) {
      transA = this._translator.load(a.translation);
    }
    let transB = this.translator;
    if (b.translation) {
      transB = this._translator.load(b.translation);
    }
    return (
      transA
        .__(a.label)
        .toLocaleLowerCase()
        .localeCompare(transB.__(b.label).toLocaleLowerCase()) ||
      a.id.localeCompare(b.id)
    );
  }

  private _activeTours: TourHandler[] = new Array<TourHandler>();
  private _isDisposed = false;
  private _locale: Locale;
  private _menu: RankedMenu | undefined;
  private _menuItems: Map<string, IDisposableMenuItem> = new Map();
  private _ready: Promise<void>;
  private _state: ITourState[] = [];
  private _tracker: ITourTracker | null;
  private _trans: TranslationBundle;
  private _translator: ITranslator;
  private _tours: Map<string, TourHandler>;
  private _tourLaunched: Signal<ITourManager, TourHandler[]> = new Signal<
    ITourManager,
    TourHandler[]
  >(this);
}
