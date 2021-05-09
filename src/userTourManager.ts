import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { PromiseDelegate } from '@lumino/coreutils';

import {
  IUserTourManager,
  ITour,
  ITourManager,
  USER_PLUGIN_ID
} from './tokens';

/**
 * The UserTourManager is needed to manage syncing of user settings with the TourManager
 */
export class UserTourManager implements IUserTourManager {
  constructor(options: IUserTourManager.IOptions) {
    this._tourManager = options.tourManager;
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
        console.groupCollapsed(
          `Error encountered adding user tour ${tour.label} (${tour.id})`,
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
    const handler = this._tourManager.createTour(
      `${USER_PLUGIN_ID}:${tour.id}`,
      tour.label,
      tour.hasHelpEntry === false ? false : true,
      tour.options
    );

    for (const step of tour.steps) {
      handler.addStep(step);
    }
  }

  /**
   * Helper to sort user tours by label, if possible, falling back to unique id
   */
  private _compareTours(a: ITour, b: ITour): number {
    return (
      a.label.toLocaleLowerCase().localeCompare(b.label.toLocaleLowerCase()) ||
      a.id.localeCompare(b.id)
    );
  }

  private _tourManager: ITourManager;
  private _userTours: ISettingRegistry.ISettings;
  private _ready = new PromiseDelegate<void>();
}
