import { JSONExt } from '@lumino/coreutils';
import { ISignal, Signal } from '@lumino/signaling';
import {
  CallBackProps,
  Placement,
  Props as JoyrideProps,
  status,
  STATUS,
  Step,
  valueof
} from 'react-joyride';
import { TutorialDefaultOptions } from './constants';
import { ITourHandler } from './tokens';

// TODO should be IDisposable !! handling signal connection clearance
export class TourHandler implements ITourHandler {
  constructor(
    id: string,
    label: string,
    options?: Omit<JoyrideProps, 'steps'>
  ) {
    this._label = label;
    this._id = id;
    const { styles, ...others } = options;
    this._options = { ...TutorialDefaultOptions, ...others };
    this._options.styles.options = {
      ...(this._options.styles.options || {}),
      ...(styles?.options || {})
    };
  }

  get currentStepIndex(): number {
    return this._currentStepIndex;
  }

  get finished(): ISignal<this, CallBackProps> {
    return this._finished;
  }

  get hasSteps(): boolean {
    return this.steps.length > 0;
  }

  get id(): string {
    return this._id;
  }

  get label(): string {
    return this._label;
  }

  get options(): Omit<JoyrideProps, 'steps'> {
    return this._options;
  }

  set options(options: Omit<JoyrideProps, 'steps'>) {
    this._options = JSONExt.deepCopy(options as any) as any;
  }

  get skipped(): ISignal<this, CallBackProps> {
    return this._skipped;
  }

  get started(): ISignal<this, CallBackProps> {
    return this._started;
  }

  get stepChanged(): ISignal<this, CallBackProps> {
    return this._stepChanged;
  }

  get steps(): Step[] {
    return this._steps;
  }

  set steps(steps: Step[]) {
    this._steps = steps;
  }

  addStep(step: Step): void {
    if (step) {
      this.steps.push(step);
    }
  }

  isRunning(): boolean {
    return this._currentStepIndex >= 0;
  }

  handleTourEvent = (data: CallBackProps): void => {
    if (!data) {
      return;
    }
    const { status, step, index } = data;

    // Handle status changes when they occur
    if (status !== this._previousStatus) {
      this._previousStatus = status;
      this._currentStepIndex = -1;
      if (status === STATUS.FINISHED) {
        this._finished.emit(data);
      } else if (status === STATUS.SKIPPED) {
        this._skipped.emit(data);
      } else if (status === STATUS.RUNNING) {
        this._currentStepIndex = 0;
        this._started.emit(data);
      } else if (status === STATUS.ERROR) {
        console.error(`An error occurred with the tour at step: ${step}`);
      }
    }

    // Emit step change event
    if (status === STATUS.RUNNING) {
      if (index !== this._previousStepIndex) {
        this._previousStepIndex = index;
        this._currentStepIndex = data.index;
      }
      this._stepChanged.emit(data);
    }
  };

  createAndAddStep(
    target: string,
    content: React.ReactNode,
    placement?: Placement,
    title?: string
  ): Step {
    const newStep: Step = {
      title,
      placement,
      target,
      content
    };
    this.addStep(newStep);
    return newStep;
  }

  replaceStep(index: number, newStep: Step): void {
    if (index < 0 || index >= this.steps.length) {
      return;
    }
    const updatedSteps: Step[] = this._steps;
    updatedSteps[index] = newStep;
    this.steps = updatedSteps;
  }

  removeStep(index: number): Step {
    if (index < 0 || index >= this.steps.length) {
      return null;
    }
    return this.steps.splice(index, 1)[0];
  }

  private _skipped: Signal<this, CallBackProps> = new Signal<
    this,
    CallBackProps
  >(this);
  private _finished: Signal<this, CallBackProps> = new Signal<
    this,
    CallBackProps
  >(this);
  private _started: Signal<this, CallBackProps> = new Signal<
    this,
    CallBackProps
  >(this);
  private _stepChanged: Signal<this, CallBackProps> = new Signal<
    this,
    CallBackProps
  >(this);

  private _currentStepIndex = -1;
  private _id: string;
  private _label: string;
  private _options: Partial<JoyrideProps>;
  private _previousStatus: valueof<status> = STATUS.READY;
  private _previousStepIndex = -1;
  private _steps: Step[] = new Array<Step>();
}
