import { UseSignal } from '@jupyterlab/apputils';
import { ISignal } from '@lumino/signaling';
import React from 'react';
import ReactJoyride, { CallBackProps, STATUS } from 'react-joyride';
import { ITourManager } from './tokens';
import { TourHandler } from './tour';

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
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    this.props.tours[this.state.index].handleTourEvent(data);

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
    return this.props.tours && this.props.tours[this.state.index] ? (
      <ReactJoyride
        key={this.props.tours[this.state.index].id}
        {...this.props.tours[this.state.index].options}
        callback={this._handleJoyrideCallback}
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
      {(_, tours): JSX.Element =>
        tours && tours.length > 0 ? <TourLauncher tours={tours} /> : null
      }
    </UseSignal>
  );
}
