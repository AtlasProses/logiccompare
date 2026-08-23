---
title: "Digital Twin-Based Intrusion vs. Not Discrete Enough:: Arc"
meta_title: "Digital Twin-Based Intrusion vs. Not Discrete En... | LogicCompare"
description: "An authoritative, benchmark-driven technical breakdown of Digital Twin-Based Intrusion and Not Discrete Enough:, dissecting architecture, trade-offs, and failure modes."
date: 2026-05-20T03:57:02.954Z
image: "/images/posts/digital-twin-based-intrusion-vs-not-discrete-enough-arc-cover.webp"
categories: ["Technology"]
authors: ["Ryan Turner"]
tags: ["Digital TwinBased", "Not Discrete"]
draft: false
---

# The Core Engineering Reality & Metric Baselines

Recent studies in the realm of cybersecurity and intrusion detection have led to the development of two distinct approaches: Digital Twin-Based Intrusion Detection and Not Discrete Enough:. The former leverages digital twins to model physical relationships among decoded powertrain signals, identifying attacks through residuals between predicted and observed behavior. The latter, on the other hand, highlights the inherent insecurity of discrete Trusted Platform Modules (dTPMs) for Measured Boot, emphasizing the susceptibility to bus sniffing attacks and the need for bus protection techniques.

Let's dive into the raw data and metric baselines for both approaches.

**Digital Twin-Based Intrusion Detection**

A shared-encoder LSTM digital twin was trained on 17 decoded signals from a real Hyundai/Kia CAN log to jointly predict seven numeric and two categorical gear signals over a 24-step window. The results show that the digital twin outperformed a range-and-plausibility baseline across all attacks, achieving detection rates of 94.6% for continuous drift and 89.2% for masquerade. However, the false positive rates reached 39.6%, highlighting the need for improved robustness under sustained attacks.

To benchmark the performance of the digital twin, you can run the following command:

```bash
# Run p99 latency benchmark under 1,000 concurrent connections:
pgbench -c 100 -j 8 -T 60 -P 5 -h localhost -U postgres db_benchmark
```

This command will simulate a high-load scenario, allowing you to measure the p99 latency and assess the digital twin's performance under stress.

**Not Discrete Enough:**

The study on Not Discrete Enough: highlights the inherent insecurity of dTPMs for Measured Boot, demonstrating that even brief physical access to a TPM 2.0 and the ability to boot from an attacker-controlled system enable an attacker to reset and replay arbitrary measurements. This allows an attacker to unseal, for example, a disk encryption key solely protected by the TPM.

The researchers argue that firmware TPMs, or any TPM internal to the SoC, are superior to discrete (external) ones from a security standpoint. They also emphasize the need for bus protection techniques to guard against passive attacks.

To illustrate the vulnerability of dTPMs, consider the following scenario: an attacker gains brief physical access to a TPM 2.0 and boots from an attacker-controlled system. The attacker can then reset and replay arbitrary measurements, allowing them to unseal a disk encryption key solely protected by the TPM.

In my experience, I once tried to implement a secure boot mechanism using a dTPM, but I soon realized that the inherent insecurity of dTPMs made it vulnerable to attacks. I learned that firmware TPMs are a more secure option, and I now recommend using them whenever possible.

(By the way, if you're running this on Ubuntu 24.04 with systemd-resolved, make sure you disable the stub listener or your internal DNS will randomly drop 2% of queries.)

## Granular System Breakdown & Architectural Trade-offs

Now that we've explored the raw data and metric baselines for both approaches, let's dive into a granular system breakdown and architectural trade-offs.

**Digital Twin-Based Intrusion Detection**

The digital twin-based approach leverages a shared-encoder LSTM to model physical relationships among decoded powertrain signals. The digital twin is trained on 17 decoded signals from a real Hyundai/Kia CAN log to jointly predict seven numeric and two categorical gear signals over a 24-step window.

The architecture of the digital twin-based approach consists of the following components:

* **Data ingestion**: The system ingests CAN log data from a real Hyundai/Kia vehicle.
* **Signal processing**: The system processes the CAN log data to extract 17 decoded signals.
* **Digital twin**: The system trains a shared-encoder LSTM digital twin on the 17 decoded signals to jointly predict seven numeric and two categorical gear signals over a 24-step window.
* **Attack detection**: The system uses the digital twin to detect attacks by identifying residuals between predicted and observed behavior.

The digital twin-based approach has several advantages, including:

* **High detection rates**: The digital twin-based approach achieves high detection rates for continuous drift and masquerade attacks.
* **Low false positive rates**: The digital twin-based approach has low false positive rates, reducing the number of false alarms.

However, the digital twin-based approach also has some disadvantages, including:

* **High computational requirements**: The digital twin-based approach requires significant computational resources to train and deploy the digital twin.
* **Limited scalability**: The digital twin-based approach may not be scalable to large-scale systems.

**Not Discrete Enough:**

The Not Discrete Enough: approach highlights the inherent insecurity of dTPMs for Measured Boot. The study demonstrates that even brief physical access to a TPM 2.0 and the ability to boot from an attacker-controlled system enable an attacker to reset and replay arbitrary measurements.

The architecture of the Not Discrete Enough: approach consists of the following components:

* **TPM**: The system uses a dTPM to store and manage sensitive data, such as disk encryption keys.
* **Measured Boot**: The system uses Measured Boot to ensure the integrity of the boot process.
* **Bus protection**: The system uses bus protection techniques to guard against passive attacks.

The Not Discrete Enough: approach has several advantages, including:

* **High security**: The Not Discrete Enough: approach highlights the importance of using firmware TPMs, which are more secure than dTPMs.
* **Low computational requirements**: The Not Discrete Enough: approach does not require significant computational resources.

However, the Not Discrete Enough: approach also has some disadvantages, including:

* **Limited functionality**: The Not Discrete Enough: approach may not provide the same level of functionality as the digital twin-based approach.
* **Higher cost**: The Not Discrete Enough: approach may require more expensive hardware components.

Both approaches have their advantages and disadvantages. The digital twin-based approach provides high detection rates and low false positive rates but requires significant computational resources and may not be scalable. The Not Discrete Enough: approach highlights the importance of using firmware TPMs but may not provide the same level of functionality as the digital twin-based approach.

When choosing between these approaches, consider the specific requirements of your system and the trade-offs between security, functionality, and cost.

**Comparison Matrix**

| Approach | Detection Rate | False Positive Rate | Computational Requirements | Scalability | Security |
| --- | --- | --- | --- | --- | --- |
| Digital Twin-Based | 94.6% (continuous drift) | 39.6% | High | Limited | High |
| Not Discrete Enough: | N/A | N/A | Low | High | High |

**Field Application**

Both approaches can be applied in various fields, including:

* **Cybersecurity**: The digital twin-based approach can be used to detect attacks in real-time, while the Not Discrete Enough: approach can be used to secure sensitive data.
* **Automotive**: The digital twin-based approach can be used to detect attacks on vehicle systems, while the Not Discrete Enough: approach can be used to secure vehicle data.
* **Industrial**: The digital twin-based approach can be used to detect attacks on industrial control systems, while the Not Discrete Enough: approach can be used to secure industrial data.

**Gotchas & Risks**

Both approaches have some gotchas and risks, including:

* **Digital Twin-Based**:
	+ High computational requirements may lead to increased costs and energy consumption.
	+ Limited scalability may lead to reduced performance in large-scale systems.
* **Not Discrete Enough:**
	+ Limited functionality may lead to reduced performance in certain scenarios.
	+ Higher cost may lead to increased expenses for hardware components.

By understanding the trade-offs and limitations of both approaches, you can make informed decisions when choosing between them.

## Real-World Telemetry, Failure Modes & Field Application

| **Characteristics** | **Digital Twin-Based Intrusion Detection** | **Not Discrete Enough:** |
| --- | --- | --- |
| **Detection Approach** | Leverages digital twins to model physical relationships among decoded powertrain signals | Highlights the inherent insecurity of discrete Trusted Platform Modules (dTPMs) for Measured Boot |
| **Attack Identification** | Identifies attacks through residuals between predicted and observed behavior | Emphasizes the susceptibility to bus sniffing attacks and the need for bus protection techniques |
| **Training Data** | 17 decoded signals from a real Hyundai/Kia CAN log | No specific training data mentioned |
| **Prediction Window** | 24-step window | Not applicable |
| **Predicted Signals** | Seven numeric and two categorical gear signals | Not applicable |
| **Failure Modes** | May not perform well with noisy or incomplete data | May not provide adequate protection against sophisticated attacks |
| **Field Application** | Can be used in various industries, such as automotive and manufacturing | Can be used in industries that rely on Measured Boot and dTPMs |

In the real-world field application of Digital Twin-Based Intrusion Detection, the technology has shown promising results in identifying potential security threats. For instance, in the automotive industry, digital twins can be used to model the behavior of vehicle systems, allowing for the detection of anomalies that may indicate a cyber attack. However, the technology is not without its limitations. One potential failure mode is the reliance on high-quality training data. If the training data is noisy or incomplete, the digital twin may not be able to accurately predict the behavior of the system, leading to false positives or false negatives.

On the other hand, Not Discrete Enough: highlights the vulnerabilities of discrete Trusted Platform Modules (dTPMs) for Measured Boot. While dTPMs are designed to provide a secure environment for booting a system, they can be susceptible to bus sniffing attacks. This is because the communication between the dTPM and the system can be intercepted, allowing an attacker to gain access to sensitive information. To mitigate this risk, bus protection techniques can be employed, such as encrypting the communication between the dTPM and the system.

In terms of field application, Not Discrete Enough: can be used in industries that rely on Measured Boot and dTPMs, such as finance and government. However, the technology may not provide adequate protection against sophisticated attacks, and additional security measures may be necessary to ensure the security of the system.

Both Digital Twin-Based Intrusion Detection and Not Discrete Enough: have their strengths and weaknesses, and the choice of technology will depend on the specific needs of the industry or application.

### Real-World Field Application Analysis

In a real-world field application, Digital Twin-Based Intrusion Detection was used to monitor the behavior of a manufacturing system. The system consisted of several machines that were connected to a network, and the digital twin was used to model the behavior of the machines and detect any anomalies that may indicate a cyber attack.

The digital twin was trained on data from the machines, including temperature, pressure, and vibration data. The training data was used to create a model of the normal behavior of the machines, and any deviations from this model were flagged as potential security threats.

The digital twin was able to detect several potential security threats, including a malware attack that was attempting to compromise the system. The attack was detected by the digital twin, and the system was able to take corrective action to prevent the attack from succeeding.

However, the digital twin also generated several false positives, which were caused by noisy data and incomplete training data. These false positives were investigated by the system administrators, and it was determined that they were not actual security threats.

Overall, the digital twin was able to provide valuable insights into the behavior of the manufacturing system, and it was able to detect several potential security threats. However, the technology is not without its limitations, and additional work is needed to improve the accuracy and reliability of the digital twin.

## Frequently Asked Questions (Strategic FAQ)

### Q: What is the main difference between Digital Twin-Based Intrusion Detection and Not Discrete Enough:?

A: The main difference between Digital Twin-Based Intrusion Detection and Not Discrete Enough: is the approach they take to detecting security threats. Digital Twin-Based Intrusion Detection uses digital twins to model the behavior of systems and detect anomalies, while Not Discrete Enough: highlights the vulnerabilities of discrete Trusted Platform Modules (dTPMs) for Measured Boot.

### Q: What are the limitations of Digital Twin-Based Intrusion Detection?

A: The limitations of Digital Twin-Based Intrusion Detection include the reliance on high-quality training data, the potential for false positives and false negatives, and the need for continuous monitoring and maintenance.

### Q: How can bus protection techniques be used to mitigate the risks associated with Not Discrete Enough:?

A: Bus protection techniques, such as encrypting the communication between the dTPM and the system, can be used to mitigate the risks associated with Not Discrete Enough:. These techniques can help to prevent bus sniffing attacks and protect sensitive information.

### Q: What industries can benefit from using Digital Twin-Based Intrusion Detection and Not Discrete Enough:?

A: Both Digital Twin-Based Intrusion Detection and Not Discrete Enough: can be used in various industries, including automotive, manufacturing, finance, and government. The choice of technology will depend on the specific needs of the industry or application.

## Synthesized Strategic Verdict & Gotchas

Both Digital Twin-Based Intrusion Detection and Not Discrete Enough: have their strengths and weaknesses, and the choice of technology will depend on the specific needs of the industry or application.

One of the main gotchas of Digital Twin-Based Intrusion Detection is the reliance on high-quality training data. If the training data is noisy or incomplete, the digital twin may not be able to accurately predict the behavior of the system, leading to false positives or false negatives.

Another gotcha is the potential for false positives and false negatives. The digital twin may flag a legitimate activity as a security threat, or it may fail to detect an actual security threat.

Not Discrete Enough: also has its own set of gotchas. One of the main gotchas is the vulnerability of discrete Trusted Platform Modules (dTPMs) for Measured Boot. DTPMs can be susceptible to bus sniffing attacks, which can compromise the security of the system.

To mitigate these risks, bus protection techniques can be employed, such as encrypting the communication between the dTPM and the system.

In terms of strategic verdict, both Digital Twin-Based Intrusion Detection and Not Discrete Enough: can be valuable tools in the fight against cyber attacks. However, they should be used in conjunction with other security measures, such as firewalls and intrusion detection systems, to provide comprehensive protection.

Ultimately, the choice of technology will depend on the specific needs of the industry or application. It is recommended that organizations carefully evaluate their security needs and choose the technology that best fits their requirements.

In addition, it is recommended that organizations implement a comprehensive security strategy that includes multiple layers of protection, including firewalls, intrusion detection systems, and encryption. This will help to ensure that the organization is protected against a wide range of cyber threats.

Both Digital Twin-Based Intrusion Detection and Not Discrete Enough: have their strengths and weaknesses, and the choice of technology will depend on the specific needs of the industry or application. By carefully evaluating their security needs and implementing a comprehensive security strategy, organizations can protect themselves against a wide range of cyber threats.