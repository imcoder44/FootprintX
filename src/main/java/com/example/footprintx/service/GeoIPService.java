package com.example.footprintx.service;

import com.example.footprintx.model.OSINTResult;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@Service
public class GeoIPService {
    
    private final WebClient webClient;
    
    @Value("${api.ipstack.key}")
    private String apiKey;
    
    @Value("${api.ipstack.url}")
    private String apiUrl;

    public GeoIPService(WebClient webClient) {
        this.webClient = webClient;
    }

    public Mono<OSINTResult> lookupIP(String ipAddress, String sessionId) {
        OSINTResult result = new OSINTResult("IPStack", "ip", ipAddress, sessionId);
        
        if ("demo_key".equals(apiKey)) {
            return createDemoIPResult(ipAddress, sessionId);
        }
        
        return webClient.get()
            .uri(uriBuilder -> uriBuilder
                .scheme("http")
                .host("api.ipstack.com")
                .path("/" + ipAddress)
                .queryParam("access_key", apiKey)
                .build())
            .retrieve()
            .bodyToMono(Map.class)
            .map(response -> {
                result.setSuccess(true);
                result.setData(response);
                result.setMessage("IP geolocation lookup completed successfully");
                return result;
            })
            .onErrorReturn(createErrorResult(result, "Failed to lookup IP address"));
    }
    
    private Mono<OSINTResult> createDemoIPResult(String ipAddress, String sessionId) {
        OSINTResult result = new OSINTResult("IPStack (Demo)", "ip", ipAddress, sessionId);
        Map<String, Object> demoData = new HashMap<>();
        demoData.put("ip", ipAddress);
        demoData.put("country_code", "US");
        demoData.put("country_name", "United States");
        demoData.put("region_code", "CA");
        demoData.put("region_name", "California");
        demoData.put("city", "San Francisco");
        demoData.put("zip", "94102");
        demoData.put("latitude", 37.7749);
        demoData.put("longitude", -122.4194);
        demoData.put("connection_type", "Corporate");
        demoData.put("isp", "Demo Internet Provider");
        demoData.put("demo_mode", true);
        
        result.setSuccess(true);
        result.setData(demoData);
        result.setMessage("Demo IP lookup completed");
        return Mono.just(result);
    }
    
    private OSINTResult createErrorResult(OSINTResult result, String errorMessage) {
        result.setSuccess(false);
        result.setMessage(errorMessage);
        return result;
    }
}