import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as bok from '@eo4geo/bok-dataviz';
import { StudyProgram, StudyProgramService } from '../../services/studyprogram.service';
import { FieldsService } from '../../services/fields.service';
import { EscoCompetenceService } from '../../services/esco-competence.service';
import { ActivatedRoute } from '@angular/router';
import * as cv from '@eo4geo/curr-viz';
import { Module, ModuleService } from '../../services/module.service';

@Component({
  selector: 'app-newsp',
  templateUrl: './newsp.component.html',
  styleUrls: ['./newsp.component.scss']
})
export class NewspComponent implements OnInit {

  competences = [];
  filteredCompetences = [];
  fullcompetences = [];

  model = new StudyProgram('', '', '', '', '', 0, [], 0, null);
  modelModule = new Module('', '', 0, '', 0, '', [], [], []);

  textByDepth = 'Module';
  textByDepthRemove = 'Study Program';

  public value: string[];
  public current: string;

  selectedSP: StudyProgram;
  _id: string;
  mode: string;
  title: string;

  selectedNodes = [];
  hasResults = false;
  limitSearch = 5;
  currentConcept = 'GIST';

  isfullESCOcompetences = false;
  isSearchingExisting = false;

  currentTreeNode = null;

  configFields = {
    displayKey: 'concatName', // if objects array passed which key to be displayed defaults to description
    search: true, // true/false for the search functionlity defaults to false,
    height: '200px', // height of the list so that if there are more no of items it can show a scroll defaults to auto.
    placeholder: 'Select Field', // text to be displayed when no item is selected defaults to Select,
    customComparator: () => { }, // a custom function to sort the items. default is undefined and Array.sort() will be used
    noResultsFound: 'No results found!', // text to be displayed when no items are found while searching
    searchPlaceholder: 'Search Field', // label thats displayed in search input,
    searchOnKey: 'concatName' // key on which search should be performed. if undefined this will be extensive search on all keys
  };

  @ViewChild('textBoK') textBoK: ElementRef;

  constructor(
    private studyprogramService: StudyProgramService,
    public fieldsService: FieldsService,
    public escoService: EscoCompetenceService,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit() {
    //  bok.visualizeBOKData('#bubbles', 'assets/saved-bok.xml', '#textBoK');
    this.getMode();
    this.currentTreeNode = cv.getCurrentNode();
  }

  /* addBokKnowledge() {
     const divs = this.textBoK.nativeElement.getElementsByTagName('div');
     if (divs['bokskills'] != null) {
       const shortCode = this.textBoK.nativeElement.getElementsByTagName('h4')[0].innerText.split(' ')[0];
       const as = divs['bokskills'].getElementsByTagName('a');
       for (const skill of as) {
         if (!this.model.skills.includes(shortCode + ' ' + skill.innerText)) {
           this.model.skills.push(shortCode + ' ' + skill.innerText);
         }
       }
     }
     const concept = this.textBoK.nativeElement.getElementsByTagName('h4')[0]
       .textContent;
     if (!this.model.knowledge.includes(concept)) {
       this.model.knowledge.push(concept);
     }
   }

   removeCompetence(name: string, array: string[]) {
     array.forEach((item, index) => {
       if (item === name) {
         array.splice(index, 1);
       }
     });
   }

   */

  saveStudyProgram() {
    if (this.mode === 'copy') {
      this.studyprogramService.updateStudyProgram(this._id, this.model);
    } else {
      this.studyprogramService.addNewStudyProgram(this.model);
    }
  }

  getMode(): void {
    this.mode = this.route.snapshot.paramMap.get('mode');
    if (this.mode === 'duplicate' || this.mode === 'copy') {
      if (this.mode === 'copy') {
        this.title = 'Copy Study Program';
      } else {
        this.title = 'Duplicate Study Program';
      }
      this.getStudyprogramId();
      this.fillForm();
      // this.displayTree();
    } else {
      this.title = 'Add New Study Program';
      this.displayTree();
    }
  }

  getStudyprogramId(): void {
    this._id = this.route.snapshot.paramMap.get('name');
    this.studyprogramService
      .getStudyProgramById(this._id)
      .subscribe(sp => (this.selectedSP = sp));
  }

  fillForm(): void {
    this.studyprogramService
      .getStudyProgramById(this._id)
      .subscribe(sp => (this.model = sp));
  }

  searchInBok(text: string) {
    this.selectedNodes = bok.searchInBoK(text);
    this.hasResults = this.selectedNodes.length > 0 ? true : false;
    this.currentConcept = '';
  }

  navigateToConcept(conceptName) {
    bok.browseToConcept(conceptName);
    this.currentConcept = conceptName;
    this.hasResults = false;
    console.log('Navigate to concept :' + conceptName);
  }

  incrementLimit() {
    this.limitSearch = this.limitSearch + 5;
  }

  displayTree() {

    console.log('Display tree');

    const treeData = {
      'longName': 'New Study Program',
      'type': 'studyProgram',
      'name': 'New Study Program',
      'parent': 'null',
      'path': 0,
      'proportions': [],
      'r': 10,
      'children': []
    };

    cv.displayCurricula('graphTree', treeData);
    this.currentTreeNode = cv.getCurrentNode();
  }
  refreshCurrentNode() {
    this.currentTreeNode = cv.getCurrentNode();
    switch (this.currentTreeNode.depth) {
      case 0:
        this.textByDepth = 'Module';
        this.textByDepthRemove = 'Study Program';
        break;
      case 1:
        this.textByDepth = 'Course';
        this.textByDepthRemove = 'Module';
        break;
      case 2:
        this.textByDepth = 'Lecture';
        this.textByDepthRemove = 'Course';
        break;
      case 3:
        this.textByDepth = 'Lecture';
        this.textByDepthRemove = 'Lecture';
        break;
    }
  }

  addNodeInTree() {
    cv.addNewNode('New');
  }

  removeNodeInTree() {
    cv.removeSelectedNode();
  }

  updateNodeInTree() {
    cv.updateNode('New node');
  }
  /*
    addExtraSkill(skill) {
      this.model.skills.push(skill);
    }
    // Add custom competence to model to force updating component, and to competences lists to find it again if removed
    addExtraCompetence(comp) {
      this.model.competences = [...this.model.competences, { preferredLabel: comp }];
      this.escoService.allcompetences = [...this.escoService.allcompetences, { preferredLabel: comp }];
      this.escoService.basicCompetences = [...this.escoService.basicCompetences, { preferredLabel: comp }];
      console.log('add compr:' + comp);
    }
    fullListESCO() {
      this.isfullESCOcompetences = !this.isfullESCOcompetences;
    }
    // custom search to match term also in altLabels
    customSearchFn(term: string, item: Competence) {
      let found = false;
      term = term.toLocaleLowerCase();
      if (item.preferredLabel.toLocaleLowerCase().indexOf(term) > -1) {
        found = true;
      }
      if (item.altLabels && item.altLabels.length > 0) {
        item.altLabels.forEach((alt) => {
          if (alt.toLocaleLowerCase().indexOf(term) > -1) {
          found = true;
          }
        });
      }
      return found;
    }
    */
}
