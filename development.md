# Setting up for Development

Clone the repository and install the python package

```bash
git clone git@github.com:labmlai/inspectus.git
cd python
pip install -e .
```

User interface uses [Weya](https://github.com/vpj/weya) for rendering the components.

Clone the Weya Repository and create symbolic link in the  `ui/lib/` directory

```bash
git clone git@github.com:vpj/weya.git
# From the ui/lib/ directory of the project
ln -s [weya cloned directory]/weya
```

Install the dependencies for the UI

```bash
cd ui
npm install
```

Build the UI

```bash
npm run build
npm run watch #  To watch for changes
```

Compiled JS and CSS files are in the `ui/build/` directory. 

Python package looks for these files in `static` directory of the `inspectus` package directory. (`python/inspectus`). If not found, it will use the files from the `ui/build/` directory.
