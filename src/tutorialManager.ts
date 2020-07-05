import { MainMenu } from '@jupyterlab/mainmenu';
import { ISignal, Signal } from '@lumino/signaling';
import {
  ITutorial,
  ITutorialManager,
  TutorialOptions
} from 'jupyterlab-tutorial';
import { Props } from 'react-joyride';
import { Tutorial } from './tutorial';

/**
 * The TutorialManager is needed to manage creation, removal and launching of Tutorials
 */
export class TutorialManager implements ITutorialManager {
  constructor(mainMenu?: MainMenu, defaultOptions?: Partial<TutorialOptions>) {
    this._menu = mainMenu;
    this._tutorials = new Map<string, Tutorial>();

    this._defaultOptions = defaultOptions || {};
  }

  get activeTutorial(): ITutorial {
    console.warn('activeTutorial is deprecated');
    return null;
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

    return newTutorial;
  };

  async launch(...tutorials: ITutorial[]): Promise<void>;
  async launch(...tutorialIDs: string[]): Promise<void>;
  async launch(...tutorials: ITutorial[] | string[]): Promise<void> {
    if (!tutorials || tutorials.length === 0) {
      return;
    }
    let tutorialGroup: ITutorial[];

    if (typeof tutorials[0] === 'string') {
      tutorialGroup = (tutorials as string[]).map((id: string) =>
        this._tutorials.get(id)
      );
    } else {
      tutorialGroup = tutorials as ITutorial[];
    }

    this._tutorialLaunched.emit(tutorialGroup.filter(
      (tutorial: ITutorial) => tutorial && tutorial.hasSteps
    ) as Tutorial[]);
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

    const tutorial: Tutorial = this._tutorials.get(id);
    if (!tutorial) {
      return;
    }
    // Remove tutorial from the list
    this._tutorials.delete(id);
  }

  private _defaultOptions: Partial<TutorialOptions>;
  private _menu: MainMenu | undefined;
  private _tutorials: Map<string, Tutorial>;
  private _tutorialLaunched: Signal<ITutorialManager, Tutorial[]> = new Signal<
    ITutorialManager,
    Tutorial[]
  >(this);
}
