public with sharing class SaleOrderController {
    
    public class SaleOrderWrapper {
        @AuraEnabled public SaleOrder__c order;
        @AuraEnabled public List<SaleOrderLine__c> orderLines;
        
        public SaleOrderWrapper(SaleOrder__c order, List<SaleOrderLine__c> orderLines) {
            this.order = order;
            this.orderLines = orderLines;
        }
    }
    
    @AuraEnabled(cacheable=true)
    public static SaleOrderWrapper getSaleOrderWithLines(String saleOrderId) {
        try {
            SaleOrder__c saleOrder = [
                SELECT Id, Name, Address__c, AmountPaid__c, CustomAccount__r.Name, 
                       Email__c, PendingAmount__c, PendingInitiatedPayment__c, 
                       Phone__c, Status__c, TotalPayableAmount__c
                FROM SaleOrder__c
                WHERE Id = :saleOrderId
                LIMIT 1
            ];
            
            List<SaleOrderLine__c> saleOrderLines = [
                SELECT Id, Name, OrderType__c, Product__r.Name, Quantity__c, 
                       SaleOrder__c, Total__c, UnitPrice__c
                FROM SaleOrderLine__c
                WHERE SaleOrder__c = :saleOrderId
                ORDER BY Name
            ];
            return new SaleOrderWrapper(saleOrder, saleOrderLines);
        } catch (Exception e) {
            throw new AuraHandledException('Error retrieving sale order details: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static Boolean updateStatusToInvoiced(Id saleOrderId) {
        try {
            System.debug('Updating SaleOrder__c to Invoiced. SaleOrderId: ' + saleOrderId);
            
            SaleOrder__c saleOrder = [
                SELECT Id, Status__c
                FROM SaleOrder__c
                WHERE Id = :saleOrderId
                LIMIT 1
            ];

            if (saleOrder.Status__c == 'Draft') {
                saleOrder.Status__c = 'Invoiced';
                update saleOrder;
                return true;
            }

            return false;
        } catch (Exception e) {
            System.debug('Error while updating SaleOrder__c to Invoiced: ' + e.getMessage());
            return false;
        }
    }


    @AuraEnabled
    public static Id getInvoiceId(Id saleOrderId){
        try{
            List<CustomInvoice__c> Invoices = [SELECT Address__c,AmountPaid__c,	CustomAccount__c,Name,	Email__c,PendingAmount__c,Phone__c,SaleOrder__c,Status__c,	TotalPayableAmount__c from CustomInvoice__c WHERE SaleOrder__c =: saleOrderId LIMIT 1];
            if(Invoices.size() > 0){
                return Invoices[0].Id;
            }
            return null;
        }
        catch(Exception e){
            system.debug('Error in the saleOrderController in getInvoiceId + ' + e.getMessage());
            return null;
        }
    }

    @AuraEnabled
    public static Boolean cancelSaleOrder(Id saleOrderId) {
        try {
            SaleOrder__c saleorder = [SELECT id,status__c FROM SaleOrder__c WHERE Id = :saleOrderId LIMIT 1];

            if(saleorder.status__c == 'Draft'){
                saleOrder.Status__c = 'Cancelled';
                update saleOrder;
                return true;
            }

            return false;
        }
        catch (Exception e) {
            System.debug('Error while updating SaleOrder to cancelled: ' + e.getMessage());
            return false;
        }
    }

    @AuraEnabled
    public static Boolean deleteSaleOrder(Id saleOrderId) {
        try {
            SaleOrder__c saleorder = [SELECT id,status__c FROM SaleOrder__c WHERE Id = :saleOrderId LIMIT 1];

            if(saleorder.status__c == 'Draft'){
                delete saleOrder;
                return true;
            }

            return false;
        }
        catch (Exception e) {
            System.debug('Error while deleting SaleOrder : ' + e.getMessage());
            return false;
        }
    }
}
