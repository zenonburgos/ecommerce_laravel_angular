import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-code-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './code-forgot-password.component.html',
  styleUrl: './code-forgot-password.component.css'
})
export class CodeForgotPasswordComponent {
  code:string = '';
  isLoadingCode:any = null;

  @Output() LoadingCodeStatus: EventEmitter<any> = new EventEmitter();
  @Output() CodeValue: EventEmitter<any> = new EventEmitter();

  constructor(
    public authService: AuthService,
    public toastr: ToastrService
  ){

  }

  verifiedCode(){
    if(!this.code){
      this.toastr.error("Validación", "Necesitas ingresar el código de verificación.");
    }
    let data = {
      code: this.code
    }
    this.authService.verifiedCode(data).subscribe((resp:any) => {
      console.log(resp);
      if(resp.message == 200){
        this.isLoadingCode = 1;
        this.LoadingCodeStatus.emit(this.isLoadingCode);
        this.CodeValue.emit(this.code);
        this.toastr.success("Exitoso", "el código es correcto, ahora cambia tu contraseña.");
      }else{
        this.isLoadingCode = null;
        this.LoadingCodeStatus.emit(this.isLoadingCode);
        this.toastr.error("Validación", "El código no existe.");
      }
    });
  }
}
