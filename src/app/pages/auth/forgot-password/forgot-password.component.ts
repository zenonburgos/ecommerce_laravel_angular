import { Component } from '@angular/core';
import { CodeForgotPasswordComponent } from '../code-forgot-password/code-forgot-password.component';
import { NewPasswordComponent } from '../new-password/new-password.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../service/auth.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CodeForgotPasswordComponent, NewPasswordComponent],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})

export class ForgotPasswordComponent {
  isLoadingMail:any = null;
  isLoadingCode:any = null;

  email:string = '';
  code:string = '';
  new_password:string = '';

  constructor(
    public authService: AuthService,
    public toastr: ToastrService
  ){

  }

  verifiedMail(){
    if(!this.email){
      this.toastr.error("Validación", "Necesitas ingresar el correo electrónico.");
    }
    let data = {
      email: this.email
    }
    this.authService.verifiedMail(data).subscribe((resp:any) => {
      console.log(resp);
      if(resp.message == 200){
        this.isLoadingMail = 1;
        this.toastr.success("Exitoso", "Busca el código en la bandeja de entrada de tu correo electrónico.");
      }else{
        this.isLoadingMail = null;
        this.toastr.error("Validación", "Correo electrónico no existe.");
      }
    });
  }

  LoadingCode($event:any){
    this.isLoadingCode = $event;
  }
  CodeValueC($event:any){
    console.log($event);
    
    this.code = $event;
  }
}
