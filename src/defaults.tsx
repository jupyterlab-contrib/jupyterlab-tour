import { ITutorialManager } from 'jupyterlab-tutorial';
import React from 'react';
import { WELCOME_ID, NOTEBOOK_ID } from './constants';
// import { triggerMouseEvent } from './utils';

function addWelcomeTour(manager: ITutorialManager): void {
  const welcomeTour = manager.createTutorial(WELCOME_ID, 'Welcome Tour', true);

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
          This sidebar contains a number tabs: a file browser, a list of running
          kernels and terminals, the command palette, a list of tabs in the main
          work area,...
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
}

function addNotebookTour(manager: ITutorialManager): void {
  const notebookTour = manager.createTutorial(
    NOTEBOOK_ID,
    'Notebook Tour',
    true
  );

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
    target: '.jp-InputArea.jp-Cell-inputArea',
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

  const runningSelector =
    '.lm-TabBar-tab svg[data-icon="ui-components:running"]';

  // notebookTour.stepChanged.connect((_, data) => {
  //   if (data.type === 'step:before' && data.step.target === runningSelector) {
  //     const node = document.querySelector<SVGElement>(runningSelector);
  //     const rect = node.getBoundingClientRect();
  //     triggerMouseEvent(node, 'mousedown', rect);
  //   }
  // });

  notebookTour.addStep({
    target: runningSelector,
    content: (
      <p>
        The running kernels are listed on this tab.
        <br /> It can be used to open the associated document or to shut them
        down.
      </p>
    ),
    placement: 'right'
  });

  const metadataSelector =
    '.lm-TabBar-tab svg[data-icon="ui-components:build"]';

  // notebookTour.stepChanged.connect((_, data) => {
  //   if (data.type === 'step:before' && data.step.target === metadataSelector) {
  //     const node = document.querySelector<HTMLElement>(metadataSelector);
  //     const rect = node.getBoundingClientRect();
  //     triggerMouseEvent(node, 'mousedown', rect);
  //   }
  // });

  notebookTour.addStep({
    target: metadataSelector,
    content: (
      <p>Metadata (like tags) can be added to cells through this tab.</p>
    ),
    placement: 'right'
  });
}

export function addTours(manager: ITutorialManager): void {
  addWelcomeTour(manager);
  addNotebookTour(manager);
}
