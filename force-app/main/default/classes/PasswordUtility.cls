public with sharing class PasswordUtility {
    public static String hashPassword(String password) {
        String hashedPassword = EncodingUtil.convertToHex(Crypto.generateDigest('SHA-256', Blob.valueOf(password)));
        return hashedPassword;
    }

    public static Boolean verifyPassword(String inputPassword, String storedHash) {
        return hashPassword(inputPassword) == storedHash;
    }
}
