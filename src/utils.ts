import { ITourManager, ITourHandler, ITour } from './tokens';

/**
 * Add a tour from its JSON serialization
 *
 * @param manager Tours manager
 * @param tour Tour to add
 */
export function addJSONTour(
  manager: ITourManager,
  tour: ITour
): ITourHandler | null {
  const { id, label, hasHelpEntry, steps } = tour;
  let tourHandler: ITourHandler | null = null;
  try {
    tourHandler = manager.createTour(id, label, hasHelpEntry);
    steps.forEach(({ content, placement, target, title }) => {
      tourHandler.createAndAddStep(target, content, placement, title);
    });
  } catch (error) {
    console.error(`Fail to add tour '${label}' (${id})`, error);
  }

  return tourHandler;
}
