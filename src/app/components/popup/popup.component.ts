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

    public static END_PAGE_LINE = 230;
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

    generatePDF() {
        console.log('pdf');
        let currentLinePoint = 45;
        let numerals = {};
        // cabecera , imágenes
        const doc = new jsPDF();
        doc.page = 1;
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
            doc.text(30, currentLinePoint, 'Organising entities: ' + this.selectedSP.affiliation);
            currentLinePoint = currentLinePoint + 8;
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
        if (this.selectedSP.field != null) {
            doc.setTextColor('#000').setFontType('normal').setFontSize(10);
            doc.text(30, currentLinePoint, 'Study area: ' + this.selectedSP.field.name + ' (' + this.selectedSP.field.grandparent + ')');
            currentLinePoint = currentLinePoint + 8;
        }
        if (this.selectedSP.description != null && this.selectedSP.description !== '') {
            currentLinePoint = currentLinePoint + 5;
            doc.setTextColor('#000').setFontType('normal');
            const linesDesc = doc.setFontSize(11).splitTextToSize(this.selectedSP.description, 150);
            const expectedLine = currentLinePoint + 9 + (4 * linesDesc.length);
            if (expectedLine > PopupComponent.END_PAGE_LINE) {
                doc.setTextColor('#000').setFontType('normal');
                doc.setFontSize(11);
                const fittingLines = Math.round((PopupComponent.END_PAGE_LINE - currentLinePoint) / 4);
                if (fittingLines <= 0) {
                    currentLinePoint = this.newPage(doc);
                    doc.setTextColor('#000').setFontType('normal');
                    doc.setFontSize(11);
                    doc.text(30, currentLinePoint, linesDesc, { maxWidth: 150, align: 'justify' });
                    currentLinePoint = currentLinePoint + 9 + (4 * linesDesc.length);
                    currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                } else {
                    const splitedLines1 = linesDesc.slice(0, fittingLines);
                    doc.text(30, currentLinePoint, splitedLines1, { maxWidth: 150, align: 'justify' });
                    currentLinePoint = currentLinePoint + 9 + (3.8 * splitedLines1.length);
                    currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                    const splitedLines2 = linesDesc.slice(fittingLines);
                    doc.setTextColor('#000').setFontType('normal');
                    doc.setFontSize(11);
                    doc.text(30, currentLinePoint, splitedLines2, { maxWidth: 150, align: 'justify' });
                    currentLinePoint = currentLinePoint + 9 + (3.8 * splitedLines2.length);
                    currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                }
            } else {
                doc.setTextColor('#000').setFontType('normal');
                doc.setFontSize(11);
                doc.text(30, currentLinePoint, linesDesc, { maxWidth: 150, align: 'justify' });
                currentLinePoint = currentLinePoint + 9 + (3.8 * linesDesc.length);
                currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
            }
        }
        if (this.selectedSP.bibliography && this.selectedSP.bibliography.length > 0) {
            currentLinePoint = currentLinePoint + 5;
            doc.setFontSize(11).setTextColor('#1a80b6').setFontType('bold'); // headline
            doc.text(30, currentLinePoint, 'Bibliography: ');
            currentLinePoint = currentLinePoint + 5;
            this.selectedSP.bibliography.forEach(concept => {
                currentLinePoint = currentLinePoint + 5;
                const conceptId = concept.concept_id.split(']', 1)[0].split('[', 2).length > 0 ? concept.concept_id.split(']', 1)[0].split('[', 2)[1] : '';
                doc.setTextColor('#000').setFontType('normal');
                const linePre = doc.setFontSize(9).splitTextToSize(concept.name + '', 150);
                doc.text(30, currentLinePoint, linePre);
                doc.link(30, currentLinePoint - 2, 150, linePre.length + 5, { url: PopupComponent.URL_BOK + conceptId });
                currentLinePoint = currentLinePoint + (4 * linePre.length);
                currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
            });
        }
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
            doc.text(30, currentLinePoint, this.selectedSP.name);
            currentLinePoint = currentLinePoint + 5;

            this.selectedSP.children.forEach(module => {
                doc.setFontSize(11).setTextColor('#000').setFontType('normal');
                doc.text(35, currentLinePoint, countM + '. ' + module.name);
                currentLinePoint = currentLinePoint + 5;
                numerals['m_' + module.name] = countM + '. ';
                if (module.children && module.children.length > 0) {
                    module.children.forEach(course => {
                        doc.setFontSize(11).setTextColor('#000').setFontType('normal');
                        doc.text(40, currentLinePoint, countM + '.' + countC + '. ' + course.name);
                        currentLinePoint = currentLinePoint + 5;
                        numerals['c_' + course.name] = countM + '.' + countC + '. ';
                        if (course.children && course.children.length > 0) {
                            course.children.forEach(lecture => {
                                doc.setFontSize(11).setTextColor('#000').setFontType('normal');
                                doc.text(45, currentLinePoint, countM + '.' + countC + '.' + countL + '. ' + lecture.name);
                                currentLinePoint = currentLinePoint + 5;
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
                const knLines = doc.setFontSize(12).splitTextToSize(numerals['m_' + module.name] + module.name, 150);
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
                        const linePre = doc.setFontSize(9).splitTextToSize(link.name + '', 140);
                        doc.text(35, currentLinePoint, '- ' + linePre);
                        doc.link(35, currentLinePoint - 2, 140, linePre.length + 5, { url: linkId });
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
                if (module.description != null && module.description !== '') {
                    currentLinePoint = currentLinePoint + 5;
                    currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                    doc.setTextColor('#000').setFontType('normal');
                    const linesDesc = doc.setFontSize(11).splitTextToSize(module.description, 150);
                    const expectedLine = currentLinePoint + 9 + (4 * linesDesc.length);
                    if (expectedLine > PopupComponent.END_PAGE_LINE) {
                        doc.setTextColor('#000').setFontType('normal');
                        doc.setFontSize(11);
                        const fittingLines = Math.round((PopupComponent.END_PAGE_LINE - currentLinePoint) / 4);
                        if (fittingLines <= 0) {
                            currentLinePoint = this.newPage(doc);
                            doc.setTextColor('#000').setFontType('normal');
                            doc.setFontSize(11);
                            doc.text(30, currentLinePoint, linesDesc, { maxWidth: 150, align: 'justify' });
                            currentLinePoint = currentLinePoint + 9 + (4 * linesDesc.length);
                            currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                        } else {
                            const splitedLines1 = linesDesc.slice(0, fittingLines);
                            doc.text(35, currentLinePoint, splitedLines1, { maxWidth: 150, align: 'justify' });
                            currentLinePoint = currentLinePoint + 9 + (3.8 * splitedLines1.length);
                            currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                            const splitedLines2 = linesDesc.slice(fittingLines);
                            doc.setTextColor('#000').setFontType('normal');
                            doc.setFontSize(11);
                            doc.text(35, currentLinePoint, splitedLines2, { maxWidth: 150, align: 'justify' });
                            currentLinePoint = currentLinePoint + 9 + (3.8 * splitedLines2.length);
                            currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                        }
                    } else {
                        doc.setTextColor('#000').setFontType('normal');
                        doc.setFontSize(11);
                        doc.text(35, currentLinePoint, linesDesc, { maxWidth: 150, align: 'justify' });
                        currentLinePoint = currentLinePoint + 9 + (3.8 * linesDesc.length);
                        currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                    }
                }
                if (module.prerequisites && module.prerequisites.length > 0) {
                    doc.setFontSize(11).setTextColor('#1a80b6').setFontType('bold'); // headline
                    doc.text(40, currentLinePoint, 'Prerequisites: ');
                    currentLinePoint = currentLinePoint + 5;
                    module.prerequisites.forEach(concept => {
                        //const conceptId = concept.concept_id.split(']', 1)[0].split('[', 2).length > 0 ?   concept.concept_id.split(']', 1)[0].split('[', 2)[1] : '';
                        doc.setTextColor('#000').setFontType('normal');
                        const linePre = doc.setFontSize(11).splitTextToSize(concept.name + '', 100);
                        doc.text(40, currentLinePoint, '- ' + linePre);
                        //doc.link(40, currentLinePoint - 2, 600, linePre.length + 5, { url: PopupComponent.URL_BOK + conceptId});
                        currentLinePoint = currentLinePoint + 5 + (4 * linePre.length);
                        currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                    });
                }
                if (module.assessment != null && module.assessment !== '') {
                    currentLinePoint = currentLinePoint + 5;
                    currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                    doc.setFontSize(11).setTextColor('#1a80b6').setFontType('bold'); // headline
                    doc.text(35, currentLinePoint, 'Assessments');
                    currentLinePoint = currentLinePoint + 5;
                    doc.setTextColor('#000').setFontType('normal').setFontSize(11); // normal text
                    const coLines = doc.setFontSize(11).splitTextToSize(module.assessment + '', 150);
                    doc.text(35, currentLinePoint, coLines, { maxWidth: 150, align: 'justify' });
                    currentLinePoint = currentLinePoint + 4 * coLines.length;
                }
                if (module.bibliography && module.bibliography.length > 0) {
                    currentLinePoint = currentLinePoint + 5;
                    doc.setFontSize(11).setTextColor('#1a80b6').setFontType('bold'); // headline
                    doc.text(45, currentLinePoint, 'Bibliography: ');
                    currentLinePoint = currentLinePoint + 5;
                    module.bibliography.forEach(concept => {
                        currentLinePoint = currentLinePoint + 5;
                        const conceptId = concept.concept_id.split(']', 1)[0].split('[', 2).length > 0 ? concept.concept_id.split(']', 1)[0].split('[', 2)[1] : '';
                        doc.setTextColor('#000').setFontType('normal');
                        const linePre = doc.setFontSize(9).splitTextToSize(concept.name + '', 150);
                        doc.text(35, currentLinePoint, linePre);
                        doc.link(35, currentLinePoint - 2, 150, linePre.length + 5, { url: PopupComponent.URL_BOK + conceptId });
                        currentLinePoint = currentLinePoint + (4 * linePre.length);
                        currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                    });
                }
                if (module.children && module.children.length > 0) {
                    currentLinePoint = currentLinePoint + 15;
                    currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                    doc.setFontSize(12).setTextColor('#1a80b6').setFontType('bold'); // headline
                    doc.text(35, currentLinePoint, 'Courses ( Module: ' + module.name + ' )');
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
                        if (courses.description != null && courses.description !== '') {
                            currentLinePoint = currentLinePoint + 5;
                            // const linesDesc = doc.setFontSize(11).splitTextToSize(courses.description, 140);
                            const linesDesc = doc.setFontSize(11).splitTextToSize(courses.description.replace(/(\r\n|\n|\r)/gm, ''), 140);
                            const expectedLine = currentLinePoint + 9 + (4 * linesDesc.length);
                            if (expectedLine > PopupComponent.END_PAGE_LINE) {
                                doc.setTextColor('#000').setFontType('normal');
                                doc.setFontSize(11);
                                const fittingLines = Math.round((PopupComponent.END_PAGE_LINE - currentLinePoint) / 4);
                                if (fittingLines <= 0) {
                                    currentLinePoint = this.newPage(doc);
                                    doc.setTextColor('#000').setFontType('normal');
                                    doc.setFontSize(11);
                                    doc.text(40, currentLinePoint, linesDesc, { maxWidth: 140, align: 'justify' });
                                    currentLinePoint = currentLinePoint + 9 + (4 * linesDesc.length);
                                    currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                                } else {
                                    const splitedLines1 = linesDesc.slice(0, fittingLines);
                                    doc.text(40, currentLinePoint, splitedLines1, { maxWidth: 140, align: 'justify' });
                                    currentLinePoint = currentLinePoint + 9 + (3.8 * splitedLines1.length);
                                    currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                                    const splitedLines2 = linesDesc.slice(fittingLines);
                                    doc.setTextColor('#000').setFontType('normal');
                                    doc.setFontSize(11);
                                    doc.text(40, currentLinePoint, splitedLines2, { maxWidth: 140, align: 'justify' });
                                    currentLinePoint = currentLinePoint + 9 + (3.8 * splitedLines2.length);
                                    currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                                }
                            } else {
                                doc.setTextColor('#000').setFontType('normal');
                                doc.setFontSize(11);
                                doc.text(40, currentLinePoint, linesDesc, { maxWidth: 140, align: 'justify' });
                                currentLinePoint = currentLinePoint + 9 + (3.8 * linesDesc.length);
                                currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                            }
                        }
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
                        if (courses.assessment != null && courses.assessment !== '') {
                            currentLinePoint = currentLinePoint + 7;
                            currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                            doc.setFontSize(11).setTextColor('#1a80b6').setFontType('bold'); // headline
                            doc.text(40, currentLinePoint, 'Assessments');
                            currentLinePoint = currentLinePoint + 5;
                            doc.setTextColor('#000').setFontType('normal').setFontSize(11); // normal text
                            const coLines = doc.setFontSize(11).splitTextToSize(courses.assessment + '', 150);
                            doc.text(40, currentLinePoint, coLines, { maxWidth: 140, align: 'justify' });
                            currentLinePoint = currentLinePoint + 1 + (4 * coLines.length);
                        }
                        if (courses.bibliography && courses.bibliography.length > 0) {
                            currentLinePoint = currentLinePoint + 5;
                            doc.setFontSize(11).setTextColor('#1a80b6').setFontType('bold'); // headline
                            doc.text(40, currentLinePoint, 'Bibliography: ');
                            currentLinePoint = currentLinePoint + 5;
                            courses.bibliography.forEach(concept => {
                                currentLinePoint = currentLinePoint + 5;
                                const conceptId = concept.concept_id.split(']', 1)[0].split('[', 2).length > 0 ? concept.concept_id.split(']', 1)[0].split('[', 2)[1] : '';
                                doc.setTextColor('#000').setFontType('normal');
                                const linePre = doc.setFontSize(9).splitTextToSize(concept.name + '', 140);
                                doc.text(40, currentLinePoint, linePre);
                                doc.link(40, currentLinePoint - 2, 140, linePre.length + 5, { url: PopupComponent.URL_BOK + conceptId });
                                currentLinePoint = currentLinePoint + (4 * linePre.length);
                                currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                            });
                        }
                        if (courses.learningObjectives != null && courses.learningObjectives.length > 0) {
                            currentLinePoint = currentLinePoint + 6;
                            currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                            doc.setFontSize(11).setTextColor('#1a80b6').setFontType('bold'); // headline
                            doc.text(40, currentLinePoint, 'Learning Outcomes: ');
                            courses.learningObjectives.forEach(concept => {
                                currentLinePoint = currentLinePoint + 5;
                                const conceptId = PopupComponent.URL_BOK + concept.concept_id.split(']', 1)[0].split('[', 2)[1];
                                doc.setTextColor('#1a80b6').setFontType('normal');
                                const lineLearn = doc.setFontSize(10).splitTextToSize(concept.name + '', 140);
                                doc.text(40, currentLinePoint, lineLearn, { maxWidth: 140, align: 'justify' });
                                if (concept.concept_id.split(']', 1)[0].split('[', 2).length > 1) {
                                    doc.link(40, currentLinePoint - 2, 140, 2 + (3 * lineLearn.length), { url: conceptId });
                                }
                                currentLinePoint = currentLinePoint + 1 + (3 * lineLearn.length);
                            });
                        }
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
                                if (lectures.description != null && lectures.description !== '') {
                                    currentLinePoint = currentLinePoint + 5;
                                    currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                                    doc.setTextColor('#000').setFontType('normal');
                                    const linesDesc = doc.setFontSize(11).splitTextToSize(lectures.description, 130);

                                    const expectedLine = currentLinePoint + 9 + (4 * linesDesc.length);
                                    if (expectedLine > PopupComponent.END_PAGE_LINE) {
                                        doc.setTextColor('#000').setFontType('normal');
                                        doc.setFontSize(11);
                                        const fittingLines = Math.round((PopupComponent.END_PAGE_LINE - currentLinePoint) / 4);
                                        if (fittingLines <= 0) {
                                            currentLinePoint = this.newPage(doc);
                                            doc.setTextColor('#000').setFontType('normal');
                                            doc.setFontSize(11);
                                            doc.text(45, currentLinePoint, linesDesc, { maxWidth: 130, align: 'justify' });
                                            currentLinePoint = currentLinePoint + 9 + (4 * linesDesc.length);
                                            currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                                        } else {
                                            const splitedLines1 = linesDesc.slice(0, fittingLines);
                                            doc.text(45, currentLinePoint, splitedLines1, { maxWidth: 130, align: 'justify' });
                                            currentLinePoint = currentLinePoint + 9 + (3.8 * splitedLines1.length);
                                            currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                                            const splitedLines2 = linesDesc.slice(fittingLines);
                                            doc.setTextColor('#000').setFontType('normal');
                                            doc.setFontSize(11);
                                            doc.text(45, currentLinePoint, splitedLines2, { maxWidth: 130, align: 'justify' });
                                            currentLinePoint = currentLinePoint + 9 + (3.8 * splitedLines2.length);
                                            currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                                        }
                                    } else {
                                        doc.setTextColor('#000').setFontType('normal');
                                        doc.setFontSize(11);
                                        doc.text(45, currentLinePoint, linesDesc, { maxWidth: 130, align: 'justify' });
                                        currentLinePoint = currentLinePoint + 9 + (3.8 * linesDesc.length);
                                        currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                                    }
                                }
                                if (lectures.bibliography && lectures.bibliography.length > 0) {
                                    currentLinePoint = currentLinePoint + 5;
                                    doc.setFontSize(11).setTextColor('#1a80b6').setFontType('bold'); // headline
                                    doc.text(45, currentLinePoint, 'Bibliography: ');
                                    currentLinePoint = currentLinePoint + 5;
                                    lectures.bibliography.forEach(concept => {
                                        currentLinePoint = currentLinePoint + 5;
                                        const conceptId = concept.concept_id.split(']', 1)[0].split('[', 2).length > 0 ? concept.concept_id.split(']', 1)[0].split('[', 2)[1] : '';
                                        doc.setTextColor('#000').setFontType('normal');
                                        const linePre = doc.setFontSize(9).splitTextToSize(concept.name + '', 130);
                                        doc.text(45, currentLinePoint, linePre);
                                        doc.link(45, currentLinePoint - 2, 130, linePre.length + 5, { url: PopupComponent.URL_BOK + conceptId });
                                        currentLinePoint = currentLinePoint + (4 * linePre.length);
                                        currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
                                    });
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
    };

    getFields(data: any) {
        let resultFields = '';
        resultFields = resultFields + '<rdf:li>' + data.field.greatgrandparent + ' </rdf:li>' +
            '<rdf:li>' + data.field.code + ' </rdf:li>' +
            '<rdf:li>' + data.field.grandparent + ' </rdf:li>' +
            '<rdf:li>' + data.field.name + ' </rdf:li>' +
            '<rdf:li>' + data.field.concatName + ' </rdf:li>' +
            '<rdf:li>' + data.field.parent + ' </rdf:li>';
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
                '<bok:name>' + link.name + '</bok:name>';
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
                '<lObj:name>' + objective.name + '</lObj:name>' +
                '</rdf:Description>' + ' </rdf:li>';
        });
        return resultLearningObjectives;
    }

    getConcepts(data: any) {
        let resultConcepts = '';
        data.concepts.forEach(concept => {
            resultConcepts = resultConcepts + '<rdf:li>' + concept + ' </rdf:li>';
        });
        return resultConcepts;
    }
    getChildren(data: any) {
        const urlChildren = PopupComponent.URL_CDT;

        let children = '';
        let module = '';
        data.children.forEach(child => {
            const linksToBok = this.getLinksToBok(child);
            const learningObjectives = this.getLearningObjectives(child);
            const concepts = this.getConcepts(child);
            children = children + '<rdf:li> <rdf:Description ' +
                'rdf:about="' + urlChildren + child._id + '">' +
                '<children:name>' + child.name + '</children:name>' +
                '<children:description>' + child.description + '</children:description>' +
                '<children:numSemester>' + child.numSemester + '</children:numSemester>';
            children = (typeof child.eqf !== 'undefined') ? children + '<children:eqf>' + child.eqf + '</children:eqf>' : children + '<children:ects>' + child.ects + '</children:ects>';
            module = (child.depth === 1) ? module = 'course' : module = 'lecture';
            if (typeof child.assesment !== 'undefined' && child.assesment !== '') children = children + '<children:assesment>' + child.assesment + '</children:assesment>';
            if (typeof child.bibliography !== 'undefined' && child.bibliography !== '') children = children + '<children:bibliography>' + child.bibliography + '</children:bibliography>';
            if (child.children.length > 0) {
                children = children + '<children:children> <rdf:Bag rdf:ID="' + module + '"> ' + this.getChildren(child) +
                    '</rdf:Bag> </children:children>';
            }
            if (child.linksToBok.length > 0) {
                children = children + '<children:linksToBok> <rdf:Bag>' + linksToBok + '</rdf:Bag> </children:linksToBok>';
            }
            if (child.learningObjectives.length > 0) {
                children = children + '<children:learningObjectives> <rdf:Bag>' + learningObjectives + '</rdf:Bag> </children:learningObjectives>';
            }
            if (child.concepts.length > 0) {
                children = children + '<children:concepts> <rdf:Bag>' + concepts + '</rdf:Bag> </children:concepts>';
            }
            children = children + '</rdf:Description> </rdf:li>';
        });

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
        let description = '<cdt:children> <rdf:Bag rdf:ID="modules"> ' + this.getChildren(data) +
            '</rdf:Bag> </cdt:children>' +
            '<cdt:name>' + data.name + ' </cdt:name>' +
            '<cdt:description> ' + data.description + ' </cdt:description>' +
            '<cdt:affiliation> ' + data.affiliation + '</cdt:affiliation>' +
            '<cdt:eqf> ' + data.eqf + '</cdt:eqf>' +
            '<cdt:numSemesters> ' + data.numSemesters + '</cdt:numSemesters>' +
            '<cdt:fields> <rdf:Bag rdf:ID="fields">' + fields + '</rdf:Bag> </cdt:fields>';
        if (data.linksToBok.length > 0) {
            description = description + '<cdt:linksToBok> <rdf:Bag rdf:ID="linksToBok">' + linksToBok + '</rdf:Bag> </cdt:linksToBok>';
        }
        if (data.concepts.length > 0) {
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
