import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createSaleOrder from '@salesforce/apex/ProductCartController.createSaleOrder';

export default class ProductCartContainer extends LightningElement {
    @api accountId;
    @track cartItems = [];
    @track isCartOpen = false;

    get cartItemCount() {
        return 'Cart ( '+ this.cartItems.reduce((count, item) => count + item.quantity, 0) + ' )';
    }

    openCart() { this.isCartOpen = true; }
    closeCart() { this.isCartOpen = false; }

    handleAddToCart(event) {
        const product = event.detail;
        const existing = this.cartItems.find(item => item.id === product.id);
        
        if(existing) {
            existing.quantity++;
            existing.total = existing.price * existing.quantity;
        } else {
            this.cartItems = [...this.cartItems, {
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                total: product.price,
                color: product.color,
                engine: product.engineType
            }];
        }
        this.showToast('Success', 'Product added to cart', 'success');
    }

    handleRemoveFromCart(event) {
        const productId = event.detail;
        this.cartItems = this.cartItems.filter(item => item.id !== productId);
        this.showToast('Removed', 'Product removed from cart', 'success');
    }

    handleCartUpdate(event) {
        this.cartItems = event.detail;
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }

    handleLogout(){
        this.dispatchEvent(new CustomEvent('logout', {        }));
    }

    async handleCheckout(){
        this.cartItems.forEach((item,idx) =>{
            console.log(`Item ${idx} : ${item.id} : ${item.name} : ${item.total}`);
        })
        const payload = JSON.stringify(
            this.cartItems.reduce((acc, item) => {
                acc[item.id] = item.quantity;
                return acc;
            }, {})
        );        
        console.log('payload' + payload);
        const saleOrderId = await createSaleOrder({payload : payload, accountId: this.accountId});
        console.log('createSaleOrder checkOut---' + saleOrderId);
        if(saleOrderId == null){
            this.showToast('Error', 'Open saleOrder already exists for this account cannot create new!', 'error');
            return;
        }
        window.location.assign('https://orgfarm-79e473cc35-dev-ed.develop.lightning.force.com/lightning/n/testSaleOrder?c__saleOrderId='+saleOrderId);

    }
}
