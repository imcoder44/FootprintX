package com.example.footprintx.controller;

import com.example.footprintx.model.LookupRequest;
import com.example.footprintx.model.OSINTResult;
import com.example.footprintx.service.OSINTOrchestratorService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api")
public class OSINTController {
    
    private final OSINTOrchestratorService orchestratorService;
    private final Map<String, String> activeSessions = new ConcurrentHashMap<>();

    public OSINTController(OSINTOrchestratorService orchestratorService) {
        this.orchestratorService = orchestratorService;
    }

    @PostMapping("/lookup")
    public Mono<Map<String, String>> startLookup(@RequestBody LookupRequest request) {
        String sessionId = UUID.randomUUID().toString();
        activeSessions.put(sessionId, request.getQuery());
        
        return Mono.just(Map.of(
            "sessionId", sessionId,
            "status", "started",
            "query", request.getQuery()
        ));
    }

    @GetMapping(value = "/stream/{sessionId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamResults(@PathVariable String sessionId) {
        String query = activeSessions.get(sessionId);
        
        if (query == null) {
            return Flux.just("data: {\"error\":\"Session not found\"}\n\n");
        }

        return orchestratorService.performLookup(query)
            .map(this::formatAsSSE)
            .doOnComplete(() -> activeSessions.remove(sessionId))
            .doOnError(error -> activeSessions.remove(sessionId));
    }

    @GetMapping("/sessions/{sessionId}/status")
    public Mono<Map<String, Object>> getSessionStatus(@PathVariable String sessionId) {
        boolean active = activeSessions.containsKey(sessionId);
        return Mono.just(Map.of(
            "sessionId", sessionId,
            "active", active,
            "query", activeSessions.getOrDefault(sessionId, "")
        ));
    }

    private String formatAsSSE(OSINTResult result) {
        try {
            String jsonData = String.format(
                "{\"source\":\"%s\",\"type\":\"%s\",\"query\":\"%s\",\"success\":%s,\"message\":\"%s\",\"timestamp\":\"%s\",\"sessionId\":\"%s\"}",
                escapeJson(result.getSource()),
                escapeJson(result.getType()),
                escapeJson(result.getQuery()),
                result.isSuccess(),
                escapeJson(result.getMessage()),
                result.getTimestamp().toString(),
                escapeJson(result.getSessionId())
            );
            return "data: " + jsonData + "\n\n";
        } catch (Exception e) {
            return "data: {\"error\":\"Failed to format result\"}\n\n";
        }
    }

    private String escapeJson(String input) {
        if (input == null) return "";
        return input.replace("\"", "\\\"")
                   .replace("\n", "\\n")
                   .replace("\r", "\\r")
                   .replace("\t", "\\t");
    }
}