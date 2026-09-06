package com.shopflow.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(exclude = {
    org.springframework.cloud.gateway.config.GatewayMetricsAutoConfiguration.class
})
public class ApiGatewayApplication {

    @org.springframework.context.annotation.Bean
    public static org.springframework.beans.factory.config.BeanFactoryPostProcessor removeWeightCalculatorFilter() {
        return beanFactory -> {
            if (beanFactory.containsBeanDefinition("weightCalculatorWebFilter")) {
                ((org.springframework.beans.factory.support.BeanDefinitionRegistry) beanFactory)
                        .removeBeanDefinition("weightCalculatorWebFilter");
            }
        };
    }
    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
