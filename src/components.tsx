import { UseSignal } from '@jupyterlab/apputils';
import type { ISignal } from '@lumino/signaling';
import React from 'react';
import type { CallBackProps } from 'react-joyride';
import ReactJoyride, { STATUS } from 'react-joyride';
import type { ITourManager } from './tokens';
import type { TourHandler } from './tour';

/**
 * Tour component properties
 */
interface ITourProps {
  /**
   * List of tours to play
   */
  tours: TourHandler[];
}

/**
 * Tour component state
 */
interface ITourState {
  /**
   * Is a tour running
   */
  run: boolean;
  /**
   * Index of the current tour
   */
  index: number;
}

/**
 * Run a list of tours
 */
class Tour extends React.Component<ITourProps, ITourState> {
  constructor(props: ITourProps) {
    super(props);
    this.state = {
      run: true,
      index: 0
    };
  }

  /**
   * Reset active tours
   */
  reset = (): void => {
    this.setState({
      run: true,
      index: 0
    });
  };

  private _handleJoyrideCallback = (data: CallBackProps): void => {
    const { status } = data;
    const handler = this.props.tours[this.state.index];
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    handler.handleTourEvent(data);
    if (finishedStatuses.includes(status)) {
      this.setState({ run: false });
      const newIndex = this.state.index + 1;
      if (newIndex < this.props.tours.length) {
        this.setState({ index: newIndex, run: true });
      } else {
        this.setState({ index: -1 });
      }
    }
  };

  render(): JSX.Element | null {
    console.log('and nothin ever did, so what?');
    const handler = this.props.tours?.[this.state.index];

    if (!handler) {
      return null;
    }

    const options = { ...handler.options };
    delete options.stepIndex;

    const joyride = (stepIndex?: number): JSX.Element => (
      <ReactJoyride
        key={handler.id}
        {...options}
        callback={this._handleJoyrideCallback}
        run={this.state.run}
        steps={handler.steps}
        {...(stepIndex === undefined ? {} : { stepIndex })}
      />
    );

    if (!handler.controlled) {
      return joyride();
    }

    return (
      <UseSignal
        signal={handler.currentStepIndexChanged}
        initialArgs={handler.currentStepIndex}
      >
        {(): React.ReactNode =>
          joyride(handler.currentStepIndex >= 0 ? handler.currentStepIndex : undefined)
        }
      </UseSignal>
    );
  }
}

/**
 * Tours launchers properties
 */
interface ITourLauncherProps {
  /**
   * Tours to be run
   */
  tours: TourHandler[];
}

/**
 * Tours launcher
 *
 * @param props properties
 */
function TourLauncher(props: ITourLauncherProps): JSX.Element {
  const tourRef = React.useRef<Tour>(null);
  if (tourRef.current) {
    tourRef.current.reset();
  }
  return <Tour ref={tourRef} tours={props.tours} />;
}

/**
 * Tour container
 */
export interface ITourContainerProps {
  /**
   * Signal emitting when a tour should be launched
   */
  tourLaunched: ISignal<ITourManager, TourHandler[]>;
}

/**
 * Launched tours in reaction to the ad-hoc signal
 *
 * @param props Component properties
 */
export function TourContainer(props: ITourContainerProps): JSX.Element {
  return (
    <UseSignal signal={props.tourLaunched} initialArgs={[]}>
      {(_, tours): React.ReactNode =>
        tours && tours.length > 0 ? <TourLauncher tours={tours} /> : null
      }
    </UseSignal>
  );
}
