import { LightningElement, wire, track } from 'lwc';
import getProducts from '@salesforce/apex/ProductCartController.getProducts'; 
import Bugatti from '@salesforce/resourceUrl/Bugatti';

export default class ProductListDesigned extends LightningElement {
    isCarDetailOpen = false;

    selectedProduct;
    modifiedProducts = [];

    @track currentIndex = 0;    

    @wire(getProducts) products;
    @track selectedColors = {};
    URL1 = Bugatti + '/1.webp';
    URL2 = Bugatti + '/2.webp';
    URL3 = Bugatti + '/3.webp';
    URL0 = Bugatti + '/0.webp';

    images = [
        this.URL1,
        this.URL2,
        this.URL0,
        this.URL3
    ];
    get currentImage() {
        return this.images[this.currentIndex];
    }

    handleNext() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
    }

    handlePrev() {
        this.currentIndex =
            (this.currentIndex - 1 + this.images.length) % this.images.length;
    }
    
    @track colorMap = {
        red: "#e53935",
        blue: "#1e88e5",
        black: "#222222",
        white: "#f5f5f5",
        green: "#43a047", 
        orange: "#ff9800",
        yellow: "#ffd600",
        silver: "#bdbdbd"
    };

    connectedCallback() {
        console.log('connectedCallback in productList');
    }

    // It will run after every update noice
    renderedCallback(){
        console.log('renderedCallback in productList');
        this.modifiedProducts = this.processedProducts1();
    }

    get processedProducts() {        
        return this.processedProducts1();
    }

    processedProducts1() {
        if (!this.products || !this.products.data) return [];
        
        return this.products.data.map(product => {
            const colors = product.Color__c ? product.Color__c.split(';') : [];
            const selectedColor = this.selectedColors[product.Id] || (colors.length > 0 ? colors[0] : null);
            const colorCode = selectedColor ? this.colorMap[selectedColor.toLowerCase()] : "#ffffff";
            
            const colorOptions = colors.map(color => {
                const colorLower = color.toLowerCase();
                const colorHex = this.colorMap[colorLower] || "#cccccc";
                
                return {
                    name: color,
                    uniqueId: `${product.Id}-color-${color}`,
                    isSelected: color === selectedColor,
                    colorStyle: `background-color: ${colorHex};`
                };
            });
            
            return {
                ...product,
                colorOptions: colorOptions,
                selectedColor: selectedColor,
                cardStyle: this.getCardBackgroundStyle(colorCode),
                accentStyle: this.getAccentStyle(colorCode)
            };
        });
    }

    getCardBackgroundStyle(colorCode) {
        // return `background: linear-gradient(145deg, ${colorCode}22, ${colorCode}44);`;
        if(colorCode == '#1e88e5') return `background: url(${this.URL2}) center center / cover no-repeat;`;
        if(colorCode == '#e53935') return `background: url(${this.URL0}) center center / cover no-repeat;`;
        if(colorCode == '#222222') return `background: url(${this.URL3}) center center / cover no-repeat;`;
        
        return `background: url(${this.URL1}) center center / cover no-repeat;`;
    }

    getAccentStyle(colorCode) {
        return `border-left: 4px solid ${colorCode};`;
    }

    handleColorChange(event) {
        const productId = event.currentTarget.dataset.productId;
        const colorName = event.currentTarget.dataset.colorName;

        console.log('productId : ' + productId + '  :  ' + 'colorName : ' + colorName);
        
        this.selectedColors = {
            ...this.selectedColors,
            [productId]: colorName
        };
    }

    handleViewDeatils(event){
        console.log('event.target.data.id ' + event.currentTarget.dataset.id);
        console.log('Products : ' + this.modifiedProducts);
        this.selectedProduct = this.modifiedProducts.find(product => product.Id === event.currentTarget.dataset.id);
        console.log(this.selectedProduct.Id + 'I am the selected Product');
        this.isCarDetailOpen = true;
    }

    closeCarDetail(){
        this.isCarDetailOpen = false;
    }
    

    handleAddToCart(event) {
        const productId = event.target.dataset.id;
        const product = this.products.data.find(p => p.Id === productId);
        const selectedColor = this.selectedColors[productId] || 
            (product.Color__c ? product.Color__c.split(';')[0] : null);

        console.log('productId : ' + productId + '  :  ' + 'selectedColor : ' + selectedColor);
        
        this.dispatchEvent(new CustomEvent('addtocart', {
            detail: {
                id: product.Id,
                name: product.Name,
                price: product.UnitPrice__c,
                color: selectedColor || product.Color__c,
                material: selectedMaterial || product.InteriorMaterial__c,
                engineType: product.EngineType__c
            }
        }));
    }
}