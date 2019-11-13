import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { BokInput } from '../model/bokinput';

const collection = 'lectures';

export class Lecture extends Object {
  public _id: string;
  public name: string;
  public description: string;
  public ects: number;
  public bibliography: String;
  public isPractical: boolean;
  public concepts: string[];

  constructor(
    public currentNode: any = null
  ) {
    super();
    if (currentNode) {
      this._id = currentNode.data._id ? currentNode.data._id : '';
      this.name = currentNode.data.name ? currentNode.data.name : '';
      this.description = currentNode.data.description ? currentNode.data.description : '';
      this.ects = currentNode.data.ects ? currentNode.data.ects : 0;
      this.bibliography = currentNode.data.bibliography ? currentNode.data.bibliography : '';
      this.isPractical = currentNode.data.isPractical ? currentNode.data.isPractical : false;
      this.concepts = currentNode.data.concepts ? currentNode.data.concepts : [];
      this.currentNode = null;

    } else {
      this._id = '';
      this.name = '';
      this.description = '';
      this.ects = 0;
      this.bibliography = '';
      this.isPractical = false;
      this.concepts = [];
    }
  }
}

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
}
