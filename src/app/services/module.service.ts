import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { BokInput } from '../model/bokinput';
import { Course } from './course.service';
import { Field } from './fields.service';

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
  public userId: string;
  public affiliation: string;
  public levelPublic: Boolean;
  public eqf: number;
  public field: Field;
  public bibliography: BokInput[];


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
      this.userId = currentNode.data.userId ? currentNode.data.userId : '';
      this.affiliation = currentNode.data.affiliation ? currentNode.data.affiliation : '';
      this.levelPublic = currentNode.data.levelPublic ? currentNode.data.levelPublic : true;
      this.eqf = currentNode.data.eqf ? currentNode.data.eqf : 0;
      this.field = currentNode.data.field ? currentNode.data.field : null;
      this.bibliography = currentNode.data.bibliography ? currentNode.data.bibliography : [];

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
      this.userId = '';
      this.affiliation = '';
      this.levelPublic = true;
      this.eqf = 0;
      this.field = null;
      this.bibliography = [];
    }
  }
}
