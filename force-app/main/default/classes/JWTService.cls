public with sharing class JWTService {
    @AuraEnabled
    public static String generateAuthToken(String email, String accountId) {
        Auth.JWT jwt = new Auth.JWT();
        jwt.setSub(email);
        jwt.setIss('your_org_name');
        jwt.setAud('https://login.salesforce.com');
        jwt.setAdditionalClaims(new Map<String, Object>{
            'accountId' => accountId,
            'exp' => System.now().addHours(1).getTime() / 1000
        });

        Auth.JWS jws = new Auth.JWS(jwt, 'JWT_Certificate');
        return jws.getCompactSerialization();
    }
}
