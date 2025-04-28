import { LightningElement, wire, api,track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getSaleOrderWithLines from '@salesforce/apex/SaleOrderController.getSaleOrderWithLines';
import updateStatusToInvoiced from '@salesforce/apex/SaleOrderController.updateStatusToInvoiced';
import getInvoiceId from '@salesforce/apex/SaleOrderController.getInvoiceId';

export default class SaleOrderDetails extends LightningElement {
    saleOrderId;
    saleOrder;
    saleOrderLines;
    error;
    isLoading = true;
    InvoiceId;
    @track formattedDate;
    isModalOpen = false;
    visualforceUrl = '';
    
    get saleOrderStatus(){
        if(this.saleOrder.Status__c == 'Invoiced'){
            return 'Billed';
        }
        return this.saleOrder.Status__c;
    }

    connectedCallback() {
        const today = new Date();
        this.formattedDate = today.toISOString().split('T')[0];
        this.updateInvoiceId();
    }

    async updateInvoiceId(){
        const invoiceId = await getInvoiceId({ saleOrderId: this.saleOrderId });
        if(this.InvoiceId==undefined || this.InvoiceId=='' || this.InvoiceId==null){
        this.InvoiceId = invoiceId;
        }
        console.log('InvoiceID:', invoiceId);
    }
    
    @wire(CurrentPageReference)
    getPageReference(pageRef) {
        if (pageRef) {
            this.saleOrderId = pageRef.state.c__saleOrderId;
        }
    }
    
    @wire(getSaleOrderWithLines, { saleOrderId: '$saleOrderId' })
    wiredSaleOrder({ error, data }) {
        this.isLoading = false;
        if (data) {
            this.saleOrder = data.order;
            this.saleOrderLines = data.orderLines;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.saleOrder = undefined;
            this.saleOrderLines = undefined;
            console.error('Error retrieving sale order details', error);
        }
    }
    
    get hasOrderLines() {
        return this.saleOrderLines && this.saleOrderLines.length > 0;
    }
    
    get formattedStatus() {
        return this.saleOrder?.Status__c 
            ? this.getStatusVariant(this.saleOrder.Status__c)
            : {};
    }
    
    getStatusVariant(status) {
        let variant = 'neutral';
        let label = status;
        
        switch(status.toLowerCase()) {
            case 'completed':
                variant = 'success';
                break;
            case 'pending':
                variant = 'warning';
                break;
            case 'cancelled':
                variant = 'error';
                break;
            default:
                variant = 'neutral';
        }
        
        return { variant, label };
    }

    getsaleOrderStatus(){
        if(this.saleOrder.Status__c == 'Invoiced'){
            return 'Billed';
        }
        return this.saleOrder.Status__c;
    }

    async handleGenerateBill() {
        try {
            const currentStatus = this.getsaleOrderStatus();
    
            if (currentStatus === 'Billed') {
                this.showToast('Cannot generate bill', 'This Order is already billed', 'info');
                return;
            }
    
            if (currentStatus === 'Cancelled' || currentStatus === 'Completed') {
                this.showToast('Cannot generate bill', 'Cannot generate bill for the cancelled or completed order!', 'error');
                return;
            }
    
            console.log('Entered bill generation, SaleOrderId:', this.saleOrderId);
    
            const updateResponse = await updateStatusToInvoiced({ saleOrderId: this.saleOrderId });
    
            if (!updateResponse) {
                this.showToast('Error creating Bill!', 'Something went wrong', 'error');
                return;
            }
    
            const invoiceId = await getInvoiceId({ saleOrderId: this.saleOrderId });
            this.InvoiceId = invoiceId;
            console.log('InvoiceID:', invoiceId);
            window.location.reload(true);
    
        } catch (error) {
            console.error('Error in handleGenerateBill:', error);
            this.showToast('Error', 'An unexpected error occurred while generating the bill.', 'error');
        }
    }
    
    handleCancelOrder(){
        try{
            const currentStatus = this.getsaleOrderStatus();
    
            if (currentStatus === 'Billed') {
                this.showToast('Cannot cancel order', 'This Order is already billed', 'info');
                return;
            }

            if (currentStatus === 'Cancelled' || currentStatus === 'Completed') {
                this.showToast('Cannot cancel order', 'Cannot generate bill for the cancelled or completed order!', 'error');
                return;
            }
        }
        catch (error) {
            console.error('Error in handleCancelOrder:', error);
            this.showToast('Error', 'An unexpected error occurred while cancelling the order.', 'error');
        }
    }

    handleDeleteOrder(){
        try{
            const currentStatus = this.getsaleOrderStatus();
    
            if (currentStatus === 'Billed') {
                this.showToast('Cannot delete order', 'This Order is already billed', 'info');
                return;
            }

            if (currentStatus === 'Cancelled' || currentStatus === 'Completed') {
                this.showToast('Cannot delete order', 'Cannot generate bill for the cancelled or completed order!', 'error');
                return;
            }
        }
        catch (error) {
            console.error('Error in handleDeleteOrder:', error);
            this.showToast('Error', 'An unexpected error occurred while deleting the order.', 'error');
        }
    }

    handleMakePayment(){
        console.log('handle Make Payment called');
    }

    handlePrintBill(){
        if(this.InvoiceId==undefined || this.InvoiceId=='' || this.InvoiceId==null){
            this.showToast('No Invoice to print', 'No Invoice to print', 'info');
            return;
        }
        console.log('Handle print bill called');
        this.visualforceUrl = `https://orgfarm-79e473cc35-dev-ed--c.develop.vf.force.com/apex/n/BillPrinter?InvoiceId=${this.InvoiceId}`;
        this.isModalOpen = true;
    }
    closeModal() {
        this.isModalOpen = false;
    }

    handlePreviousPayments(){
        console.log('handlePreviousPayments clicked');
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}
