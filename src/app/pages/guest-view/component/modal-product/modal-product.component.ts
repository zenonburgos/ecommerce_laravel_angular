import { CommonModule, } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

declare var $:any;
declare function MODAL_PRODUCT_DETAIL([]):any;
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

  ngOnInit(){
    setTimeout(() => {
      MODAL_PRODUCT_DETAIL($);
    }, 50);
  }

  getPriceCampaign(PRODUCT:any,DISCOUNT_FLASH_P:any){
    if(DISCOUNT_FLASH_P.type_discount == 1){//%
      return (PRODUCT.price - PRODUCT.price * (DISCOUNT_FLASH_P.discount*0.01)).toFixed(2);
    }else{//monto fijo
      return (PRODUCT.price - DISCOUNT_FLASH_P.discount).toFixed(2);
    }
  }

  getTotalPriceProduct(PRODUCT:any){
    if(PRODUCT.discount_g){
      return this.getPriceCampaign(PRODUCT, PRODUCT.discount_g);
    }
    return PRODUCT.price;
  }

  selectedVariation(variation:any){
    this.variation_selected = null;
    setTimeout(() => {      
      this.variation_selected = variation;
      MODAL_PRODUCT_DETAIL($);
    }, 50);
  }
}
