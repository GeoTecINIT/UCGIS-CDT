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

    getFields ( data: any ) {
        let resultFields = '';
        resultFields = resultFields + '<rdf:li>' + data.field.greatgrandparent + ' </rdf:li>' +
            '<rdf:li>' + data.field.code + ' </rdf:li>' +
            '<rdf:li>' + data.field.grandparent + ' </rdf:li>' +
            '<rdf:li>' + data.field.name + ' </rdf:li>' +
            '<rdf:li>' + data.field.concatName + ' </rdf:li>' +
            '<rdf:li>' + data.field.parent + ' </rdf:li>';
        return resultFields;
    }

    getSkills ( data: any ) {
        let resultSkills = '';
        data.skills.forEach( skill => {
            resultSkills = resultSkills + '<rdf:li>' + skill + ' </rdf:li>';
        });
        return resultSkills;
    }

    getLinksToBok ( data: any ) {
        const linksToBok = 'https://eo4geo-opt.web.app/#/detail/linksToBok';
        let resultLinks = '';
        data.linksToBok.forEach( link => {
            const skills = this.getSkills(link);
            resultLinks = resultLinks + '<rdf:li>' +
                '<rdf:Description rdf:about="' + linksToBok + link._id + '">' +
                  '<bok:concept_id>' + link.concept_id + '</bok:concept_id>' +
                  '<bok:definition>' + link.definition + '</bok:definition>' +
                  '<bok:linkedTo>' + link.linkedTo + '</bok:linkedTo>' +
                  '<bok:name>' + link.name + '</bok:name>' ;
                  if ( link.skills.length > 0 ){
                      resultLinks = resultLinks +  '<bok:skills> <rdf:Bag>' + skills +
                          '</rdf:Bag> </bok:skills>' ;
                  }

             resultLinks = resultLinks +  '</rdf:Description>' + ' </rdf:li>';
        });
        return resultLinks;
    }
    getLearningObjectives ( data: any ) {
        const learningObjectives = 'https://eo4geo-opt.web.app/#/detail/learningObjectives';
        let resultLearningObjectives = '';
        data.learningObjectives.forEach( objective => {
            resultLearningObjectives = resultLearningObjectives + '<rdf:li>' +
                '<rdf:Description rdf:about="' + learningObjectives + objective._id + '">' +
                '<lObj:concept_id>' + objective.concept_id + '</lObj:concept_id>' +
                '<lObj:definition>' + objective.definition + '</lObj:definition>' +
                '<lObj:linkedTo>' + objective.linkedTo + '</lObj:linkedTo>' +
                '<lObj:name>' + objective.name + '</lObj:name>'  +
                '</rdf:Description>' + ' </rdf:li>';
        });
        return resultLearningObjectives;
    }

    getConcepts ( data: any ) {
        let resultConcepts = '';
        data.concepts.forEach( concept => {
            resultConcepts = resultConcepts + '<rdf:li>' + concept + ' </rdf:li>';
        });
        return resultConcepts;
    }
    getChildren(data :any){
        const urlChildren = 'https://eo4geo-opt.web.app/#/detail/';

        let children = '';
        let module = '';
        data.children.forEach( child => {
            const linksToBok = this.getLinksToBok( child );
            const learningObjectives = this.getLearningObjectives( child );
            const concepts = this.getConcepts(child);
            children = children + '<rdf:li> <rdf:Description ' +
                'rdf:about="' + urlChildren + child._id + '">' +
                '<children:name>' + child.name + '</children:name>' +
                '<children:description>' + child.description + '</children:description>' +
                '<children:numSemester>' + child.numSemester + '</children:numSemester>' ;
            children = (typeof  child.eqf != 'undefined') ? children + '<children:eqf>' + child.eqf + '</children:eqf>' : children + '<children:ects>' + child.ects + '</children:ects>';
            module = ( child.depth == 1 ) ? module = 'course' : module = 'lecture';
            if ( typeof  child.assesment != 'undefined' && child.assesment != '') children =  children + '<children:assesment>' + child.assesment + '</children:assesment>';
            if ( typeof  child.bibliography != 'undefined' && child.bibliography != '' ) children =  children + '<children:bibliography>' + child.bibliography + '</children:bibliography>';
            if ( child.children.length > 0 ){
              children = children +  '<children:children> <rdf:Bag rdf:ID="' + module + '"> ' + this.getChildren(child) +
                  '</rdf:Bag> </children:children>' ;
            }
            if ( child.linksToBok.length > 0 ){
                children = children + '<children:linksToBok> <rdf:Bag>' + linksToBok + '</rdf:Bag> </children:linksToBok>' ;
            }
            if ( child.learningObjectives.length > 0 ){
                children = children + '<children:learningObjectives> <rdf:Bag>' + learningObjectives + '</rdf:Bag> </children:learningObjectives>' ;
            }
            if ( child.concepts.length > 0 ){
                children = children + '<children:concepts> <rdf:Bag>' + concepts + '</rdf:Bag> </children:concepts>' ;
            }
                children = children + '</rdf:Description> </rdf:li>';
        });

        return children;
    }
    headerRDF(data: any) {
        const urlBase = 'https://eo4geo-jot.web.app/#/detail/';
        const children = 'https://eo4geo-opt.web.app/#/detail/';
        const linksToBokURL = 'https://eo4geo-opt.web.app/#/detail/linksToBok';
        const learningObjectsURL = 'https://eo4geo-opt.web.app/#/detail/learningObjects' ;
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
        const fields = this.getFields( data);
        const header = this.headerRDF(data);
        const concepts = this.getConcepts(data);
        const linksToBok = this.getLinksToBok( data );
        let description = '<cdt:children> <rdf:Bag rdf:ID="modules"> ' + this.getChildren(data) +
            '</rdf:Bag> </cdt:children>' +
            '<cdt:name>' + data.name + ' </cdt:name>' +
            '<cdt:description> ' + data.description + ' </cdt:description>' +
            '<cdt:affiliation> ' + data.affiliation + '</cdt:affiliation>' +
            '<cdt:eqf> ' + data.eqf + '</cdt:eqf>' +
            '<cdt:numSemesters> ' + data.numSemesters + '</cdt:numSemesters>' +
            '<cdt:fields> <rdf:Bag rdf:ID="fields">' + fields + '</rdf:Bag> </cdt:fields>' ;
        if ( data.linksToBok.length > 0 ){
            description = description +   '<cdt:linksToBok> <rdf:Bag rdf:ID="linksToBok">' + linksToBok + '</rdf:Bag> </cdt:linksToBok>' ;
        }
        if ( data.concepts.length > 0 ){
            description = description +  '<cdt:concepts> <rdf:Bag rdf:ID="concepts">' + concepts + '</rdf:Bag> </cdt:concepts>' ;
        }
        description = description +  '</rdf:Description>';
        return header +
            description +
            '</rdf:RDF>';
    }
    generateRDF() {
        const data = this.createRDFFile(this.selectedSP);
        const a = document.createElement('a');
        const blob = new Blob([data], {type: 'text/csv' }),
        url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = this.selectedSP.name+ '_rdf.rdf';
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    }

}
