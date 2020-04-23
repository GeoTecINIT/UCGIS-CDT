import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Module } from './module.service';
import { Course } from './course.service';
import { Lecture } from './lecture.service';
import { Field } from './fields.service';
import { BokInput } from '../model/bokinput';

const collection = 'StudyPrograms';

export class StudyProgram extends Object {
  public _id: string;
  public name: string;
  public description: string;
  public affiliation: string;
  public levelPublic: Boolean;
  public eqf: number;
  public children: Module[];
  public numSemesters: number;
  public field: Field;
  public userId: string;
  public concepts: string[];
  public linksToBok: BokInput[];
  public depth = 0;
  public bibliography: BokInput[];
  public orgId: string;
  public orgName: string;

  constructor(public currentNode: any = null) {
    super();
    if (currentNode) {
      this._id = currentNode.data._id ? currentNode.data._id : '';
      this.name = currentNode.data.name ? currentNode.data.name : 'New Curricula Item';
      this.description = currentNode.data.description ? currentNode.data.description : '';
      this.affiliation = currentNode.data.affiliation ? currentNode.data.affiliation : '';
      this.eqf = currentNode.data.eqf ? currentNode.data.eqf : 0;
      this.children = currentNode.children ? currentNode.children : [];
      this.numSemesters = currentNode.data.numSemesters ? currentNode.data.numSemesters : 0;
      this.field = currentNode.data.field ? currentNode.data.field : null;
      this.userId = currentNode.data.userId ? currentNode.data.userId : '';
      this.concepts = currentNode.data.concepts ? currentNode.data.concepts : [];
      this.currentNode = null;
      this.linksToBok = currentNode.data.linksToBok ? currentNode.data.linksToBok : [];
      this.levelPublic = currentNode.data.levelPublic ? currentNode.data.levelPublic : true;
      this.bibliography = currentNode.data.bibliography ? currentNode.data.bibliography : [];
      this.userId = currentNode.data.userId ? currentNode.data.userId : '';
      this.orgId = currentNode.data.orgId ? currentNode.data.orgId : '';
      this.orgName = currentNode.data.orgName ? currentNode.data.orgName : '';

    } else {
      this._id = '';
      this.name = 'New Curricula Item';
      this.description = '';
      this.affiliation = '';
      this.eqf = 0;
      this.children = [];
      this.numSemesters = 0;
      this.field = null;
      this.userId = '';
      this.concepts = [];
      this.linksToBok = [];
      this.levelPublic = true;
      this.bibliography = [];
      this.orgId = '';
      this.orgName = '';
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class StudyProgramService {
  private db: AngularFirestore;
  constructor(db: AngularFirestore) {
    this.db = db;
  }

  subscribeToStudyPrograms(): Observable<StudyProgram[]> {
    return this.db.collection<StudyProgram>(collection).valueChanges();
  }

  getStudyProgramById(studyProgId: string): Observable<StudyProgram> {
    return this.db
      .collection(collection)
      .doc<StudyProgram>(studyProgId)
      .valueChanges();
  }

  getItemByKeyFromCollection(key, col): Observable<any> {
    return this.db
      .collection(col)
      .doc<any>(key)
      .valueChanges();
  }

  addNewStudyProgram(newSP: StudyProgram) {
    const id = this.db.createId();
    newSP._id = id;
    newSP = this.convertNodeChildren(newSP);
    this.db
      .collection(collection)
      .doc(id)
      .set(Object.assign({}, newSP));
  }

  removeStudyProgram(studyProgId: string) {
    this.db
      .collection(collection)
      .doc(studyProgId)
      .delete();
  }

  updateStudyProgram(studyProgId: string, updatedSP: StudyProgram) {
    updatedSP = this.convertNodeChildren(updatedSP);
    this.db
      .collection(collection)
      .doc<StudyProgram>(studyProgId)
      .update(updatedSP);
  }

  // This function is to save all child nodes in the tree in a format that firestore likes
  convertNodeChildren(updateNode: any) {
    if (updateNode.children && updateNode.children.length > 0) {
      updateNode.children.forEach((child, i) => {
        this.convertNodeChildren(child);
        const d = child.data ? child.data.depth : child.depth;
        switch (d) {
          case 1: // Module
            updateNode.children[i] = new Module(child);
            break;
          case 2: // Course
            updateNode.children[i] = new Course(child);
            break;
          case 3: // Lecture
            updateNode.children[i] = new Lecture(child);
            break;
        }
      });
      updateNode.currentNode = null;
    }
    return updateNode;
  }
}
