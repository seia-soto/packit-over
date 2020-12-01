# Seia-Soto/packit-over

A project to against Deep Packet Inspection vendors with Node.JS.

> Always working on!

## Table of Contents

- [Specifications](#Specifications)

----

# Specifications

In this section, you can read some specification such as our project concept.

## Concept

Our goal is providing the HTTP client API which can bypass DPI(Deep Packet Inspection) vendors.
Personally, the goals of this project are learning HTTP protocol and SSL handshakes in network level by creating own HTTP client.
In this project, I am going to reference a lot from existing bypassing tools such as GoodByeDPI which is showing nice performance even in real-life.
Basically, GoodByeDPI or Green Turnel can be used in system level to bypass those vendors.
However, they're not suitable for me since they touches packets in system level and requires complicated steps when I only need to use Node.JS or I use limited environment.
Finally, I decided to write the HTTP client which can bypass DPI vendors.

## TODO

- [ ] DNS
  - [ ] Support querying from user-defined DNS server
  - [ ] Support querying DNS securely via DoH or DoT
- [ ] HTTP
  - [x] Compiling HTTP packet
    - [x] Support HTTP headers
    - [ ] Support HTTP body
    - [ ] Obfuscate HTTP headers
  - [ ] Sending HTTP packet
    - [x] Send packet
    - [x] Send packet with some fragments
    - [ ] Send packet with random fragments
    - [ ] Send fake-packet
  - [ ] Receiving HTTP packet
    - [x] Identify HTTP packet header(definition)
      - [x] Identify HTTP version
      - [x] Identify HTTP status code
      - [x] Identify HTTP status message
    - [x] Identify HTTP header
    - [x] Identify HTTP body
    - [ ] Resolve HTTP packet header
      - [ ] Support redirection
      - [ ] Support max-redirection counter
    - [ ] Resolve packet with advanced data structures
    - [ ] Support heuristic DPI detection
- [ ] HTTPS (yet)
- [ ] HTTP/2 (yet)
- [ ] Obfuscation
  - [x] Studly-case
- [ ] Standard implementation
  - [x] Seia-Soto/packit-over API
  - [ ] Fetch API
