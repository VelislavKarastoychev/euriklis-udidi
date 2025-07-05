// installer.cpp
#include <cstdlib>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <stdexcept>

namespace fs = std::filesystem;

int main() {
  try {
#ifdef __linux__
    // Linux paths
    fs::path dataDir("/var/lib/udidi");
    fs::path logDir("/var/log/udidi");
    fs::path configFile("/etc/udidi.conf");
    fs::path serviceFile("/lib/systemd/system/udidi.service");

    // Create directories
    if (!fs::exists(dataDir)) {
      fs::create_directories(dataDir);
      std::cout << "Created directory: " << dataDir << std::endl;
    } else {
      std::cout << "Directory " << dataDir << " already exists." << std::endl;
    }

    if (!fs::exists(logDir)) {
      fs::create_directories(logDir);
      std::cout << "Created directory: " << logDir << std::endl;
    } else {
      std::cout << "Directory " << logDir << " already exists." << std::endl;
    }

    // Write the configuration file (/etc/udidi.conf)
    {
      std::ofstream confFile(configFile);
      if (!confFile) {
        throw std::runtime_error("Could not open " + configFile.string() +
                                 " for writing.");
      }
      confFile << "# udidi.conf\n\n"
                  "# for documentation of all options, see:\n"
                  "#   http://euriklis.com/docs/udidi\n"
                  "storage:\n"
                  "  dbPath: /var/lib/udidi\n"
                  "#  engine:\n"
                  "#  wiredTiger:\n\n"
                  "systemLog:\n"
                  "  destination: file\n"
                  "  logAppend: true\n"
                  "  path: /var/log/udidi/udidi.log\n\n"
                  "net:\n"
                  "  port: 2712\n"
                  "  bindIp: 127.0.0.1 # localhost\n\n"
                  "processManagement:\n"
                  "  timeZoneInfo: /usr/share/zoneinfo\n\n"
                  "#security:\n\n"
                  "#operationProfiling:\n\n"
                  "#replication:\n\n"
                  "#sharding:\n\n"
                  "## Enterprise-Only Options:\n\n"
                  "#auditLog:\n";
      std::cout << "Configuration file created at " << configFile << std::endl;
    }

    // Write the systemd service file (/lib/systemd/system/udidi.service)
    {
      std::ofstream servFile(serviceFile);
      if (!servFile) {
        throw std::runtime_error("Could not open " + serviceFile.string() +
                                 " for writing.");
      }
      servFile << "[Unit]\n"
                  "Description=Udidi graph database server\n"
                  "Documentation=https://euriklis.com/docs/udidi\n"
                  "After=network-online.target\n"
                  "Wants=network-online.target\n\n"
                  "[Service]\n"
                  "User=udidi\n"
                  "Group=udidi\n"
                  "EnvironmentFile=-/etc/default/udidi\n"
                  "Environment=\"UDIDI_CONFIG_OVERRIDE_NOFORK=1\"\n"
                  "Environment=\"GLIBC_TUNABLES=glibc.pthread.rseq=0\"\n"
                  "ExecStart=/usr/bin/udidi --config /etc/udidi.conf\n"
                  "RuntimeDirectory=udidi\n"
                  "LimitFSIZE=infinity\n"
                  "LimitCPU=infinity\n"
                  "LimitAS=infinity\n"
                  "LimitNOFILE=64000\n"
                  "LimitNPROC=64000\n"
                  "LimitMEMLOCK=infinity\n"
                  "TasksMax=infinity\n"
                  "TasksAccounting=false\n\n"
                  "[Install]\n"
                  "WantedBy=multi-user.target\n";
      std::cout << "Service file created at " << serviceFile << std::endl;
    }

    // Create (or touch) the log file at /var/log/udidi/udidi.log
    {
      fs::path logFile = logDir / "udidi.log";
      if (!fs::exists(logFile)) {
        std::ofstream logStream(logFile);
        if (!logStream) {
          throw std::runtime_error("Could not create log file " +
                                   logFile.string());
        }
        std::cout << "Log file created at " << logFile << std::endl;
      } else {
        std::cout << "Log file " << logFile << " already exists." << std::endl;
      }
    }

#elif defined(__APPLE__)
    // macOS paths
    fs::path dataDir("/usr/local/var/udidi");
    fs::path logDir("/usr/local/var/log/udidi");
    fs::path configFile("/usr/local/etc/udidi.conf");
    fs::path serviceFile("/Library/LaunchDaemons/com.udidi.database.plist");

    // Create directories
    if (!fs::exists(dataDir)) {
      fs::create_directories(dataDir);
      std::cout << "Created directory: " << dataDir << std::endl;
    } else {
      std::cout << "Directory " << dataDir << " already exists." << std::endl;
    }

    if (!fs::exists(logDir)) {
      fs::create_directories(logDir);
      std::cout << "Created directory: " << logDir << std::endl;
    } else {
      std::cout << "Directory " << logDir << " already exists." << std::endl;
    }

    // Write the configuration file (/usr/local/etc/udidi.conf)
    {
      std::ofstream confFile(configFile);
      if (!confFile) {
        throw std::runtime_error("Could not open " + configFile.string() +
                                 " for writing.");
      }
      confFile << "# udidi.conf\n\n"
                  "# for documentation of all options, see:\n"
                  "#   http://euriklis.com/docs/udidi\n"
                  "storage:\n"
                  "  dbPath: /usr/local/var/udidi\n\n"
                  "systemLog:\n"
                  "  destination: file\n"
                  "  logAppend: true\n"
                  "  path: /usr/local/var/log/udidi/udidi.log\n\n"
                  "net:\n"
                  "  port: 2712\n"
                  "  bindIp: 127.0.0.1\n\n"
                  "processManagement:\n"
                  "  timeZoneInfo: /usr/share/zoneinfo\n";
      std::cout << "Configuration file created at " << configFile << std::endl;
    }

    // Write the LaunchDaemon plist file
    // (/Library/LaunchDaemons/com.udidi.database.plist)
    {
      std::ofstream plistFile(serviceFile);
      if (!plistFile) {
        throw std::runtime_error("Could not open " + serviceFile.string() +
                                 " for writing.");
      }
      plistFile << "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
                   "<!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\" "
                   "\"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">\n"
                   "<plist version=\"1.0\">\n"
                   "<dict>\n"
                   "    <key>Label</key>\n"
                   "    <string>com.udidi.database</string>\n"
                   "    <key>ProgramArguments</key>\n"
                   "    <array>\n"
                   "        <string>/usr/local/bin/udidi</string>\n"
                   "        <string>--config</string>\n"
                   "        <string>/usr/local/etc/udidi.conf</string>\n"
                   "    </array>\n"
                   "    <key>RunAtLoad</key>\n"
                   "    <true/>\n"
                   "    <key>KeepAlive</key>\n"
                   "    <true/>\n"
                   "    <key>StandardOutPath</key>\n"
                   "    <string>/usr/local/var/log/udidi/udidi.log</string>\n"
                   "    <key>StandardErrorPath</key>\n"
                   "    <string>/usr/local/var/log/udidi/udidi.log</string>\n"
                   "</dict>\n"
                   "</plist>\n";
      std::cout << "LaunchDaemon plist file created at " << serviceFile
                << std::endl;
    }

#elif defined(_WIN32)
    // Windows paths using the PROGRAMDATA environment variable
    char *progData = std::getenv("PROGRAMDATA");
    if (!progData) {
      throw std::runtime_error("PROGRAMDATA environment variable not set.");
    }
    fs::path baseDir(progData);
    baseDir /= "udidi";
    fs::path dataDir = baseDir / "data";
    fs::path logDir = baseDir / "logs";
    fs::path configFile = baseDir / "udidi.conf";
    fs::path serviceInstructions =
        baseDir / "udidi_service_install_instructions.txt";

    // Create base, data, and log directories
    if (!fs::exists(dataDir)) {
      fs::create_directories(dataDir);
      std::cout << "Created directory: " << dataDir << std::endl;
    } else {
      std::cout << "Directory " << dataDir << " already exists." << std::endl;
    }

    if (!fs::exists(logDir)) {
      fs::create_directories(logDir);
      std::cout << "Created directory: " << logDir << std::endl;
    } else {
      std::cout << "Directory " << logDir << " already exists." << std::endl;
    }

    // Write the configuration file (%PROGRAMDATA%\udidi\udidi.conf)
    {
      std::ofstream confFile(configFile);
      if (!confFile) {
        throw std::runtime_error("Could not open " + configFile.string() +
                                 " for writing.");
      }
      confFile
          << "# udidi.conf\n\n"
             "# for documentation of all options, see:\n"
             "#   http://euriklis.com/docs/udidi\n"
             "storage:\n"
             "  dbPath: "
          << (baseDir / "data").string()
          << "\n\n"
             "systemLog:\n"
             "  destination: file\n"
             "  logAppend: true\n"
             "  path: "
          << (logDir / "udidi.log").string()
          << "\n\n"
             "net:\n"
             "  port: 2712\n"
             "  bindIp: 127.0.0.1\n\n"
             "processManagement:\n"
             "  timeZoneInfo: C:\\Windows\\System32\\timeZoneInformation\n";
      std::cout << "Configuration file created at " << configFile << std::endl;
    }

    // Write service installation instructions for Windows
    {
      std::ofstream instrFile(serviceInstructions);
      if (!instrFile) {
        throw std::runtime_error(
            "Could not open " + serviceInstructions.string() + " for writing.");
      }
      instrFile << "To install the Udidi database as a Windows service, "
                   "consider using a service wrapper like NSSM.\n"
                   "For example, after installing NSSM, run:\n"
                   "  nssm install UdidiService \"C:\\Path\\to\\udidi.exe\" "
                   "--config \""
                << configFile.string()
                << "\"\n"
                   "Then configure the service as needed.\n";
      std::cout << "Service installation instructions created at "
                << serviceInstructions << std::endl;
    }

#else
#error "Unsupported Operating System"
#endif

    std::cout << "Udidi installation completed successfully." << std::endl;
  } catch (const fs::filesystem_error &e) {
    std::cerr << "Filesystem error: " << e.what() << std::endl;
    return 1;
  } catch (const std::exception &e) {
    std::cerr << "Error: " << e.what() << std::endl;
    return 1;
  }
  return 0;
}
