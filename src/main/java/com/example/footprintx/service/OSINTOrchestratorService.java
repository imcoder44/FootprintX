package com.example.footprintx.service;

import com.example.footprintx.model.OSINTResult;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.UUID;

@Service
public class OSINTOrchestratorService {
    
    private final PhoneInfoService phoneInfoService;
    private final EmailInfoService emailInfoService;
    private final GeoIPService geoIPService;

    public OSINTOrchestratorService(PhoneInfoService phoneInfoService, 
                                   EmailInfoService emailInfoService,
                                   GeoIPService geoIPService) {
        this.phoneInfoService = phoneInfoService;
        this.emailInfoService = emailInfoService;
        this.geoIPService = geoIPService;
    }

    public Flux<OSINTResult> performLookup(String query) {
        String sessionId = UUID.randomUUID().toString();
        String queryType = detectQueryType(query);
        
        return Flux.concat(
            createStartMessage(query, sessionId, queryType),
            performActualLookup(query, queryType, sessionId),
            createEndMessage(sessionId)
        );
    }

    private Flux<OSINTResult> createStartMessage(String query, String sessionId, String queryType) {
        OSINTResult startResult = new OSINTResult("System", "status", query, sessionId);
        startResult.setSuccess(true);
        startResult.setMessage("Starting OSINT lookup for: " + query + " (detected as: " + queryType + ")");
        return Flux.just(startResult).delayElements(Duration.ofMillis(500));
    }

    private Flux<OSINTResult> createEndMessage(String sessionId) {
        OSINTResult endResult = new OSINTResult("System", "status", "", sessionId);
        endResult.setSuccess(true);
        endResult.setMessage("OSINT lookup completed. Type another query or 'help' for commands.");
        return Flux.just(endResult).delayElements(Duration.ofMillis(1000));
    }

    private Flux<OSINTResult> performActualLookup(String query, String queryType, String sessionId) {
        switch (queryType) {
            case "phone":
                return phoneInfoService.lookupPhone(query, sessionId)
                    .flux()
                    .delayElements(Duration.ofMillis(800));
            
            case "email":
                return emailInfoService.lookupEmail(query, sessionId)
                    .flux()
                    .delayElements(Duration.ofMillis(1200));
            
            case "ip":
                return geoIPService.lookupIP(query, sessionId)
                    .flux()
                    .delayElements(Duration.ofMillis(600));
            
            case "name":
                return Flux.merge(
                    emailInfoService.lookupEmail(query + "@gmail.com", sessionId)
                        .delayElement(Duration.ofMillis(1000)),
                    createNameSearchResult(query, sessionId)
                        .delayElement(Duration.ofMillis(1500))
                );
            
            default:
                return createUnknownQueryResult(query, sessionId).flux();
        }
    }

    private String detectQueryType(String query) {
        query = query.trim().toLowerCase();
        
        if (query.matches("\\+?[1-9]\\d{1,14}") || query.matches("\\d{10,15}")) {
            return "phone";
        }
        
        if (query.contains("@") && query.contains(".")) {
            return "email";
        }
        
        if (query.matches("\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}")) {
            return "ip";
        }
        
        if (query.matches("[a-zA-Z\\s]+")) {
            return "name";
        }
        
        return "unknown";
    }

    private Mono<OSINTResult> createNameSearchResult(String name, String sessionId) {
        OSINTResult result = new OSINTResult("Social Search (Demo)", "name", name, sessionId);
        result.setSuccess(true);
        result.setMessage("Social media search completed for: " + name);
        return Mono.just(result);
    }

    private Mono<OSINTResult> createUnknownQueryResult(String query, String sessionId) {
        OSINTResult result = new OSINTResult("System", "error", query, sessionId);
        result.setSuccess(false);
        result.setMessage("Unknown query type. Try: phone number, email, IP address, or person name");
        return Mono.just(result);
    }
}