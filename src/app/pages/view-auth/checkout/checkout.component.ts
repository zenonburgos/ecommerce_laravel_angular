import { afterNextRender, Component, ElementRef, ViewChild } from '@angular/core';
import { CartService } from '../../home/service/cart.service';
import { CookieService } from 'ngx-cookie-service';
import { UserAddressService } from '../service/user-address.service';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

declare var paypal:any;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule,RouterModule,CommonModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {

  listCarts:any = [];
  totalCarts:number = 0;

  currency: string = 'USD';

  address_list:any = [];

  name:string = '';
  surname:string = '';
  company:string = '';
  country_region:string = '';
  city:string = '';
  address:string = '';
  street:string = '';
  postcode_zip:string = '';
  phone:string = '';
  email:string = '';

  address_selected:any;
  description:string = '';
  @ViewChild('paypal',{static: true}) paypalElement?: ElementRef;

  constructor(
    public cartService: CartService,
    public cookieService: CookieService,
    public addressService: UserAddressService,
    private toastr: ToastrService,
    public router: Router,
  ){

    afterNextRender(() => {
      this.addressService.listAddress().subscribe((resp:any) => {
        console.log(resp);
        this.address_list = resp.addresses;        
      });
    })
  }

  ngOnInit(){
    this.currency = this.cookieService.get("currency") ? this.cookieService.get("currency") : 'USD';
    this.cartService.currentDataCart$.subscribe((resp:any) =>{
      this.listCarts = resp;
      this.totalCarts = this.listCarts.reduce((sum:number, item:any) => sum + item.total, 0);
    })

    paypal.Buttons({
      // optional styling for buttons
      // https://developer.paypal.com/docs/checkout/standard/customize/buttons-style-guide/
      style: {
        color: "gold",
        shape: "rect",
        layout: "vertical"
      },

      // set up the transaction
      createOrder: (data:any, actions:any) => {
          // pass in any options from the v2 orders create call:
          // https://developer.paypal.com/api/orders/v2/#orders-create-request-body
          if(this.totalCarts == 0){
            this.toastr.error("Validación", "No puedes procesar el pago con un monto de 0.")
            return;
          }
          if(this.listCarts.length == 0){
            this.toastr.error("Validación", "No puedes procesar el pago sin ningún producto en el carrito.")
            return;
          }
          if(!this.name || 
            !this.surname || 
            !this.company || 
            !this.country_region || 
            !this.city || 
            !this.address || 
            !this.street || 
            !this.postcode_zip || 
            !this.phone || 
            !this.email ){
            this.toastr.error("Validación", "Todos los campos de la dirección son necesarios.");
            return;
          }
          const createOrderPayload = {
            purchase_units: [
              {
                amount: {
                    description: "COMPRAR POR EL ECOMMERCE",
                    value: this.totalCarts
                }
              }
            ]
          };

          return actions.order.create(createOrderPayload);
      },

      // finalize the transaction
      onApprove: async (data:any, actions:any) => {
          
          let Order = await actions.order.capture();
          // Order.purchase_units[0].payments.captures[0].id

          let dataSale = {
            payment_method: 'PAYPAL',
            currency_total: this.currency,
            currency_payment: 'USD',
            discount: 0,
            subtotal: this.totalCarts,
            total: this.totalCarts,
            dolar_price: 0,
            n_transaction: Order.purchase_units[0].payments.captures[0].id,
            description: this.description,
            sale_address: {
              name: this.name,
              surname: this.surname,
              company: this.company,
              country_region: this.country_region,
              city: this.city,
              address: this.address,
              street: this.street,
              postcode_zip: this.postcode_zip,
              phone: this.phone,
              email: this.email,
            }
          }
          this.cartService.checkout(dataSale).subscribe((resp:any) => {
            console.log(resp);
            this.toastr.success("Exitoso", "La compra se ha realizado.");
            this.router.navigateByUrl("/gracias-por-tu-compra/"+Order.purchase_units[0].payments.captures[0].id);
            // La redirección a la página de gracias
          });
          //return actions.order.capture().then(captureOrderHandler);
      },

      // handle unrecoverable errors
      onError: (err:any) => {
          console.error('An error prevented the buyer from checking out with PayPal');
      }
    }).render(this.paypalElement?.nativeElement);
  }

  registerAddress(){

    if(!this.name || 
      !this.surname || 
      !this.company || 
      !this.country_region || 
      !this.city || 
      !this.address || 
      !this.street || 
      !this.postcode_zip || 
      !this.phone || 
      !this.email ){
      this.toastr.error("Validación", "Todos los campos son necesarios.");
      return;
    }

    let data = {
      name: this.name,
      surname: this.surname,
      company: this.company,
      country_region: this.country_region,
      city: this.city,
      address: this.address,
      street: this.street,
      postcode_zip: this.postcode_zip,
      phone: this.phone,
      email: this.email,
    }
    this.addressService.registerAddress(data).subscribe((resp:any) => {
      console.log(resp);
      this.toastr.success("Exitoso", "La dirección se acaba de registrar.");
      this.address_list.unshift(resp.address);
    })
  }

  editAddress(){
    if(!this.name || 
      !this.surname || 
      !this.company || 
      !this.country_region || 
      !this.city || 
      !this.address || 
      !this.street || 
      !this.postcode_zip || 
      !this.phone || 
      !this.email ){
      this.toastr.error("Validación", "Todos los campos son necesarios.");
      return;
    }

    let data = {
      name: this.name,
      surname: this.surname,
      company: this.company,
      country_region: this.country_region,
      city: this.city,
      address: this.address,
      street: this.street,
      postcode_zip: this.postcode_zip,
      phone: this.phone,
      email: this.email,
    }
    this.addressService.updateAddress(this.address_selected.id,data).subscribe((resp:any) => {
      console.log(resp);
      this.toastr.success("Exitoso", "La dirección se acaba de editar.");
      let INDEX = this.address_list.findIndex((item:any) => item.id == resp.address.id);
      if(INDEX != -1){
        this.address_list[INDEX] = resp.address;
      }
    })
  }

  selectedAddress(address:any){
    this.address_selected = address;
    this.name = this.address_selected.name;
    this.surname = this.address_selected.surname;
    this.company = this.address_selected.company;
    this.country_region = this.address_selected.country_region;
    this.city = this.address_selected.city;
    this.address = this.address_selected.address;
    this.street = this.address_selected.street;
    this.postcode_zip = this.address_selected.postcode_zip;
    this.phone = this.address_selected.phone;
    this.email = this.address_selected.email;
  }

  resetAddress(){
    this.address_selected = null;
    this.name = '';
    this.surname = '';
    this.company = '';
    this.country_region = '';
    this.city = '';
    this.address = '';
    this.street = '';
    this.postcode_zip = '';
    this.phone = '';
    this.email = '';
  }
}
