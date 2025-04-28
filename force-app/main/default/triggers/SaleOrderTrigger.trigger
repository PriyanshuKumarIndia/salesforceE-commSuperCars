trigger SaleOrderTrigger on SaleOrder__c (before insert,before Update,before delete,after insert,after Update,after delete) {
	if(Trigger.isBefore){
        SaleOrderHelper.postData(Trigger.isInsert,Trigger.isUpdate,Trigger.isDelete,Trigger.old,Trigger.new);
    }
}