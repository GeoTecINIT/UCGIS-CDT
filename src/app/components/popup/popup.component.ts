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

  public static END_PAGE_LINE = 284;

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
    doc.addImage(this.base64img.logo, 'PNG', 10, 7, 37, 25);
    doc.addImage(this.base64img.back, 'PNG', 0, 100, 210, 198);
    doc.link(15, 15, 600, 33, { url: 'http://www.eo4geo.eu' });
    doc.setFontSize(38);
    doc.setFontType('bold');
    doc.setTextColor('#1a80b6');
    if (this.selectedSP.name != null) {
      const titleLines = doc.setFontSize(38).splitTextToSize(this.selectedSP.name, 150);
      doc.text(30, currentLinePoint, titleLines);
      currentLinePoint = currentLinePoint + (15 * titleLines.length);
    }

/*

    if (this.selectedSP.field != null) {
      doc.setFontSize(12).setTextColor('#1a80b6').setFontType('bold'); // headline
      doc.text(30, currentLinePoint, 'EQF' + this.selectedSP.eqf + ' - ' + this.selectedSP.field.name);
      currentLinePoint = currentLinePoint + 5;
    }

    if (this.selectedSP.description != null) {
      doc.setTextColor('#000').setFontType('normal');
      const lines = doc.setFontSize(10).splitTextToSize(this.selectedSP.description, 150);
      doc.text(30, currentLinePoint, lines); // description
      currentLinePoint = currentLinePoint + 10 + (4 * lines.length);
    }
    // fecha
    // const d = new Date();
    // doc.text(90, 90, d.toLocaleDateString('es-ES'));

    if (this.selectedSP.knowledge.length > 0) {
      doc.setFontSize(12).setTextColor('#1a80b6').setFontType('bold'); // headline
      doc.text(30, currentLinePoint, 'Knowledge required');
      currentLinePoint = currentLinePoint + 5;
      doc.setTextColor('#000').setFontType('normal').setFontSize(8); // normal text
      this.selectedSP.knowledge.forEach(kn => {
        const knLines = doc.setFontSize(8).splitTextToSize('· ' + kn, 150);
        doc.text(30, currentLinePoint, knLines);
        currentLinePoint = currentLinePoint + 4 * knLines.length;
      });
    }

    if (this.selectedSP.skills.length > 0) {
      currentLinePoint = currentLinePoint + 10;
      doc.setFontSize(12).setTextColor('#1a80b6').setFontType('bold'); // headline
      doc.text(30, currentLinePoint, 'Skills required');
      currentLinePoint = currentLinePoint + 5;
      doc.setTextColor('#000').setFontType('normal').setFontSize(8); // normal text
      this.selectedSP.skills.forEach(sk => {
        currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
        const skLines = doc.setFontSize(8).splitTextToSize('· ' + sk, 150);
        doc.text(30, currentLinePoint, skLines);
        currentLinePoint = currentLinePoint + 4 * skLines.length;
      });
    }

    if (this.selectedSP.competences.length > 0) {
      currentLinePoint = currentLinePoint + 10;
      doc.setFontSize(12).setTextColor('#1a80b6').setFontType('bold'); // headline
      doc.text(30, currentLinePoint, 'Competences');
      currentLinePoint = currentLinePoint + 5;
      doc.setTextColor('#000').setFontType('normal').setFontSize(8); // normal text
      this.selectedProfile.competences.forEach(co => {
        currentLinePoint = this.checkEndOfPage(currentLinePoint, doc);
        const coLines = doc.setFontSize(8).splitTextToSize('· ' + co.preferredLabel, 150);
        doc.text(30, currentLinePoint, coLines);
        currentLinePoint = currentLinePoint + 4 * coLines.length;
      });
    }

    */

    // doc.textWithLink('asdfasdf', 20, 260, { url: 'https://renhata.es/es/ciudadania/consejos-sostenibilidad-edificio' });
    doc.save('StudyProgram.pdf');
  }


  checkEndOfPage(line, doc) {
    if (line > PopupComponent.END_PAGE_LINE) {
      doc.addPage();
      doc.addImage(this.base64img.logo, 'PNG', 10, 7, 37, 25);
      doc.addImage(this.base64img.back, 'PNG', 0, 100, 210, 198);
      line = 45;
    }
    return line;
  }

}
