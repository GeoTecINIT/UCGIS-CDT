import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { NgForOf } from '@angular/common';
import { Observable, Subscription } from 'rxjs';

import { StudyProgramService , StudyProgram} from '../../services/studyprogram.service';
import { FormControl } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  studyPrograms: StudyProgram[];
  advancedSearch = false;
  filteredStudyPrograms: any[];
  searchText: string;

  @ViewChild('dangerModal') public dangerModal: ModalDirective;

  constructor(private studyprogramService: StudyProgramService) { }

  ngOnInit() {
    this.studyprogramService
      .subscribeToStudyPrograms()
      .subscribe(studyPrograms => {
        this.studyPrograms = studyPrograms;
        this.filteredStudyPrograms = studyPrograms;
      });
  }

  removeStudyProgram(id: string) {
    this.studyprogramService.removeStudyProgram(id);
  }

  filter() {
    const search = this.searchText.toLowerCase();
    this.filteredStudyPrograms = [];
    this.filteredStudyPrograms = this.studyPrograms.filter(
      it =>
        it.name.toLowerCase().includes(search) ||
        it.level.toLowerCase().includes(search)
    );
  }
}
