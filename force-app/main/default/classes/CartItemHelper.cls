public class CartItemHelper {
    public static void postData(Boolean isInsert,Boolean isUpdate,Boolean isDelete,List<CartItem__c> oldEntries,List<CartItem__c> newEntries){
        if(isInsert || isUpdate){
            List<Id> PriceBookIds = DocumentHelper.extractIds(newEntries,'Price_Book__c');
            List<Id> ProductIds =  DocumentHelper.extractIds(newEntries,'Product__c');
            List<PriceBookEntry> priceBookEntries = [select id,UnitPrice,Product2Id,PriceBook2Id from PriceBookEntry where Product2Id in :productIds and PriceBook2Id in :PriceBookIds];
            
            for(CartItem__c Item : newEntries){
                for(PriceBookEntry entry : priceBookEntries){
                    if(entry.PriceBook2Id == Item.Price_Book__c && entry.Product2Id == Item.Product__c){
                        system.debug('Item.Name ' + Item.Product__r.Name +'Price ' +  entry.unitPrice);
                        Item.UnitPrice__c = entry.unitPrice;
                    }
                }
                Item.TotalCopy__c = Item.UnitPrice__c * Item.Quantity__c;
            }
        }
    }
    
    public static void afterPostData(Boolean isInsert,Boolean isUpdate,Boolean isDelete,List<CartItem__c> oldEntries,List<CartItem__c> newEntries){
        /*List<CartItem__c> itemToUpdate = new List<CartItem__c>();
        for(CartItem__c Item : newEntries){
            Item.TotalCopy__c = Item.Total__c;
            itemToUpdate.add(Item);
        }
        update itemToUpdate;
        system.debug('Updates CartItemHelper after PostData');*/
    }

}