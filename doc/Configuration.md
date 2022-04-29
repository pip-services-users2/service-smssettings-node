# Configuration Guide <br/> Sms Settings Microservice

Sms settings microservice configuration structure follows the 
[standard configuration](https://github.com/pip-services/pip-services3-container-nodex/doc/Configuration.md) 
structure. 

* [persistence](#persistence)
  - [memory](#persistence_memory)
  - [file](#persistence_file)
  - [mongodb](#persistence_mongodb)
* [controller](#controller)
* [service](#service)
  - [http](#service_http)
  - [seneca](#service_seneca)

## <a name="persistence"></a> Persistence

The microservice supports three types of persistence: in-memory, flat files or MongoDB. In-memory and flat files are great for development and testing, 
while MongoDB is a good option with outstanding performance and scalability, suitable for demanding production installations. 
You can choose and configure the option that suits your needs.

For more information on this section read 
[Pip.Services Configuration Guide](https://github.com/pip-services/pip-services/blob/master/usage/Configuration.md)

### <a name="persistence_memory"></a> Memory

Memory persistence has the following configuration properties:
- options: object - Misc configuration options
  - max_page_size: number - Maximum number of items per page (default: 100)

Example:
```yaml
- descriptor: "service-smssettings:persistence:memory:default:1.0"
  options:
    max_page_size: 100
```

### <a name="persistence_file"></a> File

Flat file persistence has the following configuration properties:
- path: string - file path where SystemEventV1 objects are stored. The object are written into the file in JSON format.
- options: object - Misc configuration options
  - max_page_size: number - Maximum number of items per page (default: 100)

Example:
```yaml
- descriptor: "service-smssettings:persistence:file:default:1.0"
  path: "./data/sms_settings.json"
```

### <a name="persistence_mongodb"></a> MongoDB

MongoDB persistence has the following configuration properties:
- connection(s): object - MongoDB connection properties
- options: object - (optional) MongoDB connection options. See: http://mongoosejs.com/docs/connections.html for more details.
- debug: boolean - (optional) Enables or disables connection debugging

Example:
```yaml
- descriptor: "service-smssettings:persistence:file:default:1.0"
  connection:
    uri: "mongodb://localhost/pipservicestest"
  options:
    server:
      poolSize: 4
      socketOptions:
        keepAlive: 1
        connectTimeoutMS: 5000
    auto_reconnect: true
```

## <a name="controller"></a> Controller

Controller has the following configuration properties:
- options: any - Misc options
  - magic_code: string - magic code to verify smss (default: disabled)
  - verify\_on\_create: string - automatically sends verification sms on settings creation
  - verify\_on\_update: string - automatically sends verification sms when user changes sms


Example:
```yaml
- descriptor: "service-smssettings:controller:default:default:1.0"
  options:
    magic_code: '123'
    verify_on_create: true
    verify_on_update: true
```

## <a name="service"></a> Services

The **service** components (also called endpoints) expose external microservice API for the consumers. 
Each microservice can expose multiple APIs (HTTP/REST, Thrift or Seneca) and multiple versions of the same API type.
At least one service is required for the microservice to run successfully.

### <a name="service_http"></a> Http

HTTP/REST service has the following configuration properties:
- connection: object - HTTP transport configuration options
  - protocol: string - HTTP protocol - 'http' or 'https' (default is 'http')
  - host: string - IP address/hostname binding (default is '0.0.0.0')
  - port: number - HTTP port number

A detailed description of HTTP protocol version 1 can be found [here](HttpProtocolV1.md)

Example:
```yaml
- descriptor: "service-smssettings:service:http:default:1.0"
  connection:
    protocol: "http"
    host: "0.0.0.0"
    port: 3000
```

### <a name="service_seneca"></a> Seneca

Seneca service has the following configuration properties:
- connection: object - Seneca transport configuration options. See http://senecajs.org/api/ for details.
  - type: string - Seneca transport type 
  - host: string - IP address/hostname binding (default is '0.0.0.0')
  - port: number - Seneca port number

A detail description of Seneca protocol version 1 can be found [here](SenecaProtocolV1.md)

Example:
```yaml
- descriptor: "service-smssettings:service:seneca:default:1.0"
  connection:
    protocol: "http"
    host: "0.0.0.0"
    port: 3000
```

For more information on this section read 
[Pip.Services Configuration Guide](https://github.com/pip-services/pip-services/blob/master/usage/Configuration.md)
