import * as React from 'react';

import { ReactWidget } from '@jupyterlab/apputils';
import { Notebook } from '@jupyterlab/notebook';
import { HTMLSelect } from '@jupyterlab/ui-components';
import { TranslationBundle } from '@jupyterlab/translation';

import { errorTourIcon, notebookHasTourIcon, notebookTourIcon } from './icons';
import { INotebookTourManager } from './tokens';

export class TourButton extends ReactWidget {
  /**
   * Construct a new notebook toolbar item for tours
   */
  constructor(notebook: Notebook, manager: INotebookTourManager) {
    super();
    this._manager = manager;
    this._notebook = notebook;
    this.addClass('jp-NotebookTour-toolbaritem');
    if (notebook.model) {
      this.update();
    }
    this._manager.notebookToursChanged.connect(this.update, this);
  }

  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this._manager.notebookToursChanged.disconnect(this.update, this);
    super.dispose();
  }

  render(): JSX.Element {
    const trans = this.translator;
    let title = trans.__('Start a Notebook Tour');
    const tourIds = this._manager.getNotebookTourIds(this._notebook);
    let icon = notebookTourIcon;

    if (tourIds.length) {
      title = `${title} (${tourIds.length})`;
      icon = notebookHasTourIcon;
    }
    const errors = this._manager.getNotebookValidationErrors(this._notebook);

    if (errors.length) {
      title = `${this.translator.__('Tour Validation Errors')}: ${errors.length}`;
      icon = errorTourIcon;
    }

    return (
      <HTMLSelect
        onChange={this.handleChange}
        icon={icon}
        aria-label={trans.__('Notebook Tours')}
        title={title}
        value=""
      >
        <option style={{ display: 'none' }} value=""></option>
        {errors.length ? (
          <option>
            {trans.__('Tour metadata is not valid: see the browser console!')}
          </option>
        ) : (
          []
        )}
        {tourIds.length ? (
          <option value="ALL">{trans.__('Run all Tours')}</option>
        ) : (
          <optgroup label={trans.__('No Tours found in this Notebook')}></optgroup>
        )}
        {tourIds.length ? (
          <optgroup label={trans.__('Notebook Tours')}>
            {tourIds.map(this.renderOption)}
          </optgroup>
        ) : (
          []
        )}
      </HTMLSelect>
    );
  }

  /**
   * Handle `change` events for the HTMLSelect component.
   */
  handleChange = async (event: React.ChangeEvent<HTMLSelectElement>): Promise<void> => {
    const { value } = event.target;
    switch (value) {
      case '-':
        break;
      case 'ALL':
        await this._manager.tourManager.launch(
          this._manager.getNotebookTourIds(this._notebook),
          true
        );
        break;
      default:
        await this._manager.tourManager.launch([value], true);
        break;
    }
  };

  renderOption = (tourId: string): JSX.Element => {
    const tour = this._manager.tourManager.tours.get(tourId);
    return (
      <option key={tourId} value={tourId}>
        {tour?.label || tourId}
      </option>
    );
  };

  get translator(): TranslationBundle {
    return this._manager.tourManager.translator;
  }

  private _manager: INotebookTourManager;
  private _notebook: Notebook;
}
