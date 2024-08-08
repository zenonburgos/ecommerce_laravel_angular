import { afterNextRender, Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../service/auth.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
//import { HttpClientModule } from '@angular/common/http';

declare function password_show_toggle():any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  email: string = '';
  password: string = '';
  code_user: string = '';

  constructor(
    private toastr: ToastrService,
    private authService: AuthService,
    public router: Router,
    public activedRouter: ActivatedRoute,
    ){

      afterNextRender(() => {
      setTimeout(() => {
        password_show_toggle();
      }, 50);
  
    });
  }

  ngOnInit(): void {
    // this.showSuccess();
    if(this.authService.token && this.authService.user){
      setTimeout(() => {
        this.router.navigateByUrl("/");
      }, 500);
      return;
    }
    this.activedRouter.queryParams.subscribe((resp:any) => {
      this.code_user = resp.code;
    })

    
    
    if(this.code_user){
      let data = {
        code_user: this.code_user,
      }

      this.authService.verifiedAuth(data).subscribe((resp:any) => {
        console.log(resp);
        if(resp.message == 403){
          this.toastr.error("Validación", "El código no pertenece a ningún usuario.");
        }
        if(resp.message == 200){
          this.toastr.success("Validación", "El correo ha sido verificado. Ingresar a la tienda.");
          setTimeout(() => {
            this.router.navigateByUrl("/login");
          }, 500);
        }
      })
    }
  }

  login(){
    if(!this.email || !this.password){
      this.toastr.error("Validación", "Necesitas ingresar todos los campos");
      return;
    }
    this.authService.login(this.email, this.password).subscribe((resp:any) => {
      console.log(resp);
      if(resp.error && resp.error.error == 'Unauthorized'){
        this.toastr.error("Validación", 'Las credenciales son incorrectas');
        return;
      }
      if(resp == true){
        this.toastr.success("Éxito", 'Bienvenido(a) a la tienda');
        setTimeout(() => {
          this.router.navigateByUrl("/");
        }, 500);
        return;
      }
    }, (error) => {
      console.log(error);
      
    })
  }

  showSuccess() {
    this.toastr.success('Hello world!', 'Toastr fun!');
  }
}
