trigger CustomCartTrigger on CustomCarts__c (before insert,before Update,before delete,after insert,after Update,after delete) {
	if(Trigger.isBefore){
        CustomCartHelper.postData(Trigger.isInsert,Trigger.isUpdate,Trigger.isDelete,Trigger.old,Trigger.new);
    }
}