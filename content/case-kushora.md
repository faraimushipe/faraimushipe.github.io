# Project Kushora — AI-Driven Agricultural Surveillance

**Problem**
Smallholder farmers and livestock managers in rural regions often lack access to automated early-warning systems for crop disease and animal health, leading to delayed responses and economic loss.

**Solution**
Project Kushora integrates drone-acquired imagery, edge IoT sensors, and a YOLO/CNN pipeline to detect early signs of disease. Detections are logged and routed through n8n to produce alerts delivered by WhatsApp and the web dashboard.

**Result**
Controlled trials showed 92% detection accuracy for the trained model on validation sets. The system reduced manual inspection time by >80% for sample farms and enabled proactive intervention.

**Tech**
Python, TensorFlow, YOLO, n8n, Drone APIs, ESP32, Postgres

**Next steps**
Optimize inference for edge devices and expand dataset diversity to improve robustness.
