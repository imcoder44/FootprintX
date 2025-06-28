package com.example.footprintx.service;

import com.example.footprintx.model.OSINTResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@Service
public class EmailInfoService {
    
    private final WebClient webClient;
    
    @Value("${api.clearbit.key}")
    private String apiKey;
    
    @Value("${api.clearbit.url}")
    private String apiUrl;

    public EmailInfoService(WebClient webClient) {
        this.webClient = webClient;
    }

    public Mono<OSINTResult> lookupEmail(String email, String sessionId) {
        OSINTResult result = new OSINTResult("Clearbit", "email", email, sessionId);
        
        if ("demo_key".equals(apiKey)) {
            return createDemoEmailResult(email, sessionId);
        }
        
        return webClient.get()
            .uri(uriBuilder -> uriBuilder
                .scheme("https")
                .host("person.clearbit.com")
                .path("/v2/combined/find")
                .queryParam("email", email)
                .build())
            .header("Authorization", "Bearer " + apiKey)
            .retrieve()
            .bodyToMono(Map.class)
            .map(response -> {
                result.setSuccess(true);
                result.setData(response);
                result.setMessage("Email lookup completed successfully");
                return result;
            })
            .onErrorReturn(createErrorResult(result, "Failed to lookup email"));
    }
    
    private Mono<OSINTResult> createDemoEmailResult(String email, String sessionId) {
        OSINTResult result = new OSINTResult("Clearbit (Demo)", "email", email, sessionId);
        Map<String, Object> demoData = new HashMap<>();
        
        Map<String, Object> person = new HashMap<>();
        person.put("email", email);
        person.put("name", "John Demo User");
        person.put("location", "San Francisco, CA");
        person.put("title", "Software Engineer");
        person.put("linkedin", "https://linkedin.com/in/demo-user");
        person.put("twitter", "https://twitter.com/demo_user");
        
        Map<String, Object> company = new HashMap<>();
        company.put("name", "Demo Tech Corp");
        company.put("domain", "demotechcorp.com");
        company.put("industry", "Technology");
        company.put("size", "100-500");
        
        demoData.put("person", person);
        demoData.put("company", company);
        demoData.put("demo_mode", true);
        
        result.setSuccess(true);
        result.setData(demoData);
        result.setMessage("Demo email lookup completed");
        return Mono.just(result);
    }
    
    private OSINTResult createErrorResult(OSINTResult result, String errorMessage) {
        result.setSuccess(false);
        result.setMessage(errorMessage);
        return result;
    }
}