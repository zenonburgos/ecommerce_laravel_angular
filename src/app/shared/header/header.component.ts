import { afterNextRender, Component } from '@angular/core';
import { HomeService } from '../../pages/home/service/home.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { CartService } from '../../pages/home/service/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  categories_menus:any = [];
  currency:string = 'USD';
  user:any;
  constructor(
    public homeService: HomeService,
    public cookieService: CookieService,
    public cartService: CartService,
  ){
    afterNextRender(() => {
      this.homeService.menus().subscribe((resp:any) => {
        console.log(resp);
        this.categories_menus = resp.categories_menus;
        
      })
      this.currency = this.cookieService.get("currency") ? this.cookieService.get("currency") : 'USD' ;
      this.user = this.cartService.authService.token;

      if(this.user){
        this.cartService.listCart().subscribe((resp:any) => {
          console.log(resp);
        });
      }
    })
  }

  ngOnInit(){
    this.cartService.currentDataCart$.subscribe((resp:any) => {
      console.log(resp);
    });    
  }

  getIconMenu(menu:any){
    var miDiv:any = document.getElementById('icon-'+menu.id);
    miDiv.innerHTML = menu.icon;
    return '';
  }

  changeCurrency(val:string){

    this.cookieService.set("currency",val);

    setTimeout(() => {
      window.location.reload();
      
    }, 50);


  }
}
