public class BillPrintController {
    public CustomInvoice__c invoice { get; set; }
    public List<InvoiceLine__c> invoiceLines { get; set; }

    public BillPrintController() {
        String invoiceId = ApexPages.currentPage().getParameters().get('InvoiceId');

        if (String.isNotBlank(invoiceId)) {
            try {
                invoice = [
                    SELECT Id, Name, Email__c, Phone__c, Address__c, Status__c,
                           TotalPayableAmount__c, AmountPaid__c, PendingAmount__c,
                           SaleOrder__r.Name, CustomAccount__r.Name
                    FROM CustomInvoice__c
                    WHERE Id = :invoiceId
                    LIMIT 1
                ];

                invoiceLines = [
                    SELECT Id, Product__r.Name, OrderType__c, Quantity__c,
                           UnitPrice__c, Total__c
                    FROM InvoiceLine__c
                    WHERE CustomInvoice__c = :invoiceId
                ];
            } catch (Exception e) {
                ApexPages.addMessage(new ApexPages.Message(ApexPages.Severity.ERROR, 'Error loading invoice: ' + e.getMessage()));
            }
        }
    }
}
