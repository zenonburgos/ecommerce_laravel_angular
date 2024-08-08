import { afterNextRender, afterRender, Component } from '@angular/core';
import { HomeService } from '../../home/service/home.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalProductComponent } from '../component/modal-product/modal-product.component';
import { CookieService } from 'ngx-cookie-service';

declare function MODAL_PRODUCT_DETAIL([]):any;
declare var $:any;
declare function LANDING_PRODUCT([]):any;
@Component({
  selector: 'app-landing-product',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalProductComponent],
  templateUrl: './landing-product.component.html',
  styleUrl: './landing-product.component.css'
})
export class LandingProductComponent {

  PRODUCT_SLUG:any;
  PRODUCT_SELECTED:any;
  variation_selected:any;
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
    private cookieService: CookieService
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
    setTimeout(() => {
      this.variation_selected = variation;
      MODAL_PRODUCT_DETAIL($);
    }, 50);
  }

  openDetailModal(PRODUCT:any){
    this.product_selected_modal = null;
    setTimeout(() => {
      this.product_selected_modal = PRODUCT;      
    }, 50);
  }
}
