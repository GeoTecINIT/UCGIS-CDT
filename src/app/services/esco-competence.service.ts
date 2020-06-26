import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
export interface Competence {
  uri?: String;
  skillType?: String;
  reuseLevel?: String;
  preferredLabel: String;
  description?: String;
  altLabels?: String[];
}

@Injectable({
  providedIn: 'root'
})

export class EscoCompetenceService {
  public allcompetences: any;

  // TODO: Retrieve this from the DB
  public basicCompetences = [
    { preferredLabel: 'Adapt to change', reuseLevel: 'transversal', uri: 'http://data.europa.eu/esco/skill/49de9958-2aa4-4eef-a89d-fe5d5bcd28c4'},
    { preferredLabel: 'Assertiveness', reuseLevel: 'transversal', uri: 'https://ec.europa.eu/esco/portal/skill' },
    { preferredLabel: 'Attend to detail', reuseLevel: 'transversal', uri: 'http://data.europa.eu/esco/skill/83e6510b-ffeb-4aec-959c-4265fd0ff7b7' },
    { preferredLabel: 'Customer relationship management', reuseLevel: 'transversal', uri: 'http://data.europa.eu/esco/skill/9889b795-d755-41b2-8afd-2e3c87a65a38' },
    { preferredLabel: 'Demonstrate intercultural competence', reuseLevel: 'transversal', uri: 'http://data.europa.eu/esco/skill/c10d5d87-36cf-42f5-8a12-e560fb5f4af8' },
    { preferredLabel: 'Demonstrate willingness to learn', reuseLevel: 'transversal', uri: 'http://data.europa.eu/esco/skill/9bf266a6-188b-4d17-a22f-2f266d76832b' },
    { preferredLabel: 'Develop company strategies', reuseLevel: 'transversal', uri: 'http://data.europa.eu/esco/skill/ba2c6181-b036-40b4-8f6d-51499463ccbb' },
    { preferredLabel: 'Develop strategy to solve problems', reuseLevel: 'transversal', uri: 'http://data.europa.eu/esco/skill/7a8fb784-67fa-41e9-a75c-6b491d91f800' },
    { preferredLabel: 'Digital competencies', reuseLevel: 'transversal', uri: 'https://ec.europa.eu/esco/portal/skill' },
    { preferredLabel: 'Identify opportunities', reuseLevel: 'transversal', uri: 'http://data.europa.eu/esco/skill/943d07ec-fb75-4bb5-bc07-20451a2b66e4' },
    { preferredLabel: 'Interact with others', reuseLevel: 'transversal', uri: 'http://data.europa.eu/esco/skill/09e28145-e205-4b7a-8b3b-5c4876396069' },
    { preferredLabel: 'Cope with pressure', reuseLevel: 'transversal', uri: 'http://data.europa.eu/esco/skill/7a147904-22b3-498a-b4d9-7bceeb86b45d' },
    { preferredLabel: 'Lead others', reuseLevel: 'transversal', uri: 'http://data.europa.eu/esco/skill/75d8e5d9-bef3-418b-9011-01bff9f27207' },
    { preferredLabel: 'Make decisions', reuseLevel: 'transversal', uri: 'http://data.europa.eu/esco/skill/d62d2b4c-a6f8-439e-8a1b-4f29ab5f2c47' },
    { preferredLabel: 'Manage frustration', reuseLevel: 'transversal', uri: 'http://data.europa.eu/esco/skill/1d1fedcb-4995-44ac-90f5-f31a157ce512' },
    { preferredLabel: 'Listen actively', reuseLevel: 'transversal', uri: 'http://data.europa.eu/esco/skill/a17286c5-238d-4f0b-bc24-29e9121345de' },
    { preferredLabel: 'Manage time', reuseLevel: 'transversal', uri: 'http://data.europa.eu/esco/skill/d9013e0e-e937-43d5-ab71-0e917ee882b8' },
    { preferredLabel: 'Meet commitments', reuseLevel: 'transversal', uri: 'http://data.europa.eu/esco/skill/113b4428-0a31-4199-8496-070af7854b91' },
    { preferredLabel: 'Motivate others', reuseLevel: 'transversal', uri: 'http://data.europa.eu/esco/skill/e2d44a9b-f28c-489e-9861-b654b5ded507' },
    { preferredLabel: 'Report facts', reuseLevel: 'transversal', uri: 'http://data.europa.eu/esco/skill/be6ab363-3de1-427f-a8ef-85d5b0250822' },
    { preferredLabel: 'Show enterpreneurial spirit', reuseLevel: 'transversal', uri: 'https://ec.europa.eu/esco/portal/skill' },
    { preferredLabel: 'Team building', reuseLevel: 'transversal', uri: 'http://data.europa.eu/esco/skill/045df803-cbab-40a9-9ac0-3c4a81ab4b2c' },
    { preferredLabel: 'Think creatively', reuseLevel: 'transversal', uri: 'http://data.europa.eu/esco/skill/c624c6a3-b0ba-4a31-a296-0d433fe47e41' },
    { preferredLabel: 'Think proactively', reuseLevel: 'transversal', uri: 'http://data.europa.eu/esco/skill/e186976a-64f0-4052-a25b-297d19e1d0ec' },
    { preferredLabel: 'Work efficiently', reuseLevel: 'transversal', uri: 'http://data.europa.eu/esco/skill/7a93e22f-54d8-4bf0-9213-d711f6601b49' },
    { preferredLabel: 'Work in an international environment', reuseLevel: 'transversal', uri: 'https://ec.europa.eu/esco/portal/skill' },
    { preferredLabel: 'Work independently', reuseLevel: 'transversal' , uri: 'http://data.europa.eu/esco/skill/c29aa9d2-4da8-4bdd-831c-8d4a2fb51730' }
  ];


  constructor(private http: HttpClient) {
    this.http.get('assets/json/esco.json').subscribe((data) => {
      this.allcompetences = data;
    });
  }
}
