import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CartService } from '../../home/service/cart.service';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [FormsModule,RouterModule,CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {

  currency:string = 'PEN';
  listCarts:any = [];
  totalCarts:number = 0;
  
  code_cupon:string = '';
  
  constructor(
    public cartService: CartService,
    private cookieService: CookieService,
    private toastr: ToastrService,
  ) {
    
  }
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.currency = this.cookieService.get("currency") ? this.cookieService.get("currency") : 'PEN';
    this.cartService.currentDataCart$.subscribe((resp:any) => {
      this.listCarts = resp;
      this.totalCarts = this.listCarts.reduce((sum:number, item:any) => sum + item.total, 0);
    })
  }

  deleteCart(CART:any) {
    this.cartService.deleteCart(CART.id).subscribe((resp:any) => {
      this.toastr.info("Eliminación","Se elimino el producto "+CART.product.title + " del carrito de compra");
      this.cartService.removeCart(CART);
    })
  }

  minusQuantity(cart:any){
    if(cart.quantity == 1){
      this.toastr.error("Validacion","Ya no puedes disminuir el producto");
      return;
    }
    cart.quantity = cart.quantity - 1;
    cart.total = cart.subtotal * cart.quantity;
    this.cartService.updateCart(cart.id,cart).subscribe((resp:any) => {
      console.log(resp);
      if(resp.message == 403){
        this.toastr.error("Validacion",resp.message_text);
      }else{
        this.cartService.changeCart(resp.cart);
        this.toastr.info("Exito","Se actualizo la cantidad  del producto "+resp.cart.product.title);
      }
    })
  }

  plusQuantity(cart:any){
    let quantity_old =  cart.quantity;
    cart.quantity = cart.quantity + 1;
    cart.total = cart.subtotal * cart.quantity;
    this.cartService.updateCart(cart.id,cart).subscribe((resp:any) => {
      console.log(resp);
      if(resp.message == 403){
        cart.quantity = quantity_old;
        cart.total = cart.subtotal * cart.quantity;
        this.toastr.error("Validacion",resp.message_text);
      }else{
        this.cartService.changeCart(resp.cart);
        this.toastr.info("Exito","Se actualizo la cantidad  del producto "+resp.cart.product.title);
      }
    })
  }

  appyCupon(){
    if(!this.code_cupon){
      this.toastr.error("Validacion",'Se necesita ingresar un código de cupon');
      return;
    }
    let data = {
      code_cupon : this.code_cupon,
    };
    this.cartService.applyCupon(data).subscribe((resp:any) => {
      console.log(resp);
      if(resp.message == 403){
        this.toastr.error("Validacion",resp.message_text);
        return;
      }else{
        this.cartService.resetCart();
        this.cartService.listCart().subscribe((resp:any) => {
          resp.carts.data.forEach((cart:any) => {
            this.cartService.changeCart(cart)
          });
        })
      }
    })
  }
}
