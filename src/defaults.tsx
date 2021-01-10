import { ILabShell, JupyterFrontEnd } from '@jupyterlab/application';
import { INotebookTracker, NotebookActions } from '@jupyterlab/notebook';
import { CommandRegistry } from '@lumino/commands';
import React from 'react';
import { NOTEBOOK_ID, WELCOME_ID } from './constants';
import { ITourManager } from './tokens';

/**
 * Add the default welcome tour
 *
 * @param manager Tours manager
 * @param commands Jupyter commands registry
 */
function addWelcomeTour(
  manager: ITourManager,
  commands: CommandRegistry
): void {
  const welcomeTour = manager.createTour(WELCOME_ID, 'Welcome Tour', true);

  welcomeTour.options = {
    ...welcomeTour.options,
    hideBackButton: true
  };

  welcomeTour.addStep({
    target: '#jp-main-dock-panel',
    content:
      'The following tour will point out some of the main UI components within JupyterLab.',
    placement: 'center',
    title: 'Welcome to JupyterLab!'
  });

  welcomeTour.addStep({
    content: (
      <>
        <p>Pause the tour by clicking anywhere outside of the tooltip.</p>
        <p>Resume the tour by clicking on the symbol:</p>
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
            Tip: Tours can be restarted from the <em>Help</em> menu.
          </small>
        </p>
      </>
    ),
    target: '#jp-main-dock-panel',
    placement: 'center',
    title: 'Some information on the tour, first.'
  });

  welcomeTour.addStep({
    content: (
      <details>
        <summary>
          This is the top menu bar where you can access several menus.
        </summary>
        <ul>
          <li>
            <strong>File</strong>: actions related to files and directories
          </li>
          <li>
            <strong>Edit</strong>: actions related to editing documents and
            other activities
          </li>
          <li>
            <strong>View</strong>: actions that alter the appearance of
            JupyterLab
          </li>
          <li>
            <strong>Run</strong>: actions for running code in notebooks and code
            consoles for example
          </li>
          <li>
            <strong>Kernel</strong>: actions for managing kernels (i.e. separate
            processes for running code)
          </li>
          <li>
            <strong>Tabs</strong>: a list of the open documents and activities
          </li>
          <li>
            <strong>Settings</strong>: common settings and an advanced settings
            editor
          </li>
          <li>
            <strong>Help</strong>: help links
          </li>
        </ul>
      </details>
    ),
    placement: 'bottom',
    target: '#jp-MainMenu',
    title: 'Top Menu Options',
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
          The main area enables you to arrange documents and activities into
          panels of tabs that can be resized or subdivided.
        </p>
        <p>
          Drag a tab to the center of a tab panel to move the tab to the panel.
          <br />
          Subdivide a tab panel by dragging a tab to the left, right, top, or
          bottom of the panel.
        </p>
        <p>
          The tab for the current activity is marked with a colored top border.
        </p>
      </>
    ),
    placement: 'left-end',
    target: '#jp-main-dock-panel',
    title: 'Main Work Area'
  });

  welcomeTour.addStep({
    target: '#jp-main-statusbar',
    content: <p>Various information are reported on the status bar.</p>,
    placement: 'top',
    title: 'Status Bar'
  });

  welcomeTour.addStep({
    content: (
      <>
        <p>
          This sidebar contains a number of tabs: a file browser, a list of
          tabs, running kernels and terminals,...
        </p>
        <p>
          <small>
            Tip: The sidebar can be collapsed or expanded by selecting{' '}
            <em>&quot;Show Left Sidebar&quot;</em> in the View menu or by
            clicking on the active sidebar tab.
          </small>
        </p>
      </>
    ),
    placement: 'right',
    target: '.jp-SideBar.jp-mod-left',
    title: 'Left Side Bar'
  });

  welcomeTour.addStep({
    content: (
      <>
        <p>
          The file browser enable you to work with files and directories on your
          system. This includes opening, creating, deleting, renaming,
          downloading, copying, and sharing files and directories.
        </p>
        <p>
          <small>Tip: Actions can be triggered through the context menu.</small>
        </p>
      </>
    ),
    placement: 'right',
    target: '#filebrowser',
    title: 'File Browser'
  });

  welcomeTour.addStep({
    content: (
      <>
        <p>
          All user actions in JupyterLab are processed through a centralized
          command system, called command palette. It provides a keyboard-driven
          way to search for and run JupyterLab commands.
        </p>
        <p>
          <small>
            Tip: To open it, the default shortcut is <em>Ctrl + Shift + C</em>
          </small>
        </p>
      </>
    ),
    placement: 'center',
    target: '#jp-main-dock-panel',
    title: 'Command Palette'
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
function addNotebookTour(
  manager: ITourManager,
  shell: ILabShell,
  nbTracker?: INotebookTracker
): void {
  const notebookTour = manager.createTour(NOTEBOOK_ID, 'Notebook Tour', true);

  notebookTour.options = {
    ...notebookTour.options,
    hideBackButton: true
  };

  let cellAdded = false;

  notebookTour.addStep({
    target: '.jp-MainAreaWidget.jp-NotebookPanel',
    content: (
      <p>
        Notebooks are documents combining live runnable code with narrative text
        (i.e. text, images,...).
      </p>
    ),
    placement: 'center',
    title: 'Working with notebooks!'
  });

  notebookTour.addStep({
    target: '.jp-Cell.jp-Notebook-cell',
    content: (
      <p>
        Notebook consists of one cells list.
        <br />
        This is the first cell.
      </p>
    ),
    placement: 'bottom'
  });

  notebookTour.addStep({
    target: '.jp-NotebookPanel-toolbar .jp-Notebook-toolbarCellType',
    content: (
      <>
        <p>A cell can have different type</p>
        <ul>
          <li>
            <strong>Code</strong>: Executable code
          </li>
          <li>
            <strong>Markdown</strong>: Markdown formatted text
          </li>
          <li>
            <strong>Raw</strong>: Plain text
          </li>
        </ul>
      </>
    )
  });

  notebookTour.addStep({
    target: '.jp-Notebook-cell:last-child .jp-InputArea.jp-Cell-inputArea',
    content: (
      <p>
        A cell has an input and an output area. This is the input area that you
        can edit with the proper syntax depending on the type.
      </p>
    ),
    placement: 'bottom'
  });

  notebookTour.addStep({
    target: '.jp-NotebookPanel-toolbar svg[data-icon="ui-components:run"]',
    content: (
      <p>
        Hitting the Play button (or pressing Shift+Enter) will execute the cell
        content.
      </p>
    ),
    placement: 'right'
  });

  notebookTour.addStep({
    target: '.jp-Notebook-cell:last-child .jp-OutputArea.jp-Cell-outputArea',
    content: (
      <p>
        Once a cell has been executed. Its result is display in the output cell
        area.
      </p>
    ),
    placement: 'bottom'
  });

  notebookTour.addStep({
    target: '.jp-NotebookPanel-toolbar .jp-KernelName',
    content: (
      <p>
        When executing a <em>Code</em> cell, its code is sent to a execution
        kernel.
        <br />
        Its name and its status are displayed here and in the status bar.
      </p>
    ),
    placement: 'bottom'
  });

  notebookTour.addStep({
    target: '#jp-running-sessions',
    content: (
      <p>
        The running kernels are listed on this tab.
        <br /> It can be used to open the associated document or to shut them
        down.
      </p>
    ),
    placement: 'right'
  });

  notebookTour.addStep({
    target: '#jp-property-inspector',
    content: (
      <p>Metadata (like tags) can be added to cells through this tab.</p>
    ),
    placement: 'left'
  });

  notebookTour.stepChanged.connect((_, data) => {
    if (data.type === 'tour:start') {
      cellAdded = false;
    } else if (data.type === 'step:before') {
      switch (data.step.target) {
        case '.jp-NotebookPanel-toolbar svg[data-icon="ui-components:run"]':
          {
            if (nbTracker) {
              const current = nbTracker.currentWidget;
              if (current) {
                const { content, context } = current;
                NotebookActions.run(content, context.sessionContext);
              }
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
              const current = nbTracker.currentWidget;
              if (current && !cellAdded) {
                const notebook = current.content;
                NotebookActions.insertBelow(notebook);
                const activeCell = notebook.activeCell;
                if (activeCell) {
                  activeCell.model.value.text = 'a = 2\na';
                  cellAdded = true;
                }
              }
            }
          }

          break;
        case '.jp-NotebookPanel-toolbar .jp-KernelName':
          shell.activateById('jp-running-sessions');
          break;
        case '#jp-running-sessions':
          shell.activateById('jp-property-inspector');
          break;
        default:
          break;
      }
    }
  });
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
  addWelcomeTour(manager, commands);
  addNotebookTour(manager, shell as ILabShell, nbTracker);
}
