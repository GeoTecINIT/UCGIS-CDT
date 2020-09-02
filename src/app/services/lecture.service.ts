import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { BokInput } from '../model/bokinput';
import { Field } from './fields.service';
import { Competence } from './esco-competence.service';

const collection = 'lectures';

export class Lecture extends Object {
  public _id: string;
  public name: string;
  public description: string;
  public ects: number;
  public bibliography: BokInput[];
  public isPractical: boolean;
  public concepts: string[];
  public linksToBok: BokInput[];
  public depth = 3;
  public userId: string;
  public affiliation: string;
  public levelPublic: Boolean;
  public children: null;
  public _children: null;
  public eqf: number;
  public field: Field;
  public fields: Field[];
  public orgId: string;
  public orgName: string;
  public division: string;
  public learningObjectives: BokInput[];
  public customCompetences: string[];
  public competences: Competence[];
  public isEdited: Boolean;
  public urlAff: string;
  public urlTM: string;

  data: any;

  constructor(
    public currentNode: any = null
  ) {
    super();
    if (currentNode && currentNode.data) {
      this._id = currentNode.data._id ? currentNode.data._id : '';
      this.name = currentNode.data.name ? currentNode.data.name : '';
      this.description = currentNode.data.description ? currentNode.data.description : '';
      this.ects = currentNode.data.ects ? currentNode.data.ects : 0;
      this.bibliography = currentNode.data.bibliography ? currentNode.data.bibliography : [];
      this.isPractical = currentNode.data.isPractical ? currentNode.data.isPractical : false;
      this.concepts = currentNode.data.concepts ? currentNode.data.concepts : [];
      this.currentNode = null;
      this.linksToBok = currentNode.data.linksToBok ? currentNode.data.linksToBok : [];
      this.userId = currentNode.data.userId ? currentNode.data.userId : '';
      this.affiliation = currentNode.data.affiliation ? currentNode.data.affiliation : '';
      this.levelPublic = currentNode.data.levelPublic != null ? currentNode.data.levelPublic : true;
      this.children = null;
      this._children = null;
      this.eqf = currentNode.data.eqf ? currentNode.data.eqf : 0;
      this.field = currentNode.data.field ? currentNode.data.field : null;
      this.fields = currentNode.data.fields ? currentNode.data.fields : [];
      if (this.field !== null && this.fields.length === 0) {
        this.fields.push(this.field);
      }
      this.orgId = currentNode.data.orgId ? currentNode.data.orgId : '';
      this.orgName = currentNode.data.orgName ? currentNode.data.orgName : '';
      this.division = currentNode.data.division ? currentNode.data.division : '';
      this.learningObjectives = currentNode.data.learningObjectives ? currentNode.data.learningObjectives : [];
      this.competences = currentNode.data.competences ? currentNode.data.competences : [];
      this.customCompetences = currentNode.data.customCompetences ? currentNode.data.customCompetences : [];
      this.isEdited = currentNode.data.isEdited != null ? currentNode.data.isEdited : false;
      this.urlAff = currentNode.data.urlAff ? currentNode.data.urlAff : '';
      this.urlTM = currentNode.data.urlTM ? currentNode.data.urlTM : '';

    } else {
      this._id = '';
      this.name = '';
      this.description = '';
      this.ects = 0;
      this.bibliography = [];
      this.isPractical = false;
      this.concepts = [];
      this.linksToBok = [];
      this.userId = '';
      this.affiliation = '';
      this.levelPublic = true;
      this.children = null;
      this._children = null;
      this.eqf = 0;
      this.field = null;
      this.fields = [];
      this.orgId = '';
      this.orgName = '';
      this.division = '';
      this.learningObjectives = [];
      this.competences = [];
      this.customCompetences = [];
      this.isEdited = false;
      this.urlAff = '';
      this.urlTM = '';
    }
  }
}
/*
@Injectable({
  providedIn: 'root'
})
 export class LectureService {
  private db: AngularFirestore;
  constructor(db: AngularFirestore) {
    this.db = db;
  }

  subscribeToLectures(): Observable<Lecture[]> {
    return this.db.collection<Lecture>(collection).valueChanges();
  }

  getLectureById(lectureId: string): Observable<Lecture> {
    return this.db
      .collection(collection)
      .doc<Lecture>(lectureId)
      .valueChanges();
  }

  addNewLecture(newLec: Lecture) {
    const id = this.db.createId();
    newLec._id = id;
    this.db
      .collection(collection)
      .doc(id)
      .set(newLec);
  }

  removeLecture(lectureId: string) {
    this.db
      .collection(collection)
      .doc(lectureId)
      .delete();
  }

  updateLecture(lectureId: string, updatedLec: Lecture) {
    this.db
      .collection(collection)
      .doc<Lecture>(lectureId)
      .update(updatedLec);
  }
} */
