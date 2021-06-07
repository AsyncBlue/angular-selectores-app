import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { switchMap, tap } from "rxjs/operators";
import { PaisesService } from '../../services/paises.service';
import { PaisSmall } from '../../interfaces/paises.interface';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: [
  ]
})
export class SelectorPageComponent implements OnInit {

  miFormulario: FormGroup = this.fb.group({
    region  : [ '', Validators.required ],
    pais    : [ '', Validators.required ],
    frontera: [ '', Validators.required ]
  });

  //llenar selectores
  regiones: string[] = [];
  paises: PaisSmall[] = []; 
  //fronteras: string[] = [];
  fronteras: PaisSmall[] = [];
  
  // UI
  cargando: boolean = false;

  constructor( private fb: FormBuilder,
               private paisesService: PaisesService ) { }

  ngOnInit(): void {
    this.regiones = this.paisesService.regiones;

    //Cuando cambie la region
    this.miFormulario.get('region')?.valueChanges
      .pipe(
        tap( ( _ ) => { // el _ es una nomensclatura estandar para decir que no nos interesa lo que venga en la resp, el tap es para disparar efectos secundarios
          this.miFormulario.get('pais')?.reset('');
          this.cargando = true;
        }),
        switchMap( region => this.paisesService.getPaisesPorRegion( region ) ) // switchMap permite utilizar la resp de un subscribe inmediatamente en otro
      )
      .subscribe( paises => {
        this.paises = paises;
        this.cargando = false;
      });

    //Cuando cambie el pais
    this.miFormulario.get('pais')?.valueChanges
      .pipe(
        tap( () => { // () es igual que poner _ ya que no queremos nada de ahi
          this.miFormulario.get('frontera')?.reset('');
          this.cargando = true;
        }),
        switchMap( codigo => this.paisesService.getPaisPorCodigo( codigo ) ),
        switchMap( pais => this.paisesService.getPaisesPorCodigo( pais?.borders! ) )
      )
      .subscribe( paises => {
        //this.fronteras = pais?.borders || [];
        this.fronteras = paises;
        this.cargando = false;
      });
  }

  guardar() {
    console.log(this.miFormulario.value);
  }

}
