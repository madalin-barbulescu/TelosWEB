import { Component, Input } from "@angular/core";
import { Contract } from "../models/contract";


@Component({
  selector: 'contract-source-code',
  templateUrl: './contract-source-code.component.html',
  styleUrls: ['./contract-source-code.component.css']
})
export class ContratSourceCodeComponent {
  @Input()
  contract: Contract;
}