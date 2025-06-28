package com.example.footprintx.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class OSINTResult {
    private String source;
    private String type;
    private String query;
    private boolean success;
    private String message;
    private Map<String, Object> data;
    private LocalDateTime timestamp;
    private String sessionId;

    public OSINTResult() {
        this.timestamp = LocalDateTime.now();
    }

    public OSINTResult(String source, String type, String query, String sessionId) {
        this();
        this.source = source;
        this.type = type;
        this.query = query;
        this.sessionId = sessionId;
    }

    // Getters and Setters
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Map<String, Object> getData() { return data; }
    public void setData(Map<String, Object> data) { this.data = data; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
}