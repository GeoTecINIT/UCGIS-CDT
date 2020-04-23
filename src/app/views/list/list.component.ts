import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { NgForOf } from '@angular/common';
import { Observable, Subscription } from 'rxjs';

import { StudyProgramService, StudyProgram } from '../../services/studyprogram.service';
import { FormControl } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AngularFireAuth } from '@angular/fire/auth';
import { SlicePipe } from '@angular/common';
import { User, UserService } from '../../services/user.service';
import { OrganizationService } from '../../services/organization.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  studyPrograms: StudyProgram[];
  advancedSearch = false;
  affiliationFilter = false;
  knowledgeFilter = false;
  skillFilter = false;
  fieldFilter = false;
  filteredStudyPrograms: any[];
  searchText: string;
  isAnonymous = null;
  ownUsrId = null;
  showOnlyDepth = -1;
  currentUser: User;

  @ViewChild('dangerModal') public dangerModal: ModalDirective;

  constructor(private studyprogramService: StudyProgramService,
    private userService: UserService,
    public organizationService: OrganizationService,
    public afAuth: AngularFireAuth) {
    this.afAuth.auth.onAuthStateChanged(user => {
      console.log(user);
      if (user) {
        this.isAnonymous = user.isAnonymous;
        this.ownUsrId = user.uid;
        this.userService.getUserById(user.uid).subscribe(userDB => {
          this.currentUser = new User(userDB);
        });
      } else {
        this.isAnonymous = true;
        this.ownUsrId = null;
      }
    });
  }

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
    if (this.advancedSearch) {
      this.applyFilters();
    } else {
      this.filteredStudyPrograms = this.studyPrograms.filter(
        it =>
          it.name.toLowerCase().includes(search) ||
          it.description.toLowerCase().includes(search)
      );
    }
  }

  applyFilters() {
    this.studyPrograms.forEach(sp => {
      console.log(sp);
      if (!this.affiliationFilter && !this.knowledgeFilter && !this.skillFilter && !this.fieldFilter && this.searchText === '') {
        // if no filters checked, return all
        this.filteredStudyPrograms.push(sp);
      } else {
        console.log('apply filters');
        if (this.affiliationFilter) {
          if (sp.affiliation.toLowerCase().includes(this.searchText.toLowerCase())) {
            if (this.filteredStudyPrograms.indexOf(sp) === -1) {
              this.filteredStudyPrograms.push(sp);
            }
          }
        }
        if (this.knowledgeFilter || this.skillFilter) {
          sp.linksToBok.forEach(link => {  // Study program links
            if (this.knowledgeFilter) {
              if (link.concept_id.toLowerCase().includes(this.searchText.toLowerCase())) {
                if (this.filteredStudyPrograms.indexOf(sp) === -1) {
                  this.filteredStudyPrograms.push(sp);
                }
              }
            }
            if (this.skillFilter) {
              link.skills.forEach(sk => {
                if (sk.toLowerCase().includes(this.searchText.toLowerCase())) {
                  if (this.filteredStudyPrograms.indexOf(sp) === -1) {
                    this.filteredStudyPrograms.push(sp);
                  }
                }
              });
            }
          });
        }
        sp.children.forEach(mod => {
          mod.linksToBok.forEach(linkM => { // Module links
            if (this.knowledgeFilter) {
              if (linkM.concept_id.toLowerCase().includes(this.searchText.toLowerCase())) {
                if (this.filteredStudyPrograms.indexOf(sp) === -1) {
                  this.filteredStudyPrograms.push(sp);
                }
              }
            }
            if (this.skillFilter) {
              linkM.skills.forEach(sk => {
                if (sk.toLowerCase().includes(this.searchText.toLowerCase())) {
                  if (this.filteredStudyPrograms.indexOf(sp) === -1) {
                    this.filteredStudyPrograms.push(sp);
                  }
                }
              });
            }
          });
          mod.children.forEach(cour => {
            cour.linksToBok.forEach(linkC => { // Course links
              if (this.knowledgeFilter) {
                if (linkC.concept_id.toLowerCase().includes(this.searchText.toLowerCase())) {
                  if (this.filteredStudyPrograms.indexOf(sp) === -1) {
                    this.filteredStudyPrograms.push(sp);
                  }
                }
              }
              if (this.skillFilter) {
                linkC.skills.forEach(sk => {
                  if (sk.toLowerCase().includes(this.searchText.toLowerCase())) {
                    if (this.filteredStudyPrograms.indexOf(sp) === -1) {
                      this.filteredStudyPrograms.push(sp);
                    }
                  }
                });
              }
            });
            cour.children.forEach(lect => {
              lect.linksToBok.forEach(linkL => { // Lecture links
                if (this.knowledgeFilter) {
                  if (linkL.concept_id.toLowerCase().includes(this.searchText.toLowerCase())) {
                    if (this.filteredStudyPrograms.indexOf(sp) === -1) {
                      this.filteredStudyPrograms.push(sp);
                    }
                  }
                }
                if (this.skillFilter) {
                  linkL.skills.forEach(sk => {
                    if (sk.toLowerCase().includes(this.searchText.toLowerCase())) {
                      if (this.filteredStudyPrograms.indexOf(sp) === -1) {
                        this.filteredStudyPrograms.push(sp);
                      }
                    }
                  });
                }
              });
            });
          });
        });
        if (this.fieldFilter) {
          // tslint:disable-next-line:max-line-length
          if (sp.field.name.toLowerCase().includes(this.searchText.toLowerCase()) || sp.field.parent.toLowerCase().includes(this.searchText.toLowerCase())) {
            if (this.filteredStudyPrograms.indexOf(sp) === -1) {
              this.filteredStudyPrograms.push(sp);
            }
          }
        }
      }
    });
  }
}
