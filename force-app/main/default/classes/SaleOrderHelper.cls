public class SaleOrderHelper {
    public static void postData(Boolean isInsert,Boolean isUpdate,Boolean isDelete,List<SaleOrder__c> oldEntries,List<SaleOrder__c> newEntries){
        if(isUpdate){
            createInvoice(oldEntries,newEntries);
        }
    }
    
    static void createInvoice(List<SaleOrder__c> oldEntries,List<SaleOrder__c> newEntries){
        	List<SaleOrder__c> firstFilter = DocumentHelper.getModifiedNewObjects('Status__c',oldEntries,newEntries);
            List<SaleOrder__c> updatedItems = DocumentHelper.getObjectsByFilter(firstFilter,'Status__c','Invoiced');
            List<CustomInvoice__c> customInvoicesToInsert = new List<CustomInvoice__c>();
            List<InvoiceLine__c> invoiceLinesToInsert = new List<InvoiceLine__c>();
            List<SaleOrderLine__c> saleOrderLines = [select id,Name,OrderType__c,Product__c,Quantity__c,RentalDuration__c,Total__c,UnitPrice__c,SaleOrder__c from SaleOrderLine__c where SaleOrder__c in :DocumentHelper.extractIds(newEntries)];
            system.debug('saleOrderLines : ' + saleOrderLines);
            for(SaleOrder__c saleOrder : updatedItems){
                customInvoicesToInsert.add(new CustomInvoice__c(CustomAccount__c = saleOrder.CustomAccount__c,SaleOrder__c = saleOrder.Id));
            }
            system.debug('customInvoicesToInsert : ' + customInvoicesToInsert);
            if(customInvoicesToInsert.size() > 0){
                insert customInvoicesToInsert;
            }
            Map<Id,Id> invoiceIdToSaleOrderIdMap = new Map<Id,Id>();
            for(CustomInvoice__c Invoice : customInvoicesToInsert){
                for(SaleOrder__c saleOrder : updatedItems){
                    if(saleOrder.CustomAccount__c == Invoice.CustomAccount__c){
                        invoiceIdToSaleOrderIdMap.put(Invoice.Id,saleOrder.Id);
                        break;
                    }
                }
            }
            system.debug('invoiceIdToSaleOrderIdMap : ' + invoiceIdToSaleOrderIdMap);
            for(Id InvoiceId : invoiceIdToSaleOrderIdMap.keySet()){
                Id saleOrderId = invoiceIdToSaleOrderIdMap.get(InvoiceId);
                for(SaleOrderLine__c Line : saleOrderLines){
                    if(Line.saleOrder__c == saleOrderId){
                        invoiceLinesToInsert.add(new InvoiceLine__c(Name = Line.Name,OrderType__c = Line.OrderType__c,
                                                                        Product__c = Line.Product__c,
                                                                        Quantity__c = Line.Quantity__c,
                                                                        RentalDuration__c = Line.RentalDuration__c,
                                                                       CustomInvoice__c = InvoiceId,
                                                                       Total__c = Line.Total__c,
                                                                       UnitPrice__c = Line.UnitPrice__c));
                    }
                }
            }
            system.debug('invoiceLinesToInsert ' + invoiceLinesToInsert);
            if(invoiceLinesToInsert.size() > 0){
                insert invoiceLinesToInsert;
            }
    }
}