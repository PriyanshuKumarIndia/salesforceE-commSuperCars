public with sharing class DocumentHelper 
{
    private static final String FIELDNAME_ID = 'Id';

    public static List<SObject> getModifiedNewObjects(string fieldNameToCheck, List<SObject> oldEntries, List<SObject> newEntries){
        List<SObject> modifiedObjects = new List<SObject>();
        if(newEntries == null || oldEntries==null){
            return modifiedObjects;
        }
        Map<Id, SObject> oldObjectsMap = new Map<Id, SObject>(oldEntries);
        for(SObject lineEntry : newEntries){
            SObject oldEntry = oldObjectsMap.get(lineEntry.Id);
            if(oldEntry != null){
                if(oldEntry.get(fieldNameToCheck) != lineEntry.get(fieldNameToCheck)) {                    
                    modifiedObjects.add(lineEntry);
                } 
            }   
        }
        return modifiedObjects;
    }

    public static Boolean containsValue(List<SObject> records, String fieldName, Object valueToCheck) {
        for (SObject record : records) {
            if (record.get(fieldName) != null && record.get(fieldName).equals(valueToCheck)) {
                return true;
            }
        }
        return false;
    }

    public static List<SObject> getModifiedNewObjects(List<String> fieldNamesToCheck, List<SObject> oldEntries, List<SObject> newEntries){
        List<SObject> modifiedObjects = new List<SObject>();
        if(newEntries == null || oldEntries==null){
            return modifiedObjects;
        }
        Map<Id, SObject> oldObjectsMap = new Map<Id, SObject>(oldEntries);
        for(SObject lineEntry : newEntries){
            SObject oldEntry = oldObjectsMap.get(lineEntry.Id);
            if(oldEntry != null){
                for(String fieldName: fieldNamesToCheck){
                    if(oldEntry.get(fieldName) != lineEntry.get(fieldName)) {                    
                        modifiedObjects.add(lineEntry);
                        break;
                    } 
                }
            }   
        }
        return modifiedObjects;
    }
    
    public static List<SObject> getApprovedObjects(String approvalfieldNames, List<SObject> oldEntries, List<SObject> newEntries){
        List<SObject> modifiedObjects = new List<SObject>();
        if(newEntries == null || oldEntries==null){
            return modifiedObjects;
        }
        Map<Id, SObject> oldObjectsMap = new Map<Id, SObject>(oldEntries);
        for(SObject lineEntry : newEntries){
            SObject oldEntry = oldObjectsMap.get(lineEntry.Id);
            if(oldEntry != null){
                if(oldEntry.get(approvalfieldNames) != lineEntry.get(approvalfieldNames) 
                    && ((Boolean)lineEntry.get(approvalfieldNames))) {                    
                    modifiedObjects.add(lineEntry);
                } 
            }   
        }
        return modifiedObjects;
    }

    public static List<SObject> getApprovedNewObjects(String approvalfieldNames, List<SObject> newEntries){
        List<SObject> modifiedObjects = new List<SObject>();
        if(newEntries == null){
            return modifiedObjects;
        }
        for(SObject lineEntry : newEntries){
            if((Boolean)lineEntry.get(approvalfieldNames)) {
                modifiedObjects.add(lineEntry);
            } 
        }
        return modifiedObjects;
    }

    public static List<SObject> getObjectsByFilter(List<SObject> objects, String fieldName, object value){
        List<SObject> sObjects = new List<SObject>();
        for(SObject objectEntry : objects){
            if(objectEntry.get(fieldName) == value){
                sObjects.add(objectEntry);
            }
        }
        return sObjects;
    }

    public static List<SObject> getObjectsNotEqualsTo(List<SObject> objects, String fieldName, object value){
        List<SObject> sObjects = new List<SObject>();
        for(SObject objectEntry : objects){
            if(objectEntry.get(fieldName) != value){
                sObjects.add(objectEntry);
            }
        }
        return sObjects;
    }
    
    public static List<SObject> getObjectsByFilter(List<SObject> objects, String relatedObjectName, String fieldName, object value){
        List<SObject> sObjects = new List<SObject>();
        for(SObject objectEntry : objects){
            SObject relatedObject = objectEntry.getSObject(relatedObjectName);
            if(relatedObject != null && relatedObject.get(fieldName) == value){
                sObjects.add(objectEntry);
            }
        }
        return sObjects;
    }

    public static List<SObject> getObjectsWithNotNull(List<SObject> objects, String fieldName){
        List<SObject> sObjects = new List<SObject>();
        for(SObject objectEntry : objects){
            if(objectEntry.get(fieldName) != null){
                sObjects.add(objectEntry);
            }
        }
        return sObjects;
    }

    public static List<SObject> getObjectsWithNull(List<SObject> objects, String fieldName){
        List<SObject> sObjects = new List<SObject>();
        for(SObject objectEntry : objects){
            if(objectEntry.get(fieldName) == null){
                sObjects.add(objectEntry);
            }
        }
        return sObjects;
    }

    public static List<ID> extractIds(List<SObject> records)
    {
        List<ID> resultIds = new List<ID>();
        for(SObject record : records){
            if(record.get(FIELDNAME_ID) != null && !resultIds.contains((ID)record.get(FIELDNAME_ID))){
                resultIds.Add((ID)record.get(FIELDNAME_ID));
            }
        }
        return resultIds;
    }

    public static List<ID> extractIds(List<SObject> records, string fieldName)
    {
        List<ID> resultIds = new List<ID>();
        for(SObject record : records){
            if(record.get(fieldName) != null && !resultIds.contains((ID)record.get(fieldName))){
                resultIds.Add((ID)record.get(fieldName));
            }
        }
        return resultIds;
    }
 
    public static List<ID> extractIds(List<SObject> records, string relationshipName, string fieldName)
    {
        List<ID> resultIds = new List<ID>();
        for(SObject record : records){
            List<SObject> relatedRecords = (List<SObject>)record.getSObjects(relationshipName);
            if(relatedRecords !=null && relatedRecords.size() > 0){
                for(SObject relatedRecord : relatedRecords){
                    if(relatedRecord.get(fieldName) != null 
                        && !resultIds.contains((ID)relatedRecord.get(fieldName))){
                        resultIds.Add((ID)relatedRecord.get(fieldName));
                    }
                }
            }
        }
        return resultIds;
    }

    public static List<ID> extractReferenceIds(List<SObject> records, string lookupReferenceField, string fieldName)
    {
        List<ID> resultIds = new List<ID>();
        for(SObject record : records){
            SObject relatedRecord = (SObject)record.getSObject(lookupReferenceField);
            if(relatedRecord !=null){
                    if(relatedRecord.get(fieldName) != null 
                        && !resultIds.contains((ID)relatedRecord.get(fieldName))){
                        resultIds.Add((ID)relatedRecord.get(fieldName));
                    }
            }
        }
        return resultIds;
    }

    public static List<String> extractStringValues(List<SObject> records, string fieldName)
    {
        List<String> resultIds = new List<String>();
        for(SObject record : records){
            if(record.get(fieldName) != null && !resultIds.contains((String)record.get(fieldName))){
                resultIds.Add((String)record.get(fieldName));
            }
        }
        return resultIds;
    }

    public static SObject getObjectByFilter(List<SObject> records, String fieldName, Id value)
    {
        for(SObject record : records)
            if(record.get(fieldName) == value)
                return record;

        return null;
    }

    public static SObject getObjectByStringFilter(List<SObject> records, String fieldName, String value)
    {
        for(SObject record : records)
            if(record.get(fieldName) == value)
                return record;

        return null;
    }

      public static List<String> extractValues(List<SObject> records, string fieldName)
    {
        List<String> resultIds = new List<String>();
        for(SObject record : records){
            if(record.get(fieldName) != null && !resultIds.contains((String)record.get(fieldName))){
                resultIds.Add((String)record.get(fieldName));
            }
        }
        return resultIds;
    }

    public static List<Date> extractDates(List<SObject> records, string fieldName)
    {
        List<Date> resultIds = new List<Date>();
        for(SObject record : records){
            if(record.get(fieldName) != null && !resultIds.contains((Date)record.get(fieldName))){
                resultIds.Add((Date)record.get(fieldName));
            }
        }
        return resultIds;
    }
}