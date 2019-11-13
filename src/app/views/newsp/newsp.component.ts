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
import { AngularFireAuth } from '@angular/fire/auth';
import { ModalDirective } from 'ngx-bootstrap/modal';


@Component({
  selector: 'app-newsp',
  templateUrl: './newsp.component.html',
  styleUrls: ['./newsp.component.scss']
})
export class NewspComponent implements OnInit {

  competences = [];
  filteredCompetences = [];
  fullcompetences = [];

  model = new StudyProgram();
  modelModule = new Module(null);
  modelCourse = new Course(null);
  modelLecture = new Lecture(null);

  textByDepth = 'module';
  textByDepthRemove = 'study program';
  linkBoKto = 'name';

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

  filterText: String = '';

  switchTitle = true;
  switchDescription = true;
  switchLO = true;
  switchPre = true;

  showMoreIndexSP = -1;
  showMoreIndexM = -1;
  showMoreIndexC = -1;
  showMoreIndexL = -1;

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

  @ViewChild('bokModal') public bokModal: ModalDirective;

  constructor(
    private studyprogramService: StudyProgramService,
    public fieldsService: FieldsService,
    public escoService: EscoCompetenceService,
    private route: ActivatedRoute,
    private afAuth: AngularFireAuth
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

  saveStudyProgram() {
    this.model.userId = this.afAuth.auth.currentUser.uid;
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
      this.fillForm();
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
    this._id = this.route.snapshot.paramMap.get('name');
    this.studyprogramService
      .getStudyProgramById(this._id)
      .subscribe(sp => {
        this.model = sp;
        this.displayTree(sp);
        console.log(sp);
      });
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

  displayTree(program = null) {

    if (program) {
      console.log('Display existing tree');
      program.parent = null;
      program.proportions = [];
      program.r = 10;
      cv.displayCurricula('graphTree', program);
      this.refreshCurrentNode();
    } else {

      console.log('Display new tree');
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
  }

  refreshCurrentNode() {
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
    this.updateTreeStudyProgram();
  }

  addExistingToStudyProgram(node) {
    cv.addExistingNode(node);
    this.updateTreeStudyProgram();
  }

  removeNodeInTree() {
    cv.removeSelectedNode();
  }

  updateNodeInTree(node) {
    cv.updateNode(node);
  }

  updateTreeStudyProgram() {
    switch (this.currentTreeNode.depth) {
      case 0:
        this.updateNodeInTree(this.model);
        break;
      case 1:
        this.updateNodeInTree(this.modelModule);
        break;
      case 2:
        this.updateNodeInTree(this.modelCourse);
        break;
      case 3:
        this.updateNodeInTree(this.modelLecture);
        break;
    }
  }

  filterModules() {
    console.log('TODO: filtering modules');
    // this.moduleService.filterModulesByNameDescription(this.filterText);
  }

  addBokKnowledge() {
    const concept = this.textBoK.nativeElement.getElementsByTagName('h4')[0]
      .textContent;
    const desc = this.textBoK.nativeElement.children[1].children[3].textContent;

    const newConcept = new BokInput('', concept, concept, '', []);

    const divs = this.textBoK.nativeElement.getElementsByTagName('div');
    if (divs['bokskills'] != null) {
      const shortCode = this.textBoK.nativeElement.getElementsByTagName('h4')[0].innerText.split(' ')[0];
      const as = divs['bokskills'].getElementsByTagName('a');
      for (const skill of as) {
        newConcept.skills.push(skill.innerText);
      }
    }

    let modelToUpdate;
    switch (this.currentTreeNode.depth) {
      case 0:
        modelToUpdate = this.model;
        break;
      case 1:
        modelToUpdate = this.modelModule;
        break;
      case 2:
        modelToUpdate = this.modelCourse;
        break;
      case 3:
        modelToUpdate = this.modelLecture;
        break;
    }

    switch (this.linkBoKto) {
      case 'name':
        modelToUpdate[this.linkBoKto] = modelToUpdate[this.linkBoKto] + ' ' + concept;
        break;
      case 'description':
        modelToUpdate[this.linkBoKto] = modelToUpdate[this.linkBoKto] + ' ' + desc;
        break;
      case 'prerequisites':
        if (!modelToUpdate.prerequisites.includes(newConcept)) {
          modelToUpdate.prerequisites.push(newConcept);
        }
        break;
      case 'learningObjectives':
        if (!modelToUpdate.learningObjectives.includes(newConcept)) {
          newConcept.skills.forEach(sk => {
            const newSkill = new BokInput('', sk, newConcept.concept_id, '', []);
            modelToUpdate.learningObjectives.push(newSkill);
          });
        }
        break;
    }
    this.bokModal.hide();
    this.updateTreeStudyProgram();
  }

  removeBokKnowledge(model, index, attrTxt) {
    model[attrTxt].splice(index, 1);
  }

}
