trigger CartItemTrigger on CartItem__c (before insert,before Update,before delete,after insert,after Update,after delete) {
    if(Trigger.isBefore){
        CartItemHelper.postData(Trigger.isInsert,Trigger.isUpdate,Trigger.isDelete,Trigger.old,Trigger.new);
    }
    if(Trigger.isAfter){
        CartItemHelper.afterPostData(Trigger.isInsert,Trigger.isUpdate,Trigger.isDelete,Trigger.old,Trigger.new);
    }
}