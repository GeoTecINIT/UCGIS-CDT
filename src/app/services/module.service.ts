import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { BokInput } from '../model/bokinput';
import { Course } from './course.service';

const collection = 'modules';

export class Module extends Object {
  public _id: string;
  public name: string;
  public numSemester: number;
  public description: string;
  public ects: number;
  public assessment: string;
  public prerequisites: BokInput[];
  public learningObjectives: BokInput[];
  public children: Course[];
  public concepts: string[];
  public linksToBok: BokInput[];
  public depth = 1;

  constructor(
    public currentNode: any = null
  ) {
    super();
    if (currentNode) {
      this._id = currentNode.data._id ? currentNode.data._id : '';
      this.name = currentNode.data.name ? currentNode.data.name : '';
      this.description = currentNode.data.description ? currentNode.data.description : '';
      this.numSemester = currentNode.data.numSemester ? currentNode.data.numSemester : 0;
      this.ects = currentNode.data.ects ? currentNode.data.ects : 0;
      this.assessment = currentNode.data.assessment ? currentNode.data.assessment : '';
      this.prerequisites = currentNode.data.prerequisites ? currentNode.data.prerequisites : [];
      this.children = currentNode.children ? currentNode.children : [];
      this.concepts = currentNode.data.concepts ? currentNode.data.concepts : [];
      this.currentNode = null;
      this.learningObjectives = [];
      if (this.children.length > 0) {
        this.children.forEach(child => {
          if (child.data && child.data.learningObjectives) {
            child.data.learningObjectives.forEach(lo => {
              this.learningObjectives.push(lo);
            });
          }
        });
      }
      this.linksToBok = currentNode.data.linksToBok ? currentNode.data.linksToBok : [];
    } else {
      this._id = '';
      this.name = '';
      this.description = '';
      this.numSemester = 0;
      this.ects = 0;
      this.assessment = '';
      this.prerequisites = [];
      this.learningObjectives = [];
      this.children = [];
      this.concepts = [];
      this.linksToBok = [];
    }
  }
}

@Injectable({
  providedIn: 'root'
})

export class ModuleService {
  public allModules: Module[] = [];
  public _allModules: Module[];
  private db: AngularFirestore;

  constructor(db: AngularFirestore) {
    this.db = db;
    this.getAllModules();
  }

  subscribeToModules(): Observable<Module[]> {
    return this.db.collection<Module>(collection).valueChanges();
  }

  getAllModules() {
    this.subscribeToModules()
      .subscribe(m => (this.allModules = m, this._allModules = m));
  }

  filterModulesByNameDescription(txt) {
    /*
    return this.allModules.filter(function(el) {
         return el.name.toLowerCase().indexOf(txt.toLowerCase()) > -1;
     });
     */
  }

  getModuleById(moduleId: string): Observable<Module> {
    return this.db
      .collection(collection)
      .doc<Module>(moduleId)
      .valueChanges();
  }

  addNewModule(newMod: Module) {
    const id = this.db.createId();
    newMod._id = id;
    this.db
      .collection(collection)
      .doc(id)
      .set(newMod);
  }

  removeModule(moduleId: string) {
    this.db
      .collection(collection)
      .doc(moduleId)
      .delete();
  }

  updateModule(moduleId: string, updatedMod: Module) {
    this.db
      .collection(collection)
      .doc<Module>(moduleId)
      .update(updatedMod);
  }


}
