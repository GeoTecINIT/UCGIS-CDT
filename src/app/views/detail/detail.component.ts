import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { StudyProgramService, StudyProgram } from '../../services/studyprogram.service';
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
  selectedItem = null;

  selectedProgram: StudyProgram;
  @ViewChild('dangerModal') public dangerModal: ModalDirective;
  @ViewChild('graphC') graphCElem: ElementRef;

  tree: any;
  isCollapsed = false;

  constructor(
    public studyprogramService: StudyProgramService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.getOccuProfileId();
  }

  getOccuProfileId(): void {
    const _id = this.route.snapshot.paramMap.get('name');
    this.studyprogramService
      .getStudyProgramById(_id)
      .subscribe(program => {
        this.selectedProgram = program;
        this.selectedItem = program;
        this.displayTree(program);
      });
  }

  displayTree(program) {

    /*     const treeData = {
          'longName': 'New Study Program',
          'type': 'studyProgram',
          'name': 'New Study Program',
          'parent': 'null',
          'path': 0,
          'proportions': [],
          'r': 10,
          'children': []
        };
     */

    program.parent = null;
    program.proportions = [];
    program.r = 10;

    console.log('display graphTree');
    cv.displayCurricula('graphTree', program);
  }

  addNode(name: string = 'New node') {
    console.log('Name:' + name);
    cv.addNewNode(name);
  }

  removeNode() {
    console.log('remove node');
    cv.removeSelectedNode();
  }

  selectItem(key, collection) {
    console.log('select item: ' + key + ' from ' + collection);
    this.studyprogramService
      .getItemByKeyFromCollection(key, collection).subscribe(item => (this.selectedItem = item));
  }

  deselectItem() {
    this.selectedItem = null;
  }

}
