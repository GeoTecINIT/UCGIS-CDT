import { Component, OnInit, ViewChild, ElementRef, OnDestroy, HostListener } from '@angular/core';
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
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { Organization, OrganizationService } from '../../services/organization.service';
import { User, UserService } from '../../services/user.service';


@Component({
  selector: 'app-newsp',
  templateUrl: './newsp.component.html',
  styleUrls: ['./newsp.component.scss']
})
export class NewspComponent implements OnInit, OnDestroy {

  competences = [];
  filteredCompetences = [];
  fullcompetences = [];

  model = null;
  modelModule = null;
  modelCourse = null;
  modelLecture = null;

  /*   model = new StudyProgram();
    modelModule = new Module(null);
    modelCourse = new Course(null);
    modelLecture = new Lecture(null); */

  textByDepth = 'module';
  textByDepthRemove = 'study program';
  linkBoKto = 'name';
  customLO = '';
  customBib = '';
  textSaved = '';

  // public value: string[];
  // public current: string;

  highestItemLevel = -1;

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
  isSearchingSpecific = false;
  isDisplayBoK = false;

  currentTreeNode = null;
  currentStudyProgram = null;

  allStudyPrograms: StudyProgram[];
  allItems: any[];

  filterText: String = '';
  filterTextAff: String = '';

  switchTitle = true;
  switchDescription = true;
  switchLO = true;
  switchPre = true;

  showMoreIndexSP = -1;
  showMoreIndexM = -1;
  showMoreIndexC = -1;
  showMoreIndexL = -1;

  depthSearching = 1;

  userOrgs: Organization[] = [];
  saveOrg: Organization;
  currentUser: User;

  isSaved = false;

  otherUserEditingWarningText = '';

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
  @ViewChild('graphTreeDiv') public graphTreeDiv: ElementRef;
  @ViewChild('bokModal') public bokModal: ModalDirective;

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event) {
    this.setEditing(false);
  }

  constructor(
    private studyprogramService: StudyProgramService,
    private organizationService: OrganizationService,
    private userService: UserService,
    public fieldsService: FieldsService,
    public escoService: EscoCompetenceService,
    private route: ActivatedRoute,
    private afAuth: AngularFireAuth,
    public analytics: AngularFireAnalytics
  ) {
    this.studyprogramService
      .subscribeToStudyPrograms()
      .subscribe(res => {
        this.allStudyPrograms = res;
        // this is for the exploring existing
        this.exploreChildrenToAddItems();
      });
    this.afAuth.auth.onAuthStateChanged(user => {
      if (user) {
        this.userService.getUserById(user.uid).subscribe(userDB => {
          this.currentUser = new User(userDB);
          if (this.currentUser.organizations && this.currentUser.organizations.length > 0) {
            this.currentUser.organizations.forEach(orgId => {
              this.organizationService.getOrganizationById(orgId).subscribe(org => {
                if (org) {
                  this.userOrgs.push(org);
                  this.saveOrg = this.userOrgs[0];
                  this.setOrganization();
                } else { // this org has been deleted. remove
                  const indexToRemove = this.currentUser.organizations.indexOf(orgId);
                  if (indexToRemove !== -1) {
                    this.currentUser.organizations.splice(indexToRemove, 1);
                    this.userService.updateUserWithId(this.currentUser._id, this.currentUser);
                  }
                }
              });
            });
          }
        });
      }
    });
  }

  ngOnInit() {
    this.getMode();
    this.currentTreeNode = cv.getCurrentNode();
    console.log('Display existing tree : ');
    bok.visualizeBOKData('#bubbles', 'assets/saved-bok.xml', '#textBoK');
    this.analytics.logEvent('NewSP', { 'mode': this.mode });
  }

  ngOnDestroy(): void {
    console.log('*******OnDestroy');
    this.setEditing(false);
  }

  setEditing(bool) {
    this.studyprogramService.updateStudyProgramIsEdited(this._id, bool);
  }

  saveStudyProgram() {
    let modelToSave = null;
    switch (this.highestItemLevel) {
      case 0:
        modelToSave = this.model;
        break;
      case 1:
        modelToSave = this.modelModule;
        break;
      case 2:
        modelToSave = this.modelCourse; // JSON.parse(JSON.stringify(this.modelCourse));
        break;
      case 3:
        modelToSave = this.modelLecture;
        break;
    }
    console.log('Save model with depth: ' + this.highestItemLevel);
    console.log(modelToSave);

    modelToSave.userId = this.afAuth.auth.currentUser.uid;
    modelToSave.orgId = this.saveOrg._id;
    modelToSave.orgName = this.saveOrg.name;
    modelToSave.levelPublic = this.model.levelPublic;

    if (this.mode === 'copy') {
      this.studyprogramService.updateStudyProgram(this._id, modelToSave);
    } else {
      this.studyprogramService.addNewStudyProgram(modelToSave);
    }
    this.isSaved = true;
    this.mode = 'copy'; // if it's second time editing change to
    this._id = modelToSave._id;
    this.refreshTreeSize();
  }

  getMode(): void {
    this.mode = this.route.snapshot.paramMap.get('mode');
    if (this.mode === 'duplicate' || this.mode === 'copy') {
      if (this.mode === 'copy') {
        this.title = 'Edit Curriculum Item';
      } else {
        this.title = 'Duplicate Curriculum Item';
      }
      this.fillForm();
    } else {
      this.title = 'Add New Curriculum Item';
      this.displayTree();
    }
  }

  getStudyprogramId(): void {
    this._id = this.route.snapshot.paramMap.get('name');
    const spObs = this.studyprogramService
      .getStudyProgramById(this._id)
      .subscribe(sp => {
        this.selectedSP = sp;
        spObs.unsubscribe();
      });
  }

  fillForm(): void {
    this._id = this.route.snapshot.paramMap.get('name');
    if (this.mode === 'copy') {
      this.setEditing(true);
    }
    const spObs = this.studyprogramService
      .getStudyProgramById(this._id)
      .subscribe(sp => {
        this.isSaved = true;
        if (this.model == null) {
          this.model = sp;
          switch (sp.depth) {
            case 0:
              this.model = sp;
              break;
            case 1:
              this.modelModule = sp;
              break;
            case 2:
              this.modelCourse = sp;
              break;
            case 3:
              this.modelLecture = sp;
              break;
          }
          this.highestItemLevel = this.model.depth;
          this.depthSearching = this.highestItemLevel + 1;
          this.setOrganization();
          this.displayTree(sp);
          console.log(sp);
          console.log('Highest item level: ' + this.highestItemLevel);
        } else {
          if (this.currentUser._id !== sp.userId) {
            // warn of other user editing it
            this.otherUserEditingWarningText = 'It looks like other user is editing this content. Despite the fact that automatic save is done frequently, some content may be lost.';
          }
        }
        // spObs.unsubscribe(); // do not recieve more notifications
      });
  }

  setOrganization() {
    // iterate orgs to select right one
    if (this.userOrgs.length > 0 && this.currentUser && this.model) {
      this.userOrgs.forEach(o => {
        if (o._id === this.model.orgId) {
          this.saveOrg = o;
        }
      });
    }
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
    const width = this.graphTreeDiv.nativeElement.clientWidth > 0 ? this.graphTreeDiv.nativeElement.clientWidth : 400;
    if (program) {
      console.log('Display existing tree : ');
      console.log(program);
      program.parent = null;
      program.proportions = [];
      program.r = 10;
      cv.displayCurricula('graphTree', program, width, 650);
      this.refreshCurrentNode();
    } else {
      console.log('Display new tree');
      cv.displayCurricula('graphTree', null, width, 650);
      this.currentTreeNode = cv.getCurrentNode();
    }
  }

  onResize() {
    // this.displayTree(this.model);
    this.refreshTreeSize();
  }

  refreshTreeSize() {
    if (this.currentTreeNode && this.currentTreeNode.data) {
      switch (this.highestItemLevel) {
        case 0:
          this.displayTree(this.model);
          break;
        case 1:
          this.displayTree(this.modelModule);
          break;
        case 2:
          this.displayTree(this.modelCourse);
          break;
        case 3:
          this.displayTree(this.modelLecture);
          break;
      }
    }
  }

  refreshCurrentNode() {
    console.log('refresh currrent node');
    console.log(this.currentTreeNode);
    this.isSearchingExisting = false;
    this.currentTreeNode = cv.getCurrentNode();
    console.log(this.currentTreeNode);
    this.depthSearching = this.currentTreeNode.data.depth + 1;
    switch (this.currentTreeNode.data.depth) {
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
        this.currentTreeNode.children = null;
        this.modelLecture = new Lecture(this.currentTreeNode);
        break;
    }
  }

  addNodeInTree(depth) {
    if (this.highestItemLevel === -1) {
      this.highestItemLevel = depth;
      this.depthSearching = this.highestItemLevel + 1;
    }
    cv.addNewNodeWithDepth('New', depth);
    this.updateTreeStudyProgram();
    this.refreshCurrentNode();
  }

  addExistingToStudyProgram(node) {
    cv.addExistingNode(node);
    this.updateTreeStudyProgram();
    this.refreshCurrentNode();
  }

  removeNodeInTree() {
    this.isSaved = false;
    cv.removeSelectedNode();
  }

  updateNodeInTree(node) {
    cv.updateNode(node);
  }

  updateTreeStudyProgram() {
    this.isSaved = false;
    if (this.currentTreeNode && this.currentTreeNode.data) {
      switch (this.currentTreeNode.data.depth) {
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
  }

  addBokKnowledge() {
    const concept = this.textBoK.nativeElement.getElementsByTagName('h4')[0]
      .textContent;

    const newConcept = new BokInput('', concept, concept, '', [], '', []);

    const divs = this.textBoK.nativeElement.getElementsByTagName('div');
    if (divs['bokskills'] != null) {
      const shortCode = this.textBoK.nativeElement.getElementsByTagName('h4')[0].innerText.split(' ')[0];
      const as = divs['bokskills'].getElementsByTagName('a');
      for (const skill of as) {
        newConcept.skills.push(skill.innerText);
      }
    }
    if (divs['boksource'] != null) {
      const shortCode = this.textBoK.nativeElement.getElementsByTagName('h4')[0].innerText.split(' ')[0];
      const as = divs['boksource'].getElementsByTagName('a');
      for (const bib of as) {
        newConcept.bibliography.push(bib.innerText);
      }
    }

    let modelToUpdate;
    switch (this.currentTreeNode.data.depth) {
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
        newConcept.linkedTo = 'name';
        modelToUpdate[this.linkBoKto] = modelToUpdate[this.linkBoKto] + ' ' + concept;
        break;
      case 'description':
        // tslint:disable-next-line:max-line-length
        const desc = this.textBoK.nativeElement.children[2].children.length > 0 ? this.textBoK.nativeElement.children[2].children[1].textContent : '';
        newConcept.linkedTo = 'description';
        modelToUpdate[this.linkBoKto] = modelToUpdate[this.linkBoKto] + ' ' + desc;  // currentDescription
        break;
      case 'prerequisites':
        newConcept.linkedTo = 'prerequisites';
        if (!modelToUpdate.prerequisites.includes(newConcept)) {
          modelToUpdate.prerequisites.push(newConcept);
        }
        break;
      case 'learningObjectives':
        newConcept.linkedTo = 'learningObjectives';
        if (!modelToUpdate.learningObjectives.includes(newConcept)) {
          newConcept.skills.forEach(sk => {
            const newSkill = new BokInput('', sk, newConcept.concept_id, '', [], 'learningObjectives', []);
            modelToUpdate.learningObjectives.push(newSkill);
          });
        }
        break;
      case 'bibliography':
        newConcept.linkedTo = 'bibliography';
        if (!modelToUpdate.bibliography.includes(newConcept)) {
          newConcept.bibliography.forEach(bib => {
            const newBib = new BokInput('', bib, newConcept.concept_id, '', [], 'bibliography', []);
            modelToUpdate.bibliography.push(newBib);
          });
        }
        break;
    }
    modelToUpdate.linksToBok.push(newConcept);
    modelToUpdate.concepts.push(newConcept.concept_id);

    this.bokModal.hide();
    this.updateTreeStudyProgram();
  }

  removeBokKnowledge(model, index, attrTxt) {
    model[attrTxt].splice(index, 1);
    model.concepts.splice(index, 1);
    this.updateTreeStudyProgram();
  }

  addCustomLO() {
    this.modelCourse.learningObjectives.push(new BokInput('', this.customLO, this.customLO, '', [], '', []));
    this.customLO = '';
  }

  addCustomBib(model) {
    model.bibliography.push(new BokInput('', this.customBib, this.customBib, '', [], '', []));
    this.customBib = '';
  }

  showExistingToStudyProgram(node) {
    this.currentStudyProgram = node;
  }

  exploreChildrenToAddItems() {
    this.allItems = [];
    this.allStudyPrograms.forEach(s => {
      this.allItems.push(s);
      if (s.children) {
        s.children.forEach(m => {
          m.affiliation = s.affiliation; // propagate affiliation and eqf to children
          m.eqf = s.eqf;
          m.field = s.field;
          this.allItems.push(m);
          if (m.children) {
            m.children.forEach(c => {
              c.affiliation = s.affiliation; // propagate affiliation and eqf to children
              c.eqf = s.eqf;
              c.field = s.field;
              this.allItems.push(c);
              if (c.children) {
                c.children.forEach(l => {
                  l.affiliation = s.affiliation; // propagate affiliation and eqf to children
                  l.eqf = s.eqf;
                  l.field = s.field;
                  this.allItems.push(l);
                });
              }
            });
          }
        });
      }
    });
    this.allItems.sort((left, right) => {
      if (left.name < right.name) { return -1; }
      if (left.name > right.name) { return 1; } else { return 0; }
    });

    // console.log(this.allItems);
  }
}
