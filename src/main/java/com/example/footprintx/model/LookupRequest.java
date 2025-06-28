package com.example.footprintx.model;

public class LookupRequest {
    private String query;
    private String type; // "phone", "email", "name", "ip"

    public LookupRequest() {}

    public LookupRequest(String query, String type) {
        this.query = query;
        this.type = type;
    }

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}