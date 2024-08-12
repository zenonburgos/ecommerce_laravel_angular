import { afterNextRender, afterRender, Component } from '@angular/core';
import { HomeService } from '../../home/service/home.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalProductComponent } from '../component/modal-product/modal-product.component';
import { CookieService } from 'ngx-cookie-service';
import { CartService } from '../../home/service/cart.service';

declare function MODAL_PRODUCT_DETAIL([]):any;
declare function LANDING_PRODUCT([]):any;
declare function MODAL_QUANTITY_LANDING([]):any;
declare var $:any;
@Component({
  selector: 'app-landing-product',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalProductComponent, RouterModule],
  templateUrl: './landing-product.component.html',
  styleUrl: './landing-product.component.css'
})
export class LandingProductComponent {

  PRODUCT_SLUG:any;
  PRODUCT_SELECTED:any;
  variation_selected:any;
  sub_variation_selected:any;
  PRODUCT_RELATEDS:any = [];
  product_selected_modal:any;
  DISCOUNT_CODE:any;
  DISCOUNT_CAMPAIGN:any;

  currency:string  = 'USD';
  constructor(
    public homeService: HomeService,
    public activedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private router: Router,
    private cookieService: CookieService,
    private cartService: CartService,
  ){
    this.activedRoute.params.subscribe((resp:any) => {
      this.PRODUCT_SLUG = resp.slug;
    })
    this.activedRoute.queryParams.subscribe((resp:any) => {
      this.DISCOUNT_CODE = resp.campaign_discount;
    })
    // afterNextRender(() => {
      this.homeService.showProduct(this.PRODUCT_SLUG,this.DISCOUNT_CODE).subscribe((resp:any) => {
        //console.log(resp);
        if(resp.message == 403){
          this.toastr.error("Validación", resp.message_text);
          this.router.navigateByUrl("/");
        }else{
          this.PRODUCT_SELECTED = resp.product;
          this.PRODUCT_RELATEDS = resp.product_relateds.data;
          this.DISCOUNT_CAMPAIGN = resp.discount_campaign;
          if(this.DISCOUNT_CAMPAIGN){
            this.PRODUCT_SELECTED.discount_g = this.DISCOUNT_CAMPAIGN; 
          }
        }
        
      })
    // })
    afterRender(() => {
      setTimeout(() => {
        MODAL_PRODUCT_DETAIL($);
        LANDING_PRODUCT($);
      }, 50);
      this.currency = this.cookieService.get("currency") ? this.cookieService.get("currency") : 'USD';
    })
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    setTimeout(() => {
      MODAL_QUANTITY_LANDING($);
    }, 50);
  }


  ngAfterViewInit(): void {
    // setTimeout(() => {
    //   MODAL_PRODUCT_DETAIL($);
    // }, 50);
  }

  getPriceCampaign(PRODUCT:any,DISCOUNT_FLASH_P:any){
    if(this.currency == 'USD'){
      if(DISCOUNT_FLASH_P.type_discount == 1){//%
        return (PRODUCT.price - PRODUCT.price * (DISCOUNT_FLASH_P.discount*0.01)).toFixed(2);
      }else{//monto fijo
        return (PRODUCT.price - DISCOUNT_FLASH_P.discount).toFixed(2);
      }
    }else{
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

  openDetailModal(PRODUCT:any){
    this.product_selected_modal = null;
    setTimeout(() => {
      this.product_selected_modal = PRODUCT;      
    }, 50);
  }

  addCart(){
    if(!this.cartService.authService.user){
      this.toastr.error("Validación", "Primero debes ingresar a la tienda. Te ayudaremos a ello...");
      this.router.navigateByUrl("/login");
      return;
    }

    let product_variation_id = null;
    if(this.PRODUCT_SELECTED.variations.length > 0){
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

    if(this.PRODUCT_SELECTED.variations.length > 0 && this.variation_selected &&
      this.variation_selected.subvariations.length == 0){
      product_variation_id = this.variation_selected.id;
    }

    if(this.PRODUCT_SELECTED.variations.length > 0 && this.variation_selected &&
      this.variation_selected.subvariations.length > 0){
      product_variation_id = this.sub_variation_selected.id;
    }

    let discount_g = null;

    if(this.PRODUCT_SELECTED.discount_g){
      discount_g = this.PRODUCT_SELECTED.discount_g;
    }
    
    let data = {
      product_id: this.PRODUCT_SELECTED.id,
      type_discount: discount_g ? discount_g.type_discount : null,
      discount: discount_g ? discount_g.discount : null,
      type_campaign: discount_g ? discount_g.type_campaign : null,
      code_cupon: null,
      code_discount: discount_g ? discount_g.code : null,
      product_variation_id: product_variation_id,
      quantity: $("#tp-cart-input-val").val(),
      price_unit: this.currency == 'USD' ? this.PRODUCT_SELECTED.price : this.PRODUCT_SELECTED.price,
      subtotal: this.getTotalPriceProduct(this.PRODUCT_SELECTED),
      total: this.getTotalPriceProduct(this.PRODUCT_SELECTED)*$("#tp-cart-input-val").val(),
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
