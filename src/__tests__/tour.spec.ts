import 'jest';
import type { CallBackProps, Status } from 'react-joyride';
import { STATUS } from 'react-joyride';
import { TourManager } from '../tourManager';
import { TourHandler } from '../tour';

function event(status: Status, index: number): CallBackProps {
  return { status, index, step: { target: 'body', content: '' } } as CallBackProps;
}

function runningTour(controlled = false): TourHandler {
  const tour = new TourHandler('tour', 'Tour', undefined, null, 0, controlled);
  tour.addStep({ target: 'body', content: 'one' });
  tour.addStep({ target: 'body', content: 'two' });
  tour.handleTourEvent(event(STATUS.RUNNING, 0));
  return tour;
}

describe('TourHandler', () => {
  it('leaves the tour uncontrolled by default', () => {
    const tour = new TourHandler('tour', 'Tour');

    expect(tour.controlled).toBe(false);
    expect(tour.currentStepIndex).toBe(-1);
    expect(tour.isRunning()).toBe(false);
  });

  it('updates the shared index when a controlled tour sets currentStepIndex', () => {
    const tour = new TourHandler('tour', 'Tour', undefined, null, 0, true);

    tour.currentStepIndex = 2;

    expect(tour.currentStepIndex).toBe(2);
    expect(tour.isRunning()).toBe(true);
  });

  it('follows Joyride callbacks on an uncontrolled tour', () => {
    const tour = runningTour(false);

    expect(tour.currentStepIndex).toBe(0);

    tour.handleTourEvent(event(STATUS.RUNNING, 1));

    expect(tour.currentStepIndex).toBe(1);
  });

  it('stores a currentStepIndex write on an uncontrolled tour', () => {
    const tour = runningTour(false);

    tour.currentStepIndex = 1;

    expect(tour.currentStepIndex).toBe(1);
  });

  it('keeps a controlled currentStepIndex when Joyride reports another index', () => {
    const tour = runningTour(true);

    tour.currentStepIndex = 1;
    tour.handleTourEvent(event(STATUS.RUNNING, 0));

    expect(tour.currentStepIndex).toBe(1);
  });

  it('returns to idle when the tour finishes', () => {
    const tour = runningTour(false);

    tour.handleTourEvent(event(STATUS.FINISHED, 1));

    expect(tour.currentStepIndex).toBe(-1);
    expect(tour.isRunning()).toBe(false);
  });
});

describe('TourManager', () => {
  it('resets currentStepIndex when a controlled tour is launched', async () => {
    const manager = new TourManager();
    const handler = manager.addTour({
      id: 'sample',
      label: 'Sample',
      hasHelpEntry: false,
      controlled: true,
      steps: [{ target: 'body', content: 'one', placement: 'center' as const }]
    });

    if (!handler) {
      throw new Error('tour was not created');
    }

    handler.currentStepIndex = 1;

    await manager.launch([handler], true);

    expect(handler.currentStepIndex).toBe(0);
    manager.dispose();
  });

  it('does not reset currentStepIndex when an uncontrolled tour is launched', async () => {
    const manager = new TourManager();
    const handler = manager.addTour({
      id: 'sample',
      label: 'Sample',
      hasHelpEntry: false,
      steps: [{ target: 'body', content: 'one', placement: 'center' as const }]
    }) as TourHandler | null;

    if (!handler) {
      throw new Error('tour was not created');
    }

    handler.handleTourEvent(event(STATUS.RUNNING, 1));

    await manager.launch([handler], true);

    expect(handler.currentStepIndex).toBe(1);
    manager.dispose();
  });
});
