public with sharing class ProductCartController {
    @AuraEnabled(cacheable=true)
    public static List<Product2> getProducts() {
        return [SELECT Id, Name, IsActive, Color__c, EngineType__c, HorsePower__c, 
                InteriorMaterial__c, IsRentable__c, RentalPrice__c, RentDuration__c, 
                TopSpeed__c, UnitPrice__c 
                FROM Product2 
                WHERE IsActive = true]; 
    }

    @AuraEnabled(cacheable=true)
    public static CustomAccount__c getAccountDetails(String accountId) {
        customAccount__c acc= [SELECT Id, Name, Email__c, PhoneNumber__c, 
        Address__c, Type__c
        FROM CustomAccount__c 
        WHERE Id = :accountId 
        LIMIT 1];
        return acc;
    }

    @AuraEnabled
    public static Product2 getProductById(String productId) {
        return [SELECT Id, Name, UnitPrice__c, Color__c, 
                EngineType__c FROM Product2 WHERE Id = :productId];
    }

    @AuraEnabled
    public static Id createSaleOrder(String payload,Id accountId){
        List<saleOrder__c> existingSaleOrderForThisAccount = [SELECT Id FROM saleOrder__c WHERE CustomAccount__c = :accountId AND Status__c = 'Draft'];

        if(existingSaleOrderForThisAccount.size() > 0){
            system.debug('Existing opened Sale order exists');
            return null;
        }
        try{
            system.debug('inside createSaleOrder : ' + payload);
            system.debug('inside createSaleOrder with account : ' + accountId);
            Map<String, Object> payloadMap = (Map<String, Object>) JSON.deserializeUntyped(payload);
            List<Product2> products = [select id,Name,Color__c,EngineType__c,HorsePower__c,	InteriorMaterial__c,TopSpeed__c,UnitPrice__c from Product2 where Id in :payloadMap.keySet()];
            Map<Id,Product2> idToProductMap = new Map<Id,Product2>(products);
            saleOrder__c saleOrder = new saleOrder__c(CustomAccount__c = accountId);
            insert saleOrder;

            List<SaleOrderLine__c> saleOrderLinesToInsert = new List<SaleOrderLine__c>();
            for(string productId : payloadMap.keySet()){
                Integer Qty = Integer.valueOf(payloadMap.get(productId));
                Decimal unitPrice = idToProductMap.get(productId).UnitPrice__c;
                String productName = idToProductMap.get(productId).Name;
                Decimal total = Qty * unitPrice;
                saleOrderLinesToInsert.add(new SaleOrderLine__c(OrderType__c = 'Buy',Product__c = productId,Quantity__c = Qty,SaleOrder__c = saleOrder.Id,UnitPrice__c = unitPrice,Total__c = total));
            }

            insert saleOrderLinesToInsert;
            return saleOrder.Id;

        }
        catch(exception e){
            system.debug('inside error of createSaleOrder : ' + e.getMessage());
        }
        return null;
    }
}
