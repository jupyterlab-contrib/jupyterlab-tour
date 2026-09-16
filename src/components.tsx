import { UseSignal } from '@jupyterlab/apputils';
import type { ISignal } from '@lumino/signaling';
import React from 'react';
import type { CallBackProps, StoreHelpers } from 'react-joyride';
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
    this._stopWaiting();
    this.setState({
      run: true,
      index: 0
    });
  };

  componentWillUnmount(): void {
    this._stopWaiting();
  }

  private _helpers: StoreHelpers | null = null;
  private _observer: MutationObserver | null = null;

  private _stopWaiting = (): void => {
    this._observer?.disconnect();
    this._observer = null;
  };

  private _wait = (target: string, index: number): void => {
    this._stopWaiting();
    // Pause so Joyride cannot auto-skip this step (it increments index on
    // error:target_not_found after the callback returns).
    this.setState({ run: false });
    const retry = (): void => {
      if (!document.querySelector(target)) {
        return;
      }
      this._stopWaiting();
      this.setState({ run: true }, () => {
        this._helpers?.go(index);
      });
    };
    if (document.querySelector(target)) {
      retry();
      return;
    }
    this._observer = new MutationObserver(retry);
    this._observer.observe(document.body, { childList: true, subtree: true });
  };

  private _setHelpers = (helpers: StoreHelpers): void => {
    this._helpers = helpers;
    this.props.tours[this.state.index]?.setHelpers(helpers);
  };

  private _handleJoyrideCallback = (data: CallBackProps): void => {
    const { index, status, step, type } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    const wait = !!(step as { wait?: boolean }).wait;
    const target = step.target;

    // A step with `wait` is shown once its target exists, not skipped.
    if (type === 'error:target_not_found' && wait && typeof target === 'string') {
      this._wait(target, index);
      return;
    }
    if (this._observer && status === STATUS.FINISHED) {
      return;
    }

    if (status === STATUS.SKIPPED) {
      this._stopWaiting();
    }

    this.props.tours[this.state.index].handleTourEvent(data);

    if (finishedStatuses.includes(status)) {
      this._stopWaiting();
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
    return this.props.tours && this.props.tours[this.state.index] ? (
      <ReactJoyride
        key={this.props.tours[this.state.index].id}
        {...this.props.tours[this.state.index].options}
        callback={this._handleJoyrideCallback}
        getHelpers={this._setHelpers}
        run={this.state.run}
        steps={this.props.tours[this.state.index].steps}
      />
    ) : null;
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
