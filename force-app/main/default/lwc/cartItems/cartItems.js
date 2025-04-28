import { LightningElement, api } from 'lwc';

export default class CartItems extends LightningElement {
    @api cartItems;

    get itemCount() {
        return this.cartItems.reduce((count, item) => count + item.quantity, 0);
    }
    
    get cartTotal() {
        return this.cartItems.reduce((sum, item) => sum + item.total, 0);
    }

    removeItem(event) {
        const productId = event.target.dataset.id;
        this.dispatchEvent(new CustomEvent('removefromcart', {
            detail: productId
        }));
    }

    increaseQty(event) {
        this.updateQty(event.target.dataset.id, 1);
    }

    decreaseQty(event) {
        this.updateQty(event.target.dataset.id, -1);
    }

    updateQty(productId, change) {
        const items = this.cartItems.map(item => {
            if(item.id === productId) {
                const newQty = item.quantity + change;
                if(newQty > 0) {
                    return {...item, 
                            quantity: newQty, 
                            total: item.price * newQty};
                }
                return null;
            }
            return item;
        }).filter(Boolean);

        this.dispatchEvent(new CustomEvent('cartupdate', {
            detail: items
        }));
    }
    handleCheckout(event) {
        this.dispatchEvent(new CustomEvent('checkout', {
            detail: this.cartItems}));
    }
}
