public with sharing class AccountController {
    @AuraEnabled
    public static Id createCustomAccount(String username, String email, String phone, String userType, String address, String password) {
        system.debug('I am under AccountController');
        List<customAccount__c> existingAccountWithSameDetail = [SELECT id FROM customAccount__c WHERE Email__c = :email  OR PhoneNumber__c = :phone];
        if(existingAccountWithSameDetail.size() > 0){
            system.debug('Existing account with Same detail ');
            return null;
        }
        try {
            customAccount__c acc = new customAccount__c(
                Name = username,
                Email__c = email,
                PhoneNumber__c = phone,
                Type__c = userType,
                Address__c = address,
                Password__c = PasswordUtility.hashPassword(password)
            );
            
            insert acc;
            return acc.Id;
        } catch(Exception e) {
            throw new AuraHandledException('Account creation failed: ' + e.getMessage());
        }
    }
    @AuraEnabled
    public static customAccount__c getAccountDetails(Id accountId){
        try {
            return [
                SELECT Name, Type__c, Address__c, Email__c, PhoneNumber__c, Password__c from customAccount__c where Id = :accountId];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static Id createAccountLogin(String Email, String password){
        try {
            String hashedPassword = PasswordUtility.hashPassword(password);
    
            List<customAccount__c> accList = [
                SELECT Id, Password__c FROM customAccount__c WHERE Email__c = :Email LIMIT 1
            ];
    
            if (accList.isEmpty()) {
                return null; 
            }
    
            customAccount__c acc = accList[0];
            if (acc.Password__c == hashedPassword) {
                return acc.Id;
            } else {
                return null; 
            }
        } catch (Exception e) {
            throw new AuraHandledException('Login error: ' + e.getMessage());
        }
    }
    
}
