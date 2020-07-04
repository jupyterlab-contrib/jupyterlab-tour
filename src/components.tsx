import { UseSignal } from '@jupyterlab/apputils';
import { ISignal } from '@lumino/signaling';
import { ITutorialManager } from 'jupyterlab-tutorial';
import React from 'react';
import ReactJoyride, { CallBackProps, STATUS } from 'react-joyride';
import { Tutorial } from './tutorial';

interface ITourProps {
  tutorials: Tutorial[];
}

interface ITourState {
  run: boolean;
  index: number;
}

class Tour extends React.Component<ITourProps, ITourState> {
  constructor(props: ITourProps) {
    super(props);
    this.state = {
      run: true,
      index: 0
    };
  }

  reset = (): void => {
    this.setState({
      run: true,
      index: 0
    });
  };

  private _handleJoyrideCallback = (data: CallBackProps): void => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    this.props.tutorials[this.state.index].handleTourEvent(data);

    if (finishedStatuses.includes(status)) {
      this.setState({ run: false });
      const newIndex = this.state.index + 1;
      if (newIndex < this.props.tutorials.length) {
        this.setState({ index: newIndex, run: true });
      } else {
        this.setState({ index: -1 });
      }
    }
  };

  render(): JSX.Element {
    return this.props.tutorials && this.props.tutorials[this.state.index] ? (
      <ReactJoyride
        key={this.props.tutorials[this.state.index].id}
        {...this.props.tutorials[this.state.index].optionsJoyride}
        callback={this._handleJoyrideCallback}
        run={this.state.run}
        steps={this.props.tutorials[this.state.index].steps}
      />
    ) : null;
  }
}

interface ITourLauncherProps {
  tutorials: Tutorial[];
}

const TourLauncher: React.FunctionComponent<ITourLauncherProps> = (
  props: ITourLauncherProps
) => {
  const tourRef = React.useRef<Tour>(null);
  if (tourRef.current) {
    tourRef.current.reset();
  }
  return <Tour ref={tourRef} tutorials={props.tutorials} />;
};

export interface ITourContainerProps {
  tutorialLaunched: ISignal<ITutorialManager, Tutorial[]>;
}

export const TourContainer: React.FunctionComponent<ITourContainerProps> = (
  props: ITourContainerProps
) => {
  return (
    <UseSignal signal={props.tutorialLaunched} initialArgs={[]}>
      {(_, tutorials): JSX.Element =>
        tutorials && tutorials.length > 0 ? (
          <TourLauncher tutorials={tutorials} />
        ) : null
      }
    </UseSignal>
  );
};
