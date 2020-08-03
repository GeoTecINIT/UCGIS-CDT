import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { BokInput } from '../model/bokinput';
import { Course } from './course.service';
import { Field } from './fields.service';
import { Competence } from './esco-competence.service';

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
  public inheritedLearningObjectives: BokInput[];
  public children: Course[];
  public _children: Course[];
  public concepts: string[];
  public linksToBok: BokInput[];
  public depth = 1;
  public userId: string;
  public affiliation: string;
  public levelPublic: Boolean;
  public eqf: number;
  public field: Field;
  public fields: Field[];
  public bibliography: BokInput[];
  public orgId: string;
  public orgName: string;
  public division: string;
  public customCompetences: string[];
  public competences: Competence[];
  public isEdited: Boolean;

  data: any;

  constructor(
    public currentNode: any = null
  ) {
    super();
    if (currentNode && currentNode.data) {
      this._id = currentNode.data._id ? currentNode.data._id : '';
      this.name = currentNode.data.name ? currentNode.data.name : '';
      this.description = currentNode.data.description ? currentNode.data.description : '';
      this.numSemester = currentNode.data.numSemester ? currentNode.data.numSemester : 0;
      this.ects = currentNode.data.ects ? currentNode.data.ects : 0;
      this.assessment = currentNode.data.assessment ? currentNode.data.assessment : '';
      this.prerequisites = currentNode.data.prerequisites ? currentNode.data.prerequisites : [];
      this.children = currentNode.children && currentNode.children.length > 0 ? currentNode.children : null;
      this._children = currentNode._children && currentNode._children.length > 0 ? currentNode._children : null;
      this.concepts = currentNode.data.concepts ? currentNode.data.concepts : [];
      this.currentNode = null;
      this.learningObjectives = currentNode.data.learningObjectives ? currentNode.data.learningObjectives : [];
      this.inheritedLearningObjectives = [];
      if (this.children && this.children.length > 0) {
        this.children.forEach(child => {
          // Courses
          if (child.data && child.data.learningObjectives) {
            child.data.learningObjectives.forEach(lo => {
              this.inheritedLearningObjectives.push(lo);
            });
          }
          // Lectures
          if (child.children && child.children.length > 0) {
            child.children.forEach(childL => {
              if (childL.data && childL.data.learningObjectives) {
                childL.data.learningObjectives.forEach(lo => {
                  this.inheritedLearningObjectives.push(lo);
                });
              }
            });
          }
        });
      }
      this.linksToBok = currentNode.data.linksToBok ? currentNode.data.linksToBok : [];
      this.userId = currentNode.data.userId ? currentNode.data.userId : '';
      this.affiliation = currentNode.data.affiliation ? currentNode.data.affiliation : '';
      this.levelPublic = currentNode.data.levelPublic != null ? currentNode.data.levelPublic : true;
      this.eqf = currentNode.data.eqf ? currentNode.data.eqf : 0;
      this.field = currentNode.data.field ? currentNode.data.field : null;
      this.fields = currentNode.data.fields ? currentNode.data.fields : [];
      if (this.field !== null && this.fields.length === 0) {
        this.fields.push(this.field);
      }
      this.bibliography = currentNode.data.bibliography ? currentNode.data.bibliography : [];
      this.orgId = currentNode.data.orgId ? currentNode.data.orgId : '';
      this.orgName = currentNode.data.orgName ? currentNode.data.orgName : '';
      this.division = currentNode.data.division ? currentNode.data.division : '';
      this.competences = currentNode.data.competences ? currentNode.data.competences : [];
      this.customCompetences = currentNode.data.customCompetences ? currentNode.data.customCompetences : [];
      this.isEdited = currentNode.data.isEdited != null ? currentNode.data.isEdited : false;

    } else {
      this._id = '';
      this.name = '';
      this.description = '';
      this.numSemester = 0;
      this.ects = 0;
      this.assessment = '';
      this.prerequisites = [];
      this.learningObjectives = [];
      this.inheritedLearningObjectives = [];
      this.children = null;
      this._children = null;
      this.concepts = [];
      this.linksToBok = [];
      this.userId = '';
      this.affiliation = '';
      this.levelPublic = true;
      this.eqf = 0;
      this.field = null;
      this.bibliography = [];
      this.orgId = '';
      this.orgName = '';
      this.division = '';
      this.competences = [];
      this.customCompetences = [];
      this.isEdited = false;
    }
  }
}
