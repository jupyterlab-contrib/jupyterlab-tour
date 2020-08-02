import { Placement } from 'react-joyride';

export interface IStep {
  content: string;
  target: string;
  placement?: Placement;
  title?: string;
}

export interface ITour {
  id: string;
  label: string;
  hasHelpEntry: boolean;
  steps: Array<IStep>;
}
