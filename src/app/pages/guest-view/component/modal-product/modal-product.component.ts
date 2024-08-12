import { CommonModule, } from '@angular/common';
import { afterRender, Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../../../home/service/cart.service';
import { CookieService } from 'ngx-cookie-service';

declare var $:any;
declare function MODAL_PRODUCT_DETAIL([]):any;
declare function MODAL_QUANTITY([]):any;
@Component({
  selector: 'app-modal-product',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './modal-product.component.html',
  styleUrl: './modal-product.component.css'
})
export class ModalProductComponent {
  @Input() product_selected:any;
  variation_selected:any;
  sub_variation_selected:any;
  
  currency:string = 'USD';
  constructor(
    private toastr: ToastrService,
    private router: Router,
    private cartService: CartService,
    public cookieService: CookieService,
    
  ){
    // afterRender(() => {
    // })
  }

  ngOnInit(){
    this.currency = this.cookieService.get("currency") ? this.cookieService.get("currency") : 'USD';
    setTimeout(() => {
      MODAL_PRODUCT_DETAIL($);
      MODAL_QUANTITY($);
    }, 50);
  }

  getPriceCampaign(PRODUCT:any,DISCOUNT_FLASH_P:any){
    if(this.currency == 'USD'){
      if(DISCOUNT_FLASH_P.type_discount == 1){//%
        return (PRODUCT.price - PRODUCT.price * (DISCOUNT_FLASH_P.discount*0.01)).toFixed(2);
      }else{//monto fijo
        return (PRODUCT.price - DISCOUNT_FLASH_P.discount).toFixed(2);
      }
    }else{
      //Agregar campo con otra moneda si se requiere (por ej.: price_eur, lo cual sería aquí PRODUCT.price_eur)
      if(DISCOUNT_FLASH_P.type_discount == 1){//%
        return (PRODUCT.price - PRODUCT.price * (DISCOUNT_FLASH_P.discount*0.01)).toFixed(2);
      }else{//monto fijo
        return (PRODUCT.price - DISCOUNT_FLASH_P.discount).toFixed(2);
      }
    }
  }

  getTotalPriceProduct(PRODUCT:any){
    if(PRODUCT.discount_g){
      return this.getPriceCampaign(PRODUCT, PRODUCT.discount_g);
    }
    if(this.currency == 'USD'){
      return PRODUCT.price;
    }else{
      return PRODUCT.price;
    }
  }

  getTotalCurrency(PRODUCT:any){
    if(this.currency == 'USD'){
      return PRODUCT.price;
    }else{
      return PRODUCT.price;
    }
  }

  selectedVariation(variation:any){
    this.variation_selected = null;
    this.sub_variation_selected = null;
    setTimeout(() => {      
      this.variation_selected = variation;
      MODAL_PRODUCT_DETAIL($);
    }, 50);
  }

  selectedSubVariation(subvariation:any){
    this.sub_variation_selected = null;
      setTimeout(() => {      
        this.sub_variation_selected = subvariation;
    }, 50);
  }

  addCart(){
    if(!this.cartService.authService.user){
      this.toastr.error("Validación", "Primero debes ingresar a la tienda. Te ayudaremos a ello...");
      this.router.navigateByUrl("/login");
      return;
    }

    let product_variation_id = null;
    if(this.product_selected.variations.length > 0){
      if(!this.variation_selected){
        this.toastr.error("Validación", "Por favor selecciona una variación...");
        return;
      }
      if(this.variation_selected && this.variation_selected.subvariations.length > 0){
        if(!this.sub_variation_selected){
          this.toastr.error("Validación", "Por favor selecciona una sub variación...");
          return;
        }
      }
    }

    if(this.product_selected.variations.length > 0 && this.variation_selected &&
      this.variation_selected.subvariations.length == 0){
      product_variation_id = this.variation_selected.id;
    }

    if(this.product_selected.variations.length > 0 && this.variation_selected &&
      this.variation_selected.subvariations.length > 0){
      product_variation_id = this.sub_variation_selected.id;
    }

    let discount_g = null;

    if(this.product_selected.discount_g){
      discount_g = this.product_selected.discount_g;
    }
    
    let data = {
      product_id: this.product_selected.id,
      type_discount: discount_g ? discount_g.type_discount : null,
      discount: discount_g ? discount_g.discount : null,
      type_campaign: discount_g ? discount_g.type_campaign : null,
      code_cupon: null,
      code_discount: discount_g ? discount_g.code : null,
      product_variation_id: product_variation_id,
      quantity: $("#tp-cart-input-val").val(),
      price_unit: this.currency == 'USD' ? this.product_selected.price : this.product_selected.price,
      subtotal: this.getTotalPriceProduct(this.product_selected),
      total: this.getTotalPriceProduct(this.product_selected)*$("#tp-cart-input-val").val(),
      currency: this.currency,
    }

    this.cartService.registerCart(data).subscribe((resp:any) => {
      console.log(resp);
      if(resp.message == 403){
        this.toastr.error("Validación", resp.message_text);
      }else{
        this.cartService.changeCart(resp.cart);
        this.toastr.success("¡Muy bien!", "El producto se agregó al carrito de compra");
      }      
    }, err => {
      console.log(err);
      
    });
  }
}
