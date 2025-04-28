import { LightningElement, api, wire } from 'lwc'; 
import getAccountDetails from '@salesforce/apex/ProductCartController.getAccountDetails';

export default class AccountDetails extends LightningElement {
    @api accountId;

    @wire(getAccountDetails, { accountId: '$accountId' })
    account;
}
