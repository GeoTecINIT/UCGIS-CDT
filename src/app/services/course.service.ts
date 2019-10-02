import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { BokInput } from '../model/bokinput';
import { Lecture } from './lecture.service';

const collection = 'courses';

export class Course extends Object {
  constructor(
    public _id: string,
    public name: string,
    public numSemester: number,
    public description: string,
    public ects: number,
    public assessment: string,
    public prerequisites: BokInput [],
    public learningObjectives: BokInput [],
    public lectures: Lecture[]
  ) {
    super();
  }
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private db: AngularFirestore;
  constructor(db: AngularFirestore) {
    this.db = db;
  }

  subscribeToCourses(): Observable<Course[]> {
    return this.db.collection<Course>(collection).valueChanges();
  }

  getCourseById(courseId: string): Observable<Course> {
    return this.db
      .collection(collection)
      .doc<Course>(courseId)
      .valueChanges();
  }

  addNewCourse(newCourse: Course) {
    const id = this.db.createId();
    newCourse._id = id;
    this.db
      .collection(collection)
      .doc(id)
      .set(newCourse);
  }

  removeCourse(courseId: string) {
    this.db
      .collection(collection)
      .doc(courseId)
      .delete();
  }

  updateCourse(courseId: string, updatedCourse: Course) {
    this.db
      .collection(collection)
      .doc<Course>(courseId)
      .update(updatedCourse);
  }

}
