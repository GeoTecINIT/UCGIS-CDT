import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Module } from './module.service';
import { Field } from './fields.service';

const collection = 'studyprograms';

export class StudyProgram extends Object {

  public _id: string;
  public name: string;
  public description: string;
  public affiliation: string;
  public level: string;
  public eqf: number;
  public modules: Module[];
  public numSemesters: number;
  public field: Field;
   // -- public children = []; // needed for D3 nodes

  constructor(
    public currentNode: any = null
  ) {
    super();
    if (currentNode) {
      this._id = currentNode.data.id;
      this.name = currentNode.data.name;
      this.description = currentNode.data.description;
      this.affiliation = currentNode.data.affiliation;
      this.level = currentNode.data.level;
      this.eqf = currentNode.data.eqf;
      this.modules = currentNode.data.modules;
      this.numSemesters = currentNode.data.numSemesters;
      this.field = currentNode.data.field;

    } else {
      this._id = '';
      this.name = '';
      this.description = '';
      this.affiliation = '';
      this.level = '';
      this.eqf = 0;
      this.modules = [];
      this.numSemesters = 0;
      this.field = null;
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
    this.db
      .collection(collection)
      .doc(id)
      .set(newSP);
  }

  removeStudyProgram(studyProgId: string) {
    this.db
      .collection(collection)
      .doc(studyProgId)
      .delete();
  }

  updateStudyProgram(studyProgId: string, updatedSP: StudyProgram) {
    this.db
      .collection(collection)
      .doc<StudyProgram>(studyProgId)
      .update(updatedSP);
  }
}
