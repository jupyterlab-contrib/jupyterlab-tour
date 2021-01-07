import { Token } from '@lumino/coreutils';
import { ISignal } from '@lumino/signaling';
import { Menu } from '@lumino/widgets';
import { CallBackProps, Placement, Step, Locale } from 'react-joyride';

export const PLUGIN_ID = 'jupyterlab-tour';

export const ITutorialManager = new Token<ITutorialManager>(
  `${PLUGIN_ID}:ITutorialManager`
);

export type StyleOptions = {
  arrowColor: string;
  backgroundColor: string;
  beaconSize: number;
  overlayColor: string;
  primaryColor: string;
  spotlightShadow: string;
  textColor: string;
  width: number;
  zIndex: number;
};

export type TutorialOptions = {
  continuous: boolean;
  debug: boolean;
  disableCloseOnEsc: boolean;
  disableOverlay: boolean;
  disableOverlayClose: boolean;
  disableScrolling: boolean;
  hideBackButton: boolean;
  locale: Locale;
  scrollOffset: number;
  scrollToFirstStep: boolean;
  showProgress: boolean;
  showSkipButton: boolean;
  spotlightClicks: boolean;
  spotlightPadding: number;
  styles: StyleOptions;
};

export interface ITutorial {
  /**
   * Adds a step to the tutorial.
   * @param step Step - The step to add to the current tutorial.
   */
  addStep(step: Step): void;
  /**
   * Adds the tutorial command to the specified menu. Note: The label used when
   * the tutorial was created will be the text of the button added to the menu.
   * @param menu The menu to add a tutorial button to.
   */
  addTutorialToMenu(menu: Menu): Menu.IItem;
  /** The ID of the command that will launch the tutorial. */
  readonly commandID: string;
  /**
   * Creates a tutorial step and adds it to this tutorial.
   * @param target A css selector that will specify which area/component to highlight with this step.
   * @param content The text content to use for this tutorial step.
   * @param placement The position of the content when it is displayed for this step.
   * @param title The title to use for the the tutorial step.
   */
  createAndAddStep(
    target: string,
    content: string,
    placement?: Placement,
    title?: string
  ): Step;

  /**
   * The index of the current step of the tutorial. Returns -1 if tutorial isn't active.
   */
  readonly currentStepIndex: number;

  /**
   * A signal emitted when all the steps of the tutorial have been seen and tutorial is finished.
   */
  readonly finished: ISignal<this, CallBackProps>;

  /**
   * True if the tutorial has steps, otherwise false. Launching a tutorial without steps is a no-op.
   */
  readonly hasSteps: boolean;

  /**
   * The id of the tutorial, used by the tutorial manager to track different tutorials.
   */
  readonly id: string;

  /**
   * Each tutorial can have it's behavior, attributes and css styling customized
   * by accessing and setting its options.
   */
  options: TutorialOptions;

  /**
   * This will replace the tutorial step at the specified index with a new step
   * @param index The index of the step to update.
   * @param newStep The new step that will replace the old step.
   */
  replaceStep(index: number, newStep: Step): void;

  /**
   * Will remove the tutorial from the specified menu so that its button is no longer there.
   * @param menu The menu to remove the tutorial from. this is a no-op ff the tutorial is not in the menu.
   */
  removeTutorialFromMenu(menu: Menu): void;

  /**
   * Removes a step from the tutorial, no-op if the index is out of range.
   * @param index The index of the step to remove.
   */
  removeStep(index: number): Step;

  /**
   * A signal emitted when the tutorial is first launched.
   */
  readonly started: ISignal<this, CallBackProps>;

  /**
   * A signal emitted when the tutorial step has changed.
   */
  readonly stepChanged: ISignal<this, CallBackProps>;

  /**
   * A signal emitted if the user skips or ends the tutorial prematurely.
   */
  readonly skipped: ISignal<this, CallBackProps>;

  /**
   * The array of steps the tutorial currently contains. Each step will be followed
   * in order as the tutorial progresses.
   */
  steps: Step[];
}

export interface ITutorialManager {
  /**
   * The currently active tutorial. Null if no tutorial is currently running.
   */
  readonly activeTutorial: ITutorial;

  /**
   * Creates an interactive Tutorial object that can be customized and run by the TutorialManager.
   * @param id The id used to track the tutorial.
   * @param label The label to use for the tutorial. If added to help menu, this would be the button text.
   * @param addToHelpMenu If true, the tutorial will be added as a button on the help menu. Default = True.
   */
  createTutorial(id: string, label: string, addToHelpMenu: boolean): ITutorial;

  /**
   * Launches a tutorial or series of tutorials one after another in order of the array provided.
   * If the array is empty or no tutorials have steps, this will be a no-op.
   * @param tutorials An array of tutorials or tutorialIDs to launch.
   */
  launch(...tutorials: ITutorial[]): Promise<void>;
  launch(...tutorialIDs: string[]): Promise<void>;
  launch(...tutorials: ITutorial[] | string[]): Promise<void>;

  /**
   * Removes the tutorial and its associated command from the application.
   * @param tutorial The Tutorial object or the id of the tutorial object to remove
   */
  removeTutorial(tutorial: ITutorial): void;
  removeTutorial(tutorialID: string): void;
  removeTutorial(tutorial: string | ITutorial): void;

  /**
   * A key/value map of the tutorials that the tutorial manager contains.
   * Key: ID of the tutorial, value: tutorial object.
   */
  readonly tutorials: Map<string, ITutorial>;
}
