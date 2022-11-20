# tydids-ghg-electricity
Provides GHG emissions for electricity usage (Germany only!) as digital certificate.

## Usage CLI

Request a new certificate for a electricity consumption (1500 Wh = 1.5 kWh) in Wiesloch (Zipcode 69168)
```shell
tydids-ghg-certificate requestCertificate 69168 1500
```
Request a new certificate for a electricity consumption (2700 Wh = 2.7 kWh) in Mauer (Zipcode 69256) and writes it into the sub-folder tmp.
```shell
tydids-ghg-certificate requestCertificate -o ./tmp 69256 2700
```
Request a new certificate for a electricity consumption (1200 Wh = 1.2 kWh) in Hemsbach (Zipcode 69502) using a given Private Key.
```shell
tydids-ghg-certificate requestCertificate -pk 0xeb0277027c00bb1b450d039737b5e08db5e08d720c748ce78e281b6b97a9f7b9 69502 1200
```

## Presentations 

Persentations are provided in attribute presentations of output

### Location
| Payload  | Description  |
|---|---|
| `zip`  | Postal-code of location |
| `city`  | Pretty name of city |
| `country`  | Always Germany |
| `meloid`  | Metering location (if specified) |
| `hash`  | Hash of certificate |

### Consumption
| Payload  | Description  |
|---|---|
| `unit`  | Unit of consumption metering (must be wh - Watt hours) |
| `actual`  | Metered consumption |
| `time`  | Timestamp of consumption end (settlement) |
| `hash`  | Hash of certificate |

### GHG
| Payload  | Description  |
|---|---|
| `factors`  | Calculation factors used (for GHG reporting) |
| `base`  | Greenhouse Gas emissions regular per base unit |
| `actual`  | Greenhouse Gas emissions at time of settlement |
| `saving`  | Saved (base - actual) emissions |
| `scope`  | Reporting scop (following ISO 14064 / ghg protocol) |

## Maintainer / Imprint
<addr>
[STROMDAO GmbH](https://stromdao.de/)  <br/>
Gerhard Weiser Ring 29  <br/>
69256 Mauer  <br/>
Germany  <br/>
  <br/>
+49 6226 968 009 0  <br/>
  <br/>
kontakt@stromdao.com  <br/>
  <br/>
Handelsregister: HRB 728691 (Amtsgericht Mannheim)
</addr>

## LICENSE
[Apache-2.0](./LICENSE)



