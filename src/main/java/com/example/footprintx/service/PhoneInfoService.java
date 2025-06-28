package com.example.footprintx.service;

import com.example.footprintx.model.OSINTResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@Service
public class PhoneInfoService {
    
    private final WebClient webClient;
    
    @Value("${api.numverify.key}")
    private String apiKey;
    
    @Value("${api.numverify.url}")
    private String apiUrl;

    public PhoneInfoService(WebClient webClient) {
        this.webClient = webClient;
    }

    public Mono<OSINTResult> lookupPhone(String phoneNumber, String sessionId) {
        OSINTResult result = new OSINTResult("Numverify", "phone", phoneNumber, sessionId);
        
        if ("demo_key".equals(apiKey)) {
            return createDemoPhoneResult(phoneNumber, sessionId);
        }
        
        return webClient.get()
            .uri(uriBuilder -> uriBuilder
                .scheme("http")
                .host("apilayer.net")
                .path("/api/validate")
                .queryParam("access_key", apiKey)
                .queryParam("number", phoneNumber)
                .build())
            .retrieve()
            .bodyToMono(Map.class)
            .map(response -> {
                result.setSuccess(true);
                result.setData(response);
                result.setMessage("Phone lookup completed successfully");
                return result;
            })
            .onErrorReturn(createErrorResult(result, "Failed to lookup phone number"));
    }
    
    private Mono<OSINTResult> createDemoPhoneResult(String phoneNumber, String sessionId) {
        OSINTResult result = new OSINTResult("Numverify (Demo)", "phone", phoneNumber, sessionId);
        Map<String, Object> demoData = new HashMap<>();
        demoData.put("number", phoneNumber);
        demoData.put("valid", true);
        demoData.put("country_code", "US");
        demoData.put("country_name", "United States of America");
        demoData.put("location", "California");
        demoData.put("carrier", "Demo Carrier");
        demoData.put("line_type", "mobile");
        demoData.put("demo_mode", true);
        
        result.setSuccess(true);
        result.setData(demoData);
        result.setMessage("Demo phone lookup completed");
        return Mono.just(result);
    }
    
    private OSINTResult createErrorResult(OSINTResult result, String errorMessage) {
        result.setSuccess(false);
        result.setMessage(errorMessage);
        return result;
    }
}