## UCGIS - Curriculum Design Tool (CDT)

#### Introduction

The [Curriculum Design Tool](https://ucgis-tools-cdt.web.app/) (CDT) allows users to create, edit and find educational offers in the field of Earth Observation and Geographic Information. Educational offers may benefit from the UCGIS BoK, by re-using descriptions of related BoK concepts and link specific EO/GI BoK concepts and skills. The modularity of the tool allows to create educational offers at different levels of granularity, from an entire study program to a single lecture or lesson. 
This allows its use by a broad range of educational offers by various providers, ranging from academia programs to high school curricula or VET trainings. It also allows re-use of educational offers, by duplicating or promoting existing offers and adapting them to the user’s needs. The tool displays a list of innovative training offers, populated by UCGIS partners. The [European Skills/Competences and Occupation (ESCO)](https://ec.europa.eu/esco/portal/skill) classification is used for the inclusion of transversal skills. 

#### Authors
The UCGIS BoK tools are developed by the [Geospatial Technologies Research Group](http://geotec.uji.es/) (GEOTEC) from the University Jaume I, Castellón (Spain) and are Licenced under GNU GPLv3.

[![DOI](https://zenodo.org/badge/211871500.svg)](https://zenodo.org/badge/latestdoi/211871500)


## Installation

#### Prerequisites
Before you begin, make sure your development environment includes `Node.js®` and an `npm` package manager.

###### Node.js
Angular requires `Node.js` version 8.x or 10.x.

- To check your version, run `node -v` in a terminal/console window.
- To get `Node.js`, go to [nodejs.org](https://nodejs.org/).

###### Angular CLI
Install the Angular CLI globally using a terminal/console window.
```bash
npm install -g @angular/cli
```

### Clone repo

``` bash
# clone the repo
$ git clone https://github.com/GeoTecINIT/UCGIS-CDT.git my-project

# go into app's directory
$ cd my-project

# install app's dependencies
$ npm install
```

## Firebase
Set up a Firebase project, and copy keys to src/environments/environments.ts 

## Usage

``` bash
# serve with hot reload at localhost:4200.
$ ng serve

# build for production with minification
$ ng build
```
