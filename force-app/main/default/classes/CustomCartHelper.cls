public class CustomCartHelper {
    public static void postData(Boolean isInsert,Boolean isUpdate,Boolean isDelete,List<CustomCarts__c> oldEntries,List<CustomCarts__c> newEntries){
        if(isUpdate){
            createSaleOrder(oldEntries,newEntries);
        }
        
        if(isInsert){
            List<CustomAccount__c> accounts = [select id from CustomAccount__c where id in :DocumentHelper.extractIds(newEntries,'CustomAccount__c')];
            List<CustomCarts__c> carts = [select id,CustomAccount__c from CustomCarts__c where status__c = 'Open' and customAccount__c in :DocumentHelper.extractIds(accounts)];
            List<Id> existingOpenCartsAccountId = new List<Id>();
            for(CustomCarts__c cart : carts){
                existingOpenCartsAccountId.add(cart.CustomAccount__c);
            }
            
            for(CustomCarts__c cart : newEntries){
                if(existingOpenCartsAccountId.contains(cart.CustomAccount__c)){
                    cart.addError('Open Cart already exists for this order');
                }
            }
        }
    }
    
    static void createSaleOrder(List<CustomCarts__c> oldEntries,List<CustomCarts__c> newEntries){
        List<CustomCarts__c> firstFilter = DocumentHelper.getModifiedNewObjects('Status__c',oldEntries,newEntries);
            List<CustomCarts__c> updatedItems = DocumentHelper.getObjectsByFilter(firstFilter,'Status__c','Checked-Out');
            List<SaleOrder__c> saleOrderToInsert = new List<SaleOrder__c>();
            List<SaleOrderLine__c> SaleOrderLinesToInsert = new List<SaleOrderLine__c>();
            List<CartItem__c> cartItems = [select id,Name,OrderType__c,Product__c,Quantity__c,RentalDuration__c,Total__c,UnitPrice__c,CustomCart__c from CartItem__c where CustomCart__c in :DocumentHelper.extractIds(newEntries)];
            system.debug('cartItems : ' + cartItems);
            for(CustomCarts__c cart : updatedItems){
                saleOrderToInsert.add(new SaleOrder__c(CustomAccount__c = cart.CustomAccount__c,CustomCart__c = cart.Id));
            }
            system.debug('saleOrderToInsert : ' + saleOrderToInsert);
            if(saleOrderToInsert.size() > 0){
                insert saleOrderToInsert;
            }
            Map<Id,Id> saleOrderIdToCartItemIdMap = new Map<Id,Id>();
            for(SaleOrder__c saleOrder : saleOrderToInsert){
                for(CustomCarts__c cart : updatedItems){
                    if(cart.CustomAccount__c == saleOrder.CustomAccount__c){
                        saleOrderIdToCartItemIdMap.put(saleOrder.Id,cart.Id);
                        break;
                    }
                }
            }
            system.debug('saleOrderIdToCartItemIdMap : ' + saleOrderIdToCartItemIdMap);
            for(Id saleOrderId : saleOrderIdToCartItemIdMap.keySet()){
                Id cartId = saleOrderIdToCartItemIdMap.get(saleOrderid);
                for(CartItem__c Item : cartItems){
                    if(Item.CustomCart__c == cartId){
                        SaleOrderLinesToInsert.add(new SaleOrderLine__c(OrderType__c = Item.OrderType__c,
                                                                        Product__c = Item.Product__c,
                                                                        Quantity__c = Item.Quantity__c,
                                                                        RentalDuration__c = Item.RentalDuration__c,
                                                                       SaleOrder__c = saleOrderId,
                                                                       Total__c = Item.Total__c,
                                                                       UnitPrice__c = Item.UnitPrice__c));
                    }
                }
            }
            system.debug('SaleOrderLinesToInsert ' + SaleOrderLinesToInsert);
            if(SaleOrderLinesToInsert.size() > 0){
                insert SaleOrderLinesToInsert;
            }
    }
}