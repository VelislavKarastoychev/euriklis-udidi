// udidi.cpp
#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <cstring>
#include <cstdlib>

#ifdef _WIN32
  #include <winsock2.h>
  #include <ws2tcpip.h>
  #pragma comment(lib, "ws2_32.lib")
  typedef int socklen_t;
#else
  #include <sys/socket.h>
  #include <netinet/in.h>
  #include <arpa/inet.h>
  #include <unistd.h>
#endif

// Simple configuration structure
struct Config {
    std::string bindIp = "127.0.0.1";
    int port = 2712;
};

// A very simple parser that searches for the "net:" section and extracts the "port" and "bindIp" values.
Config parseConfig(const std::string &configPath) {
    Config config;
    std::ifstream file(configPath);
    if (!file.is_open()) {
        std::cerr << "Could not open config file at " << configPath << ". Using defaults." << std::endl;
        return config;
    }
    
    std::string line;
    bool netSection = false;
    while (std::getline(file, line)) {
        // Remove leading whitespace
        line.erase(0, line.find_first_not_of(" \t"));
        if (line.empty() || line[0] == '#') continue;
        
        // Detect the "net:" section
        if (line.find("net:") == 0) {
            netSection = true;
            continue;
        }
        
        if (netSection) {
            // If the line has no indent, assume the net section is finished.
            if (line[0] != ' ') {
                netSection = false;
                continue;
            }
            // Remove indent and parse key: value
            line.erase(0, line.find_first_not_of(" \t"));
            std::istringstream iss(line);
            std::string key;
            if (std::getline(iss, key, ':')) {
                std::string value;
                std::getline(iss, value);
                // Trim value
                value.erase(0, value.find_first_not_of(" \t"));
                value.erase(value.find_last_not_of(" \t") + 1);
                if (key == "port") {
                    config.port = std::stoi(value);
                } else if (key == "bindIp") {
                    config.bindIp = value;
                }
            }
        }
    }
    return config;
}

int main(int argc, char* argv[]) {
    // Determine config file path from command-line argument --config
    std::string configPath;
    for (int i = 1; i < argc; ++i) {
        std::string arg(argv[i]);
        if (arg == "--config" && i + 1 < argc) {
            configPath = argv[i + 1];
            break;
        }
    }
    
    // If not provided, use defaults based on OS.
    if (configPath.empty()) {
#ifdef _WIN32
        char* progData = std::getenv("PROGRAMDATA");
        if (progData)
            configPath = std::string(progData) + "\\udidi\\udidi.conf";
        else
            configPath = "udidi.conf";
#else
        configPath = "/etc/udidi.conf";
#endif
    }
    
    std::cout << "Using configuration file: " << configPath << std::endl;
    Config config = parseConfig(configPath);
    std::cout << "Starting Udidi TCP server on " << config.bindIp << ":" << config.port << std::endl;

#ifdef _WIN32
    // Initialize Winsock
    WSADATA wsaData;
    int wsaResult = WSAStartup(MAKEWORD(2,2), &wsaData);
    if (wsaResult != 0) {
        std::cerr << "WSAStartup failed: " << wsaResult << std::endl;
        return 1;
    }
#endif

    // Create a TCP socket.
    int server_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd < 0) {
        std::cerr << "Socket creation failed." << std::endl;
        return 1;
    }
    
    // Set socket options (reuse address)
    int opt = 1;
    if (setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, reinterpret_cast<char*>(&opt), sizeof(opt)) < 0) {
        std::cerr << "setsockopt failed." << std::endl;
#ifdef _WIN32
        closesocket(server_fd);
#else
        close(server_fd);
#endif
        return 1;
    }
    
    struct sockaddr_in address;
    address.sin_family = AF_INET;
    address.sin_port = htons(config.port);
    if (inet_pton(AF_INET, config.bindIp.c_str(), &address.sin_addr) <= 0) {
        std::cerr << "Invalid address: " << config.bindIp << std::endl;
#ifdef _WIN32
        closesocket(server_fd);
#else
        close(server_fd);
#endif
        return 1;
    }
    
    if (bind(server_fd, reinterpret_cast<struct sockaddr*>(&address), sizeof(address)) < 0) {
        std::cerr << "Bind failed." << std::endl;
#ifdef _WIN32
        closesocket(server_fd);
#else
        close(server_fd);
#endif
        return 1;
    }
    
    if (listen(server_fd, 5) < 0) {
        std::cerr << "Listen failed." << std::endl;
#ifdef _WIN32
        closesocket(server_fd);
#else
        close(server_fd);
#endif
        return 1;
    }
    
    std::cout << "Udidi TCP server is running and listening for connections..." << std::endl;
    
    // Main loop: accept and handle connections.
    while (true) {
        struct sockaddr_in client_addr;
        socklen_t client_len = sizeof(client_addr);
        int client_fd = accept(server_fd, reinterpret_cast<struct sockaddr*>(&client_addr), &client_len);
        if (client_fd < 0) {
            std::cerr << "Accept failed." << std::endl;
            continue;
        }
        
        char clientIP[INET_ADDRSTRLEN];
        inet_ntop(AF_INET, &client_addr.sin_addr, clientIP, INET_ADDRSTRLEN);
        std::cout << "Accepted connection from " << clientIP << std::endl;
        
        char buffer[1024] = {0};
        int bytesRead = 0;
#ifdef _WIN32
        bytesRead = recv(client_fd, buffer, sizeof(buffer), 0);
#else
        bytesRead = read(client_fd, buffer, sizeof(buffer));
#endif
        if (bytesRead > 0) {
            std::cout << "Received message: " << buffer << std::endl;
        }
        
        // For now, respond with a simple JSON message.
        std::string response = "{\"success\":true, \"message\":\"Udidi TCP server received your request.\"}";
#ifdef _WIN32
        send(client_fd, response.c_str(), response.size(), 0);
        closesocket(client_fd);
#else
        write(client_fd, response.c_str(), response.size());
        close(client_fd);
#endif
    }
    
#ifdef _WIN32
    WSACleanup();
#endif

    return 0;
}
