# Project Kushora — AI-Driven Agricultural Surveillance

**Problem**
Smallholder farmers and livestock managers in rural regions often lack access to automated early-warning systems for crop disease and animal health, leading to delayed responses and economic loss.

**Solution**
Project Kushora integrates drone-acquired imagery, edge IoT sensors, and a YOLO/CNN pipeline to detect early signs of disease. Detections are logged and routed through n8n to produce alerts delivered by WhatsApp and the web dashboard.

**Result**
Controlled trials showed 92% detection accuracy for the trained model on validation sets. The system reduced manual inspection time by >80% for sample farms and enabled proactive intervention.

**Core Technologies**
- AI/ML: Convolutional Neural Networks (CNN), YOLO Object Detection
- Computer Vision: Image Recognition & Classification, Predictive Analytics
- IoT Sensors: ESP32-based edge devices for real-time data acquisition
- Drone Integration: APIs for aerial imagery capture and processing
- Automation: n8n workflows for alert routing and notifications
- Backend: Python, TensorFlow, Postgres for data storage
- Frontend: Web dashboard with real-time updates

**Next steps**
Optimize inference for edge devices and expand dataset diversity to improve robustness.
