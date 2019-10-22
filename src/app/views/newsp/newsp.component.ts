import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as bok from '@eo4geo/bok-dataviz';
import { StudyProgram, StudyProgramService } from '../../services/studyprogram.service';
import { FieldsService } from '../../services/fields.service';
import { EscoCompetenceService } from '../../services/esco-competence.service';
import { ActivatedRoute } from '@angular/router';
import * as cv from '@eo4geo/curr-viz';
import { Module } from '../../services/module.service';
import { Course } from '../../services/course.service';
import { Lecture } from '../../services/lecture.service';
import { BokInput } from '../../model/bokinput';

@Component({
  selector: 'app-newsp',
  templateUrl: './newsp.component.html',
  styleUrls: ['./newsp.component.scss']
})
export class NewspComponent implements OnInit {

  competences = [];
  filteredCompetences = [];
  fullcompetences = [];

  model = new StudyProgram(null);
  modelModule = new Module(null);
  modelCourse = new Course(null);
  modelLecture = new Lecture(null);

  textByDepth = 'module';
  textByDepthRemove = 'study program';

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
  isDisplayBoK = false;

  currentTreeNode = null;

  allStudyPrograms: StudyProgram[];

/*
  allModules: Module[];
  _allModules: Module[];

  allCourses: Course[];
  _allCourses: Course[];

  allLectures: Lecture[];
  _allLectures: Lecture[]; */

  filterText: String = '';

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
    this.studyprogramService
      .subscribeToStudyPrograms()
      .subscribe(res => (this.allStudyPrograms = res));
  }

  ngOnInit() {
    this.getMode();
    this.currentTreeNode = cv.getCurrentNode();
    bok.visualizeBOKData('#bubbles', 'assets/saved-bok.xml', '#textBoK');
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
    /*   modelModule = new Module('', '', 0, '', 0, '', [], [], []);
      modelCourse = new Course('', '', 0, '', 0, '', '', [], [], []);
      modelLecture = new Lecture('', '', '', 0, [], [], false);
   */
    this.isSearchingExisting = false;
    this.currentTreeNode = cv.getCurrentNode();
    switch (this.currentTreeNode.depth) {
      case 0:
        this.textByDepth = 'module';
        this.textByDepthRemove = 'study program';
        this.model = new StudyProgram(this.currentTreeNode);
        break;
      case 1:
        this.textByDepth = 'course';
        this.textByDepthRemove = 'module';
        this.modelModule = new Module(this.currentTreeNode);
        break;
      case 2:
        this.textByDepth = 'lecture';
        this.textByDepthRemove = 'course';
        this.modelCourse = new Course(this.currentTreeNode);
        break;
      case 3:
        this.textByDepth = 'lecture';
        this.textByDepthRemove = 'lecture';
        this.modelLecture = new Lecture(this.currentTreeNode);
        break;
    }
  }

  addNodeInTree() {
    cv.addNewNode('New');
  }

  addExistingToStudyProgram(node) {
    cv.addExistingNode(node);
  }

  removeNodeInTree() {
    cv.removeSelectedNode();
  }

  updateNodeInTree(node) {
    cv.updateNode(node);
  }

  updateTreeStudyProgram() {
    this.updateNodeInTree(this.model);
  }

  updateTreeModule() {
    this.updateNodeInTree(this.modelModule);
  }

  updateTreeCourse() {
    this.updateNodeInTree(this.modelCourse);
  }

  updateTreeLecture() {
    this.updateNodeInTree(this.modelLecture);
  }

  filterModules() {
    console.log ('TODO: filtering modules');
    // this.moduleService.filterModulesByNameDescription(this.filterText);
  }

  addBokKnowledge() {
    const concept = this.textBoK.nativeElement.getElementsByTagName('h4')[0]
      .textContent;
    const newConcept = new BokInput('', concept, concept, '', []);

    const divs = this.textBoK.nativeElement.getElementsByTagName('div');
    if (divs['bokskills'] != null) {
      const shortCode = this.textBoK.nativeElement.getElementsByTagName('h4')[0].innerText.split(' ')[0];
      const as = divs['bokskills'].getElementsByTagName('a');
      for (const skill of as) {
        newConcept.skills.push(skill.innerText);
      }
    }
    if (this.currentTreeNode.depth === 2) {
      if (!this.modelCourse.prerequisites.includes(newConcept)) {
        this.modelCourse.prerequisites.push(newConcept);
      }
    } else if (this.currentTreeNode.depth === 3) {
      if (!this.modelLecture.learningObjectives.includes(newConcept)) {
        this.modelLecture.learningObjectives.push(newConcept);
      }
    }
  }

  removeBokKnowledge(model, index, attrTxt) {
    model[attrTxt].splice(index, 1);
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
