public with sharing class PaymentController {
    @AuraEnabled(cacheable=true)
    public static List<customPayment__c> getPayments(Id invoiceId){
        try{
            List<customPayment__c> payments = [SELECT Id,Name,CustomAccount__r.Name,SaleOrder__c,Status__c,Amount__c FROM customPayment__c WHERE CustomInvoice__c = :invoiceId];
            return payments;
        }
        catch(Exception e){
            system.debug('Error in the Payment controller getPayments ' + e.getMessage());
            throw new AuraHandledException('Error fetching payment ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static Boolean makePayment(Id invoiceId,Decimal amount,String status){
        CustomInvoice__c invoice = [SELECT Id,SaleOrder__c,CustomAccount__c FROM CustomInvoice__c WHERE Id = :invoiceId];

        Decimal amountValue = (Decimal)amount;

        customPayment__c payment = new customPayment__c(SaleOrder__c=invoice.SaleOrder__c,
        Status__c = status,CustomAccount__c = invoice.CustomAccount__c,Amount__c = amountValue,CustomInvoice__c = invoice.Id);

        try{
            insert payment;
            return true;
        }
        catch (Exception e) {
            system.debug('Error in the Payment controller MAke payment ' + e.getMessage());
            throw new AuraHandledException('Error creating payment ' + e.getMessage());
        }
    }
}