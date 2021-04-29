Set up the telemetry backend.
```
docker-compose up -d
```

Install the example dependencies
```
npm install
```

Run the example
```
TELEMETRY_TRACING_ENABLED=true TELEMETRY_METRICS_ENABLED=true npm start
```

make a request to the server
```
http://localhost:8080
```
go into zipkin to see the traces
```
http://localhost:9411/zipkin/
```
go the prometheus to see the metrics
```
http://localhost:9090/
```

optionally go to grafana to see the the traces and make graphs of metrics
```
http://localhost:3000
```