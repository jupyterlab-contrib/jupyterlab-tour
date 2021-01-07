import { ITutorialManager, ITutorial } from './tokens';
import { ITour } from './interfaces';

/**
 * Add a tour from its JSON serialization
 *
 * @param manager Tours manager
 * @param tour Tour to add
 */
export function addJSONTour(
  manager: ITutorialManager,
  tour: ITour
): ITutorial | null {
  const { id, label, hasHelpEntry, steps } = tour;
  let tutorial: ITutorial | null = null;
  try {
    tutorial = manager.createTutorial(id, label, hasHelpEntry);
    steps.forEach(({ content, placement, target, title }) => {
      tutorial.createAndAddStep(target, content, placement, title);
    });
  } catch (error) {
    console.error(`Fail to add tour '${label}' (${id})`, error);
  }

  return tutorial;
}
