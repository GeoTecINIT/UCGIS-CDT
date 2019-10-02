import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { BokInput } from '../model/bokinput';

const collection = 'lectures';

export class Lecture extends Object {
  constructor(
    public _id: string,
    public name: string,
    public description: string,
    public ects: number,
    public sourceDocs: BokInput [],
    public learningObjectives: BokInput [],
    public isPractical: boolean
  ) {
    super();
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
