import { LightningElement, wire } from 'lwc';
import getProducts from '@salesforce/apex/ProductCartController.getProducts'; 

export default class ProductList extends LightningElement {
    @wire(getProducts) products;

    connectedCallback(){
        console.log('connectedCallback in productList');
    }

    handleAddToCart(event) {
        const productId = event.target.dataset.id;
        const product = this.products.data.find(p => p.Id === productId);
        
        this.dispatchEvent(new CustomEvent('addtocart', {
            detail: {
                id: product.Id,
                name: product.Name,
                price: product.UnitPrice__c,
                color: product.Color__c,
                engineType: product.EngineType__c
            }
        }));
    }
}
