import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Module } from './module.service';
import { Course } from './course.service';
import { Lecture } from './lecture.service';
import { Field } from './fields.service';

const collection = 'StudyPrograms';

export class StudyProgram extends Object {

  public _id: string;
  public name: string;
  public description: string;
  public affiliation: string;
  // public level: string;
  public eqf: number;
  public children: Module[];
  public numSemesters: number;
  public field: Field;
  public userId: string;

  constructor(
    public currentNode: any = null
  ) {
    super();
    if (currentNode) {
      this._id = currentNode.data.id ? currentNode.data.id : '';
      this.name = currentNode.data.name ? currentNode.data.name : '';
      this.description = currentNode.data.description ? currentNode.data.description : '';
      this.affiliation = currentNode.data.affiliation ? currentNode.data.affiliation : '';
     //  this.level = currentNode.data.level ? currentNode.data.level : '';
      this.eqf = currentNode.data.eqf ? currentNode.data.eqf : 0;
      this.children = currentNode.children ? currentNode.children : [];
      this.numSemesters = currentNode.data.numSemesters ? currentNode.data.numSemesters : 0;
      this.field = currentNode.data.field ? currentNode.data.field : null;
      this.userId = currentNode.data.userId ? currentNode.data.userId : '';
      // this.currentNode = null;
    } else {
      this._id = '';
      this.name = '';
      this.description = '';
      this.affiliation = '';
     // this.level = '';
      this.eqf = 0;
      this.children = [];
      this.numSemesters = 0;
      this.field = null;
      this.userId = '';
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
        switch (child.depth) {
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
