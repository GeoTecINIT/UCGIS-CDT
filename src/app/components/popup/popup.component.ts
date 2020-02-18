import { Component, OnInit, Input } from '@angular/core';
import * as jsPDF from 'jspdf';
import { StudyProgramService, StudyProgram } from '../../services/studyprogram.service';
import { Base64img } from './base64img';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})

export class PopupComponent implements OnInit {

  constructor(private base64img: Base64img,
    public studyprogramService: StudyProgramService,
    private route: ActivatedRoute) { }

  public static END_PAGE_LINE = 235;
  public static URL_BOK = 'https://findinbokv2.firebaseapp.com/bok/';
    public static URL_FIREBASE = 'https://findinbokv2.firebaseapp.com';

  @Input() idOP: any;
  selectedSP: StudyProgram;

  ngOnInit() {
    this.getOccuProfileId();
  }

  getOccuProfileId(): void {
    this.studyprogramService
      .getStudyProgramById(this.idOP)
      .subscribe(program => {
        this.selectedSP = program;
      });
  }

  copyText() {
    let url = location.href;
    if (url.includes('list')) {
      url = url.replace('list', 'detail') + '/' + this.idOP;
    }
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = url;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

    generatePDF() {
        let currentLinePoint = 45;
        // cabecera , imágenes
        const doc = new jsPDF();
        doc.page = 1;
        doc.addImage(this.base64img.logo, 'PNG', 10, 7, 37, 25);
        doc.addImage(this.base64img.back, 'PNG', 0, 100, 210, 198);
        doc.link(15, 15, 600, 33, { url: 'http://www.eo4geo.eu' });
        doc.setFontSize(38);
        doc.setFontType('bold');
        doc.setTextColor('#1a80b6');
        if (this.selectedSP.name != null) {
            const titleLines = doc.setFontSize(38).splitTextToSize(this.selectedSP.name, 150);
            doc.text(30, currentLinePoint, titleLines);
            doc.link(15, currentLinePoint - 5, 600, currentLinePoint - 4, { url: 'https://eo4geo-cdt.web.app/' });
            currentLinePoint = currentLinePoint + (15 * titleLines.length);
        }
        if (this.selectedSP.affiliation != null) {
            doc.setFontSize(12).setTextColor('#1a80b6').setFontType('bold'); // headline
            doc.text(30, currentLinePoint, this.selectedSP.affiliation);
            currentLinePoint = currentLinePoint + 8;
        }
        doc.setFontSize(12).setTextColor('#1a80b6').setFontType('bold'); // headline
        doc.text(30, currentLinePoint, 'EQF: ' + this.selectedSP.eqf);
        currentLinePoint = currentLinePoint + 5;
        doc.setFontSize(12).setTextColor('#1a80b6').setFontType('bold'); // headline
        doc.text(30, currentLinePoint, 'Semesters: ' + this.selectedSP.numSemesters);
        currentLinePoint = currentLinePoint + 7;
        if (this.selectedSP.field != null) {
            doc.setTextColor('#000').setFontType('normal').setFontSize(10);
            doc.text(30, currentLinePoint, this.selectedSP.field.name + ' (' + this.selectedSP.field.grandparent + ')');
            currentLinePoint = currentLinePoint + 8;
        }
        doc.setFontSize(11).setTextColor('#E2C319').setFontType('bold');
        doc.text(35, currentLinePoint, this.selectedSP.name);
        currentLinePoint = currentLinePoint + 5;

        if ( this.selectedSP.children && this.selectedSP.children.length > 0 ) {
            this.selectedSP.children.forEach( module => {
                doc.setFontSize(11).setTextColor('#E2C319').setFontType('bold');
                doc.text(40, currentLinePoint, module.name);
                currentLinePoint = currentLinePoint + 5;
                if ( module.children && module.children.length > 0 ) {
                    module.children.forEach( course => {
                        doc.setFontSize(11).setTextColor('#E2C319').setFontType('bold');
                        doc.text(45, currentLinePoint, course.name);
                        currentLinePoint = currentLinePoint + 5;
                        if ( course.children && course.children.length > 0 ) {
                            course.children.forEach( lecture => {
                                doc.setFontSize(11).setTextColor('#E2C319').setFontType('bold');
                                doc.text(50, currentLinePoint, lecture.name);
                                currentLinePoint = currentLinePoint + 5;
                            });
                        }
                    });
                }
            });
        }
        if (this.selectedSP.description != null) {
            currentLinePoint = currentLinePoint + 5;
            doc.setTextColor('#000').setFontType('normal');
            const lines = doc.setFontSize(11).splitTextToSize(this.selectedSP.description, 150);
            doc.text(30, currentLinePoint, lines, {maxWidth: 150, align: "justify"}); // description
            currentLinePoint = currentLinePoint + 5 + (4 * lines.length);
        }
        if ( this.selectedSP.concepts && this.selectedSP.concepts.length > 0 ) {
            currentLinePoint = currentLinePoint + 5;
            doc.setFontSize(12).setTextColor('#1a80b6').setFontType('bold'); // headline
            doc.text(30, currentLinePoint, 'Concepts: ');
            currentLinePoint = currentLinePoint + 5;
            this.selectedSP.concepts.forEach( concept => {
                //const conceptId = concept.concept_id.split(']', 1)[0].split('[', 2).length > 0 ?   concept.concept_id.split(']', 1)[0].split('[', 2)[1] : '';
                doc.setFontSize(12).setTextColor('#000').setFontType('bold');
                doc.text(30, currentLinePoint, '- ' + concept);
                //doc.link(15, currentLinePoint - 5, 600, 6, { url: PopupComponent.URL_BOK + conceptId});
                currentLinePoint = currentLinePoint + 5+ (4 * concept.length);
            });
        }
        if ( this.selectedSP.children && this.selectedSP.children.length > 0 ) {
            currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
            currentLinePoint = currentLinePoint + 5;
            doc.setFontSize(12).setTextColor('#1a80b6').setFontType('bold'); // headline
            doc.text(30, currentLinePoint, 'Modules');
            doc.setTextColor('#000').setFontType('normal').setFontSize(8); // normal text
            currentLinePoint = currentLinePoint + 5;
            this.selectedSP.children.forEach( module => { //children -> modules
                currentLinePoint = currentLinePoint + 7;
                currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                const knLines = doc.setFontSize(12).splitTextToSize('\u2022' + '  ' + module.name, 150);
                doc.setFontSize(12).setTextColor('#1a80b6').setFontType('bold');
                doc.text(30, currentLinePoint, knLines);
                currentLinePoint = currentLinePoint + 1 + (4 * knLines.length);
                if (module.linksToBok != null && module.linksToBok.length > 0 ) {
                    currentLinePoint = currentLinePoint + 3;
                    doc.setFontSize(9).setTextColor('#E2C319').setFontType('bold'); // headline
                    doc.text(35, currentLinePoint, 'Links: ' );
                    currentLinePoint = currentLinePoint + 5;
                    module.linksToBok.forEach(link => {
                        const linkId = link.concept_id.split(']', 1)[0].split('[', 2).length > 0 ? PopupComponent.URL_BOK + link.concept_id.split(']', 1)[0].split('[', 2)[1] : PopupComponent.URL_FIREBASE;
                        doc.setTextColor('#E2C319').setFontType('normal');
                        const linePre = doc.setFontSize(9).splitTextToSize(link.name+ '', 140);
                        doc.text(35, currentLinePoint, '- ' + linePre);
                        doc.link(35, currentLinePoint - 2, 140, linePre.length + 5, { url: linkId});
                        currentLinePoint = currentLinePoint + 1 + (3 *  linePre.length);
                    });
                }
                if (module.ects != null) {
                    currentLinePoint = currentLinePoint + 3;
                    doc.setFontSize(11).setTextColor('#1a80b6').setFontType('bold'); // headline
                    doc.text(35, currentLinePoint, 'ECTS: ' + this.selectedSP.eqf);
                    currentLinePoint = currentLinePoint + 5;
                }
                if (module.numSemester != null) {
                    doc.setFontSize(11).setTextColor('#1a80b6').setFontType('bold'); // headline
                    doc.text(35, currentLinePoint, 'Semester: ' + module.numSemester);
                    currentLinePoint = currentLinePoint + 5;
                }
                if (module.description != null) {
                    currentLinePoint = currentLinePoint + 5;
                    currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                    doc.setTextColor('#000').setFontType('normal');
                    const linesDesc = doc.setFontSize(11).splitTextToSize(module.description, 150);
                    const numLines =  doc.setFontSize(11).splitTextToSize(module.description.replace(/(\r\n|\n|\r)/gm,""), 150);
                    doc.text(35, currentLinePoint, linesDesc, {maxWidth: 150, align: "justify"});
                    currentLinePoint = currentLinePoint + 5 + (4 *  numLines.length);
                }
                if (module.prerequisites && module.prerequisites.length > 0) {
                    doc.setFontSize(11).setTextColor('#1a80b6').setFontType('bold'); // headline
                    doc.text(40, currentLinePoint, 'Prerequisites: ');
                    currentLinePoint = currentLinePoint + 5;
                    module.prerequisites.forEach(concept => {
                        //const conceptId = concept.concept_id.split(']', 1)[0].split('[', 2).length > 0 ?   concept.concept_id.split(']', 1)[0].split('[', 2)[1] : '';
                        doc.setTextColor('#000').setFontType('normal');
                        const linePre = doc.setFontSize(11).splitTextToSize(concept.name+ '', 100);
                        doc.text(40, currentLinePoint, '- ' + linePre);
                        //doc.link(40, currentLinePoint - 2, 600, linePre.length + 5, { url: PopupComponent.URL_BOK + conceptId});
                        currentLinePoint = currentLinePoint + 5 + (4 *  linePre.length);
                    });
                }
                if (module.assessment != null && module.assessment != '' ) {
                    currentLinePoint = currentLinePoint + 5;
                    currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                    doc.setFontSize(11).setTextColor('#1a80b6').setFontType('bold'); // headline
                    doc.text(35, currentLinePoint, 'Assessments');
                    currentLinePoint = currentLinePoint + 5;
                    doc.setTextColor('#000').setFontType('normal').setFontSize(11); // normal text
                    const coLines = doc.setFontSize(11).splitTextToSize(module.assessment + '', 150);
                    doc.text(35, currentLinePoint, coLines, {maxWidth: 150, align: "justify"});
                    currentLinePoint = currentLinePoint + 4 * coLines.length;
                }
                if (  module.children &&  module.children.length > 0 ) {
                    currentLinePoint = currentLinePoint + 5;
                    currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                    doc.setFontSize(12).setTextColor('#1a80b6').setFontType('bold'); // headline
                    doc.text(35, currentLinePoint, 'Courses ');
                    doc.setTextColor('#000').setFontType('normal').setFontSize(8); // normal text
                    currentLinePoint = currentLinePoint + 5;
                    module.children.forEach( courses => { //children -> courses
                        currentLinePoint = currentLinePoint + 5;
                        currentLinePoint = this.checkEndOfPage(currentLinePoint , doc);
                        const knLines = doc.setFontSize(11).splitTextToSize('-  ' + courses.name, 150);
                        doc.setFontSize(11).setTextColor('#1a80b6').setFontType('bold');
                        doc.text(35, currentLinePoint, knLines);
                        currentLinePoint = currentLinePoint + 4 * knLines.length;
                        if (courses.linksToBok != null && courses.linksToBok.length > 0 ) {
                            currentLinePoint = currentLinePoint + 5;
                            doc.setFontSize(9).setTextColor('#E2C319').setFontType('bold'); // headline
                            doc.text(40, currentLinePoint, 'Links: ' );
                            currentLinePoint = currentLinePoint + 5;
                            courses.linksToBok.forEach(link => {
                                const linkId = link.concept_id.split(']', 1)[0].split('[', 2).length > 0 ? PopupComponent.URL_BOK + link.concept_id.split(']', 1)[0].split('[', 2)[1] : PopupComponent.URL_FIREBASE;
                                doc.setTextColor('#E2C319').setFontType('normal');
                                const linePre = doc.setFontSize(9).splitTextToSize(link.name+ '', 140);
                                doc.text(40, currentLinePoint, '- ' + linePre);
                                doc.link(40, currentLinePoint - 3 , 140, linePre.length + 5, { url: linkId});
                                currentLinePoint = currentLinePoint + 1 + (3 *  linePre.length);
                            });
                        }
                        if (courses.ects != null) {
                            currentLinePoint = currentLinePoint + 5;
                            doc.setTextColor('#1a80b6').setFontType('bold');
                            doc.setFontSize(11);
                            doc.text(40, currentLinePoint, 'ECTS: ' + courses.ects.toString());
                            currentLinePoint = currentLinePoint + 5;
                        }
                        if (courses.numSemester != null) {
                            doc.setFontSize(11).setTextColor('#1a80b6').setFontType('bold'); // headline
                            doc.text(40, currentLinePoint, 'Semester: ' + courses.numSemester);
                            currentLinePoint = currentLinePoint + 5;
                        }
                        if (courses.description != null) {
                            currentLinePoint = currentLinePoint + 5;
                            currentLinePoint = this.checkEndOfPage(currentLinePoint , doc);
                            doc.setTextColor('#000').setFontType('normal');
                            const linesDesc = doc.setFontSize(11).splitTextToSize(courses.description, 150);
                            const numLines =  doc.setFontSize(11).splitTextToSize(courses.description.replace(/(\r\n|\n|\r)/gm,""), 150);
                            doc.text(40, currentLinePoint, linesDesc, {maxWidth: 140, align: "justify"});
                            currentLinePoint = currentLinePoint + 9 + (4 * numLines.length);
                        }
                        if (courses.prerequisites && courses.prerequisites.length > 0) {
                            currentLinePoint = currentLinePoint + 5;
                            doc.setFontSize(11).setTextColor('#1a80b6').setFontType('bold'); // headline
                            doc.text(40, currentLinePoint, 'Prerequisites: ');
                            currentLinePoint = currentLinePoint + 5;
                            courses.prerequisites.forEach(concept => {
                                currentLinePoint = currentLinePoint + 5;
                                const conceptId = concept.concept_id.split(']', 1)[0].split('[', 2).length > 0 ?   concept.concept_id.split(']', 1)[0].split('[', 2)[1] : '';
                                doc.setTextColor('#000').setFontType('normal');
                                const linePre = doc.setFontSize(11).splitTextToSize(concept.name+ '', 140);
                                doc.text(40, currentLinePoint, linePre);
                                doc.link(40, currentLinePoint - 2, 140, linePre.length + 5, { url: PopupComponent.URL_BOK + conceptId});
                                currentLinePoint = currentLinePoint + 5 + (4 *  linePre.length);
                            });
                        }
                        if (courses.assessment != null && courses.assessment != '' ) {
                            currentLinePoint = currentLinePoint + 7;
                            currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                            doc.setFontSize(11).setTextColor('#1a80b6').setFontType('bold'); // headline
                            doc.text(40, currentLinePoint, 'Assessments');
                            currentLinePoint = currentLinePoint + 5;
                            doc.setTextColor('#000').setFontType('normal').setFontSize(11); // normal text
                            const coLines = doc.setFontSize(11).splitTextToSize(courses.assessment + '', 150);
                            doc.text(40, currentLinePoint, coLines, {maxWidth: 140, align: "justify"});
                            currentLinePoint = currentLinePoint + 1 + (4 *  coLines.length);

                        }
                        if (courses.bibliography != null && courses.bibliography != '' ) {
                            currentLinePoint = currentLinePoint + 5;
                            doc.setFontSize(11).setTextColor('#1a80b6').setFontType('bold'); // headline
                            doc.text(40, currentLinePoint, 'Bibliography: ');
                            currentLinePoint = currentLinePoint + 5;
                            doc.setTextColor('#000').setFontType('normal').setFontSize(11); // normal text
                            const coLines = doc.setFontSize(11).splitTextToSize(courses.bibliography + '', 150);
                            doc.text(40, currentLinePoint, coLines);
                            currentLinePoint = currentLinePoint + 5 + (4 *  coLines.length);
                        }
                        if (courses.learningObjectives != null && courses.learningObjectives.length > 0 ) {
                            currentLinePoint = currentLinePoint + 6;
                            currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                            doc.setFontSize(11).setTextColor('#1a80b6').setFontType('bold'); // headline
                            doc.text(40, currentLinePoint, 'Learning Outcomes: ');
                            courses.learningObjectives.forEach(concept => {
                                currentLinePoint = currentLinePoint + 5;
                                const conceptId = concept.concept_id.split(']', 1)[0].split('[', 2).length > 1 ?  PopupComponent.URL_BOK + concept.concept_id.split(']', 1)[0].split('[', 2)[1] : PopupComponent.URL_FIREBASE;
                                doc.setTextColor('#1a80b6').setFontType('normal');
                                const lineLearn = doc.setFontSize(10).splitTextToSize(concept.name+ '', 140);
                                doc.text(40, currentLinePoint, lineLearn,  {maxWidth: 140, align: "justify"});
                                doc.link(40, currentLinePoint - 2 , 140 , 2 + (3 *  lineLearn.length) , { url: conceptId});
                                currentLinePoint = currentLinePoint + 1 + (3 *  lineLearn.length);
                            });
                        }
                        if (  courses.children &&  courses.children.length > 0 ) { // Children -> lectures
                            currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                            currentLinePoint = currentLinePoint + 5;
                            doc.setFontSize(12).setTextColor('#1a80b6').setFontType('bold'); // headline
                            doc.text(40, currentLinePoint, 'Lectures ');
                            doc.setTextColor('#000').setFontType('normal').setFontSize(8); // normal text
                            currentLinePoint = currentLinePoint + 5;
                            courses.children.forEach( lectures => { //children -> courses
                                currentLinePoint = currentLinePoint + 5;
                                currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                                const knLines = doc.setFontSize(11).splitTextToSize('>  ' + lectures.name, 150);
                                doc.setFontSize(11).setTextColor('#1a80b6').setFontType('bold');
                                doc.text(40, currentLinePoint, knLines);
                                currentLinePoint = currentLinePoint + 4 * knLines.length;
                                if (lectures.linksToBok != null && lectures.linksToBok.length >0 ) {
                                    currentLinePoint = currentLinePoint + 5;
                                    doc.setFontSize(9).setTextColor('#E2C319').setFontType('bold'); // headline
                                    doc.text(45, currentLinePoint, 'Links: ' );
                                    currentLinePoint = currentLinePoint + 5;
                                    lectures.linksToBok.forEach(link => {
                                        const linkId = link.concept_id.split(']', 1)[0].split('[', 2).length > 0 ? PopupComponent.URL_BOK + link.concept_id.split(']', 1)[0].split('[', 2)[1] : PopupComponent.URL_FIREBASE;
                                        doc.setTextColor('#E2C319').setFontType('normal');
                                        const linePre = doc.setFontSize(9).splitTextToSize(link.name+ '', 140);
                                        doc.text(45, currentLinePoint, '- ' + linePre);
                                        doc.link(45, currentLinePoint - 2, 140, linePre.length + 5, { url: linkId});
                                        currentLinePoint = currentLinePoint + 1 + (3 *  linePre.length);
                                    });
                                }
                                if (lectures.isPractical ){
                                    currentLinePoint = currentLinePoint + 2;
                                    doc.setFontSize(12).setTextColor('#1a80b6').setFontType('bold'); // headline
                                    doc.text(40, currentLinePoint, 'Practical');
                                }
                                if (lectures.ects != null) {
                                    currentLinePoint = currentLinePoint + 5;
                                    doc.setTextColor('#1a80b6').setFontType('normal');
                                    doc.setFontSize(11);
                                    doc.text(45, currentLinePoint, 'ECTS: ' + lectures.ects.toString());
                                    currentLinePoint = currentLinePoint + 8;
                                }
                                if (lectures.description != null) {
                                    currentLinePoint = currentLinePoint + 5;
                                    currentLinePoint = this.checkEndOfPage(currentLinePoint , doc);
                                    doc.setTextColor('#000').setFontType('normal');
                                    const linesDesc = doc.setFontSize(11).splitTextToSize(lectures.description, 150);
                                    doc.text(45, currentLinePoint, linesDesc, {maxWidth: 130, align: "justify"});
                                    currentLinePoint = currentLinePoint + 8 + (4 * linesDesc.length);
                                }
                                if (lectures.bibliography != null) {
                                    currentLinePoint = currentLinePoint + 5;
                                    doc.setFontSize(11).setTextColor('#1a80b6').setFontType('bold'); // headline
                                    doc.text(45, currentLinePoint, 'Bibliography: ');
                                    currentLinePoint = currentLinePoint + 1;
                                    doc.setTextColor('#000').setFontType('normal').setFontSize(8); // normal text
                                    const coLines = doc.setFontSize(10).splitTextToSize(lectures.bibliography + '', 150);
                                    doc.text(45, currentLinePoint, coLines);
                                    currentLinePoint = currentLinePoint + 4 * coLines.length;
                                }

                            });
                        }
                    });
                }
            });
        }
        this.footer(doc);
        doc.save('Study Program.pdf');
    }

    checkEndOfPage(line, doc) {
        if (line > PopupComponent.END_PAGE_LINE) {
            this.footer(doc);
            doc.addPage();
            doc.addImage(this.base64img.logo, 'PNG', 10, 7, 37, 25);
            doc.addImage(this.base64img.back, 'PNG', 0, 100, 210, 198);
            line = 45;
        }
        return line;
    }
    footer(doc){
        doc.setFontSize(10).setTextColor('#768187').setFontType('bold');
        doc.text(165,280, 'Page ' + doc.page);
        doc.page ++;
    };

}
