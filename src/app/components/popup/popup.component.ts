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

    public static END_PAGE_LINE = 255;
    public static URL_BOK = 'https://bok.eo4geo.eu/';
    public static URL_CDT = 'https://eo4geo-cdt.web.app/detail/';

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

    getSubjectMetadata() {
        // @prefix dc: <http://purl.org/dc/terms/> .
        // @prefix eo4geo: <http://bok.eo4geo.eu/> .
        // <> dc:hasPart [ dc:type "Module";
        // dc:title "Mathematics";
        // dc:relation eo4geo:AM;
        // dc:relation eo4geo:GC] .

        let subject = '@prefix dc: <http://purl.org/dc/terms/> . @prefix eo4geo: <http://bok.eo4geo.eu/> . ';
        if (this.selectedSP.concepts && this.selectedSP.concepts.length > 0) {
            subject = subject + '<> dc:hasPart [ dc:type "Study Program"; dc:title "' + this.selectedSP.name + '"';
            this.selectedSP.concepts.forEach(concept => {
                // const bokCode = concept.split('] ')[1];
                const bokCode = concept.split(']', 1)[0].split('[', 2)[1];
                if (bokCode) {
                    subject = subject + '; dc:relation eo4geo:' + bokCode;
                }
            });
            subject = subject + '  ] .';
        }

        if ( this.selectedSP.children !== null && this.selectedSP.children.length > 0 ) {
          this.selectedSP.children.forEach(module => {
            if (module.concepts && module.concepts.length > 0) {
              subject = subject + '<> dc:hasPart [ dc:type "Module"; dc:title "' + module.name + '"';
              module.concepts.forEach(concept => {
                const bokCode = concept.split(']', 1)[0].split('[', 2)[1];
                if (bokCode) {
                  subject = subject + '; dc:relation eo4geo:' + bokCode;
                }
              });
              subject = subject + '  ]';
            }
            if (module.children && module.children.length > 0) {
              module.children.forEach(course => {
                if (course.concepts && course.concepts.length > 0) {
                  subject = subject + '<> dc:hasPart [  dc:type "Course"; dc:title "' + course.name + '"';
                  course.concepts.forEach(concept => {
                    const bokCode = concept.split(']', 1)[0].split('[', 2)[1];
                    if (bokCode) {
                      subject = subject + '; dc:relation eo4geo:' + bokCode;
                    }
                  });
                  subject = subject + '  ]';
                }
                if (course.children && course.children.length > 0) {
                  course.children.forEach(lecture => {
                    if (lecture.concepts && lecture.concepts.length > 0) {
                      subject = subject + '<> dc:hasPart [  dc:type "Lecture"; dc:title "' + lecture.name + '"';
                      lecture.concepts.forEach(concept => {
                        const bokCode = concept.split(']', 1)[0].split('[', 2)[1];
                        if (bokCode) {
                          subject = subject + '; dc:relation eo4geo:' + bokCode;
                        }
                      });
                      subject = subject + '  ]';
                    }
                  });
                }
              });
            }
          });
        }
        return subject;
    }

    generatePDF() {
        console.log('pdf');
        let currentLinePoint = 45;
        let numerals = {};
        // cabecera , imágenes
        const doc = new jsPDF();
        doc.page = 1;

        doc.setProperties({
            title: this.selectedSP.name,
            subject: this.getSubjectMetadata(),
            author: 'EO4GEO',
            keywords: 'eo4geo, curriculum design tool',
            creator: 'Curriculum Design Tool'
        });
        doc.addImage(this.base64img.logo, 'PNG', 10, 7, 37, 25);
        doc.addImage(this.base64img.back, 'PNG', 0, 100, 210, 198);
        // doc.link(15, 15, 600, 33, { url: 'http://www.eo4geo.eu' });
        doc.setFontSize(38);
        doc.setFontType('bold');
        doc.setTextColor('#1a80b6');
        if (this.selectedSP.name != null) {
            currentLinePoint = currentLinePoint + 5;
            const titleLines = doc.setFontSize(38).splitTextToSize(this.selectedSP.name, 150);
            doc.text(30, currentLinePoint, titleLines);
            doc.link(15, currentLinePoint - 5, 600, currentLinePoint - 4, { url: PopupComponent.URL_CDT + this.selectedSP._id });
            currentLinePoint = currentLinePoint + (15 * titleLines.length);
        }
        switch (this.selectedSP.depth) {
            case 0:
                doc.setFontSize(12).setTextColor('#1a80b6').setFontType('bold'); // headline
                doc.text(30, currentLinePoint, 'Study Program');
                currentLinePoint = currentLinePoint + 8;
                break;
            case 1:
                doc.setFontSize(12).setTextColor('#1a80b6').setFontType('bold'); // headline
                doc.text(30, currentLinePoint, 'Module');
                currentLinePoint = currentLinePoint + 8;
                break;
            case 2:
                doc.setFontSize(12).setTextColor('#1a80b6').setFontType('bold'); // headline
                doc.text(30, currentLinePoint, 'Course');
                currentLinePoint = currentLinePoint + 8;
                break;
            case 3:
                doc.setFontSize(12).setTextColor('#1a80b6').setFontType('bold'); // headline
                doc.text(30, currentLinePoint, 'Lecture');
                currentLinePoint = currentLinePoint + 8;
                break;
        }
        if (this.selectedSP.affiliation != null && this.selectedSP.affiliation !== '') {
            doc.setFontSize(12).setTextColor('#1a80b6').setFontType('bold'); // headline
            const linesAff = doc.setFontSize(12).splitTextToSize('Organizing entities :' + this.selectedSP.affiliation, 150);
            doc.text(30, currentLinePoint, linesAff, { maxWidth: 150, align: 'justify' });
            currentLinePoint = currentLinePoint + 8 * linesAff.length;


            /*   doc.text(30, currentLinePoint, 'Organizing entities:');
              doc.text(30, currentLinePoint, this.selectedSP.affiliation);
              currentLinePoint = currentLinePoint + 8; */
        }
        if (this.selectedSP.eqf && this.selectedSP.eqf > 0) {
            doc.setFontSize(12).setTextColor('#1a80b6').setFontType('bold'); // headline
            doc.text(30, currentLinePoint, 'EQF: ' + this.selectedSP.eqf);
            currentLinePoint = currentLinePoint + 5;
        }
        if (this.selectedSP.numSemesters && this.selectedSP.numSemesters > 0) {
            doc.setFontSize(12).setTextColor('#1a80b6').setFontType('bold'); // headline
            doc.text(30, currentLinePoint, 'Semesters: ' + this.selectedSP.numSemesters);
            currentLinePoint = currentLinePoint + 7;
        }
        if (this.selectedSP.fields == null && this.selectedSP.field != null) {
            this.selectedSP.fields = [];
            this.selectedSP.fields.push(this.selectedSP.field);
        }
        if (this.selectedSP.fields && this.selectedSP.fields.length > 0) {
            this.selectedSP.fields.forEach(f => {
                doc.setTextColor('#000').setFontType('normal').setFontSize(10);
                const lineName = doc.setFontSize(9).splitTextToSize('Study area: ' + f.name + ' (' + f.grandparent + ')', 150);
                doc.text(30, currentLinePoint, lineName);
                currentLinePoint = currentLinePoint + 8;
            });
        }
        currentLinePoint = this.printCleanText(doc, currentLinePoint, 30, 150, this.selectedSP.description, 11);
        if (this.selectedSP.bibliography && this.selectedSP.bibliography.length > 0) {
            currentLinePoint = currentLinePoint + 5;
            doc.setFontSize(11).setTextColor('#1a80b6').setFontType('bold'); // headline
            doc.text(30, currentLinePoint, 'Bibliography: ');
            currentLinePoint = currentLinePoint + 5;
            this.selectedSP.bibliography.forEach(concept => {
                currentLinePoint = currentLinePoint + 5;
                if (concept.concept_id) { // bib from Bok
                    const conceptId = concept.concept_id.split(']', 1)[0].split('[', 2).length > 0 ? concept.concept_id.split(']', 1)[0].split('[', 2)[1] : '';
                    doc.setTextColor('#000').setFontType('normal');
                    const linePre = doc.setFontSize(9).splitTextToSize(concept.name + '', 150);
                    doc.text(30, currentLinePoint, linePre, { maxWidth: 150, align: 'justify' });
                   // doc.link(30, currentLinePoint - 2, 150, linePre.length + 5, { url: PopupComponent.URL_BOK + conceptId });
                    currentLinePoint = currentLinePoint + (4 * linePre.length);
                    currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                } else { //custom bib
                    doc.setTextColor('#000').setFontType('normal');
                    const linePreC = doc.setFontSize(9).splitTextToSize(concept + '', 150);
                    doc.text(30, currentLinePoint, linePreC, { maxWidth: 150, align: 'justify' });
                    currentLinePoint = currentLinePoint + (4 * linePreC.length);
                    currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                }
            });
        }
        currentLinePoint = this.printLO(doc, currentLinePoint, 30, 150, this.selectedSP.learningObjectives);
        currentLinePoint = this.printTS(doc, currentLinePoint, 30, 150, this.selectedSP.competences);

        if (this.selectedSP.linksToBok != null && this.selectedSP.linksToBok.length > 0) {
            currentLinePoint = currentLinePoint + 3;
            doc.setFontSize(9).setTextColor('#E2C319').setFontType('bold'); // headline
            doc.text(30, currentLinePoint, 'Linked BoK concepts: ');
            currentLinePoint = currentLinePoint + 5;
            this.selectedSP.linksToBok.forEach(link => {
                const linkId = link.concept_id.split(']', 1)[0].split('[', 2).length > 0 ? PopupComponent.URL_BOK + link.concept_id.split(']', 1)[0].split('[', 2)[1] : PopupComponent.URL_BOK;
                doc.setTextColor('#E2C319').setFontType('normal');
                const linePre = doc.setFontSize(9).splitTextToSize(link.name + '', 140);
                doc.text(30, currentLinePoint, '- ' + linePre);
                doc.link(30, currentLinePoint - 2, 140, linePre.length + 5, { url: linkId });
                currentLinePoint = currentLinePoint + 1 + (3 * linePre.length);
                currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
            });
        }
        if (this.selectedSP.children && this.selectedSP.children.length > 0) {
            currentLinePoint = currentLinePoint + 10;
            doc.setFontSize(12).setTextColor('#000').setFontType('bold');
            doc.text(30, currentLinePoint, 'Index');
            currentLinePoint = currentLinePoint + 7;
            let countM = 1;
            let countC = 1;
            let countL = 1;
            doc.setFontSize(11).setTextColor('#000').setFontType('normal');
            const linesTitle = doc.setFontSize(11).splitTextToSize(this.selectedSP.name + '', 150);
            doc.text(30, currentLinePoint, linesTitle, { maxWidth: 150, align: 'justify' });
            currentLinePoint = currentLinePoint + (5 * linesTitle.length);
            currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
            this.selectedSP.children.forEach(module => {
                doc.setFontSize(11).setTextColor('#000').setFontType('normal');
                const linesTitleM = doc.setFontSize(11).splitTextToSize(countM + '. ' + module.name, 145);
                doc.text(35, currentLinePoint, linesTitleM, { maxWidth: 145, align: 'justify' });
                currentLinePoint = currentLinePoint + (5 * linesTitleM.length);
                currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                numerals['m_' + module.name] = countM + '. ';
                if (module.children && module.children.length > 0) {
                    module.children.forEach(course => {
                        doc.setFontSize(11).setTextColor('#000').setFontType('normal');
                        const linesTitleC = doc.setFontSize(11).splitTextToSize(countM + '.' + countC + '. ' + course.name, 140);
                        doc.text(40, currentLinePoint, linesTitleC, { maxWidth: 140, align: 'justify' });
                        currentLinePoint = currentLinePoint + (5 * linesTitleC.length);
                        currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                        numerals['c_' + course.name] = countM + '.' + countC + '. ';
                        if (course.children && course.children.length > 0) {
                            course.children.forEach(lecture => {
                                doc.setFontSize(11).setTextColor('#000').setFontType('normal');
                                const linesTitleL = doc.setFontSize(11).splitTextToSize(countM + '.' + countC + '.' + countL + '. ' + lecture.name, 135);
                                doc.text(45, currentLinePoint, linesTitleL, { maxWidth: 135, align: 'justify' });
                                currentLinePoint = currentLinePoint + (5 * linesTitleL.length);
                                currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                                numerals['l_' + lecture.name] = countM + '.' + countC + '.' + countL + '. ';
                                countL = countL + 1;
                            });
                        }
                        countC = countC + 1;
                    });
                }
                countM = countM + 1;
            });
            currentLinePoint = currentLinePoint + 15;
        }
        if (this.selectedSP.children && this.selectedSP.children.length > 0) {
            currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
            currentLinePoint = currentLinePoint + 7;
            doc.setFontSize(12).setTextColor('#1a80b6').setFontType('bold'); // headline
            doc.text(30, currentLinePoint, 'Modules');
            doc.setTextColor('#000').setFontType('normal').setFontSize(8); // normal text
            currentLinePoint = currentLinePoint + 5;
            this.selectedSP.children.forEach(module => { //children -> modules
                currentLinePoint = currentLinePoint + 7;
                currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                const knLines = doc.setFontSize(12).setFontType('bold').splitTextToSize(numerals['m_' + module.name] + module.name, 150);
                doc.setFontSize(12).setTextColor('#1a80b6').setFontType('bold');
                doc.text(30, currentLinePoint, knLines);
                currentLinePoint = currentLinePoint + 1 + (4 * knLines.length);
                if (module.linksToBok != null && module.linksToBok.length > 0) {
                    currentLinePoint = currentLinePoint + 3;
                    doc.setFontSize(9).setTextColor('#E2C319').setFontType('bold'); // headline
                    doc.text(35, currentLinePoint, 'Linked BoK concepts: ');
                    currentLinePoint = currentLinePoint + 5;
                    module.linksToBok.forEach(link => {
                        const linkId = link.concept_id.split(']', 1)[0].split('[', 2).length > 0 ? PopupComponent.URL_BOK + link.concept_id.split(']', 1)[0].split('[', 2)[1] : PopupComponent.URL_BOK;
                        doc.setTextColor('#E2C319').setFontType('normal');
                        const linePre = doc.setFontSize(9).splitTextToSize(link.name + '', 145);
                        doc.text(35, currentLinePoint, '- ' + linePre);
                        doc.link(35, currentLinePoint - 2, 145, linePre.length + 5, { url: linkId });
                        currentLinePoint = currentLinePoint + 1 + (3 * linePre.length);
                        currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                    });
                }
                if (module.ects != null && module.ects > 0) {
                    currentLinePoint = currentLinePoint + 3;
                    doc.setFontSize(11).setTextColor('#1a80b6').setFontType('bold'); // headline
                    doc.text(35, currentLinePoint, 'ECTS: ' + module.ects);
                    currentLinePoint = currentLinePoint + 5;
                }
                if (module.numSemester != null && module.numSemester > 0) {
                    doc.setFontSize(11).setTextColor('#1a80b6').setFontType('bold'); // headline
                    doc.text(35, currentLinePoint, 'Semester: ' + module.numSemester);
                    currentLinePoint = currentLinePoint + 5;
                }
                currentLinePoint = this.printCleanText(doc, currentLinePoint, 35, 145, module.description, 11);
                if (module.prerequisites && module.prerequisites.length > 0) {
                    doc.setFontSize(11).setTextColor('#1a80b6').setFontType('bold'); // headline
                    doc.text(40, currentLinePoint, 'Prerequisites: ');
                    currentLinePoint = currentLinePoint + 5;
                    module.prerequisites.forEach(concept => {
                        // const conceptId = concept.concept_id.split(']', 1)[0].split('[', 2).length > 0 ?   concept.concept_id.split(']', 1)[0].split('[', 2)[1] : '';
                        doc.setTextColor('#000').setFontType('normal');
                        const linePre = doc.setFontSize(11).splitTextToSize(concept.name + '', 140);
                        doc.text(40, currentLinePoint, '- ' + linePre);
                        //doc.link(40, currentLinePoint - 2, 600, linePre.length + 5, { url: PopupComponent.URL_BOK + conceptId});
                        currentLinePoint = currentLinePoint + 5 + (4 * linePre.length);
                        currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                    });
                }
                currentLinePoint = this.printCleanText(doc, currentLinePoint, 35, 145, module.assessment, 11);

                if (module.bibliography && module.bibliography.length > 0) {
                    currentLinePoint = currentLinePoint + 5;
                    doc.setFontSize(11).setTextColor('#1a80b6').setFontType('bold'); // headline
                    doc.text(45, currentLinePoint, 'Bibliography: ');
                    currentLinePoint = currentLinePoint + 5;
                    module.bibliography.forEach(concept => {
                        currentLinePoint = currentLinePoint + 5;
                        if (concept.concept_id) { // bib from Bok
                            const conceptId = concept.concept_id.split(']', 1)[0].split('[', 2).length > 0 ? concept.concept_id.split(']', 1)[0].split('[', 2)[1] : '';
                            doc.setTextColor('#000').setFontType('normal');
                            const linePre = doc.setFontSize(9).splitTextToSize(concept.name + '', 145);
                            doc.text(35, currentLinePoint, linePre, { maxWidth: 150, align: 'justify' });
                          //  doc.link(35, currentLinePoint - 2, 145, linePre.length + 5, { url: PopupComponent.URL_BOK + conceptId });
                            currentLinePoint = currentLinePoint + (4 * linePre.length);
                            currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                        } else { //custom bib
                            doc.setTextColor('#000').setFontType('normal');
                            const linePreC = doc.setFontSize(9).splitTextToSize(concept + '', 145);
                            doc.text(35, currentLinePoint, linePreC, { maxWidth: 150, align: 'justify' });
                            currentLinePoint = currentLinePoint + (4 * linePreC.length);
                            currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                        }
                    });
                }
                currentLinePoint = this.printLO(doc, currentLinePoint, 35, 145, module.learningObjectives);
                currentLinePoint = this.printTS(doc, currentLinePoint, 35, 145, module.competences);


                if (module.children && module.children.length > 0) {
                    currentLinePoint = currentLinePoint + 15;
                    currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                    doc.setFontSize(12).setTextColor('#1a80b6').setFontType('bold'); // headline
                    const lineName = doc.setFontSize(11).splitTextToSize('Courses ( Module: ' + module.name + ' )', 145);
                    doc.text(35, currentLinePoint, lineName);
                    doc.setTextColor('#000').setFontType('normal').setFontSize(8); // normal text
                    currentLinePoint = currentLinePoint + 5;
                    module.children.forEach(courses => { //children -> courses
                        currentLinePoint = currentLinePoint + 15;
                        currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                        const knLines = doc.setFontSize(11).splitTextToSize(numerals['c_' + courses.name] + courses.name, 150);
                        doc.setFontSize(11).setTextColor('#1a80b6').setFontType('bold');
                        doc.text(35, currentLinePoint, knLines);
                        currentLinePoint = currentLinePoint + 4 * knLines.length;
                        if (courses.linksToBok != null && courses.linksToBok.length > 0) {
                            currentLinePoint = currentLinePoint + 5;
                            doc.setFontSize(9).setTextColor('#E2C319').setFontType('bold'); // headline
                            doc.text(40, currentLinePoint, 'Linked BoK concepts: ');
                            currentLinePoint = currentLinePoint + 5;
                            courses.linksToBok.forEach(link => {
                                const linkId = link.concept_id.split(']', 1)[0].split('[', 2).length > 0 ? PopupComponent.URL_BOK + link.concept_id.split(']', 1)[0].split('[', 2)[1] : PopupComponent.URL_BOK;
                                doc.setTextColor('#E2C319').setFontType('normal');
                                const linePre = doc.setFontSize(9).splitTextToSize(link.name + '', 140);
                                doc.text(40, currentLinePoint, '- ' + linePre);
                                doc.link(40, currentLinePoint - 3, 140, linePre.length + 5, { url: linkId });
                                currentLinePoint = currentLinePoint + 1 + (3 * linePre.length);
                                currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                            });
                        }
                        if (courses.ects != null && courses.ects > 0) {
                            currentLinePoint = currentLinePoint + 5;
                            doc.setTextColor('#1a80b6').setFontType('bold');
                            doc.setFontSize(11);
                            doc.text(40, currentLinePoint, 'ECTS: ' + courses.ects.toString());
                            currentLinePoint = currentLinePoint + 5;
                        }
                        if (courses.numSemester != null && courses.numSemester > 0) {
                            doc.setFontSize(11).setTextColor('#1a80b6').setFontType('bold'); // headline
                            doc.text(40, currentLinePoint, 'Semester: ' + courses.numSemester);
                            currentLinePoint = currentLinePoint + 5;
                        }
                        currentLinePoint = this.printCleanText(doc, currentLinePoint, 40, 140, courses.description, 11);
                        if (courses.prerequisites && courses.prerequisites.length > 0) {
                            currentLinePoint = currentLinePoint + 5;
                            doc.setFontSize(11).setTextColor('#1a80b6').setFontType('bold'); // headline
                            doc.text(40, currentLinePoint, 'Prerequisites: ');
                            currentLinePoint = currentLinePoint + 5;
                            courses.prerequisites.forEach(concept => {
                                currentLinePoint = currentLinePoint + 5;
                                const conceptId = concept.concept_id.split(']', 1)[0].split('[', 2).length > 0 ? concept.concept_id.split(']', 1)[0].split('[', 2)[1] : '';
                                doc.setTextColor('#000').setFontType('normal');
                                const linePre = doc.setFontSize(11).splitTextToSize(concept.name + '', 140);
                                doc.text(40, currentLinePoint, linePre);
                                doc.link(40, currentLinePoint - 2, 140, linePre.length + 5, { url: PopupComponent.URL_BOK + conceptId });
                                currentLinePoint = currentLinePoint + 5 + (4 * linePre.length);
                                currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                            });
                        }

                        currentLinePoint = this.printCleanText(doc, currentLinePoint, 40, 140, courses.assessment, 11);

                        if (courses.bibliography && courses.bibliography.length > 0) {
                            currentLinePoint = currentLinePoint + 5;
                            doc.setFontSize(11).setTextColor('#1a80b6').setFontType('bold'); // headline
                            doc.text(40, currentLinePoint, 'Bibliography: ');
                            currentLinePoint = currentLinePoint + 5;
                            courses.bibliography.forEach(concept => {
                                currentLinePoint = currentLinePoint + 5;
                                if (concept.concept_id) { // bib from Bok
                                    const conceptId = concept.concept_id.split(']', 1)[0].split('[', 2).length > 0 ? concept.concept_id.split(']', 1)[0].split('[', 2)[1] : '';
                                    doc.setTextColor('#000').setFontType('normal');
                                    const linePre = doc.setFontSize(9).splitTextToSize(concept.name + '', 140);
                                    doc.text(40, currentLinePoint, linePre, { maxWidth: 140, align: 'justify' });
                                  //  doc.link(40, currentLinePoint - 2, 140, linePre.length + 5, { url: PopupComponent.URL_BOK + conceptId });
                                    currentLinePoint = currentLinePoint + (4 * linePre.length);
                                    currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                                } else { //custom bib
                                    doc.setTextColor('#000').setFontType('normal');
                                    const linePreC = doc.setFontSize(9).splitTextToSize(concept + '', 140);
                                    doc.text(40, currentLinePoint, linePreC, { maxWidth: 140, align: 'justify' });
                                    currentLinePoint = currentLinePoint + (4 * linePreC.length);
                                    currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                                }
                            });
                        }
                        currentLinePoint = this.printLO(doc, currentLinePoint, 40, 140, courses.learningObjectives);
                        currentLinePoint = this.printTS(doc, currentLinePoint, 40, 140, courses.competences);


                        if (courses.children && courses.children.length > 0) { // Children -> lectures
                            currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                            currentLinePoint = currentLinePoint + 5;
                            doc.setFontSize(12).setTextColor('#1a80b6').setFontType('bold'); // headline
                            doc.text(40, currentLinePoint, 'Lectures ');
                            doc.setTextColor('#000').setFontType('normal').setFontSize(8); // normal text
                            currentLinePoint = currentLinePoint + 5;
                            courses.children.forEach(lectures => { //children -> courses
                                currentLinePoint = currentLinePoint + 15;
                                currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                                const knLines = doc.setFontSize(11).splitTextToSize(numerals['l_' + lectures.name] + lectures.name, 150);
                                doc.setFontSize(11).setTextColor('#1a80b6').setFontType('bold');
                                doc.text(40, currentLinePoint, knLines);
                                currentLinePoint = currentLinePoint + 4 * knLines.length;
                                if (lectures.linksToBok != null && lectures.linksToBok.length > 0) {
                                    currentLinePoint = currentLinePoint + 5;
                                    doc.setFontSize(9).setTextColor('#E2C319').setFontType('bold'); // headline
                                    doc.text(45, currentLinePoint, 'Links: ');
                                    currentLinePoint = currentLinePoint + 5;
                                    lectures.linksToBok.forEach(link => {
                                        const linkId = link.concept_id.split(']', 1)[0].split('[', 2).length > 0 ? PopupComponent.URL_BOK + link.concept_id.split(']', 1)[0].split('[', 2)[1] : PopupComponent.URL_BOK;
                                        doc.setTextColor('#E2C319').setFontType('normal');
                                        const linePre = doc.setFontSize(9).splitTextToSize(link.name + '', 140);
                                        doc.text(45, currentLinePoint, '- ' + linePre);
                                        doc.link(45, currentLinePoint - 2, 140, linePre.length + 5, { url: linkId });
                                        currentLinePoint = currentLinePoint + 1 + (3 * linePre.length);
                                        currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                                    });
                                }
                                if (lectures.isPractical) {
                                    currentLinePoint = currentLinePoint + 2;
                                    doc.setFontSize(12).setTextColor('#1a80b6').setFontType('bold'); // headline
                                    doc.text(40, currentLinePoint, 'Practical');
                                }
                                if (lectures.ects != null && lectures.ects > 0) {
                                    currentLinePoint = currentLinePoint + 5;
                                    doc.setTextColor('#1a80b6').setFontType('normal');
                                    doc.setFontSize(11);
                                    doc.text(45, currentLinePoint, 'ECTS: ' + lectures.ects.toString());
                                    currentLinePoint = currentLinePoint + 8;
                                }
                                currentLinePoint = this.printCleanText(doc, currentLinePoint, 45, 140, lectures.description, 11);
                                if (lectures.bibliography && lectures.bibliography.length > 0) {
                                    currentLinePoint = currentLinePoint + 5;
                                    doc.setFontSize(11).setTextColor('#1a80b6').setFontType('bold'); // headline
                                    doc.text(45, currentLinePoint, 'Bibliography: ');
                                    currentLinePoint = currentLinePoint + 5;
                                    lectures.bibliography.forEach(concept => {
                                        currentLinePoint = currentLinePoint + 5;
                                        if (concept.concept_id) { // bib from Bok
                                            const conceptId = concept.concept_id.split(']', 1)[0].split('[', 2).length > 0 ? concept.concept_id.split(']', 1)[0].split('[', 2)[1] : '';
                                            doc.setTextColor('#000').setFontType('normal');
                                            const linePre = doc.setFontSize(9).splitTextToSize(concept.name + '', 135);
                                            doc.text(45, currentLinePoint, linePre, { maxWidth: 135, align: 'justify' });
                                         //   doc.link(45, currentLinePoint - 2, 135, linePre.length + 5, { url: PopupComponent.URL_BOK + conceptId });
                                            currentLinePoint = currentLinePoint + (4 * linePre.length);
                                            currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                                        } else { //custom bib
                                            doc.setTextColor('#000').setFontType('normal');
                                            const linePreC = doc.setFontSize(9).splitTextToSize(concept + '', 135);
                                            doc.text(45, currentLinePoint, linePreC, { maxWidth: 135, align: 'justify' });
                                            currentLinePoint = currentLinePoint + (4 * linePreC.length);
                                            currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                                        }
                                    });
                                }
                                currentLinePoint = this.printLO(doc, currentLinePoint, 45, 135, lectures.learningObjectives);
                                currentLinePoint = this.printTS(doc, currentLinePoint, 45, 135, lectures.competences);

                            });
                        }
                    });
                }
            });
        }
        this.footer(doc);
        if (this.selectedSP.name) {
            doc.save(this.selectedSP.name + '.pdf');
        } else {
            doc.save('Study Program.pdf');
        }
    }

    checkEndOfPage(line, doc) {
        if (line > PopupComponent.END_PAGE_LINE) {
            line = this.newPage(doc);
        }
        return line;
    }
    newPage(doc) {
        this.footer(doc);
        doc.addPage();
        doc.addImage(this.base64img.logo, 'PNG', 10, 7, 37, 25);
        doc.addImage(this.base64img.back, 'PNG', 0, 100, 210, 198);
        return 45;
    }
    footer(doc) {
        doc.setFontSize(10).setTextColor('#768187').setFontType('bold');
        doc.text(165, 280, 'Page ' + doc.page);
        doc.page++;
    }

    printCleanText(doc, currentLinePoint, x, xEnd, text, size) {
        if (text != null && text !== '') {
            currentLinePoint = currentLinePoint + 5;
            doc.setTextColor('#000').setFontType('normal');
            const arrayLines = text.split('\n');
            arrayLines.forEach(l => {

                const cleanLine = l.replace(/[^a-zA-Z ;:.,-_()*+-/0-9='"!¡?¿]/g, '');
                const linesDesc = doc.setFontSize(size).splitTextToSize(cleanLine, xEnd);

                const expectedLine = currentLinePoint + 4 + (4 * linesDesc.length);
                if (expectedLine > PopupComponent.END_PAGE_LINE) {
                    doc.setTextColor('#000').setFontType('normal');
                    doc.setFontSize(size);
                    const fittingLines = Math.round((PopupComponent.END_PAGE_LINE - currentLinePoint) / 4);
                    if (fittingLines <= 0) {
                        currentLinePoint = this.newPage(doc);
                        doc.setTextColor('#000').setFontType('normal');
                        doc.setFontSize(size);
                        doc.text(x, currentLinePoint, linesDesc, { maxWidth: xEnd, align: 'justify' });
                        currentLinePoint = currentLinePoint + 4 + (4 * linesDesc.length);
                        currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                    } else {
                        const splitedLines1 = linesDesc.slice(0, fittingLines);
                        doc.text(x, currentLinePoint, splitedLines1, { maxWidth: xEnd, align: 'justify' });
                        currentLinePoint = currentLinePoint + 4 + (4 * splitedLines1.length);
                        currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                        const splitedLines2 = linesDesc.slice(fittingLines);
                        doc.setTextColor('#000').setFontType('normal');
                        doc.setFontSize(size);
                        doc.text(x, currentLinePoint, splitedLines2, { maxWidth: xEnd, align: 'justify' });
                        currentLinePoint = currentLinePoint + 4 + (4 * splitedLines2.length);
                        currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                    }
                } else {
                    doc.setTextColor('#000').setFontType('normal');
                    doc.setFontSize(size);
                    doc.text(x, currentLinePoint, linesDesc, { maxWidth: xEnd, align: 'justify' });
                    currentLinePoint = currentLinePoint + 4 + (4 * linesDesc.length);
                    currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                }
            });
        }

        return currentLinePoint;
    }

    printLO(doc, currentLinePoint, x, xEnd, los) {

        if (los != null && los.length > 0) {
            currentLinePoint = currentLinePoint + 6;
            currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
            doc.setFontSize(11).setTextColor('#1a80b6').setFontType('bold'); // headline
            doc.text(x, currentLinePoint, 'Learning Outcomes: ');
            los.forEach(concept => {
                currentLinePoint = currentLinePoint + 9;
                const conceptId = PopupComponent.URL_BOK + concept.concept_id.split(']', 1)[0].split('[', 2)[1];
                doc.setTextColor('#1a80b6').setFontType('normal');
                const lineLearn = doc.setFontSize(10).splitTextToSize(concept.name + '', xEnd);
                doc.text(x, currentLinePoint, lineLearn, { maxWidth: xEnd, align: 'justify' });
                if (concept.concept_id.split(']', 1)[0].split('[', 2).length > 1) {
                    doc.link(x, currentLinePoint - 2, xEnd, 2 + (3 * lineLearn.length), { url: conceptId });
                }
                currentLinePoint = currentLinePoint + (3 * lineLearn.length);
                currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
            });
        }
        return currentLinePoint;

    }

    printTS(doc, currentLinePoint, x, xEnd, trs) {

        if (trs != null && trs.length > 0) {
            currentLinePoint = currentLinePoint + 6;
            currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
            doc.setFontSize(11).setTextColor('#1a80b6').setFontType('bold'); // headline
            doc.text(x, currentLinePoint, 'Transversal skills: ');
            currentLinePoint = currentLinePoint + 9;
            trs.forEach(skill => {
                doc.setTextColor('#000').setFontType('normal');
                const lineSkill = doc.setFontSize(10).splitTextToSize(skill.preferredLabel + '', xEnd);
                doc.text(x, currentLinePoint, lineSkill, { maxWidth: xEnd, align: 'justify' });
                currentLinePoint = currentLinePoint + (4 * lineSkill.length);
                currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
            });
        }
        return currentLinePoint;
    }

    getFields(data: any) {
        let resultFields = '';
        if ( data.field !== null && data.field.greatgrandparent !== null ) {
          resultFields = resultFields + '<rdf:li>' + data.field.greatgrandparent + ' </rdf:li>' +
            '<rdf:li>' + data.field.code + ' </rdf:li>' +
            '<rdf:li>' + data.field.grandparent + ' </rdf:li>' +
            '<rdf:li>' + data.field.name + ' </rdf:li>' +
            '<rdf:li>' + data.field.concatName + ' </rdf:li>' +
            '<rdf:li>' + data.field.parent + ' </rdf:li>';
        }
      return resultFields;
    }

    getSkills(data: any) {
        let resultSkills = '';
        data.skills.forEach(skill => {
            resultSkills = resultSkills + '<rdf:li>' + skill + ' </rdf:li>';
        });
        return resultSkills;
    }

    getLinksToBok(data: any) {
        const linksToBok = PopupComponent.URL_CDT + 'linksToBok';
        let resultLinks = '';
        data.linksToBok.forEach(link => {
            const skills = this.getSkills(link);
            resultLinks = resultLinks + '<rdf:li>' +
                '<rdf:Description rdf:about="' + linksToBok + link._id + '">' +
                '<bok:concept_id>' + link.concept_id + '</bok:concept_id>' +
                '<bok:definition>' + link.definition + '</bok:definition>' +
                '<bok:linkedTo>' + link.linkedTo + '</bok:linkedTo>' +
                '<bok:name>' + link.name.replace('&', ' ')  + '</bok:name>';
            if (link.skills.length > 0) {
                resultLinks = resultLinks + '<bok:skills> <rdf:Bag>' + skills +
                    '</rdf:Bag> </bok:skills>';
            }

            resultLinks = resultLinks + '</rdf:Description>' + ' </rdf:li>';
        });
        return resultLinks;
    }
    getLearningObjectives(data: any) {
        const learningObjectives = PopupComponent.URL_CDT + 'learningObjectives';
        let resultLearningObjectives = '';
        data.learningObjectives.forEach(objective => {
            resultLearningObjectives = resultLearningObjectives + '<rdf:li>' +
                '<rdf:Description rdf:about="' + learningObjectives + objective._id + '">' +
                '<lObj:concept_id>' + objective.concept_id + '</lObj:concept_id>' +
                '<lObj:definition>' + objective.definition + '</lObj:definition>' +
                '<lObj:linkedTo>' + objective.linkedTo + '</lObj:linkedTo>' +
                '<lObj:name>' + objective.name.replace('&', ' ') + '</lObj:name>' +
                '</rdf:Description>' + ' </rdf:li>';
        });
        return resultLearningObjectives;
    }

    getConcepts(data: any) {
        let resultConcepts = '';
        data.concepts.forEach(concept => {
            resultConcepts = resultConcepts + '<rdf:li>' + concept.replace('&', ' ') + ' </rdf:li>';
        });
        return resultConcepts;
    }
    getChildren(data: any) {
        const urlChildren = PopupComponent.URL_CDT;

        let children = '';
        let module = '';
        if ( data.children !== null && data.children.length > 0 ) {
          data.children.forEach(child => {
            const linksToBok = this.getLinksToBok(child);
            const learningObjectives = this.getLearningObjectives(child);
            const concepts = this.getConcepts(child);
            const numSemesters = typeof child.numSemester !== undefined ? child.numSemester : 0;
            children = children + '<rdf:li> <rdf:Description ' +
              'rdf:about="' + urlChildren + child._id + '">' +
              '<children:name>' + child.name + '</children:name>' +
              '<children:description>' + child.description + '</children:description>' +
              '<children:numSemester>' + numSemesters + '</children:numSemester>';
            children = (typeof child.eqf !== 'undefined') ? children + '<children:eqf>' + child.eqf + '</children:eqf>' : children + '<children:ects>' + child.ects + '</children:ects>';
            module = (child.depth === 1) ? module = 'course' : module = 'lecture';
            if (typeof child.assesment !== 'undefined' && child.assesment !== '') {
              children = children + '<children:assesment>' + child.assesment + '</children:assesment>';
            }
            if (typeof child.bibliography !== 'undefined' && child.bibliography !== '') {
              children = children + '<children:bibliography> <rdf:Bag rdf:ID="bibliography"> ';
              child.bibliography.forEach(b => {
                children = children + '<rdf:li>' + b.name.replace('&', ' ') + '</rdf:li>';
              });
              children = children + '</rdf:Bag> </children:bibliography>';
            }
            if (child.children !== null && child.children.length > 0) {
              children = children + '<children:children> <rdf:Bag rdf:ID="' + module + '"> ' + this.getChildren(child) +
                '</rdf:Bag> </children:children>';
            }
            if (child.linksToBok !== null && child.linksToBok.length > 0) {
              children = children + '<children:linksToBok> <rdf:Bag>' + linksToBok + '</rdf:Bag> </children:linksToBok>';
            }
            if (child.learningObjectives !== null && child.learningObjectives.length > 0) {
              children = children + '<children:learningObjectives> <rdf:Bag>' + learningObjectives + '</rdf:Bag> </children:learningObjectives>';
            }
            if (child.concepts !== null && child.concepts.length > 0) {
              children = children + '<children:concepts> <rdf:Bag>' + concepts + '</rdf:Bag> </children:concepts>';
            }
            children = children + '</rdf:Description> </rdf:li>';
          });
        }
        return children;
    }
    headerRDF(data: any) {
        const urlBase = PopupComponent.URL_CDT;
        const children = PopupComponent.URL_CDT;
        const linksToBokURL = PopupComponent.URL_CDT + 'linksToBok';
        const learningObjectsURL = PopupComponent.URL_CDT + 'learningObjects';
        return '<?xml version="1.0"?>' +
            '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"' +
            ' xmlns:children="' + children + '" ' +
            ' xmlns:bok="' + linksToBokURL + '" ' +
            ' xmlns:lObj="' + learningObjectsURL + '" ' +
            ' xmlns:cdt="' + urlBase + '">' +
            ' <rdf:Description ' +
            'rdf:about="' + urlBase + data._id + '">';
    }
    createRDFFile(data: any) {
        const fields = this.getFields(data);
        const header = this.headerRDF(data);
        const concepts = this.getConcepts(data);
        const linksToBok = this.getLinksToBok(data);
        const numSemesters = data.numSemesters ? data.numSemesters : 0 ;
          let description = '<cdt:children> <rdf:Bag rdf:ID="modules"> ' + this.getChildren(data) +
            '</rdf:Bag> </cdt:children>' +
            '<cdt:name>' + data.name + ' </cdt:name>' +
            '<cdt:description> ' + data.description + ' </cdt:description>' +
            '<cdt:affiliation> ' + data.affiliation + '</cdt:affiliation>' +
            '<cdt:eqf> ' + data.eqf + '</cdt:eqf>' +
            '<cdt:numSemesters> ' + numSemesters + '</cdt:numSemesters>' +
            '<cdt:fields> <rdf:Bag rdf:ID="fields">' + fields + '</rdf:Bag> </cdt:fields>';
        if (data.linksToBok !== null && data.linksToBok.length > 0) {
            description = description + '<cdt:linksToBok> <rdf:Bag rdf:ID="linksToBok">' + linksToBok + '</rdf:Bag> </cdt:linksToBok>';
        }
        if (data.concepts !== null && data.concepts.length > 0) {
            description = description + '<cdt:concepts> <rdf:Bag rdf:ID="concepts">' + concepts + '</rdf:Bag> </cdt:concepts>';
        }
        description = description + '</rdf:Description>';
        return header +
            description +
            '</rdf:RDF>';
    }
    generateRDF() {
        const data = this.createRDFFile(this.selectedSP);
        const a = document.createElement('a');
        const blob = new Blob([data], { type: 'text/csv' }),
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = this.selectedSP.name + '_rdf.rdf';
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    }

}
