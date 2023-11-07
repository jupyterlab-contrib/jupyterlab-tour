import React from 'react';

import { CommandRegistry } from '@lumino/commands';

import { ILabShell, JupyterFrontEnd } from '@jupyterlab/application';
import { INotebookTracker, NotebookActions, NotebookPanel } from '@jupyterlab/notebook';

import { NOTEBOOK_ID, WELCOME_ID } from './constants';
import { defaultNotebookTourIcon, defaultTourIcon } from './icons';
import { ITourManager } from './tokens';

namespace DefaultTours {
  export namespace JupyterLab {
    /**
     * Add the default welcome tour
     *
     * @param manager Tours manager
     * @param commands Jupyter commands registry
     */
    export function addWelcomeTour(
      manager: ITourManager,
      commands: CommandRegistry
    ): void {
      const trans = manager.translator;

      const welcomeTour = manager.createTour({
        id: WELCOME_ID,
        label: trans.__('Welcome Tour'),
        hasHelpEntry: true,
        icon: defaultTourIcon,
        version: 20231107
      });

      welcomeTour.options = {
        ...welcomeTour.options,
        hideBackButton: true
      };

      welcomeTour.addStep({
        target: '#jp-main-dock-panel',
        content: trans.__(
          'The following tour will point out some of the main UI components within JupyterLab.'
        ),
        placement: 'center',
        title: trans.__('Welcome to JupyterLab!')
      });

      welcomeTour.addStep({
        content: (
          <>
            <p>
              {trans.__('Pause the tour by clicking anywhere outside of the tooltip.')}
            </p>
            <p>{trans.__('Resume the tour by clicking on the symbol:')}</p>
            <div style={{ display: 'inline-block', height: '60px' }}>
              <span
                style={{
                  animation:
                    '1.2s ease-in-out 0s infinite normal none running joyride-beacon-inner',
                  backgroundColor: 'var(--jp-brand-color1)',
                  borderRadius: '50%',
                  display: 'block',
                  height: '30px',
                  opacity: '0.7',
                  position: 'relative',
                  top: '15px',
                  width: '30px'
                }}
              />
              <span
                style={{
                  animation:
                    '1.2s ease-in-out 0s infinite normal none running joyride-beacon-outer',
                  border: '2px solid var(--jp-brand-color1)',
                  borderRadius: '50%',
                  boxSizing: 'border-box',
                  display: 'block',
                  height: '60px',
                  left: '-15px',
                  opacity: '0.9',
                  position: 'relative',
                  top: '-30px',
                  width: '60px'
                }}
              />
            </div>
            <p>
              <small>
                {trans.__('Tip: Tours can be restarted from the Help menu.')}
              </small>
            </p>
          </>
        ),
        target: '#jp-main-dock-panel',
        placement: 'center',
        title: trans.__('Some information on the tour, first.')
      });

      welcomeTour.addStep({
        content: (
          <details>
            <summary>
              {trans.__('This is the top menu bar where you can access several menus.')}
            </summary>
            <ul>
              <li>
                <strong>{trans.__('File')}</strong>
                {trans.__(': actions related to files and directories')}
              </li>
              <li>
                <strong>{trans.__('Edit')}</strong>
                {trans.__(
                  ': actions related to editing documents and other activities'
                )}
              </li>
              <li>
                <strong>{trans.__('View')}</strong>
                {trans.__(': actions that alter the appearance of JupyterLab')}
              </li>
              <li>
                <strong>{trans.__('Run')}</strong>
                {trans.__(
                  ': actions for running code in notebooks and code consoles for example'
                )}
              </li>
              <li>
                <strong>{trans.__('Kernel')}</strong>
                {trans.__(
                  ': actions for managing kernels (i.e. separate processes for running code)'
                )}
              </li>
              <li>
                <strong>{trans.__('Tabs')}</strong>
                {trans.__(': a list of the open documents and activities')}
              </li>
              <li>
                <strong>{trans.__('Settings')}</strong>
                {trans.__(': common settings and an advanced settings editor')}
              </li>
              <li>
                <strong>{trans.__('Help')}</strong>
                {trans.__(': help links')}
              </li>
            </ul>
          </details>
        ),
        placement: 'bottom',
        target: '#jp-MainMenu',
        title: trans.__('Top Menu Options'),
        styles: {
          tooltipContent: {
            overflowY: 'auto',
            maxHeight: '200px'
          }
        }
      });

      welcomeTour.addStep({
        content: (
          <>
            <p>
              {trans.__(
                `The main area enables you to arrange documents and activities into
            panels of tabs that can be resized or subdivided.`
              )}
            </p>
            <p>
              {trans.__(
                'Drag a tab to the center of a tab panel to move the tab to the panel.'
              )}
              <br />
              {trans.__(
                'Subdivide a tab panel by dragging a tab to the left, right, top, or bottom of the panel.'
              )}
            </p>
            <p>
              {trans.__(
                'The tab for the current activity is marked with a colored top border.'
              )}
            </p>
          </>
        ),
        placement: 'left-end',
        target: '#jp-main-dock-panel',
        title: trans.__('Main Work Area')
      });

      welcomeTour.addStep({
        target: '#jp-main-statusbar',
        content: (
          <p>{trans.__('Various information are reported on the status bar.')}</p>
        ),
        placement: 'top',
        title: trans.__('Status Bar')
      });

      welcomeTour.addStep({
        content: (
          <>
            <p>
              {trans.__(
                'This sidebar contains a number of tabs: a file browser, a list of tabs, running kernels and terminals,...'
              )}
            </p>
            <p>
              <small>
                {trans.__(
                  `Tip: The sidebar can be collapsed or expanded by selecting
              "Show Left Sidebar" in the View menu or by
              clicking on the active sidebar tab.`
                )}
              </small>
            </p>
          </>
        ),
        placement: 'right',
        target: '.jp-SideBar.jp-mod-left',
        title: trans.__('Left Side Bar')
      });

      welcomeTour.addStep({
        content: (
          <>
            <p>
              {trans.__(
                `The file browser enable you to work with files and directories on your
            system. This includes opening, creating, deleting, renaming,
            downloading, copying, and sharing files and directories.`
              )}
            </p>
            <p>
              <small>
                {trans.__('Tip: Actions can be triggered through the context menu.')}
              </small>
            </p>
          </>
        ),
        placement: 'right',
        target: '#filebrowser',
        title: trans.__('File Browser')
      });

      welcomeTour.addStep({
        content: (
          <>
            <p>
              {trans.__(
                `All user actions in JupyterLab are processed through a centralized
            command system, called command palette. It provides a keyboard-driven
            way to search for and run JupyterLab commands.`
              )}
            </p>
            <p>
              <small>
                {trans.__(
                  'Tip: To open it, the default shortcut is "Ctrl + Shift + C"'
                )}
              </small>
            </p>
          </>
        ),
        placement: 'center',
        target: '#jp-main-dock-panel',
        title: trans.__('Command Palette')
      });

      welcomeTour.stepChanged.connect((_, data) => {
        switch (data.type) {
          case 'step:after':
            if (data.step.target === '.jp-SideBar.jp-mod-left') {
              commands.execute('filebrowser:activate');
            } else if (data.step.target === '#filebrowser') {
              commands.execute('apputils:activate-command-palette');
            }
            break;
        }
      });
    }

    /**
     * Add the default notebook tour
     *
     * @param manager Tours manager
     * @param shell Jupyter shell
     * @param nbTracker Notebook tracker (optional)
     */
    export function addNotebookTour(
      manager: ITourManager,
      commands: CommandRegistry,
      shell: ILabShell,
      nbTracker?: INotebookTracker,
      appName = 'JupyterLab'
    ): void {
      const trans = manager.translator;
      const notebookTour = manager.createTour({
        id: NOTEBOOK_ID,
        label: trans.__('Notebook Tour'),
        hasHelpEntry: true,
        icon: defaultNotebookTourIcon,
        version: 20231107
      });

      notebookTour.options = {
        ...notebookTour.options,
        hideBackButton: true,
        disableScrolling: true
      };

      let currentNbPanel: NotebookPanel | null = null;
      let addedCellIndex: number | null = null;

      notebookTour.addStep({
        target: '.jp-MainAreaWidget.jp-NotebookPanel',
        content: (
          <p>
            {trans.__(
              'Notebooks are documents combining live runnable code with narrative text (i.e. text, images,...).'
            )}
          </p>
        ),
        placement: 'center',
        title: trans.__('Working with notebooks!')
      });

      notebookTour.addStep({
        target: '.jp-Cell.jp-Notebook-cell',
        content: (
          <p>
            {trans.__('Notebook consists of one cells list.')}
            <br />
            {trans.__('This is the first cell.')}
          </p>
        ),
        placement: 'bottom'
      });

      notebookTour.addStep({
        target: '.jp-NotebookPanel-toolbar .jp-Notebook-toolbarCellType',
        content: (
          <>
            <p>{trans.__('A cell can have different type')}</p>
            <ul>
              <li>
                <strong>{trans.__('Code')}</strong>
                {trans.__(': Executable code')}
              </li>
              <li>
                <strong>{trans.__('Markdown')}</strong>
                {trans.__(': Markdown formatted text')}
              </li>
              <li>
                <strong>{trans.__('Raw')}</strong>
                {trans.__(': Plain text')}
              </li>
            </ul>
          </>
        )
      });

      notebookTour.addStep({
        target: '.jp-Notebook-cell:last-child .jp-InputArea.jp-Cell-inputArea',
        content: (
          <p>
            {trans.__(
              `A cell has an input and an output area. This is the input area that you can edit with
          the proper syntax depending on the type.`
            )}
          </p>
        ),
        placement: 'bottom'
      });

      notebookTour.addStep({
        target: '.jp-NotebookPanel-toolbar svg[data-icon="ui-components:run"]',
        content: (
          <p>
            {trans.__(
              'Hitting the Play button (or pressing Shift+Enter) will execute the cell content.'
            )}
          </p>
        ),
        placement: 'right'
      });

      notebookTour.addStep({
        target: '.jp-Notebook-cell:last-child .jp-OutputArea.jp-Cell-outputArea',
        content: (
          <p>
            {trans.__(
              'Once a cell has been executed. Its result is display in the output cell area.'
            )}
          </p>
        ),
        placement: 'bottom'
      });

      notebookTour.addStep({
        target: '.jp-NotebookPanel-toolbar .jp-KernelName',
        content: (
          <p>
            {trans.__(
              'When executing a "Code" cell, its code is sent to a execution kernel.'
            )}
            <br />
            {trans.__('Its name and its status are displayed here.')}
          </p>
        ),
        placement: 'bottom'
      });

      if (appName !== 'Jupyter Notebook') {
        notebookTour.addStep({
          target: '#jp-running-sessions',
          content: (
            <p>
              {trans.__('The running kernels are listed on this tab.')}
              <br />
              {trans.__(
                ' It can be used to open the associated document or to shut them down.'
              )}
            </p>
          ),
          placement: 'right'
        });

        notebookTour.addStep({
          target: '#jp-property-inspector',
          content: (
            <p>
              {trans.__('Metadata (like tags) can be added to cells through this tab.')}
            </p>
          ),
          placement: 'left'
        });
      }

      notebookTour.stepChanged.connect((_, data) => {
        if (data.type === 'tour:start') {
          addedCellIndex = null;
        } else if (data.type === 'step:before') {
          switch (data.step.target) {
            case '.jp-NotebookPanel-toolbar svg[data-icon="ui-components:run"]':
              {
                if (nbTracker && currentNbPanel) {
                  const { content, context } = currentNbPanel;
                  NotebookActions.run(content, context.sessionContext);
                }
              }
              break;
            default:
              break;
          }
        } else if (data.type === 'step:after') {
          switch (data.step.target) {
            case '.jp-NotebookPanel-toolbar .jp-Notebook-toolbarCellType':
              {
                if (nbTracker) {
                  currentNbPanel = nbTracker.currentWidget;
                  if (currentNbPanel && !addedCellIndex) {
                    const notebook = currentNbPanel.content;
                    NotebookActions.insertBelow(notebook);
                    const activeCell = notebook.activeCell;
                    addedCellIndex = notebook.activeCellIndex;
                    if (activeCell) {
                      try {
                        activeCell.model.sharedModel.setSource('a = 2\na');
                      } catch (err) {
                        // @ts-expect-error JupyterLab 3 syntax
                        activeCell.model.value.text = 'a = 2\na';
                      }
                    }
                  }
                }
              }

              break;
            case '.jp-NotebookPanel-toolbar .jp-KernelName':
              if (appName !== 'Jupyter Notebook') {
                shell.activateById('jp-running-sessions');
              }
              break;
            case '#jp-running-sessions': {
              shell.activateById('jp-property-inspector');
              const commonTools = shell.node
                .querySelector('#jp-property-inspector')
                ?.querySelector('.jp-Collapse-header:first-child');
              if (commonTools?.classList.contains('jp-Collapse-header-collapsed')) {
                commonTools.dispatchEvent(
                  new MouseEvent('click', {
                    button: 0,
                    bubbles: true,
                    cancelable: true
                  })
                );
              }
              break;
            }
            default:
              break;
          }
        }
      });

      // clean
      notebookTour.finished.connect((_, data) => {
        if (data.step.target === '#jp-property-inspector') {
          commands.execute('filebrowser:activate');
          if (nbTracker) {
            if (currentNbPanel && addedCellIndex !== null) {
              currentNbPanel.content.activeCellIndex = addedCellIndex;
              NotebookActions.deleteCells(currentNbPanel.content);
              addedCellIndex = null;
            }
          }
        } else if (
          appName === 'Jupyter Notebook' &&
          data.step.target === '.jp-NotebookPanel-toolbar .jp-KernelName'
        ) {
          if (nbTracker) {
            if (currentNbPanel && addedCellIndex !== null) {
              currentNbPanel.content.activeCellIndex = addedCellIndex;
              NotebookActions.deleteCells(currentNbPanel.content);
              addedCellIndex = null;
            }
          }
        }
      });
    }
  }

  export namespace Notebook {
    /**
     * Add the default welcome tour
     *
     * @param manager Tours manager
     * @param commands Jupyter commands registry
     */
    export function addWelcomeTour(
      manager: ITourManager,
      commands: CommandRegistry
    ): void {
      const trans = manager.translator;

      const welcomeTour = manager.createTour({
        id: WELCOME_ID,
        label: trans.__('Welcome Tour'),
        hasHelpEntry: true,
        version: 20231107
      });

      welcomeTour.options = {
        ...welcomeTour.options,
        hideBackButton: true
      };

      welcomeTour.addStep({
        target: '#main-panel',
        content: trans.__(
          'The following tour will point out some of the main UI components within Jupyter Notebook.'
        ),
        placement: 'center',
        title: trans.__('Welcome to Jupyter Notebook!')
      });

      welcomeTour.addStep({
        content: (
          <>
            <p>
              {trans.__('Pause the tour by clicking anywhere outside of the tooltip.')}
            </p>
            <p>{trans.__('Resume the tour by clicking on the symbol:')}</p>
            <div style={{ display: 'inline-block', height: '60px' }}>
              <span
                style={{
                  animation:
                    '1.2s ease-in-out 0s infinite normal none running joyride-beacon-inner',
                  backgroundColor: 'var(--jp-brand-color1)',
                  borderRadius: '50%',
                  display: 'block',
                  height: '30px',
                  opacity: '0.7',
                  position: 'relative',
                  top: '15px',
                  width: '30px'
                }}
              />
              <span
                style={{
                  animation:
                    '1.2s ease-in-out 0s infinite normal none running joyride-beacon-outer',
                  border: '2px solid var(--jp-brand-color1)',
                  borderRadius: '50%',
                  boxSizing: 'border-box',
                  display: 'block',
                  height: '60px',
                  left: '-15px',
                  opacity: '0.9',
                  position: 'relative',
                  top: '-30px',
                  width: '60px'
                }}
              />
            </div>
            <p>
              <small>
                {trans.__('Tip: Tours can be restarted from the Help menu.')}
              </small>
            </p>
          </>
        ),
        target: '#main-panel',
        placement: 'center',
        title: trans.__('Some information on the tour, first.')
      });

      welcomeTour.addStep({
        content: (
          <details>
            <summary>
              {trans.__('This is the top menu bar where you can access several menus.')}
            </summary>
            <ul>
              <li>
                <strong>{trans.__('File')}</strong>
                {trans.__(': actions related to files and directories')}
              </li>
              <li>
                <strong>{trans.__('View')}</strong>
                {trans.__(': actions that alter the appearance of Jupyter Notebook')}
              </li>
              <li>
                <strong>{trans.__('Settings')}</strong>
                {trans.__(': common settings and an settings editor')}
              </li>
              <li>
                <strong>{trans.__('Help')}</strong>
                {trans.__(': help links')}
              </li>
            </ul>
          </details>
        ),
        placement: 'bottom',
        target: '#menu-panel',
        title: trans.__('Top Menu Options'),
        styles: {
          tooltipContent: {
            overflowY: 'auto',
            maxHeight: '200px'
          }
        }
      });

      welcomeTour.addStep({
        content: (
          <>
            <p>
              {trans.__(
                'The notebook dashboard enables you to arrange documents and monitor running kernels.'
              )}
            </p>
            <p>
              {trans.__(
                'This tab panel contains a number of tabs: a file browser, a list of running kernels and terminals,...'
              )}
            </p>
          </>
        ),
        placement: 'bottom',
        target: '.lm-TabBar',
        title: trans.__('Noteboook Dashboard')
      });

      welcomeTour.addStep({
        content: (
          <>
            <p>
              {trans.__(
                `The file browser enable you to work with files and directories on your
                system. This includes opening, creating, deleting, renaming,
                downloading, copying, and sharing files and directories.`
              )}
            </p>
            <p>
              <small>
                {trans.__('Tip: Actions can be triggered through the context menu.')}
              </small>
            </p>
          </>
        ),
        placement: 'left',
        target: '#filebrowser',
        title: trans.__('File Browser')
      });

      welcomeTour.addStep({
        content: (
          <>
            <p>
              {trans.__(
                `All user actions in Jupyter Notebook are processed through a centralized
                command system, called command palette. It provides a keyboard-driven
                way to search for and run Jupyter Notebook commands.`
              )}
            </p>
            <p>
              <small>
                {trans.__(
                  'Tip: To open it, the default shortcut is "Ctrl + Shift + C"'
                )}
              </small>
            </p>
          </>
        ),
        placement: 'center',
        target: '#main-panel',
        title: trans.__('Command Palette')
      });

      welcomeTour.stepChanged.connect((_, data) => {
        switch (data.type) {
          case 'step:after':
            if (data.step.target === '#main-panel') {
              commands.execute('filebrowser:activate');
            } else if (data.step.target === '#filebrowser') {
              commands.execute('apputils:activate-command-palette');
            }
            break;
        }
      });
    }
  }
}

/**
 * Add all default tours
 *
 * @param manager Tours manager
 * @param app Jupyter application
 * @param nbTracker Notebook tracker (optional)
 */
export function addTours(
  manager: ITourManager,
  app: JupyterFrontEnd,
  nbTracker?: INotebookTracker
): void {
  const { commands, shell } = app;
  switch (app.name) {
    case 'Jupyter Notebook':
      DefaultTours.Notebook.addWelcomeTour(manager, commands);
      DefaultTours.JupyterLab.addNotebookTour(
        manager,
        commands,
        shell as ILabShell,
        nbTracker,
        'Jupyter Notebook'
      );
      break;
    default:
      DefaultTours.JupyterLab.addWelcomeTour(manager, commands);
      DefaultTours.JupyterLab.addNotebookTour(
        manager,
        commands,
        shell as ILabShell,
        nbTracker
      );
  }
}
