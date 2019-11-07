import { Component, OnInit } from '@angular/core';
import { ModuleService, Module } from '../../services/module.service';


@Component({
  selector: 'app-addmodules',
  templateUrl: './addmodules.component.html',
  styleUrls: ['./addmodules.component.scss']
})
export class AddmodulesComponent implements OnInit {

  addModule: Module[];
  newModule: Module;
  constructor() { }

  ngOnInit() {
  }

  createNewModule() {
  }

}
