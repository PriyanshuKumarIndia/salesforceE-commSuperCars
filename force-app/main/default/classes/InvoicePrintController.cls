public class InvoicePrintController {
    public List<InvoiceLine__c> invoiceLines { get; set; }

    public InvoicePrintController(ApexPages.StandardController std) {
        Id invoiceId = std.getId();
        invoiceLines = [
            SELECT Name, OrderType__c, Product__r.Name, Quantity__c, RentalDuration__c,
                   Total__c, UnitPrice__c
            FROM InvoiceLine__c
            WHERE CustomInvoice__c = :invoiceId
        ];
    }
}