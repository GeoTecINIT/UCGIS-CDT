import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { StudyProgramService, StudyProgram } from '../../services/studyprogram.service';
import { Module } from '../../services/module.service';
import { Course } from '../../services/course.service';
import { Lecture } from '../../services/lecture.service';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import * as cv from '@eo4geo/curr-viz';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

  statistics = [];

  currentTreeNode = null;
  model = null;

  selectedProgram: StudyProgram;
  @ViewChild('dangerModal') public dangerModal: ModalDirective;
  @ViewChild('graphC') graphCElem: ElementRef;
  @ViewChild('graphTreeDiv') graphTreeDiv: ElementRef;

  tree: any;

  constructor(
    public studyprogramService: StudyProgramService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.getStudyProgId();
  }

  getStudyProgId(): void {
    const _id = this.route.snapshot.paramMap.get('name');
    this.studyprogramService
      .getStudyProgramById(_id)
      .subscribe(program => {
        if (program) {
          this.selectedProgram = program;
          this.displayTree(program);
          console.log(this.selectedProgram);
        }
      });
  }

  displayTree(program) {
    program.parent = null;
    program.proportions = [];
    program.r = 10;
    cv.displayCurricula('graphTree', program, this.graphTreeDiv.nativeElement.clientWidth - 50, 650);
    this.refreshCurrentNode();
  }

  refreshTreeSize() {
    this.displayTree(this.selectedProgram);
  }

  refreshCurrentNode() {
    this.currentTreeNode = cv.getCurrentNode();
    switch (this.currentTreeNode.depth) {
      case 0:
        this.model = new StudyProgram(this.currentTreeNode);
        break;
      case 1:
        this.model = new Module(this.currentTreeNode);
        break;
      case 2:
        this.model = new Course(this.currentTreeNode);
        break;
      case 3:
        this.model = new Lecture(this.currentTreeNode);
        break;
    }
    console.log(this.model);
  }

}
