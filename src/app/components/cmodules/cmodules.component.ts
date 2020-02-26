/* import { Component, OnInit } from '@angular/core';
import { ModuleService, Module } from '../../services/module.service';

@Component({
  selector: 'app-cmodules',
  templateUrl: './cmodules.component.html',
  styleUrls: ['./cmodules.component.scss']
})
export class CmodulesComponent implements OnInit {

  modules: Module[];
  _modules: Module[];

  filterText: String = '';

  constructor(private moduleService: ModuleService) {
    this.moduleService
      .subscribeToModules()
      .subscribe(m => (this.modules = m, this._modules = m));
  }

  ngOnInit() {
  }

  filterModules() {
    this.moduleService.filterModulesByNameDescription(this.filterText);
  }

}
 */