import { LightningElement, wire, track } from 'lwc';
import getProducts from '@salesforce/apex/ProductCartController.getProducts'; 

export default class ProductListDesigned extends LightningElement {
    @wire(getProducts) products;
    @track selectedColors = {};
    @track selectedMaterials = {};
    
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
    
    @track materialIconMap = {
        leather: { icon: "custom:custom33", color: "#7F4D0E" },
        alcantara: { icon: "custom:custom33", color: "#5E5E5E" },
        fabric: { icon: "custom:custom33", color: "#2F72A8" },
        carbon: { icon: "custom:custom33", color: "#333333" },
        wood: { icon: "custom:custom33", color: "#9C5221" }
    };

    connectedCallback() {
        console.log('connectedCallback in productList');
    }

    get processedProducts() {
        if (!this.products || !this.products.data) return [];
        
        return this.products.data.map(product => {
            const colors = product.Color__c ? product.Color__c.split(';') : [];
            const selectedColor = this.selectedColors[product.Id] || (colors.length > 0 ? colors[0] : null);
            const colorCode = selectedColor ? this.colorMap[selectedColor.toLowerCase()] : "#ffffff";
            
            const materials = product.InteriorMaterial__c ? product.InteriorMaterial__c.split(';') : [];
            const selectedMaterial = this.selectedMaterials[product.Id] || (materials.length > 0 ? materials[0] : null);
            
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
            
            const materialOptions = materials.map(material => {
                const materialLower = material.toLowerCase();
                const materialInfo = this.materialIconMap[materialLower] || { icon: "custom:custom33", color: "#6B6D70" };
                
                return {
                    name: material,
                    uniqueId: `${product.Id}-material-${material}`,
                    isSelected: material === selectedMaterial,
                    iconName: materialInfo.icon,
                    iconStyle: `color: ${materialInfo.color};`
                };
            });
            
            return {
                ...product,
                colorOptions: colorOptions,
                materialOptions: materialOptions,
                selectedColor: selectedColor,
                selectedMaterial: selectedMaterial,
                cardStyle: this.getCardBackgroundStyle(colorCode),
                accentStyle: this.getAccentStyle(colorCode)
            };
        });
    }

    getCardBackgroundStyle(colorCode) {
        return `background: linear-gradient(145deg, ${colorCode}22, ${colorCode}44);`;
    }

    getAccentStyle(colorCode) {
        return `border-left: 4px solid ${colorCode};`;
    }

    handleColorChange(event) {
        const productId = event.currentTarget.dataset.productId;
        const colorName = event.currentTarget.dataset.colorName;
        
        this.selectedColors = {
            ...this.selectedColors,
            [productId]: colorName
        };
    }
    
    handleMaterialChange(event) {
        const productId = event.currentTarget.dataset.productId;
        const materialName = event.currentTarget.dataset.materialName;
        
        this.selectedMaterials = {
            ...this.selectedMaterials,
            [productId]: materialName
        };
    }

    handleAddToCart(event) {
        const productId = event.target.dataset.id;
        const product = this.products.data.find(p => p.Id === productId);
        const selectedColor = this.selectedColors[productId] || 
            (product.Color__c ? product.Color__c.split(';')[0] : null);
        const selectedMaterial = this.selectedMaterials[productId] || 
            (product.InteriorMaterial__c ? product.InteriorMaterial__c.split(';')[0] : null);
        
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