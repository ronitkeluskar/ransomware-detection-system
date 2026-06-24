# XENON Security Suite (SHIELD-X)

XENON Security Suite (SHIELD-X) is a proactive, real-time defensive computing application engineered to monitor file systems, detect anomalous behaviors, and neutralize ransomware threats before they can compromise critical infrastructure. By integrating automated file system observers with isolated quarantine workflows, XENON provides robust host-based intrusion prevention.

## Key Features

*   **Real-Time File System Observer:** Continuous monitoring of specified directories using low-overhead background workers to intercept unauthorized file modifications, creations, or deletions.
*   **Automated Quarantine Manager:** Instantly isolates suspected malicious binaries or heavily modified data payloads into a cryptographically secure, sandboxed environment.
*   **Ransomware Behavior Analysis:** Algorithmic detection of rapid file-entropy changes and high-frequency encryption patterns typical of modern ransomware families.
*   **Network Security Simulation:** Built-in capabilities to simulate and analyze local network anomalies, including DNS flood attack patterns and credential exploitation vectors.

---

## Architecture & Core Components

The suite is modularly structured into defensive subsystems:

1.  **SHIELD-X Watchdog core:** Built on the Python `watchdog` framework to hook into low-level operating system file events.
2.  **Quarantine Subsystem:** Moves, renames, and revokes execution permissions from flagged artifacts, logging metadata for forensic triage.
3.  **Threat Simulator:** A controlled staging module used to safe-test defensive rulesets against simulated high-velocity disk encryption and basic flooding scenarios.

---

## Prerequisites & Installation

### Environment Setup
Ensure you have Python 3.10+ installed on your system.

1. **Clone the Repository:**

2. Install Required Dependencies: "pip install -r requirements.txt"

```bash
   git clone [https://github.com/your-username/XENON-APP.git](https://github.com/your-username/XENON-APP.git)
   cd XENON-APP
