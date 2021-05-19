import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { ITranslator, nullTranslator } from '@jupyterlab/translation';
import { PromiseDelegate } from '@lumino/coreutils';
import {
  ITour,
  ITourManager,
  IUserTourManager,
  USER_PLUGIN_ID
} from './tokens';

/**
 * The UserTourManager is needed to manage syncing of user settings with the TourManager
 */
export class UserTourManager implements IUserTourManager {
  constructor(options: IUserTourManager.IOptions) {
    this._tourManager = options.tourManager;
    this._translator = options.translator ?? nullTranslator;

    options
      .getSettings()
      .then(userTours => {
        this._userTours = userTours;
        this._userTours.changed.connect(this._userToursChanged, this);
        this._userToursChanged();
        this._ready.resolve();
      })
      .catch(reason => {
        console.warn(reason);
        this._ready.reject(reason);
      });
  }

  /**
   * A promise that resolves when the settings have been loaded.
   */
  get ready(): Promise<void> {
    return this._ready.promise;
  }

  get tourManager(): ITourManager {
    return this._tourManager;
  }

  /**
   * The user changed their tours, remove and re-add all of them.
   */
  private _userToursChanged(): void {
    const tours: ITour[] = [...(this._userTours?.composite?.tours as any)];

    if (!tours) {
      return;
    }

    for (const id of this._tourManager.tours.keys()) {
      if (id.startsWith(USER_PLUGIN_ID)) {
        this._tourManager.removeTour(id);
      }
    }

    tours.sort(this._compareTours);

    for (const tour of tours) {
      try {
        this._addUserTour(tour);
        this._tourManager.launch([tour.id], false);
      } catch (error) {
        const trans = this._tourManager.translator;
        console.groupCollapsed(
          trans.__(
            'Error encountered adding user tour %1 (%2)',
            tour.label,
            tour.id
          ),
          error
        );
        console.table(tour.steps);
        console.log(tour.options || {});
        console.groupEnd();
      }
    }
  }

  /**
   * Actually create a tour from JSON
   */
  private _addUserTour(tour: ITour): void {
    this._tourManager.addTour({ ...tour, id: `${USER_PLUGIN_ID}:${tour.id}` });
  }

  /**
   * Helper to sort user tours by label, if possible, falling back to unique id
   */
  private _compareTours(a: ITour, b: ITour): number {
    let transA = this._tourManager.translator;
    if (a.translation) {
      transA = this._translator.load(a.translation);
    }
    let transB = this._tourManager.translator;
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

  private _ready = new PromiseDelegate<void>();
  private _tourManager: ITourManager;
  private _translator: ITranslator;
  private _userTours: ISettingRegistry.ISettings | null = null;
}
