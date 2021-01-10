import { Token } from '@lumino/coreutils';
import { ISignal } from '@lumino/signaling';
import React from 'react';
import { CallBackProps, Locale, Placement, Step } from 'react-joyride';

/**
 * Extension ID
 */
export const PLUGIN_ID = 'jupyterlab-tour';

/**
 * Token to get a reference to the tours manager
 */
export const ITourManager = new Token<ITourManager>(
  `${PLUGIN_ID}:ITourManager`
);

/**
 * Step style
 */
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

/**
 * Tour options
 */
export type TourOptions = {
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

/**
 * Serialized step interface
 */
export interface IStep {
  /**
   * Step content
   */
  content: React.ReactNode;
  /**
   * CSS selector
   */
  target: string;
  /**
   * Pop-up position
   */
  placement?: Placement;
  /**
   * Pop-up title
   */
  title?: string;
}

/**
 * Serialized tour interface
 */
export interface ITour {
  /**
   * Tour unique ID
   */
  id: string;
  /**
   * Tour label
   */
  label: string;
  /**
   * Should this tour be added as entry in the Help menu
   */
  hasHelpEntry: boolean;
  /**
   * Tour steps
   */
  steps: Array<IStep>;
}

/**
 * Tour handler interface
 */
export interface ITourHandler {
  /**
   * Adds a step to the tour.
   *
   * @param step Step - The step to add to the current tour.
   */
  addStep(step: Step): void;

  /**
   * Creates a tour step and adds it to this tour.
   *
   * @param target A css selector that will specify which area/component to highlight with this step.
   * @param content The text content to use for this tour step.
   * @param placement The position of the content when it is displayed for this step.
   * @param title The title to use for the the tour step.
   */
  createAndAddStep(
    target: string,
    content: React.ReactNode,
    placement?: Placement,
    title?: string
  ): Step;

  /**
   * The index of the current step of the tour. Returns -1 if tour isn't active.
   */
  readonly currentStepIndex: number;

  /**
   * A signal emitted when all the steps of the tour have been seen and tour is finished.
   */
  readonly finished: ISignal<this, CallBackProps>;

  /**
   * True if the tour has steps, otherwise false. Launching a tour without steps is a no-op.
   */
  readonly hasSteps: boolean;

  /**
   * The id of the tour, used by the tour manager to track different tutorials.
   */
  readonly id: string;

  /**
   * Each tour can have it's behavior, attributes and css styling customized
   * by accessing and setting its options.
   */
  options: TourOptions;

  /**
   * This will replace the tour step at the specified index with a new step
   * @param index The index of the step to update.
   * @param newStep The new step that will replace the old step.
   */
  replaceStep(index: number, newStep: Step): void;

  /**
   * Removes a step from the tour, no-op if the index is out of range.
   * @param index The index of the step to remove.
   */
  removeStep(index: number): Step;

  /**
   * A signal emitted when the tour is first launched.
   */
  readonly started: ISignal<this, CallBackProps>;

  /**
   * A signal emitted when the tour step has changed.
   */
  readonly stepChanged: ISignal<this, CallBackProps>;

  /**
   * A signal emitted if the user skips or ends the tour prematurely.
   */
  readonly skipped: ISignal<this, CallBackProps>;

  /**
   * The array of steps the tour currently contains. Each step will be followed
   * in order as the tour progresses.
   */
  steps: Step[];
}

/**
 * Tours manager interface
 */
export interface ITourManager {
  /**
   * The currently active tour. undefined if no tour is currently running.
   */
  readonly activeTutorial: ITourHandler | undefined;

  /**
   * Creates an interactive TourHandler object that can be customized and run by the TourManager.
   * @param id The id used to track the tour.
   * @param label The label to use for the tour. If added to help menu, this would be the button text.
   * @param addToHelpMenu If true, the tour will be added as a button on the help menu. Default = True.
   *
   * @returns The tour created
   */
  createTutorial(
    id: string,
    label: string,
    addToHelpMenu: boolean
  ): ITourHandler;

  /**
   * Launches a tour or series of tutorials one after another in order of the array provided.
   * If the array is empty or no tutorials have steps, this will be a no-op.
   *
   * @param tutorials An array of tutorials or tutorialIDs to launch.
   * @param force Force the tour execution
   */
  launch(tutorials: ITourHandler[] | string[], force: boolean): Promise<void>;

  /**
   * Removes the tour and its associated command from the application.
   *
   * @param tour The TourHandler object or the id of the tour object to remove
   */
  removeTutorial(tour: string | ITourHandler): void;

  /**
   * A key/value map of the tutorials that the tour manager contains.
   * Key: ID of the tour, value: tour object.
   */
  readonly tutorials: Map<string, ITourHandler>;
}
