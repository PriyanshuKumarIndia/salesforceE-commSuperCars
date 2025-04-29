import { LightningElement, wire, api, track } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

import getSaleOrderWithLines from '@salesforce/apex/SaleOrderController.getSaleOrderWithLines';
import updateStatusToInvoiced from '@salesforce/apex/SaleOrderController.updateStatusToInvoiced';
import getInvoiceId from '@salesforce/apex/SaleOrderController.getInvoiceId';
import cancelSaleOrder from '@salesforce/apex/SaleOrderController.cancelSaleOrder';
import deleteSaleOrder from '@salesforce/apex/SaleOrderController.deleteSaleOrder';
import makePayment from '@salesforce/apex/PaymentController.makePayment';
import getPayments from '@salesforce/apex/PaymentController.getPayments';

export default class SaleOrderDetails extends LightningElement {
    saleOrderId;
    saleOrder;
    saleOrderLines;
    paymentLines;
    error;
    isLoading = true;
    InvoiceId;
    @track formattedDate;
    isModalOpen = false;
    isMakePaymentModalOpen = false;
    isPreviousPaymentsModalOpen = false;
    visualforceUrl = '';
    paymentAmount;
    PaymentStatus = 'success';

    wiredSaleOrderResult;

    get optionsForPaymentStatus() {
        return [
            { label: 'Success', value: 'success' },
            { label: 'Pending', value: 'Pending' },
            { label: 'Failed', value: 'Failed' },
        ];
    }

    get saleOrderStatus() {
        if (this.saleOrder?.Status__c === 'Invoiced') {
            return 'Billed';
        }
        return this.saleOrder?.Status__c || '';
    }

    async connectedCallback() {
        const today = new Date();
        this.formattedDate = today.toISOString().split('T')[0];
        await this.updateInvoiceId();
        if (this.InvoiceId) {
            await this.getPreviousPayments();
        }
    }

    async updateInvoiceId() {
        try {
            const invoiceId = await getInvoiceId({ saleOrderId: this.saleOrderId });
            this.InvoiceId = invoiceId;
            console.log('InvoiceID:', invoiceId);
        } catch (error) {
            console.error('Error in updateInvoiceId:', error);
            this.showToast('Error', 'An unexpected error occurred while updating invoice.', 'error');
        }
    }

    async getPreviousPayments() {
        try {
            const payments = await getPayments({ invoiceId: this.InvoiceId });
            this.paymentLines = payments;
            console.log('Payments:', payments);
        } catch (error) {
            console.error('Error in getPreviousPayments:', error);
            this.showToast('Error', 'An unexpected error occurred while retrieving payments.', 'error');
        }
    }

    @wire(CurrentPageReference)
    getPageReference(pageRef) {
        if (pageRef) {
            this.saleOrderId = pageRef.state.c__saleOrderId;
        }
    }

    @wire(getSaleOrderWithLines, { saleOrderId: '$saleOrderId' })
    wiredSaleOrder(result) {
        this.isLoading = false;
        this.wiredSaleOrderResult = result;

        if (result.data) {
            this.saleOrder = result.data.order;
            this.saleOrderLines = result.data.orderLines;
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.saleOrder = undefined;
            this.saleOrderLines = undefined;
            console.error('Error retrieving sale order details', result.error);
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

        switch (status.toLowerCase()) {
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

    getsaleOrderStatus() {
        if (this.saleOrder?.Status__c === 'Invoiced') {
            return 'Billed';
        }
        return this.saleOrder?.Status__c || '';
    }

    async handleGenerateBill() {
        try {
            const currentStatus = this.getsaleOrderStatus();

            if (currentStatus === 'Billed') {
                this.showToast('Cannot generate bill', 'This Order is already billed', 'info');
                return;
            }

            if (currentStatus === 'Cancelled' || currentStatus === 'Completed') {
                this.showToast('Cannot generate bill', 'Cannot generate bill for cancelled or completed order!', 'error');
                return;
            }

            const updateResponse = await updateStatusToInvoiced({ saleOrderId: this.saleOrderId });

            if (!updateResponse) {
                this.showToast('Error creating Bill!', 'Something went wrong', 'error');
                return;
            }

            await refreshApex(this.wiredSaleOrderResult);
            await this.updateInvoiceId();
            await this.getPreviousPayments();

            this.showToast('Successfully bill generated!', 'Bill generated', 'success');

        } catch (error) {
            console.error('Error in handleGenerateBill:', error);
            this.showToast('Error', 'An unexpected error occurred while generating the bill.', 'error');
        }
    }

    async handleCancelOrder() {
        try {
            const currentStatus = this.getsaleOrderStatus();

            if (currentStatus === 'Billed') {
                this.showToast('Cannot cancel order', 'This Order is already billed', 'info');
                return;
            }

            if (currentStatus === 'Cancelled' || currentStatus === 'Completed') {
                this.showToast('Cannot cancel order', 'Order already cancelled or completed!', 'error');
                return;
            }

            const updateResponse = await cancelSaleOrder({ saleOrderId: this.saleOrderId });

            if (!updateResponse) {
                this.showToast('Error cancelling order!', 'Something went wrong', 'error');
                return;
            }

            await refreshApex(this.wiredSaleOrderResult);
            this.showToast('Successfully order cancelled!', 'Order cancelled', 'success');

        } catch (error) {
            console.error('Error in handleCancelOrder:', error);
            this.showToast('Error', 'An unexpected error occurred while cancelling the order.', 'error');
        }
    }

    async handleDeleteOrder() {
        try {
            const currentStatus = this.getsaleOrderStatus();

            if (currentStatus === 'Billed') {
                this.showToast('Cannot delete order', 'This Order is already billed', 'info');
                return;
            }

            if (currentStatus === 'Cancelled' || currentStatus === 'Completed') {
                this.showToast('Cannot delete order', 'Order already cancelled or completed!', 'error');
                return;
            }

            const updateResponse = await deleteSaleOrder({ saleOrderId: this.saleOrderId });

            if (!updateResponse) {
                this.showToast('Error deleting order!', 'Something went wrong', 'error');
                return;
            }

            this.showToast('Successfully order deleted!', 'Order deleted', 'success');
            window.location.assign('/lightning/page/home');
        } catch (error) {
            console.error('Error in handleDeleteOrder:', error);
            this.showToast('Error', 'An unexpected error occurred while deleting the order.', 'error');
        }
    }

    handleMakePayment() {
        this.isMakePaymentModalOpen = true;
    }

    handlePrintBill() {
        if (!this.InvoiceId) {
            this.showToast('No Invoice to print', 'No Invoice to print', 'info');
            return;
        }
        this.visualforceUrl = `https://orgfarm-79e473cc35-dev-ed--c.develop.vf.force.com/apex/n/BillPrinter?InvoiceId=${this.InvoiceId}`;
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
    }

    closeMakePaymentModal() {
        this.isMakePaymentModalOpen = false;
    }

    handlePreviousPayments() {
        this.isPreviousPaymentsModalOpen = true;
    }

    closePreviousPaymentsModal() {
        this.isPreviousPaymentsModalOpen = false;
    }

    handlePaymentAmountChange(event) {
        this.paymentAmount = event.target.value;
    }

    handlePaymentStatusChange(event) {
        this.PaymentStatus = event.target.value;
    }

    async handleMakePaymentSubmit() {
        try {
            const response = await makePayment({
                invoiceId: this.InvoiceId,
                amount: parseFloat(this.paymentAmount),
                status: this.PaymentStatus
            });

            if (response) {
                this.isMakePaymentModalOpen = false;
                await this.getPreviousPayments();
                this.showToast('Payment Successful', 'Payment Successful', 'success');
                return;
            }

            this.showToast('Error', 'An unexpected error occurred while making payment.', 'error');

        } catch (error) {
            console.error('Error in handleMakePaymentSubmit:', error);
            this.showToast('Error', 'An unexpected error occurred while making payment.', 'error');
        }
    }

    showToast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}
