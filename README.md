# jupyterlab-tour

[![Extension status](https://img.shields.io/badge/status-ready-success 'ready to be used')](https://jupyterlab-contrib.github.io/)
[![Github Actions Status](https://github.com/jupyterlab-contrib/jupyterlab-tour/workflows/Build/badge.svg)](https://github.com/jupyterlab-contrib/jupyterlab-tour/actions?query=workflow%3ABuild)
[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/jupyterlab-contrib/jupyterlab-tour/main?urlpath=lab)
[![npm](https://img.shields.io/npm/v/jupyterlab-tour)](https://www.npmjs.com/package/jupyterlab-tour)
[![PyPI](https://img.shields.io/pypi/v/jupyterlab-tour)](https://pypi.org/project/jupyterlab-tour)
[![conda-forge](https://img.shields.io/conda/vn/conda-forge/jupyterlab-tour)](https://anaconda.org/conda-forge/jupyterlab-tour)

A JupyterLab UI Tour based on [react-joyride](https://docs.react-joyride.com).

![demo](https://raw.githubusercontent.com/jupyterlab-contrib/jupyterlab-tour/main/doc/tourDemo.gif)

## Install

To install the extension, execute:

```bash
pip install jupyterlab-tour
```

or

```bash
conda install -c conda-forge jupyterlab-tour
```

## Features

This extension has the following features:

- Default tours:
  - Welcome tour
  - Notebook tour
  - User-defined features in Settings
- Toast proposing to start a Tour
- If a Tour has already be seen by the user, this is saved in the state database. So you
  can start Tour on event only if the user have not seen it; e.g. the _Welcome Tour_ is
  launched at JupyterLab start except if the user have seen it.

> The state is cleaned if this extension is updated

- Tooltip are styled using JupyterLab theming system
- Commands to _add_ and _launch_ tours
- Through the _Tour Manager_ (`ITourManager` extension token), add, modify or delete a
  Tour
- Connect to Tour events through signals
- Override the default style (and options) for the Tour separately

This extension is inspired by
[@cdat/jupyterlab-tutorial](https://github.com/CDAT/jupyterlab-tutorial) licensed under
BSD 3-Clause License with Copyright (c) 2020, Lawrence Livermore National Security, LLC.

## Requirements

- JupyterLab >= 3.6

For JupyterLab 2.x, have look
[there](https://github.com/jupyterlab-contrib/jupyterlab-tour/tree/2.x).

> For developers, the API has changed between v3 (for JupyterLab 3) and v2 (for
> JupyterLab 2).

## How to add a Tour with Advanced Settings

As a user of JupyterLab, after you've installed `jupyterlab-tour`, you can create your
own _Tours_ as data.

- Open the JupyterLab _Advanced Settings_ panel <kbd>Ctrl+,</kbd>
- Select _Tours_ from list of settings groups
- In the editor, create JSON(5) compatible with the
  [react-joyride data model](https://docs.react-joyride.com/props)
- The _Tour_ will be available from the _Help Menu_, as well as the _Command Palette_

### A simple Tour

For example, to show a glowing button on the Jupyter logo, which reveals an orange
overlay when pressed:

```json5
// json5 can have comments
{
  tours: [
    {
      id: 'my-tour',
      label: 'My First Tour',
      // steps are required, and have many, many options
      steps: [{ target: '#jp-MainLogo', content: 'Look at this!' }],
      // below here not required!
      options: {
        styles: {
          options: {
            // you can use jupyterlab theme variables
            backgroundColor: 'var(--jp-warn-color0)'
          }
        }
      }
    }
  ]
}
```

## How to add a Tour to a Notebook

The same JSON used to create a Tour in _Advanced Settings_ can be added to a Notebook.

- Open the Notebook
- Open the _Property Inspector_ sidebar (the "gears" icon)
- Open _Advanced Tools_
- Create a key in _Notebook Metadata_ like:

```json
{
  "jupyterlab-tour": {
    "tours": []
  }
}
```

Now, when the notebook is opened, a "pin" icon will be visible in the _Notebook Toolbar_
which will allow lauching one (or all) of the tours saved in the Notebook.

### Shipping a Tour to Binder

On Binder, and elsewhere, you can store the above (_without_ comments) in an
[overrides.json] file and put it in the _right place_, e.g.
`{sys.prefix}/share/jupyter/lab/settings/overrides.json`. When JupyterLab is next
opened, those overrides will become the defaults, and your Tour will be available.

An example `overrides.json` might look like:

```json
{
  "jupyterlab-tour:user-tours": {
    "tours": []
  }
}
```

[overrides.json]:
  https://jupyterlab.readthedocs.io/en/stable/user/directories.html#overrides-json

## How to add Tour for my JupyterLab extension

As an extension developer, there are two methods to add a tour: the easiest is to use
JupyterLab commands and the advanced version is to request this extension token
`ITourManager`.

### Add a Tour with TypeScript

```ts
const { commands } = app;
// Add a Tour - returns the Tour or null if something went wrong
const tour = (await app.commands.execute('jupyterlab-tour:add', {
  tour: {
    // Tour must be of type ITour - see src/tokens.ts
    id: 'test-jupyterlab-tour:welcome',
    label: 'Welcome Tour',
    hasHelpEntry: true,
    steps: [
      // Step must be of type IStep - see src/tokens.ts
      {
        content:
          'The following tutorial will point out some of the main UI components within JupyterLab.',
        placement: 'center',
        target: '#jp-main-dock-panel',
        title: 'Welcome to Jupyter Lab!'
      },
      {
        content:
          'This is the main content area where notebooks and other content can be viewed and edited.',
        placement: 'left-end',
        target: '#jp-main-dock-panel',
        title: 'Main Content'
      }
    ]
    // can also define `options`
  }
})) as ITourHandler;
if (tour) {
  app.commands.execute('jupyterlab-tour:launch', {
    id: 'test-jupyterlab-tour:welcome',
    force: false // Optional, if false the Tour will start only if the user have not seen or skipped it
  });
}
```

> One example is available on
> [Mamba navigator](https://github.com/mamba-org/gator/blob/master/packages/labextension/src/index.ts#L76).
> Test it on [binder](https://mybinder.org/v2/gh/mamba-org/gator/master?urlpath=lab).

If you want to react to step changes to trigger elements of the UI (like opening
sidebar), you can connect to the `stepChanged` signal. Building from the previous
example, this snippet will open the filebrowser after the first step.

```ts
tour.stepChanged.connect((_, data) => {
  switch (data.type) {
    case 'step:after':
      if (data.step.target === '#jp-main-dock-panel') {
        commands.execute('filebrowser:activate');
      }
      break;
  }
});
```

> `data` is an object of type
> [`CallbackProps`](https://docs.react-joyride.com/callback).

## Disabling the User, Notebook, and Default Tours

If you _only_ wish to see the default _Welcome_ and _Notebook_ tours, or ones defined by
users, they can be disabled via the command line or a well-known file.

The examples below disable all tours not provided by third-party extensions. Adding
`jupyterlab-tour:plugin` to either of these will disable tours altogether!

### Disabling Tours from the Command Line

From the command line, run:

```bash
jupyter labextension disable "jupyterlab-tour:user-tours"
jupyter labextension disable "jupyterlab-tour:notebook-tours"
jupyter labextension disable "jupyterlab-tour:default-tours"
```

### Disabling Tours with `pageConfig.json`

Create a [pageConfig.json] and put it in _the right place_, e.g.
`{sys.prefix}/etc/jupyter/labconfig/pageconfig.json` and add the plugin IDs to
`disabledExtensions`.

```json
{
  "disabledExtensions": {
    "jupyterlab-tour:user-tours": true,
    "jupyterlab-tour:notebook-tours": true,
    "jupyterlab-tour:default-tours": true
  }
}
```

[pageConfig.json]:
  https://jupyterlab.readthedocs.io/en/stable/user/directories.html#labconfig-directories

## Uninstall

To remove the extension, execute:

```bash
pip uninstall jupyterlab-tour
```

or

```bash
conda remove -c conda-forge jupyterlab-tour
```

## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of [yarn](https://yarnpkg.com/) that
is installed with JupyterLab. You may use `yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the jupyterlab-tour directory
# Install package in development mode
pip install -e "."
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Rebuild extension Typescript source after making changes
jlpm build
```

You can watch the source directory and run JupyterLab at the same time in different
terminals to watch for changes in the extension's source and automatically rebuild the
extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and
available in your running JupyterLab. Refresh JupyterLab to load the change in your
browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm build` command generates the source maps for this extension to
make it easier to debug using the browser dev tools. To also generate source maps for
the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```

### Development uninstall

```bash
pip uninstall jupyterlab-tour
```

In development mode, you will also need to remove the symlink created by
`jupyter labextension develop` command. To find its location, you can run
`jupyter labextension list` to figure out where the `labextensions` folder is located.
Then you can remove the symlink named `jupyterlab-tour` within that folder.

### Testing the extension

#### Frontend tests

This extension is using [Jest](https://jestjs.io/) for JavaScript code testing.

To execute them, execute:

```sh
jlpm
jlpm test
```

#### Integration tests

This extension uses [Playwright](https://playwright.dev/docs/intro) for the integration
tests (aka user level tests). More precisely, the JupyterLab helper
[Galata](https://github.com/jupyterlab/jupyterlab/tree/master/galata) is used to handle
testing the extension in JupyterLab.

More information are provided within the [ui-tests](./ui-tests/README.md) README.

### Packaging the extension

See [RELEASE](RELEASE.md)
